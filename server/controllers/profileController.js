const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { getGithub } = require("../services/githubService");
const { getLeetcode } = require("../services/leetcodeService");
const { getYoutube } = require("../services/youtubeService");

function safeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function computeDevScore(stats) {
  const githubRepos = safeNumber(stats?.github?.publicRepos);
  const leetcodeSolved = safeNumber(stats?.leetcode?.totalSolved);
  const youtubeVideos = safeNumber(stats?.youtube?.videos);
  return githubRepos * 2 + leetcodeSolved * 3 + youtubeVideos;
}

function normalizeManualData(body) {
  return {
    linkedin: {
      url: body.linkedin?.url || body.linkedinUrl || "",
      followers: safeNumber(body.linkedin?.followers ?? body.linkedinFollowers),
      connections: safeNumber(body.linkedin?.connections ?? body.linkedinConnections)
    },
    twitter: {
      url: body.twitter?.url || body.twitterUrl || "",
      followers: safeNumber(body.twitter?.followers ?? body.twitterFollowers)
    },
    sololearn: {
      url: body.sololearn?.url || body.sololearnUrl || "",
      xp: safeNumber(body.sololearn?.xp ?? body.sololearnXp),
      badges: safeNumber(body.sololearn?.badges ?? body.sololearnBadges)
    }
  };
}

function mergeStats(existingStats, verifiedStats) {
  const pick = (key) => {
    const value = verifiedStats?.[key];
    if (value && typeof value === "object" && Object.keys(value).length) return value;
    return existingStats?.[key] || {};
  };

  return {
    github: pick("github"),
    leetcode: pick("leetcode"),
    youtube: pick("youtube")
  };
}

function applyProfilePayload(profile, payload, stats) {
  const manual = normalizeManualData(payload);
  profile.name = payload.name ?? profile.name;
  if (payload.username) profile.username = payload.username.toLowerCase().trim();
  profile.bio = payload.bio ?? profile.bio;
  profile.avatar = payload.avatar || stats.github?.avatar || profile.avatar;
  profile.github = payload.github ?? profile.github;
  profile.leetcode = payload.leetcode ?? profile.leetcode;
  profile.youtube = payload.youtube ?? profile.youtube;
  profile.linkedin = manual.linkedin;
  profile.twitter = manual.twitter;
  profile.sololearn = manual.sololearn;
  profile.stats = stats;
  profile.devScore = computeDevScore(stats);
}

async function fetchVerifiedStats({ github, leetcode, youtube }) {
  const entries = [
    ["github", github ? getGithub(github) : Promise.resolve(null)],
    ["leetcode", leetcode ? getLeetcode(leetcode) : Promise.resolve(null)],
    ["youtube", youtube ? getYoutube(youtube) : Promise.resolve(null)]
  ];

  const settled = await Promise.allSettled(entries.map(([, promise]) => promise));
  const stats = {};
  const errors = {};

  settled.forEach((result, index) => {
    const key = entries[index][0];
    if (result.status === "fulfilled") {
      stats[key] = result.value || {};
      return;
    }
    errors[key] = result.reason?.message || "Unable to fetch platform data.";
    stats[key] = {};
  });

  return { stats, errors };
}

async function verifyProfile(req, res) {
  try {
    const { github = "", leetcode = "", youtube = "" } = req.body || {};
    if (!github && !leetcode && !youtube) {
      return res.status(400).json({ message: "Provide at least one platform username to verify." });
    }

    const { stats, errors } = await fetchVerifiedStats({ github, leetcode, youtube });
    const devScore = computeDevScore(stats);

    return res.json({ stats, devScore, errors });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Verification failed." });
  }
}

