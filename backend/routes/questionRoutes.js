const express = require("express");
const router = express.Router();
const {
  createQuestion,
  getQuestions,
  getQuestionById,
  getRelatedQuestions,
} = require("../controllers/questionController");
const { protect } = require("../middleware/auth");

router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.get("/:id/related", getRelatedQuestions);
router.post("/", protect, createQuestion);

module.exports = router;
