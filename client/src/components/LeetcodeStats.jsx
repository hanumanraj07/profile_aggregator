import StatCard from "./StatCard";

function LeetcodeStats({ stats, username }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard title="LeetCode Solved" value={stats?.totalSolved ?? 0} subValue={`@${username || "leetcode-user"}`} tone="orange" />
      <StatCard title="LeetCode Ranking" value={stats?.ranking ?? 0} subValue="Global ranking" tone="orange" />
      <StatCard title="Easy Solved" value={stats?.easySolved ?? 0} tone="orange" />
      <StatCard title="Medium / Hard Solved" value={`${stats?.mediumSolved ?? 0} / ${stats?.hardSolved ?? 0}`} tone="orange" />
    </div>
  );
}

export default LeetcodeStats;
