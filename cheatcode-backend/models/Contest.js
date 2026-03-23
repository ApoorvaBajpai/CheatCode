const mongoose = require('mongoose');

// Each question the contest creator adds manually
const questionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    constraints: [String],              // e.g. ["1 <= n <= 100", "n is integer"]
    sampleTestCases: [{
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
    }],
}, { _id: true });

const contestSchema = new mongoose.Schema({
    title: { type: String, required: true },
    duration: { type: Number, required: true },
    questions: [questionSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
