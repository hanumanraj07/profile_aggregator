const express = require("express");
const {
  verifyProfile,
  createProfile,
  getProfiles,
  getProfileById,
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  updateProfile,
  deleteProfile,
  getLeaderboard,
  getDevCard
} = require("../controllers/profileController");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/verify", requireAuth, verifyProfile);
router.get("/leaderboard", requireAuth, getLeaderboard);
router.get("/dev-card/:username", requireAuth, getDevCard);
router.get("/public/:username", requireAuth, getPublicProfile);
router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

router.route("/").get(requireAuth, requireRole("admin"), getProfiles).post(requireAuth, requireRole("admin"), createProfile);
router
  .route("/:id")
  .get(requireAuth, getProfileById)
  .put(requireAuth, requireRole("admin"), updateProfile)
  .delete(requireAuth, requireRole("admin"), deleteProfile);

module.exports = router;
