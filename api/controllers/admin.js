const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const Admin = require("../models/admin");
const Test = require("../models/test");
const Student = require("../models/student");
const Question = require("../models/question");
const Result = require("../models/result");

exports.admin_login = async(req, res, next) => {
    const admin = await Admin.findOne({
        adminName: req.body.adminName,
    }).exec();

    if (admin == null) {
        return res.status(400).json({
            result: 0,
            message: "No admin found",
        });
    }

    const passwordCheck = await bcrypt.compare(req.body.password, admin.password);
    if (!passwordCheck) {
        return res.status(400).json({
            result: 0,
            message: "Invalid credentials",
        });
    } else {
        const token = jwt
            .sign({
                    _id: admin._id,
                    loginid: admin.adminID,
                    exp: Math.floor(Date.now() / 1000) + 60 * 60,
                },
                process.env.TOKEN_SECRET
            )
            .toString();

        req.session.userToken = token;

        res.status(200).json({
            result: 1,
            message: "Admin login successfull",
            token: token,
            adminName: admin.adminName
        });
    }
};

exports.admin_logout = async(req, res, next) => {
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
                message: "Admin logged out successfully!",
                logoutTime: logoutTime,
            });
        }
    });
};

exports.admin_change_password = async(req, res, next) => {
    var adminExist = await Admin.findOne({ adminName: req.body.adminName }).exec();
    if (adminExist != null) {
        bcrypt.hash(req.body.password, 10, async(err, hash) => {
            if (err) {
                return res.status(500).json({
                    error: err,
                });
            } else {
                await Admin.updateOne({ adminName: req.body.adminName }, {
                        $set: {
                            password: hash
                        }
                    })
                    .then((result) => {
                        return res.status(200).json({
                            result: 1,
                            message: "Password changed"
                        });
                    })
                    .catch((err) => {
                        return res.status(400).json({
                            result: 0,
                            message: "Something went wrong"
                        });
                    });
            }
        });
    } else {
        return res.status(400).json({
            result: 0,
            message: "Something went wrong"
        });
    }
};

