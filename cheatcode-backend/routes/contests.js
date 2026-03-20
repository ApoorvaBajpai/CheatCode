const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');

/**
 * POST /api/contests
 * Create a new contest.
 *
 * Accepts JSON body:
 * {
 *   "title":    "Sprint 1",
 *   "duration": 90,
 *   "questions": [
 *     {
 *       "title": "Two Sum",
 *       "description": "Given an array...",
 *       "constraints": ["2 <= nums.length <= 1000"],
 *       "sampleTestCases": [{ "input": "...", "expectedOutput": "..." }]
 *     }
 *   ]
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { title, duration, questions } = req.body;

        if (!title || !duration) {
            return res.status(400).json({ message: 'title and duration are required' });
        }

        const contest = await Contest.create({ title, duration, questions: questions || [] });
        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/contests  –  list all contests (summary only, no question bodies)
router.get('/', async (req, res) => {
    try {
        const contests = await Contest.find()
            .select('title duration questions createdAt')
            .sort({ createdAt: -1 });

        // Return count instead of full question objects in list view
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

// GET /api/contests/:id  –  get full contest with all questions
router.get('/:id', async (req, res) => {
    try {
        const contest = await Contest.findById(req.params.id);
        if (!contest) return res.status(404).json({ message: 'Contest not found' });
        res.json(contest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/contests/:id  –  delete a contest
router.delete('/:id', async (req, res) => {
    try {
        await Contest.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
