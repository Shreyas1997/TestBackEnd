const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Student = require("../models/student");
const Test = require("../models/test");
const Question = require("../models/question");
const Result = require("../models/result");

exports.add_student = async(req, res, next) => {
    await Student.findOne({
            studentUSN: req.body.studentUSN,
            studentEmail: req.body.studentEmail,
        })
        .exec()
        .then(async(result) => {
            if (result) {
                return res.status(400).json({
                    result: 2,
                    message: "Student has been already registered.",
                });
            } else {
                await bcrypt.hash(req.body.password, 10, async(err, hash) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            error: err,
                        });
                    } else {
                        const newStudent = new Student({
                            studentUSN: req.body.studentUSN,
                            studentEmail: req.body.studentEmail,
                            studentName: req.body.studentName,
                            studentContact: req.body.studentContact,
                            studentCollege: req.body.studentCollege,
                            studentCourse: req.body.studentCourse,
                            studentDepartment: req.body.studentDepartment,
                            password: hash,
                        });
                        await newStudent
                            .save()
                            .then(async(result) => {
                                res.status(201).json({
                                    result: 1,
                                    message: "Student Registration Complete"
                                })
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(400).json({
                                    result: 0,
                                    message: "Registration failed",
                                });
                            });
                    }
                });
            }
        });
};

exports.student_login = async(req, res, next) => {
    const student = await Student.findOne({
        studentUSN: req.body.studentUSN,
    }).exec();

    if (student == null) {
        return res.status(400).json({
            result: 0,
            message: "Invalid USN or USN is not registered",
        });
    } else {
        const passwordCheck = await bcrypt.compare(
            req.body.password,
            student.password
        );
        if (!passwordCheck) {
            return res.status(400).json({
                result: 0,
                message: "Invalid password.",
            });
        } else {
            const token = jwt
                .sign({
                        _id: student._id,
                        loginid: student.studentUSN,
                        exp: Math.floor(Date.now() / 1000) + 60 * 60,
                    },
                    process.env.TOKEN_SECRET
                )
                .toString();
            req.session.userToken = token;
            res.status(200).json({
                result: 1,
                message: "Login Successfull",
                token: token,
                studentUSN: student.studentUSN,
                studentName: student.studentName,
            });
        }
    }
};

exports.student_logout = async(req, res, next) => {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.status(401).json({
                result: 0,
                message: "Something went wrong."
            });
        } else {
            let date = new Date().toISOString();
            var logoutTime = moment(date).format("DD-MMM-YYYY hh:mm A");
            res.status(200).json({
                result: 1,
                message: "User logged out successfully!",
                logoutTime: logoutTime,
            });
        }
    });
};

exports.student_profile = async(req, res, next) => {
    await Student.findOne({ studentUSN: req.body.studentUSN })
        .select('studentUSN studentEmail studentName studentContact studentCollege studentCourse studentDepartment enrolledTest')
        .exec()
        .then(async result => {
            var studentResult = await Result.findOne({ studentUSN: req.body.studentUSN });
            return res.status(200).json({
                result: 1,
                data: result,
                report: studentResult
            });
        })
        .catch(err => {
            return res.status(400).json({
                result: 0,
                message: "Something went wrong"
            });
        });
};

exports.student_all_test_list = async(req, res, next) => {
    var testIDArray = await Student.findOne({ studentUSN: req.body.studentUSN }).select("enrolledTest").exec();
    var allTest = await Test.find({}).exec();

    if (testIDArray.enrolledTest.length == 0) {
        return res.status(200).json({
            result: 1,
            data: allTest,
        });
    } else {
        for (var i = allTest.length - 1; i >= 0; i--) {
            for (var j = 0; j < testIDArray.enrolledTest.length; j++) {
                if (allTest[i] && (allTest[i].testID === testIDArray.enrolledTest[j].testID)) {
                    allTest.splice(i, 1);
                }
            }
        }

        if (allTest != null) {
            return res.status(200).json({
                result: 1,
                data: allTest,
            });
        } else {
            res.status(400).json({
                result: 0,
                message: "Failed",
            });
        }
    }

};

exports.student_test_list = async(req, res, next) => {
    var testIDArray = await Student.findOne({ studentUSN: req.body.studentUSN }).select("enrolledTest").exec();
    var dataArray = [];

    for (let i = 0; i < testIDArray.enrolledTest.length; i++) {
        var data = await Test.findOne({ testID: testIDArray.enrolledTest[i].testID }).exec();
        dataArray.push(data);
    }


    if (dataArray != null) {
        res.status(200).json({
            result: 1,
            data: dataArray,
        });
    } else {
        res.status(400).json({
            result: 0,
            message: "Failed",
        });
    }
};

