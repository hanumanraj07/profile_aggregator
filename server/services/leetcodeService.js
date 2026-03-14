const axios = require("axios");

const SOURCES = [
  (username) => `https://leetcode-api-faisalshohag.vercel.app/${username}`,
  (username) => `https://leetcode-stats-api.herokuapp.com/${username}`,
  (username) => `https://alfa-leetcode-api.onrender.com/${username}/solved`
];

function readCountFromArray(items, difficulty) {
  if (!Array.isArray(items)) return 0;
  const row = items.find((entry) => String(entry?.difficulty).toLowerCase() === difficulty.toLowerCase());
  return Number(row?.count || 0);
}

function normalizeLeetcodePayload(data, username) {
  const allSolvedFromArray =
    readCountFromArray(data?.matchedUserStats?.acSubmissionNum, "All") ||
    readCountFromArray(data?.data?.matchedUserStats?.acSubmissionNum, "All");

  const easySolvedFromArray =
    readCountFromArray(data?.matchedUserStats?.acSubmissionNum, "Easy") ||
    readCountFromArray(data?.data?.matchedUserStats?.acSubmissionNum, "Easy");
  const mediumSolvedFromArray =
    readCountFromArray(data?.matchedUserStats?.acSubmissionNum, "Medium") ||
    readCountFromArray(data?.data?.matchedUserStats?.acSubmissionNum, "Medium");
  const hardSolvedFromArray =
    readCountFromArray(data?.matchedUserStats?.acSubmissionNum, "Hard") ||
    readCountFromArray(data?.data?.matchedUserStats?.acSubmissionNum, "Hard");

  const totalSolved = Number(data?.totalSolved ?? allSolvedFromArray ?? 0);
  const easySolved = Number(data?.easySolved ?? easySolvedFromArray ?? 0);
  const mediumSolved = Number(data?.mediumSolved ?? mediumSolvedFromArray ?? 0);
  const hardSolved = Number(data?.hardSolved ?? hardSolvedFromArray ?? 0);
  const ranking = Number(data?.ranking ?? data?.data?.matchedUser?.profile?.ranking ?? 0);

  if (
    data?.errors?.length &&
    !totalSolved &&
    !easySolved &&
    !mediumSolved &&
    !hardSolved &&
    !ranking
  ) {
    throw new Error("LeetCode username not found.");
  }

  return {
    username,
    profileUrl: `https://leetcode.com/${username}`,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    lastSynced: new Date()
  };
}

async function getLeetcode(username) {
  if (!username) return null;

  const attemptedErrors = [];

  for (const buildUrl of SOURCES) {
    const endpoint = buildUrl(username);
    try {
      const { data } = await axios.get(endpoint, {
        timeout: 9000,
        headers: { "User-Agent": "dev-profile-aggregator" }
      });
      return normalizeLeetcodePayload(data, username);
    } catch (error) {
      const reason = error.response?.data?.message || error.response?.data || error.message;
      attemptedErrors.push(`${endpoint}: ${typeof reason === "string" ? reason : JSON.stringify(reason)}`);
    }
  }

  throw new Error(`Unable to fetch LeetCode stats. ${attemptedErrors.join(" | ")}`);
}

module.exports = { getLeetcode };
