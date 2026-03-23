const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const authMiddleware = require('../middleware/auth');

// POST /api/contests  — create contest (auth required, sets createdBy)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, duration, questions } = req.body;
        if (!title || !duration) return res.status(400).json({ message: 'title and duration are required' });
        const contest = await Contest.create({ title, duration, questions: questions || [], createdBy: req.user.id });
        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/contests  — list only this user's contests
router.get('/', authMiddleware, async (req, res) => {
    try {
        const contests = await Contest.find({ createdBy: req.user.id })
            .select('title duration questions createdAt')
            .sort({ createdAt: -1 });
        const data = contests.map(c => ({
            _id: c._id,
            title: c.title,
            duration: c.duration,
            questionCount: c.questions.length,
            createdAt: c.createdAt,
        }));
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/contests/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const contest = await Contest.findOne({ _id: req.params.id, createdBy: req.user.id });
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/contests/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await Contest.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
