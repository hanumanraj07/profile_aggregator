import StatCard from "./StatCard";

function YoutubeStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard title="YouTube Subscribers" value={stats?.subscribers ?? 0} tone="blue" />
      <StatCard title="YouTube Views" value={stats?.views ?? 0} tone="blue" />
      <StatCard title="YouTube Videos" value={stats?.videos ?? 0} tone="blue" />
    </div>
  );
}

export default YoutubeStats;
