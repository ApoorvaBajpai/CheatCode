const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionId: String,
    questionTitle: String,
    language: String,
    code: String,
    status: String,   // 'Accepted' | 'Wrong Answer' | 'Error' | 'Skipped'
    output: String,
}, { _id: false });

const submissionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
    contestTitle: String,
    timeTaken: Number,   // seconds elapsed when submitted
    answers: [answerSchema],
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
