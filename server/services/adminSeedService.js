const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@devprofile.local").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";

  const existing = await User.findOne({ role: "admin" });
  if (existing) return;

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: "Administrator",
    username: "admin",
    email: adminEmail,
    passwordHash,
    role: "admin"
  });

  // eslint-disable-next-line no-console
  console.log(`Default admin created: ${adminEmail}`);
}

module.exports = { ensureAdminUser };
