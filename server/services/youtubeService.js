const axios = require("axios");

const YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";

function sanitizeInput(value) {
  return decodeURIComponent((value || "").trim());
}

function extractYoutubeUsernameFromUrl(value) {
  const input = sanitizeInput(value);
  const userMatch = input.match(/youtube\.com\/user\/([a-zA-Z0-9._-]+)/i);
  return userMatch?.[1] || "";
}

function extractYoutubeHandle(value) {
  const input = sanitizeInput(value);
  if (!input) return "";

  if (input.startsWith("@")) {
    return input.replace("@", "");
  }

  const fromHandleUrl = input.match(/youtube\.com\/@([a-zA-Z0-9._-]+)/i);
  if (fromHandleUrl?.[1]) return fromHandleUrl[1];

  return "";
}

function extractYoutubeChannelId(value) {
  const input = sanitizeInput(value);
  if (!input) return "";

  if (/^UC[a-zA-Z0-9_-]{20,}$/.test(input)) return input;

  const channelMatch = input.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/i);
  if (channelMatch?.[1]) return channelMatch[1];

  return "";
}

async function resolveByHandle(handle, apiKey) {
  if (!handle) return "";
  try {
    const { data } = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: {
        part: "id",
        forHandle: handle,
        key: apiKey
      },
      timeout: 10000
    });
    return data.items?.[0]?.id || "";
  } catch {
    return "";
  }
}

async function resolveByLegacyUsername(username, apiKey) {
  if (!username) return "";
  try {
    const { data } = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: {
        part: "id",
        forUsername: username,
        key: apiKey
      },
      timeout: 10000
    });
    return data.items?.[0]?.id || "";
  } catch {
    return "";
  }
}

async function resolveBySearch(query, apiKey) {
  if (!query) return "";
  const { data } = await axios.get(`${YOUTUBE_BASE}/search`, {
    params: {
      part: "snippet",
      type: "channel",
      q: query,
      maxResults: 1,
      key: apiKey
    },
    timeout: 10000
  });
  return data.items?.[0]?.snippet?.channelId || "";
}

async function resolveChannelId(channelInput, apiKey) {
  const directChannelId = extractYoutubeChannelId(channelInput);
  if (directChannelId) return directChannelId;

  const handle = extractYoutubeHandle(channelInput);
  const fromHandle = await resolveByHandle(handle, apiKey);
  if (fromHandle) return fromHandle;

  const legacyUsername = extractYoutubeUsernameFromUrl(channelInput);
  const fromLegacyUsername = await resolveByLegacyUsername(legacyUsername, apiKey);
  if (fromLegacyUsername) return fromLegacyUsername;

  const query = handle || legacyUsername || sanitizeInput(channelInput);
  return resolveBySearch(query, apiKey);
}

async function getYoutube(channelInput) {
  if (!channelInput) return null;

  const apiKey = (process.env.YOUTUBE_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_youtube_api_key_here") {
    throw new Error("YOUTUBE_API_KEY is not configured. Add a valid key in server/.env.");
  }

  let channelId = "";
  try {
    channelId = await resolveChannelId(channelInput, apiKey);
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    throw new Error(`YouTube channel resolution failed: ${message}`);
  }
  if (!channelId) {
    throw new Error("Could not resolve YouTube channel. Use @handle, channel URL, or channel ID.");
  }

  let data;
  try {
    const response = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: {
        part: "snippet,statistics",
        id: channelId,
        key: apiKey
      },
      timeout: 10000
    });
    data = response.data;
  } catch (error) {
    const message = error.response?.data?.error?.message || error.message;
    throw new Error(`YouTube API failed: ${message}`);
  }

  const item = data.items?.[0];
  if (!item) return null;

  return {
    channelId,
    channelTitle: item.snippet?.title || "",
    channelUrl: `https://www.youtube.com/channel/${channelId}`,
    subscribers: Number(item.statistics?.subscriberCount || 0),
    views: Number(item.statistics?.viewCount || 0),
    videos: Number(item.statistics?.videoCount || 0),
    lastSynced: new Date()
  };
}

module.exports = { getYoutube };
