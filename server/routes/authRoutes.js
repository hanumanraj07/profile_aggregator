const express = require("express");
const { login, me, registerStudent } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register-student", registerStudent);
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;
