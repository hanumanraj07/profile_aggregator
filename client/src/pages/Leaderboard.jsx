import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { useToast } from "../components/ToastContext";
import { profileApi } from "../services/api";

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const data = await profileApi.leaderboard();
        setLeaders(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Could not load leaderboard.", "error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pushToast]);

  if (loading) return <Loader label="Loading leaderboard..." />;

  const topThree = leaders.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="panel">
        <h2 className="text-2xl font-bold text-white">Top Developers</h2>
        <p className="mt-1 text-sm text-slate-400">Dev Score = (GitHub Repos x 2) + (LeetCode Solved x 3) + (YouTube Videos x 1)</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {topThree.map((dev, index) => (
          <article
            key={dev._id}
            className={`panel text-center ${
              index === 0
                ? "border-yellow-300/70 bg-yellow-300/10 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
                : index === 1
                  ? "border-slate-300/70 bg-slate-300/10"
                  : "border-orange-300/70 bg-orange-300/10"
            }`}
          >
            <p className="font-mono text-3xl">{index + 1}</p>
            <p className="mt-2 text-lg font-semibold text-white">{dev.name}</p>
            <p className="text-sm text-slate-300">@{dev.username}</p>
            <p className="mt-3 font-mono text-2xl text-accentGreen">{dev.devScore}</p>
            <Link to={`/student-dashboard/${dev.username}`} className="mt-3 inline-flex text-sm text-accentBlue">
              View Profile
            </Link>
          </article>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <table className="min-w-full divide-y divide-line text-left text-sm">
          <thead className="bg-surface">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Developer</th>
              <th className="px-4 py-3">GitHub Repos</th>
              <th className="px-4 py-3">LeetCode Solved</th>
              <th className="px-4 py-3">YouTube Videos</th>
              <th className="px-4 py-3">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leaders.map((dev, index) => (
              <tr key={dev._id}>
                <td className="px-4 py-3 font-mono text-accentBlue">#{index + 1}</td>
                <td className="px-4 py-3">
                  <Link to={`/student-dashboard/${dev.username}`} className="hover:text-accentBlue">
                    {dev.name}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono">{dev.stats?.github?.publicRepos ?? 0}</td>
                <td className="px-4 py-3 font-mono">{dev.stats?.leetcode?.totalSolved ?? 0}</td>
                <td className="px-4 py-3 font-mono">{dev.stats?.youtube?.videos ?? 0}</td>
                <td className="px-4 py-3 font-mono text-accentGreen">{dev.devScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Leaderboard;
