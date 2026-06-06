const express = require("express");
const router = express.Router();
const {
  getProfile, getMyQuestions, getMyAnswers,
  getNotifications, markNotificationsRead,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/me", getProfile);
router.get("/me/questions", getMyQuestions);
router.get("/me/answers", getMyAnswers);
router.get("/me/notifications", getNotifications);
router.patch("/me/notifications/read", markNotificationsRead);

module.exports = router;
