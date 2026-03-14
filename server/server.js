require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const { ensureAdminUser } = require("./services/adminSeedService");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "").split(",")
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  // Allow Render-hosted frontends when explicitly running in production.
  if (process.env.NODE_ENV === "production" && /^https:\/\/.*\.onrender\.com$/i.test(origin)) {
    return true;
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "dev-profile-aggregator-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = error.message || "Unexpected server error.";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/dev-profile-aggregator";

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    await ensureAdminUser();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
