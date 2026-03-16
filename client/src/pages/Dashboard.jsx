import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiLeetcode, SiSololearn } from "react-icons/si";
import GithubStats from "../components/GithubStats";
import LeetcodeStats from "../components/LeetcodeStats";
import Loader from "../components/Loader";
import ProfileCard from "../components/ProfileCard";
import StatCard from "../components/StatCard";
import { useToast } from "../components/ToastContext";
import YoutubeStats from "../components/YoutubeStats";
import { profileApi } from "../services/api";

function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const data = await profileApi.getAll();
        setProfiles(data);
        setSelectedId(data[0]?._id || "");
      } catch (error) {
        pushToast(error.response?.data?.message || "Could not load dashboard profiles.", "error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pushToast]);

  const selectedProfile = useMemo(
    () => profiles.find((item) => item._id === selectedId) || profiles[0],
    [profiles, selectedId]
  );

  const ensureUrl = (value, fallback) => {
    if (!value) return fallback;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `https://${value}`;
  };

  const youtubeUrl = (() => {
    const channel = selectedProfile?.youtube?.trim();
    if (!channel) return "https://www.youtube.com";
    if (channel.startsWith("http://") || channel.startsWith("https://")) return channel;
    if (channel.startsWith("@")) return `https://www.youtube.com/${channel}`;
    if (channel.startsWith("UC")) return `https://www.youtube.com/channel/${channel}`;
    return `https://www.youtube.com/@${channel}`;
  })();

  const platformLinks = [
    {
      label: "GitHub",
      href: selectedProfile?.github ? `https://github.com/${selectedProfile.github}` : "https://github.com",
      Icon: FaGithub,
      accent: "hover:border-accentGreen/80 hover:text-accentGreen"
    },
    {
      label: "LeetCode",
      href: selectedProfile?.leetcode ? `https://leetcode.com/${selectedProfile.leetcode}` : "https://leetcode.com",
      Icon: SiLeetcode,
      accent: "hover:border-accentOrange/80 hover:text-accentOrange"
    },
    {
      label: "YouTube",
      href: youtubeUrl,
      Icon: FaYoutube,
      accent: "hover:border-accentBlue/80 hover:text-accentBlue"
    },
    {
      label: "LinkedIn",
      href: ensureUrl(selectedProfile?.linkedin?.url, "https://www.linkedin.com"),
      Icon: FaLinkedin,
      accent: "hover:border-accentBlue/80 hover:text-accentBlue"
    },
    {
      label: "Twitter",
      href: ensureUrl(selectedProfile?.twitter?.url, "https://x.com"),
      Icon: FaXTwitter,
      accent: "hover:border-accentPurple/80 hover:text-accentPurple"
    },
    {
      label: "Sololearn",
      href: ensureUrl(selectedProfile?.sololearn?.url, "https://www.sololearn.com"),
      Icon: SiSololearn,
      accent: "hover:border-accentGreen/80 hover:text-accentGreen"
    }
  ];

  if (loading) return <Loader label="Loading dashboard..." />;

  if (!profiles.length) {
    return (
      <div className="panel text-center">
        <h2 className="text-xl font-semibold text-white">No profiles found</h2>
        <p className="mt-2 text-sm text-slate-400">Create a developer profile from the admin dashboard first.</p>
        <Link to="/admin" className="btn-primary mt-4 inline-flex">
          Go to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="panel flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Developer Dashboard</h2>
          <p className="text-sm text-slate-400">Unified profile view: API + manual social metrics</p>
        </div>
        <select className="input max-w-xs" value={selectedProfile?._id || ""} onChange={(e) => setSelectedId(e.target.value)}>
          {profiles.map((profile) => (
            <option key={profile._id} value={profile._id}>
              {profile.name} (@{profile.username})
            </option>
          ))}
        </select>
      </div>

      <ProfileCard profile={selectedProfile} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="GitHub Repos" value={selectedProfile?.stats?.github?.publicRepos ?? 0} tone="green" />
        <StatCard title="LeetCode Solved" value={selectedProfile?.stats?.leetcode?.totalSolved ?? 0} tone="orange" />
        <StatCard title="LinkedIn Followers" value={selectedProfile?.linkedin?.followers ?? 0} tone="blue" />
        <StatCard title="Twitter Followers" value={selectedProfile?.twitter?.followers ?? 0} tone="purple" />
        <StatCard title="YouTube Subscribers" value={selectedProfile?.stats?.youtube?.subscribers ?? 0} tone="blue" />
        <StatCard title="Sololearn XP" value={selectedProfile?.sololearn?.xp ?? 0} tone="green" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GithubStats stats={selectedProfile?.stats?.github} username={selectedProfile?.github} />
        <div className="space-y-4">
          <div className="panel">
            <h3 className="mb-4 text-lg font-semibold text-white">LeetCode Breakdown</h3>
            <LeetcodeStats stats={selectedProfile?.stats?.leetcode} username={selectedProfile?.leetcode} />
          </div>
          <div className="panel">
            <h3 className="mb-4 text-lg font-semibold text-white">YouTube Overview</h3>
            <YoutubeStats stats={selectedProfile?.stats?.youtube} />
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-xl font-bold text-white">Quick Platform Links</h3>
        <p className="mt-1 text-sm text-slate-400">Click any icon to open this student&apos;s platform profile.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {platformLinks.map(({ label, href, Icon, accent }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={`flex flex-col items-center gap-2 rounded-2xl border border-line bg-surface p-3 text-slate-200 transition ${accent}`}
            >
              <Icon className="text-2xl" />
              <span className="text-xs font-semibold">{label}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
