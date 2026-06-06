const express = require("express");
const router = express.Router();
const {
  getFAQs,
  searchFAQs,
  bookmarkFAQ,
  getCategories,
  incrementView,
  getPopularFAQs,
  getTrendingFAQs,
  getRelatedFAQs,
} = require("../controllers/faqController");
const { protect } = require("../middleware/auth");

router.get("/", getFAQs);
router.get("/search", searchFAQs);
router.get("/categories", getCategories);
router.get("/popular", getPopularFAQs);
router.get("/trending", getTrendingFAQs);
router.get("/:id/related", getRelatedFAQs);
router.patch("/:id/view", incrementView);
router.post("/bookmark", protect, bookmarkFAQ);

module.exports = router;
