const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const Contest = require('../models/Contest');
const authMiddleware = require('../middleware/auth');
const { Readable } = require('stream');

const upload = multer({ storage: multer.memoryStorage() });

// 1️⃣ Endpoint 1: Upload and pick fields from CSV to Save in MongoDB
// POST /api/csv/add-new-ques/:contestId
router.post('/add-new-ques/:contestId', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { contestId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: 'Invalid Contest ID format' });
        }

        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const contest = await Contest.findOne({ _id: contestId, createdBy: req.user.id });
        if (!contest) return res.status(404).json({ message: 'Contest not found or unauthorized' });

        const questionsList = [];
        // Convert CSV data stream
        const stream = Readable.from(req.file.buffer.toString());

        stream.pipe(csv())
            .on('data', (row) => {
                // Formatting based on 5 columns: question, description, constraint, testcase 1, testcase 2
                const questionData = {
                    title: row.question || 'Untitled',
                    description: row.description || '',
                    constraints: row.constraint ? row.constraint.split(',').map(c => c.trim()) : [],
                    sampleTestCases: []
                };

                // Split test cases using ':::' as a separator (Input ::: Output)
                [row['testcase 1'], row['testcase 2']].forEach(tc => {
                    if (tc && tc.includes(':::')) {
                        const [input, expectedOutput] = tc.split(':::').map(s => s.trim());
                        questionData.sampleTestCases.push({ input, expectedOutput });
                    }
                });

                if (questionData.title !== 'Untitled') {
                    questionsList.push(questionData);
                }
            })
            .on('end', async () => {
                if (questionsList.length === 0) {
                    return res.status(400).json({ message: 'No valid rows found in CSV. Check your column names.' });
                }

                // Push and Save to MongoDB
                contest.questions.push(...questionsList);
                await contest.save();

                res.status(201).json({
                    message: `Successfully saved ${questionsList.length} questions to MongoDB.`,
                    contestTitle: contest.title,
                    questionCount: contest.questions.length
                });
            })
            .on('error', (err) => {
                res.status(500).json({ message: 'CSV Parse Error: ' + err.message });
            });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2️⃣ Endpoint 2: Load questions list from MongoDB
// GET /api/csv/loadQues/:contestId
router.get('/loadQues/:contestId', authMiddleware, async (req, res) => {
    try {
        const { contestId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return res.status(400).json({ message: 'Invalid Contest ID format' });
        }

        const contest = await Contest.findOne({ _id: contestId, createdBy: req.user.id });
        if (!contest) return res.status(404).json({ message: 'Contest not found or unauthorized' });

        res.status(200).json({
            status: '200OK',
            contestTitle: contest.title,
            questions: contest.questions
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
