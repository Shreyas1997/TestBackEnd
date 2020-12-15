const express = require("express");
const router = express.Router();

const checkAuth = require('../middlewares/check-auth');
const studentController = require('../controllers/student');

// Request handlers

router.post("/studentRegister", studentController.add_student);

router.post("/studentLogin", studentController.student_login);

router.post("/studentLogout", checkAuth, studentController.student_logout);

router.post("/studentProfile", checkAuth, studentController.student_profile);

router.post("/studentAllAssessment", checkAuth, studentController.student_all_test_list);

router.post("/studentGetTests", checkAuth, studentController.student_test_list);

router.post("/studentEnroll", checkAuth, studentController.student_enroll_test);

router.post("/studentGetQuestions", checkAuth, studentController.student_test_question_list);

router.post("/studentSubmitAnswer", checkAuth, studentController.student_submit_answer);

router.post("/checkEnrolled", checkAuth, studentController.student_enroll_check);

/*router.post("/studentAnswer", studentController.student_answer_post);*/

module.exports = router;