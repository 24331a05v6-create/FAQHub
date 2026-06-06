const express = require("express");
const router = express.Router();
const {
  issueCredential, revokeCredential, listCredentials,
} = require("../controllers/credentialController");
const { protect, authorize } = require("../middleware/auth");

router.use(protect, authorize("admin"));

router.get("/", listCredentials);
router.post("/issue", issueCredential);
router.patch("/:id/revoke", revokeCredential);

module.exports = router;