exports.admin_get_tests = async(req, res, next) => {
    var data = await Test.find({}).exec();
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

exports.admin_get_test_by_id = async(req, res, next) => {
    var data = await Test.findOne({ testID: req.body.testID }).exec();
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

exports.admin_add_test = async(req, res, next) => {
    var newTest = new Test({
        testID: req.body.testID,
        testDate: req.body.testDate,
        testDuration: req.body.testDuration,
        marksForRightAnswer: req.body.marksForRightAnswer,
        marksForWrongAnswer: req.body.marksForWrongAnswer,
    });

    await newTest
        .save()
        .then(async(result) => {
            res.status(201).json({
                result: 1,
                message: "Test created successfully",
            });
        })
        .catch((err) => {
            res.status(400).json({
                result: 0,
                message: "Failed",
            });
        });
};

exports.admin_get_students = async(req, res, next) => {
    var data = await Student.find({}).exec();
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

exports.admin_add_students = async(req, res, next) => {
    var newSheet = req.body.sheet;
    var newSheetParsed = JSON.parse(newSheet);

    var newUserArray = [];
    var newUser = newSheetParsed.Sheet1;
    var newCollege = req.body.studentCollege;
    var newPassword = req.body.password;

    for (let i = 0; i < newUser.length; i++) {
        var studentExist = await Student.findOne({
            studentUSN: newUser[i].studentUSN,
            studentEmail: newUser[i].studentEmail,
        }).exec();
        if (studentExist != null) {
            continue;
        } else if (studentExist == null) {
            var newUserItem = {
                studentUSN: newUser[i].studentUSN,
                studentEmail: newUser[i].studentEmail,
                studentName: newUser[i].studentName,
                studentContact: newUser[i].studentContact,
                studentCollege: newCollege,
                studentCourse: newUser[i].studentCourse,
                studentDepartment: newUser[i].studentDepartment,
                password: "",
            };
            newUserArray.push(newUserItem);
        }
    }

    await Student.insertMany(newUserArray, async function(error, docs) {
        if (docs) {
            docs.forEach(async(data, i, arr) => {
                await bcrypt.hash(newPassword, 10, async(err, hash) => {
                    if (err) {
                        return res.status(400).json({
                            result: 0,
                            message: "Something went wrong",
                        });
                    } else {
                        await Student.updateMany({ userCollege: arr[i].newCollege }, {
                            $set: { password: hash },
                        }).exec();
                    }
                });
            });
            res.status(201).json({
                result: 1,
                message: "Added students successfully",
            });
        } else {
            console.log(error);
            res.status(400).json({
                result: 0,
                message: "Failed.",
            });
        }
    });
};

exports.admin_edit_student = async(req, res, next) => {
    await Student.updateOne({ _id: req.body._id, studentUSN: req.body.studentUSN, studentEmail: req.body.studentEmail }, {
            $set: {
                studentName: req.body.studentName,
                studentCollege: req.body.studentCollege,
                studentCourse: req.body.studentCourse,
                studentDepartment: req.body.studentDepartment,
                studentContact: req.body.studentContact
            }
        }).exec()
        .then(result => {
            res.status(200).json({
                result: 1,
                message: "Updation Successfull"
            });
        })
        .catch(err => {
            res.status(400).json({
                result: 0,
                message: "Updation Failed"
            });
        });
};

exports.admin_get_questions_by_id = async(req, res, next) => {
    var data = await Question.find({ testID: req.body.testID }).exec();
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

exports.admin_add_questions = async(req, res, next) => {
    var newSheet = req.body.sheet;
    var testID = req.body.testID;
    var newSheetParsed = JSON.parse(newSheet);

    var newQuestionArray = [];
    var newQuestion = newSheetParsed.Sheet1;

    newQuestion.forEach(async(data, i, arr) => {
        var newQuestionItem = {
            question: arr[i].question,
            a: arr[i].a,
            b: arr[i].b,
            c: arr[i].c,
            d: arr[i].d,
            correctOption: arr[i].correctOption,
            testID: testID,
        };
        newQuestionArray.push(newQuestionItem);
    });

    await Question.insertMany(newQuestionArray, async function(error, docs) {
        if (docs) {
            var totalQuestions = await Test.findOne({ testID: req.body.testID }).exec();
            await Test.updateOne({ testID: req.body.testID }, {
                $set: {
                    totalQuestions: totalQuestions.totalQuestions + docs.length
                }
            }).exec();
            res.status(201).json({
                result: 1,
                message: "Added questions successfully",
            });
        } else {
            console.log(error);
            res.status(400).json({
                result: 0,
                message: "Failed.",
            });
        }
    });
};

exports.admin_questions_update = async(req, res, next) => {
    await Question.updateOne({ _id: req.body._id, testID: req.body.testID }, {
            $set: {
                question: req.body.question,
                a: req.body.a,
                b: req.body.b,
                c: req.body.c,
                d: req.body.d,
                correctOption: req.body.correctOption
            }
        }).exec()
        .then(async result => {
            res.status(200).json({
                result: 1,
                message: "Question Updated"
            });
        }).
    catch(err => {
        res.status(400).json({
            result: 0,
            message: "Failed"
        });
    });
}

exports.admin_delete_student = async(req, res, next) => {
    await Student.deleteOne({ studentUSN: req.body.studentUSN, studentEmail: req.body.studentEmail }).exec()
        .then(result => {
            res.status(200).json({
                result: 1,
                message: "Student deleted"
            });
        }).
    catch(err => {
        res.status(400).json({
            result: 0,
            message: "Failed"
        });
    });
};

exports.admin_edit_test = async(req, res, next) => {
    await Test.updateOne({ _id: req.body._id, testID: req.body.testID }, {
            $set: {
                testDate: req.body.testDate,
                testDuration: req.body.testDuration,
                marksForRightAnswer: req.body.marksForRightAnswer,
                marksForWrongAnswer: req.body.marksForWrongAnswer
            }
        }).exec()
        .then(async result => {
            res.status(200).json({
                result: 1,
                message: "Test Updated"
            });
        }).
    catch(err => {
        res.status(400).json({
            result: 0,
            message: "Failed"
        });
    });
};

exports.admin_delete_test = async(req, res, next) => {
    await Test.deleteOne({ _id: req.body._id, testID: req.body.testID }).exec()
        .then(async result => {
            await Question.deleteMany({ testID: req.body.testID }).exec();
            res.status(200).json({
                result: 1,
                message: "Test deleted"
            });
        }).
    catch(err => {
        res.status(400).json({
            result: 0,
            message: "Failed"
        });
    });
};

exports.admin_delete_question = async(req, res, next) => {
    await Question.deleteOne({ _id: req.body._id, testID: req.body.testID }).exec()
        .then(async result => {
            var totalQuestions = await Test.findOne({ testID: req.body.testID }).exec();
            await Test.updateOne({ testID: req.body.testID }, {
                $set: {
                    totalQuestions: totalQuestions.totalQuestions - 1
                }
            })
            res.status(200).json({
                result: 1,
                message: "Question deleted"
            });
        }).
    catch(err => {
        res.status(400).json({
            result: 0,
            message: "Failed"
        });
    });
};

exports.admin_generate_report = async(req, res, next) => {
    var studentResult = await Result.findOne({ studentUSN: req.body.studentUSN });
    if (studentResult == null) {
        return res.status(400).json({
            result: 0,
            message: "Candidate has not enrolled for any tests"
        });
    } else {
        return res.status(200).json({
            result: 1,
            data: studentResult
        });
    }
};