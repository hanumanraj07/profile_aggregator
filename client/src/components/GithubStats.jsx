import StatCard from "./StatCard";

function GithubStats({ stats, username }) {
  return (
    <div className="space-y-4">
      <StatCard title="GitHub Repositories" value={stats?.publicRepos ?? 0} subValue={`@${username || "github-user"}`} tone="green" />
      <StatCard title="GitHub Followers" value={stats?.followers ?? 0} subValue={`Following: ${stats?.following ?? 0}`} tone="green" />
      {stats?.contributionGraph ? (
        <div className="panel">
          <p className="mb-3 text-sm text-slate-400">Contribution Streak Graph</p>
          <img src={stats.contributionGraph} alt="GitHub contribution streak" className="w-full rounded-xl border border-line" />
        </div>
      ) : null}
    </div>
  );
}

export default GithubStats;
