const express = require("express");
const router = express.Router();
const {
  getStats,
  getSubmissions,
  getSubmissionDetail,
  updateFollowup,
} = require("../controllers/dashboard.controller");
const { requireAuth } = require("../middleware/auth.middleware");

// requireAuth runs first on every one of these — if there's no valid
// token, the request gets rejected before it ever reaches the controller
router.get("/stats", requireAuth, getStats);
router.get("/submissions", requireAuth, getSubmissions);
router.get("/submissions/:ass_id", requireAuth, getSubmissionDetail);
router.post("/submissions/:ass_id/followup", requireAuth, updateFollowup);

module.exports = router;