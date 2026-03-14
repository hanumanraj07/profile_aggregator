const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
  return process.env.JWT_SECRET || "dev-profile-aggregator-secret";
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "Invalid token user." });
    }

    req.authUser = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.authUser) {
      return res.status(401).json({ message: "Authentication required." });
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({ message: "You do not have access to this resource." });
    }

    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
  signToken
};