async function createProfile(req, res) {
  try {
    const payload = req.body || {};
    const manual = normalizeManualData(payload);

    const username = (payload.username || "").toLowerCase().trim();
    if (!username) {
      return res.status(400).json({ message: "username is required." });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: "Username already exists." });
    }

    if (payload.email) {
      const emailTaken = await User.findOne({ email: payload.email.toLowerCase().trim() });
      if (emailTaken) {
        return res.status(409).json({ message: "Email already exists." });
      }
    }

    let verifiedStats = payload.stats || {};
    if (payload.verifyOnSave) {
      const result = await fetchVerifiedStats({
        github: payload.github,
        leetcode: payload.leetcode,
        youtube: payload.youtube
      });
      verifiedStats = result.stats;
    }

    const stats = mergeStats({}, verifiedStats);
    const devScore = computeDevScore(stats);

    const passwordHash = payload.password ? await bcrypt.hash(payload.password, 10) : "";

    const user = await User.create({
      name: payload.name,
      username,
      email: payload.email ? payload.email.toLowerCase().trim() : "",
      passwordHash,
      role: payload.role === "admin" ? "admin" : "student",
      bio: payload.bio || "",
      avatar: payload.avatar || stats.github?.avatar || "",
      github: payload.github || "",
      leetcode: payload.leetcode || "",
      youtube: payload.youtube || "",
      linkedin: manual.linkedin,
      twitter: manual.twitter,
      sololearn: manual.sololearn,
      stats,
      devScore
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not create profile." });
  }
}

async function getProfiles(req, res) {
  try {
    const search = req.query.search?.trim();
    const query = { role: "student" };
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { username: { $regex: search, $options: "i" } }];
    }

    const profiles = await User.find(query).sort({ createdAt: -1 });
    return res.json(profiles);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not fetch profiles." });
  }
}

async function getProfileById(req, res) {
  try {
    const { id } = req.params;

    const profile = mongoose.Types.ObjectId.isValid(id)
      ? await User.findById(id)
      : await User.findOne({ username: id.toLowerCase() });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    if (
      req.authUser?.role !== "admin" &&
      profile._id.toString() !== req.authUser?._id?.toString()
    ) {
      return res.status(403).json({ message: "You can only access your own profile." });
    }

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not fetch profile." });
  }
}

async function getMyProfile(req, res) {
  try {
    const profile = await User.findById(req.authUser._id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not fetch your profile." });
  }
}

async function updateMyProfile(req, res) {
  try {
    const payload = req.body || {};
    const profile = await User.findById(req.authUser._id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    let verifiedStats = payload.stats || {};
    if (payload.verifyOnSave) {
      const result = await fetchVerifiedStats({
        github: payload.github ?? profile.github,
        leetcode: payload.leetcode ?? profile.leetcode,
        youtube: payload.youtube ?? profile.youtube
      });
      verifiedStats = result.stats;
    }

    const stats = mergeStats(profile.stats, verifiedStats);
    applyProfilePayload(profile, payload, stats);
    await profile.save();

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not update your profile." });
  }
}

async function getPublicProfile(req, res) {
  try {
    const username = req.params.username.toLowerCase();
    const profile = await User.findOne({ username, role: "student" });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not fetch public profile." });
  }
}

async function updateProfile(req, res) {
  try {
    const { id } = req.params;
    const payload = req.body || {};

    const profile = await User.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found." });
    }

    let verifiedStats = payload.stats || {};
    if (payload.verifyOnSave) {
      const result = await fetchVerifiedStats({
        github: payload.github || profile.github,
        leetcode: payload.leetcode || profile.leetcode,
        youtube: payload.youtube || profile.youtube
      });
      verifiedStats = result.stats;
    }

    const stats = mergeStats(profile.stats, verifiedStats);
    applyProfilePayload(profile, payload, stats);

    await profile.save();
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not update profile." });
  }
}

async function deleteProfile(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Profile not found." });
    }
    return res.json({ message: "Profile deleted." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not delete profile." });
  }
}

async function getLeaderboard(req, res) {
  try {
    const limit = Math.min(safeNumber(req.query.limit) || 50, 100);
    const leaderboard = await User.find({ role: "student" })
      .sort({ devScore: -1, "stats.leetcode.totalSolved": -1 })
      .limit(limit)
      .select("name username avatar devScore stats.github.publicRepos stats.leetcode.totalSolved stats.youtube.videos");

    return res.json(leaderboard);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not load leaderboard." });
  }
}

async function getDevCard(req, res) {
  try {
    const username = req.params.username.toLowerCase();
    const user = await User.findOne({ username, role: "student" });
    if (!user) {
      return res.status(404).json({ message: "Profile not found." });
    }

    return res.json({
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      devScore: user.devScore,
      githubRepos: safeNumber(user.stats?.github?.publicRepos),
      leetcodeSolved: safeNumber(user.stats?.leetcode?.totalSolved),
      youtubeVideos: safeNumber(user.stats?.youtube?.videos),
      profileUrl: `${req.protocol}://${req.get("host")}/api/profiles/public/${user.username}`
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not load dev card." });
  }
}

module.exports = {
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
};
