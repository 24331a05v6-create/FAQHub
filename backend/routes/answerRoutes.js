const express = require("express");
const router = express.Router();
const {
  createAnswer,
  getAnswers,
  upvoteAnswer,
} = require("../controllers/answerController");
const { protect } = require("../middleware/auth");

router.get("/:questionId", getAnswers);
router.post("/:questionId", protect, createAnswer);
router.patch("/upvote/:id", protect, upvoteAnswer);

module.exports = router;
