const router = require('express').Router();
const Submission = require('../models/Submission');
const authMiddleware = require('../middleware/auth');

// POST /api/submissions  — save a completed contest
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { contestId, contestTitle, timeTaken, answers } = req.body;
        const sub = await Submission.create({
            userId: req.user.id, contestId, contestTitle, timeTaken, answers,
        });
        res.status(201).json(sub);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/submissions  — my submissions, newest first
router.get('/', authMiddleware, async (req, res) => {
    try {
        const subs = await Submission.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('contestId', 'title');
        res.json(subs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/submissions/:id  — single submission detail
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const sub = await Submission.findOne({ _id: req.params.id, userId: req.user.id });
        if (!sub) return res.status(404).json({ message: 'Not found' });
        res.json(sub);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
