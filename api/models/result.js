const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    studentUSN: { type: String },
    studentName: { type: String },
    studentAnswer: [{
        testID: { type: String },
        answers: { type: Array },
    }],
    testResult: [{
        testID: { type: String },
        totalScore: { type: Number, default: 0 },
        maxScore: { type: Number, default: 0 },
        answers: { type: Array },
    }]
});

module.exports = mongoose.model("Result", resultSchema);