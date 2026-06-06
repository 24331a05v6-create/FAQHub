const express = require("express");
const router = express.Router();
const {
  createAdminQuery,
  getMyAdminQueries,
  getPendingAdminQueries,
  resolveAdminQuery,
} = require("../controllers/adminQueryController");
const { protect, authorize } = require("../middleware/auth");

router.post("/", protect, createAdminQuery);
router.get("/my", protect, getMyAdminQueries);
router.get("/pending", protect, authorize("admin"), getPendingAdminQueries);
router.patch("/:id/resolve", protect, authorize("admin"), resolveAdminQuery);

module.exports = router;
