const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../middleware/authMiddleware");

function publicUser(user) {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar
  };
}

async function registerStudent(req, res) {
  try {
    const { name = "", username = "", email = "", password = "" } = req.body || {};

    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) {
      return res.status(400).json({ message: "name, username, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }]
    });

    if (existing) {
      return res.status(409).json({ message: "Email or username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "student"
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not register student." });
  }
}

async function login(req, res) {
  try {
    const { identifier = "", password = "" } = req.body || {};

    if (!identifier.trim() || !password.trim()) {
      return res.status(400).json({ message: "identifier and password are required." });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase().trim() }, { username: identifier.toLowerCase().trim() }]
    }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({ token, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not log in." });
  }
}

async function me(req, res) {
  return res.json({ user: publicUser(req.authUser) });
}

module.exports = {
  registerStudent,
  login,
  me
};
