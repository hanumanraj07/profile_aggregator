import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastContext";
import { profileApi } from "../services/api";

function DevCard() {
  const [cardsLoading, setCardsLoading] = useState(true);
  const [rankedCards, setRankedCards] = useState([]);
  const { pushToast } = useToast();

  useEffect(() => {
    const loadRankedCards = async () => {
      try {
        const data = await profileApi.leaderboard();
        const cards = data.map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          username: entry.username,
          avatar: entry.avatar,
          devScore: entry.devScore,
          githubRepos: entry?.stats?.github?.publicRepos ?? 0,
          leetcodeSolved: entry?.stats?.leetcode?.totalSolved ?? 0,
          youtubeVideos: entry?.stats?.youtube?.videos ?? 0
        }));
        setRankedCards(cards);
      } catch (error) {
        pushToast(error.response?.data?.message || "Could not load ranked student cards.", "error");
      } finally {
        setCardsLoading(false);
      }
    };

    loadRankedCards();
  }, [pushToast]);

  const share = async (targetCard) => {
    if (!targetCard) return;
    const shareUrl = `${window.location.origin}/student-dashboard/${targetCard.username}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      pushToast("Share link copied to clipboard.", "success");
    } catch {
      pushToast("Clipboard access is unavailable.", "error");
    }
  };

  const download = (targetCard) => {
    if (!targetCard) return;
    const safeName = targetCard.username.replace(/[^a-z0-9_-]/gi, "");
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#1F6FEB" stop-opacity="0.25"/>
      <stop offset="50%" stop-color="#8957E5" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#238636" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0D1117"/>
  <rect x="16" y="16" width="868" height="468" rx="28" fill="#161B22" stroke="#30363D"/>
  <rect x="16" y="16" width="868" height="468" rx="28" fill="url(#bg)"/>
  <text x="60" y="100" fill="#ffffff" font-size="40" font-family="Inter, sans-serif" font-weight="700">${targetCard.name}</text>
  <text x="60" y="138" fill="#93c5fd" font-size="24" font-family="JetBrains Mono, monospace">@${targetCard.username}</text>
  <text x="60" y="220" fill="#e2e8f0" font-size="30" font-family="Inter, sans-serif">GitHub: ${targetCard.githubRepos} repos</text>
  <text x="60" y="270" fill="#e2e8f0" font-size="30" font-family="Inter, sans-serif">LeetCode: ${targetCard.leetcodeSolved} solved</text>
  <text x="60" y="320" fill="#e2e8f0" font-size="30" font-family="Inter, sans-serif">YouTube: ${targetCard.youtubeVideos} videos</text>
  <text x="60" y="400" fill="#22c55e" font-size="34" font-family="JetBrains Mono, monospace">Dev Score: ${targetCard.devScore}</text>
</svg>
    `.trim();

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeName || "dev-card"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Dev card SVG downloaded.", "success");
  };

  return (
    <div className="space-y-6">
      <section className="panel">
        <h2 className="text-2xl font-bold text-white">Leaderboard + Dev Card Center</h2>
        <p className="mt-1 text-sm text-slate-400">
          Students are ranked automatically. Use each card to open full profile dashboard, share, or download.
        </p>
      </section>

      {cardsLoading ? <Loader label="Loading ranked student cards..." /> : null}

      {!cardsLoading ? (
        <section className="panel">
          <h3 className="text-xl font-bold text-white">Students Dev Cards (Rank Wise)</h3>
          <p className="mt-1 text-sm text-slate-400">Cards are automatically arranged by leaderboard rank.</p>

          {rankedCards.length ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {rankedCards.map((item) => (
                <article key={item.username} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-lg border border-accentBlue/60 bg-accentBlue/15 px-2 py-1 font-mono text-xs text-accentBlue">
                      Rank #{item.rank}
                    </span>
                    <span className="font-mono text-sm text-accentGreen">Score {item.devScore}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={item.avatar || "https://api.dicebear.com/9.x/initials/svg?seed=Dev"}
                      alt={item.name}
                      className="h-12 w-12 rounded-xl border border-line object-cover"
                    />
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="font-mono text-xs text-accentBlue">@{item.username}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg border border-line bg-card p-2">
                      <p className="text-[11px] text-slate-400">GitHub</p>
                      <p className="font-mono text-sm">{item.githubRepos}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-card p-2">
                      <p className="text-[11px] text-slate-400">LeetCode</p>
                      <p className="font-mono text-sm">{item.leetcodeSolved}</p>
                    </div>
                    <div className="rounded-lg border border-line bg-card p-2">
                      <p className="text-[11px] text-slate-400">YouTube</p>
                      <p className="font-mono text-sm">{item.youtubeVideos}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`/student-dashboard/${item.username}`} className="btn-secondary px-3 py-1 text-xs">
                      View Profile
                    </Link>
                    <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => share(item)}>
                      Share
                    </button>
                    <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => download(item)}>
                      Download
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No student cards found yet.</p>
          )}
        </section>
      ) : null}
    </div>
  );
}

export default DevCard;
