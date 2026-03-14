const mongoose = require("mongoose");

const githubStatsSchema = new mongoose.Schema(
  {
    username: { type: String, default: "" },
    profileUrl: { type: String, default: "" },
    avatar: { type: String, default: "" },
    name: { type: String, default: "" },
    bio: { type: String, default: "" },
    publicRepos: { type: Number, default: 0 },
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    publicGists: { type: Number, default: 0 },
    contributionGraph: { type: String, default: "" },
    lastSynced: Date
  },
  { _id: false }
);

const leetcodeStatsSchema = new mongoose.Schema(
  {
    username: { type: String, default: "" },
    profileUrl: { type: String, default: "" },
    totalSolved: { type: Number, default: 0 },
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
    lastSynced: Date
  },
  { _id: false }
);

const youtubeStatsSchema = new mongoose.Schema(
  {
    channelId: { type: String, default: "" },
    channelTitle: { type: String, default: "" },
    channelUrl: { type: String, default: "" },
    subscribers: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    videos: { type: Number, default: 0 },
    lastSynced: Date
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true, default: "" },
    passwordHash: { type: String, select: false, default: "" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    github: { type: String, default: "", trim: true },
    leetcode: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
    linkedin: {
      url: { type: String, default: "" },
      followers: { type: Number, default: 0 },
      connections: { type: Number, default: 0 }
    },
    twitter: {
      url: { type: String, default: "" },
      followers: { type: Number, default: 0 }
    },
    sololearn: {
      url: { type: String, default: "" },
      xp: { type: Number, default: 0 },
      badges: { type: Number, default: 0 }
    },
    stats: {
      github: { type: githubStatsSchema, default: () => ({}) },
      leetcode: { type: leetcodeStatsSchema, default: () => ({}) },
      youtube: { type: youtubeStatsSchema, default: () => ({}) }
    },
    devScore: { type: Number, default: 0 }
  },
  { timestamps: true }
);

userSchema.pre("validate", function prepareUsername(next) {
  if (!this.username && this.name) {
    this.username = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }

  next();
});

module.exports = mongoose.model("User", userSchema);
