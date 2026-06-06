const express = require("express");
const router = express.Router();
const { aiChat, suggestFAQs } = require("../controllers/aiController");

router.post("/chat", aiChat);
router.post("/suggest", suggestFAQs);

module.exports = router;
