const axios = require("axios");

function githubHeaders() {
  const token = (process.env.GITHUB_TOKEN || "").trim();
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "dev-profile-aggregator",
    "X-GitHub-Api-Version": "2022-11-28"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function getGithub(username) {
  if (!username) return null;

  const endpoint = `https://api.github.com/users/${username}`;
  try {
    const { data } = await axios.get(endpoint, {
      timeout: 10000,
      headers: githubHeaders()
    });

    return {
      username: data.login || username,
      profileUrl: data.html_url || "",
      avatar: data.avatar_url || "",
      name: data.name || data.login || "",
      bio: data.bio || "",
      publicRepos: Number(data.public_repos || 0),
      followers: Number(data.followers || 0),
      following: Number(data.following || 0),
      publicGists: Number(data.public_gists || 0),
      contributionGraph: `https://github-readme-streak-stats.herokuapp.com/?user=${
        data.login || username
      }&theme=dark&hide_border=true`,
      lastSynced: new Date()
    };
  } catch (error) {
    const status = error.response?.status;
    if (status === 403) {
      throw new Error("GitHub API rate limit reached. Set GITHUB_TOKEN in server environment.");
    }
    if (status === 404) {
      throw new Error("GitHub username not found.");
    }

    throw new Error(error.response?.data?.message || "Unable to fetch GitHub profile.");
  }
}

module.exports = { getGithub };
