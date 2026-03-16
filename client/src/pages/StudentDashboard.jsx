import { useEffect, useState } from "react";
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

function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const ensureUrl = (value, fallback) => {
    if (!value) return fallback;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `https://${value}`;
  };

  const youtubeUrl = (() => {
    const channel = profile?.youtube?.trim();
    if (!channel) return "https://www.youtube.com";
    if (channel.startsWith("http://") || channel.startsWith("https://")) return channel;
    if (channel.startsWith("@")) return `https://www.youtube.com/${channel}`;
    if (channel.startsWith("UC")) return `https://www.youtube.com/channel/${channel}`;
    return `https://www.youtube.com/@${channel}`;
  })();

  const platformLinks = [
    {
      label: "GitHub",
      href: profile?.github ? `https://github.com/${profile.github}` : "https://github.com",
      Icon: FaGithub,
      accent: "hover:border-accentGreen/80 hover:text-accentGreen"
    },
    {
      label: "LeetCode",
      href: profile?.leetcode ? `https://leetcode.com/${profile.leetcode}` : "https://leetcode.com",
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
      href: ensureUrl(profile?.linkedin?.url, "https://www.linkedin.com"),
      Icon: FaLinkedin,
      accent: "hover:border-accentBlue/80 hover:text-accentBlue"
    },
    {
      label: "Twitter",
      href: ensureUrl(profile?.twitter?.url, "https://x.com"),
      Icon: FaXTwitter,
      accent: "hover:border-accentPurple/80 hover:text-accentPurple"
    },
    {
      label: "Sololearn",
      href: ensureUrl(profile?.sololearn?.url, "https://www.sololearn.com"),
      Icon: SiSololearn,
      accent: "hover:border-accentGreen/80 hover:text-accentGreen"
    }
  ];

  useEffect(() => {
    const run = async () => {
      try {
        const data = await profileApi.getMe();
        setProfile(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Could not load student dashboard.", "error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pushToast]);

  if (loading) return <Loader label="Loading student dashboard..." />;
  if (!profile) return <Loader label="Student profile not found." />;

  return (
    <div className="space-y-6">
      <section className="panel flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Student Dashboard</h2>
          <p className="text-sm text-slate-400">All six platform details in one dashboard view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/student" className="btn-secondary">
            Edit Profile
          </Link>
          <Link to="/leaderboard" className="btn-secondary">
            Leaderboard
          </Link>
        </div>
      </section>

      <ProfileCard profile={profile} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="GitHub Repos" value={profile?.stats?.github?.publicRepos ?? 0} tone="green" />
        <StatCard title="LeetCode Solved" value={profile?.stats?.leetcode?.totalSolved ?? 0} tone="orange" />
        <StatCard title="YouTube Subscribers" value={profile?.stats?.youtube?.subscribers ?? 0} tone="blue" />
        <StatCard title="LinkedIn Followers" value={profile?.linkedin?.followers ?? 0} tone="blue" />
        <StatCard title="Twitter Followers" value={profile?.twitter?.followers ?? 0} tone="purple" />
        <StatCard title="Sololearn XP" value={profile?.sololearn?.xp ?? 0} tone="green" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GithubStats stats={profile?.stats?.github} username={profile?.github} />
        <div className="space-y-4">
          <div className="panel">
            <h3 className="mb-4 text-lg font-semibold text-white">LeetCode Breakdown</h3>
            <LeetcodeStats stats={profile?.stats?.leetcode} username={profile?.leetcode} />
          </div>
          <div className="panel">
            <h3 className="mb-4 text-lg font-semibold text-white">YouTube Overview</h3>
            <YoutubeStats stats={profile?.stats?.youtube} />
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-xl font-bold text-white">Manual Platform Details</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm text-slate-400">LinkedIn</p>
            <p className="mt-2 text-sm text-slate-200">{profile?.linkedin?.url || "Not set"}</p>
            <p className="mt-2 font-mono text-sm text-accentBlue">
              Followers: {profile?.linkedin?.followers ?? 0} | Connections: {profile?.linkedin?.connections ?? 0}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm text-slate-400">Twitter</p>
            <p className="mt-2 text-sm text-slate-200">{profile?.twitter?.url || "Not set"}</p>
            <p className="mt-2 font-mono text-sm text-accentPurple">Followers: {profile?.twitter?.followers ?? 0}</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-sm text-slate-400">Sololearn</p>
            <p className="mt-2 text-sm text-slate-200">{profile?.sololearn?.url || "Not set"}</p>
            <p className="mt-2 font-mono text-sm text-accentGreen">
              XP: {profile?.sololearn?.xp ?? 0} | Badges: {profile?.sololearn?.badges ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3 className="text-xl font-bold text-white">Quick Platform Links</h3>
        <p className="mt-1 text-sm text-slate-400">Click any icon to open your platform profile.</p>
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

export default StudentDashboard;
