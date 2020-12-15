const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studentUSN: { type: String },
    studentEmail: { type: String },
    studentName: { type: String },
    studentContact: { type: String },
    studentCollege: { type: String },
    studentCourse: { type: String },
    studentDepartment: { type: String },
    password: { type: String, require: true, max: 1024, min: 6 },
    enrolledTest: [{
        testID: { type: String },
    }],
});

module.exports = mongoose.model("Student", studentSchema);