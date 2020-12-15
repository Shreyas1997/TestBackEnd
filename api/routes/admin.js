const express = require("express");
const router = express.Router();

const checkAuth = require("../middlewares/check-auth");
const adminController = require("../controllers/admin");

// Request handlers

router.post("/adminLogin", adminController.admin_login);

router.post("/adminLogout", checkAuth, adminController.admin_logout);

router.post("/adminChangePassword", checkAuth, adminController.admin_change_password);

/*router.post("/getQuestions", checkAuth, adminController.admin_questions_gets);

router.post("/getQuestion", checkAuth, adminController.admin_questions_get);*/

router.post("/getTestQuestions", checkAuth, adminController.admin_get_questions_by_id);

router.post("/uploadQuestions", checkAuth, adminController.admin_add_questions);

router.post("/updateQuestion", checkAuth, adminController.admin_questions_update);

router.post("/deleteQuestion", checkAuth, adminController.admin_delete_question);

/*router.get("/getFaculty", checkAuth, adminController.admin_get_faculty);

router.post("/addFaculty", checkAuth, adminController.add_faculty);

router.get("/getTest/:testID", checkAuth, adminController.admin_get_test);*/

router.post("/getTests", checkAuth, adminController.admin_get_tests);

router.post("/getTestByID", checkAuth, adminController.admin_get_test_by_id);

router.post("/addTest", checkAuth, adminController.admin_add_test);

/*router.patch("/updateFaculty", checkAuth, adminController.admin_faculty_update);

router.patch("/updateFacultyPassword", checkAuth, adminController.admin_faculty_password_update);

router.post("/deleteFaculty", checkAuth, adminController.admin_faculty_delete);*/

router.post("/getStudents", checkAuth, adminController.admin_get_students);

router.post("/addStudents", checkAuth, adminController.admin_add_students);

/*router.patch("/updateUser", checkAuth, adminController.admin_user_update);

router.patch("/updateUserPassword", checkAuth, adminController.admin_user_password_update);*/

router.post("/updateStudent", checkAuth, adminController.admin_edit_student);

router.post("/deleteStudent", checkAuth, adminController.admin_delete_student);

router.post("/updateTest", checkAuth, adminController.admin_edit_test);

router.post("/deleteTest", checkAuth, adminController.admin_delete_test);

//router.post("/allUserReport", adminController.admin_all_user_report);

router.post("/studentReport", checkAuth, adminController.admin_generate_report);

module.exports = router;