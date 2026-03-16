import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    const run = async () => {
      try {
        const data = await profileApi.getOne(id);
        setProfile(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Profile not found.", "error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, pushToast]);

  const scoreBreakdown = useMemo(() => {
    const repos = profile?.stats?.github?.publicRepos ?? 0;
    const solved = profile?.stats?.leetcode?.totalSolved ?? 0;
    const videos = profile?.stats?.youtube?.videos ?? 0;
    return {
      repos,
      solved,
      videos,
      total: repos * 2 + solved * 3 + videos
    };
  }, [profile]);

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

  if (loading) return <Loader label="Loading profile..." />;

  if (!profile) {
    return (
      <div className="panel text-center">
        <p className="text-slate-300">Profile not available.</p>
        <Link to="/dashboard" className="btn-secondary mt-3 inline-flex">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileCard profile={profile} />

      <section className="panel">
        <h2 className="text-xl font-semibold text-white">Developer Score Formula</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-3 font-mono text-sm">
            GitHub Repos: {scoreBreakdown.repos} x 2
          </div>
          <div className="rounded-xl border border-line bg-surface p-3 font-mono text-sm">
            LeetCode Solved: {scoreBreakdown.solved} x 3
          </div>
          <div className="rounded-xl border border-line bg-surface p-3 font-mono text-sm">
            YouTube Videos: {scoreBreakdown.videos} x 1
          </div>
          <div className="rounded-xl border border-accentGreen/70 bg-accentGreen/15 p-3 font-mono text-sm text-accentGreen">
            Total Dev Score: {scoreBreakdown.total}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard title="GitHub Followers" value={profile?.stats?.github?.followers ?? 0} tone="green" />
        <StatCard title="LeetCode Ranking" value={profile?.stats?.leetcode?.ranking ?? 0} tone="orange" />
        <StatCard title="YouTube Subscribers" value={profile?.stats?.youtube?.subscribers ?? 0} tone="blue" />
        <StatCard title="LinkedIn Connections" value={profile?.linkedin?.connections ?? 0} tone="blue" />
        <StatCard title="Twitter Followers" value={profile?.twitter?.followers ?? 0} tone="purple" />
        <StatCard title="Sololearn Badges" value={profile?.sololearn?.badges ?? 0} tone="green" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <GithubStats stats={profile?.stats?.github} username={profile?.github} />
        <div className="space-y-4">
          <div className="panel">
            <h3 className="mb-4 text-lg font-semibold text-white">LeetCode Stats</h3>
            <LeetcodeStats stats={profile?.stats?.leetcode} username={profile?.leetcode} />
          </div>
          <div className="panel">
            <h3 className="mb-4 text-lg font-semibold text-white">YouTube Stats</h3>
            <YoutubeStats stats={profile?.stats?.youtube} />
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

export default Profile;