exports.student_enroll_test = async(req, res, next) => {
    await Test.updateOne({ _id: req.body._id, testID: req.body.testID }, {
            $push: {
                enrolledUser: {
                    studentUSN: req.body.studentUSN
                }
            }
        }).exec()
        .then(async(result) => {
            await Student.updateOne({ studentUSN: req.body.studentUSN }, {
                $push: {
                    enrolledTest: {
                        testID: req.body.testID
                    }
                }
            }).exec();
            res.status(200).json({
                result: 1,
                message: "Successfully Enrolled",
            });
        }).catch((err) => {
            res.status(400).json({
                result: 0,
                message: "Failed",
            });
        });
};

exports.student_enroll_check = async(req, res, next) => {
    var enrolledUserArr;
    await Test.findOne({ _id: req.body._id, testID: req.body.testID }).exec()
        .then((result) => {
            enrolledUserArr = result.enrolledUser;
            if (enrolledUserArr.length === 0) {
                return res.status(200).json({
                    result: 2,
                    message: "Not Enrolled",
                });
            }
            enrolledUserArr.forEach((item) => {
                if (req.body.studentUSN == item.studentUSN) {
                    return res.status(200).json({
                        result: 1,
                        message: "Already Enrolled",
                    });
                } else {
                    return res.status(200).json({
                        result: 2,
                        message: "Not Enrolled",
                    });
                }
            });
        }).catch((err) => {
            res.status(400).json({
                result: 0,
                message: "Failed",
            });
        });
};

exports.student_test_question_list = async(req, res, next) => {
    var data = await Question.find({ testID: req.body.testID }).select('_id question a b c d').exec();
    if (data != null) {
        res.status(200).json({
            result: 1,
            data: data,
        });
    } else {
        res.status(400).json({
            result: 0,
            message: "Failed",
        });
    }
};

exports.student_submit_answer = async(req, res, next) => {
    var totalScore = 0;
    var marksRight = await Test.findOne({ testID: req.body.testID }).select('marksForRightAnswer').exec();
    var marksWrong = await Test.findOne({ testID: req.body.testID }).select('marksForWrongAnswer').exec();
    var totalQuestion = await Test.findOne({ testID: req.body.testID }).select('totalQuestions').exec();

    var maxScore = (totalQuestion.totalQuestions * marksRight.marksForRightAnswer);

    var resultExist = await Result.findOne({ studentUSN: req.body.studentUSN }).exec();
    if (resultExist == null) {
        var newResult = new Result({
            studentUSN: req.body.studentUSN,
            studentName: req.body.studentName,
        });

        await newResult.save()
            .then(async(result) => {
                await Result.updateOne({ studentUSN: req.body.studentUSN }, {
                        $push: {
                            testResult: {
                                testID: req.body.testID,
                                totalScore: totalScore,
                                maxScore: maxScore,
                                answers: req.body.answers,
                            }
                        }
                    }).exec()
                    .then(async(result) => {

                        req.body.answers.forEach(async element => {
                            var questionArray = await Question.findOne({ _id: element.questionID, testID: req.body.testID }).exec();
                            if (element.option == questionArray.correctOption) {
                                totalScore += marksRight.marksForRightAnswer;
                            } else if (element.option != questionArray.correctOption) {
                                totalScore += marksWrong.marksForWrongAnswer;
                            }
                            await Result.updateOne({ studentUSN: req.body.studentUSN, "testResult.testID": req.body.testID }, {
                                $set: {
                                    "testResult.$.totalScore": totalScore
                                }
                            }).exec();
                        });

                        res.status(200).json({
                            result: 1,
                            message: "Thank you for attending test"
                        });

                    }).catch(err => {
                        console.log(err)
                        res.status(400).json({
                            result: 0,
                            message: "Something went wrong"
                        });
                    });
            }).catch((err) => {
                console.log(err)
                res.status(400).json({
                    result: 0,
                    message: "Something went wrong"
                });
            })
    } else {
        await Result.updateOne({ studentUSN: req.body.studentUSN }, {
                $push: {
                    testResult: {
                        testID: req.body.testID,
                        totalScore: totalScore,
                        maxScore: maxScore,
                        answers: req.body.answers,
                    }
                }
            }).exec()
            .then(async(result) => {
                req.body.answers.forEach(async element => {
                    var questionArray = await Question.findOne({ _id: element.questionID, testID: req.body.testID }).exec();
                    if (element.option == questionArray.correctOption) {
                        totalScore += marksRight.marksForRightAnswer;
                    } else if (element.option != questionArray.correctOption) {
                        totalScore += marksWrong.marksForWrongAnswer;
                    }
                    await Result.updateOne({ studentUSN: req.body.studentUSN, "testResult.testID": req.body.testID }, {
                        $set: {
                            "testResult.$.totalScore": totalScore,
                        }
                    }).exec();
                });

                res.status(200).json({
                    result: 1,
                    message: "Thank you for attending test"
                })
            }).catch((err) => {
                console.log(err)
                res.status(400).json({
                    result: 0,
                    message: "Something went wrong"
                });
            });
    }
};