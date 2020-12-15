const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    testID: { type: String },
    testDate: { type: String },
    testDuration: { type: Number },
    totalQuestions: { type: Number, default: 0 },
    enrolledUser: [{
        studentUSN: { type: String },
    }, ],
    marksForRightAnswer: { type: Number, default: 0 },
    marksForWrongAnswer: { type: Number, default: 0 },
});

module.exports = mongoose.model("Test", testSchema);