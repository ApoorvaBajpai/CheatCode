/**
 * POST /api/run
 * Body: { code, language ('cpp'|'python'|'javascript'), stdin }
 * Talks to a local Judge0 CE instance at http://localhost:2358
 */
const router = require('express').Router();
const axios = require('axios');

const LANG_IDS = { cpp: 54, python: 71, javascript: 63 };
const JUDGE0 = process.env.JUDGE0_URL || 'http://localhost:2358';

router.post('/', async (req, res) => {
    const { code, language = 'python', stdin = '' } = req.body;

    try {
        // 1. Submit
        const { data: { token } } = await axios.post(
            `${JUDGE0}/submissions?base64_encoded=false&wait=false`,
            { source_code: code, language_id: LANG_IDS[language] || 71, stdin }
        );

        // 2. Poll until done (max 10s)
        let result;
        for (let i = 0; i < 10; i++) {
            await new Promise(r => setTimeout(r, 1000));
            const { data } = await axios.get(`${JUDGE0}/submissions/${token}?base64_encoded=false`);
            if (data.status?.id > 2) { result = data; break; }
        }

        if (!result) return res.json({ status: 'Time Limit Exceeded', stdout: '', stderr: '' });

        res.json({
            status: result.status?.description || 'Unknown',
            stdout: result.stdout || '',
            stderr: result.stderr || result.compile_output || '',
            time: result.time,
        });
    } catch (err) {
        res.status(500).json({ error: `Judge0 error: ${err.message}. Is Docker running?` });
    }
});

module.exports = router;
