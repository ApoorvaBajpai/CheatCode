const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const Contest = require('../models/Contest');
const authMiddleware = require('../middleware/auth');
const { Readable } = require('stream');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/csv/upload/:contestId
// Accepts formdata with field 'file' containing CSV
router.post('/upload/:contestId', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const contest = await Contest.findOne({ _id: req.params.contestId, createdBy: req.user.id });
        if (!contest) return res.status(404).json({ message: 'Contest not found or unauthorized' });

        const questions = [];
        const stream = Readable.from(req.file.buffer.toString());

        stream.pipe(csv())
            .on('data', (row) => {
                // Column names: question, description, constraint, testcase 1, testcase 2
                const q = {
                    title: row.question || 'Untitled',
                    description: row.description || '',
                    constraints: row.constraint ? row.constraint.split(',').map(c => c.trim()) : [],
                    sampleTestCases: []
                };

                // Parse testcase 1 and testcase 2 (Assume "input ::: output" format)
                [row['testcase 1'], row['testcase 2']].forEach(tc => {
                    if (tc && tc.includes(':::')) {
                        const [input, expectedOutput] = tc.split(':::').map(s => s.trim());
                        q.sampleTestCases.push({ input, expectedOutput });
                    }
                });

                if (q.title !== 'Untitled') {
                    questions.push(q);
                }
            })
            .on('end', async () => {
                if (questions.length === 0) {
                    return res.status(400).json({ message: 'No valid rows found in CSV' });
                }

                contest.questions.push(...questions);
                await contest.save();
                res.status(200).json({ message: `Successfully added ${questions.length} questions to contest.`, contest });
            })
            .on('error', (err) => {
                res.status(500).json({ message: 'CSV Parse Error: ' + err.message });
            });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
