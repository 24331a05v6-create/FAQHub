const express = require("express");
const router = express.Router();
const {
  groupQueries,
  approveAnswer,
  getAnalytics,
  getAllQuestions,
  deleteQuestion,
  deleteAnswer,
  manageFAQs,
  deleteFAQ,
  addFAQ,
  getPriorityFAQs,
  togglePinFAQ,
  getTrendingFAQs,
  promoteToAdmin,
} = require("../controllers/adminController");
const {
  getPendingAnswers, getPendingCount,
  approveAnswer: moderateApprove, rejectAnswer, requestChanges, getQueueStats,
} = require("../controllers/moderationController");
const {
  runDuplicateDetection, mergeDuplicates, checkSimilarity,
} = require("../controllers/duplicateController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.post("/group-queries", groupQueries);
router.patch("/approve-answer/:answerId", approveAnswer);
router.get("/analytics", getAnalytics);
router.get("/questions", getAllQuestions);
router.delete("/questions/:id", deleteQuestion);
router.delete("/answers/:id", deleteAnswer);
router.get("/faqs", manageFAQs);
router.post("/faqs", addFAQ);
router.delete("/faqs/:id", deleteFAQ);

router.get("/priority-faqs", getPriorityFAQs);
router.patch("/faqs/:id/toggle-pin", togglePinFAQ);
router.get("/trending", getTrendingFAQs);

router.get("/moderation/pending", getPendingAnswers);
router.get("/moderation/pending-count", getPendingCount);
router.get("/moderation/stats", getQueueStats);
router.patch("/moderation/approve/:id", moderateApprove);
router.patch("/moderation/reject/:id", rejectAnswer);
router.patch("/moderation/request-changes/:id", requestChanges);

router.post("/duplicates/detect", runDuplicateDetection);
router.post("/duplicates/merge", mergeDuplicates);
router.post("/duplicates/check-similarity", checkSimilarity);

router.post("/promote-to-admin", promoteToAdmin);

module.exports = router;
