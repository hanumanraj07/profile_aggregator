import { useEffect, useMemo, useState } from "react";
import Loader from "../components/Loader";
import ProfileCard from "../components/ProfileCard";
import { useToast } from "../components/ToastContext";
import { profileApi } from "../services/api";

const initialForm = {
  name: "",
  username: "",
  bio: "",
  avatar: "",
  github: "",
  leetcode: "",
  youtube: "",
  linkedinUrl: "",
  linkedinFollowers: "",
  linkedinConnections: "",
  twitterUrl: "",
  twitterFollowers: "",
  sololearnUrl: "",
  sololearnXp: "",
  sololearnBadges: ""
};

function Student() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [verifiedStats, setVerifiedStats] = useState({});
  const [verifyErrors, setVerifyErrors] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { pushToast } = useToast();

  const hydrateForm = (data) => {
    setForm({
      name: data?.name || "",
      username: data?.username || "",
      bio: data?.bio || "",
      avatar: data?.avatar || "",
      github: data?.github || "",
      leetcode: data?.leetcode || "",
      youtube: data?.youtube || "",
      linkedinUrl: data?.linkedin?.url || "",
      linkedinFollowers: String(data?.linkedin?.followers ?? 0),
      linkedinConnections: String(data?.linkedin?.connections ?? 0),
      twitterUrl: data?.twitter?.url || "",
      twitterFollowers: String(data?.twitter?.followers ?? 0),
      sololearnUrl: data?.sololearn?.url || "",
      sololearnXp: String(data?.sololearn?.xp ?? 0),
      sololearnBadges: String(data?.sololearn?.badges ?? 0)
    });
  };

  const loadData = async () => {
    const [me, leaders] = await Promise.all([profileApi.getMe(), profileApi.leaderboard()]);
    setProfile(me);
    setVerifiedStats(me.stats || {});
    hydrateForm(me);
    setLeaderboard(leaders);
  };

  useEffect(() => {
    const run = async () => {
      try {
        await loadData();
      } catch (error) {
        pushToast(error.response?.data?.message || "Could not load student data.", "error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [pushToast]);

  const payload = useMemo(
    () => ({
      name: form.name,
      username: form.username,
      bio: form.bio,
      avatar: form.avatar,
      github: form.github,
      leetcode: form.leetcode,
      youtube: form.youtube,
      linkedin: {
        url: form.linkedinUrl,
        followers: Number(form.linkedinFollowers || 0),
        connections: Number(form.linkedinConnections || 0)
      },
      twitter: {
        url: form.twitterUrl,
        followers: Number(form.twitterFollowers || 0)
      },
      sololearn: {
        url: form.sololearnUrl,
        xp: Number(form.sololearnXp || 0),
        badges: Number(form.sololearnBadges || 0)
      },
      stats: verifiedStats
    }),
    [form, verifiedStats]
  );

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onVerify = async () => {
    if (!form.github && !form.leetcode && !form.youtube) {
      pushToast("Add at least one platform username before verify.", "error");
      return;
    }

    setVerifying(true);
    try {
      const result = await profileApi.verify({
        github: form.github,
        leetcode: form.leetcode,
        youtube: form.youtube
      });
      setVerifiedStats(result.stats || {});
      setVerifyErrors(result.errors || {});
      if (!form.avatar && result.stats?.github?.avatar) {
        setForm((prev) => ({ ...prev, avatar: result.stats.github.avatar }));
      }
      if (!form.bio && result.stats?.github?.bio) {
        setForm((prev) => ({ ...prev, bio: result.stats.github.bio }));
      }
      const failures = Object.entries(result.errors || {}).filter(([, value]) => Boolean(value));
      if (failures.length) {
        pushToast(`Partial verify failed for: ${failures.map(([k]) => k).join(", ")}`, "error");
      } else {
        pushToast("All platform stats verified.", "success");
      }
    } catch (error) {
      pushToast(error.response?.data?.message || "Verification failed.", "error");
    } finally {
      setVerifying(false);
    }
  };

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await profileApi.updateMe(payload);
      setProfile(updated);
      setVerifiedStats(updated.stats || {});
      hydrateForm(updated);
      pushToast("Your profile has been updated.", "success");
      const leaders = await profileApi.leaderboard();
      setLeaderboard(leaders);
    } catch (error) {
      pushToast(error.response?.data?.message || "Could not save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading student dashboard..." />;

  return (
    <div className="space-y-6">
      <ProfileCard profile={profile} />

      <section className="panel">
        <h2 className="text-xl font-bold text-white">Student Profile Route</h2>
        <p className="mt-1 text-sm text-slate-400">
          Add/edit your details for GitHub, LeetCode, YouTube, LinkedIn, Twitter, and Sololearn.
        </p>

        <form className="mt-5 space-y-4" onSubmit={onSave}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <input name="name" className="input" value={form.name} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Username</label>
              <input name="username" className="input" value={form.username} onChange={onChange} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Bio</label>
            <textarea name="bio" className="input min-h-24" value={form.bio} onChange={onChange} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-slate-300">GitHub</label>
              <input name="github" className="input" value={form.github} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">LeetCode</label>
              <input name="leetcode" className="input" value={form.leetcode} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">YouTube</label>
              <input name="youtube" className="input" value={form.youtube} onChange={onChange} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">LinkedIn URL</label>
              <input name="linkedinUrl" className="input" value={form.linkedinUrl} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">LinkedIn Followers</label>
              <input name="linkedinFollowers" type="number" className="input" value={form.linkedinFollowers} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Twitter URL</label>
              <input name="twitterUrl" className="input" value={form.twitterUrl} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Twitter Followers</label>
              <input name="twitterFollowers" type="number" className="input" value={form.twitterFollowers} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Sololearn URL</label>
              <input name="sololearnUrl" className="input" value={form.sololearnUrl} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Sololearn XP</label>
              <input name="sololearnXp" type="number" className="input" value={form.sololearnXp} onChange={onChange} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Sololearn Badges</label>
              <input name="sololearnBadges" type="number" className="input" value={form.sololearnBadges} onChange={onChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Avatar URL</label>
              <input name="avatar" className="input" value={form.avatar} onChange={onChange} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn-secondary" onClick={onVerify} disabled={verifying}>
              {verifying ? "Verifying..." : "Verify Profile"}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save My Details"}
            </button>
          </div>

          {Object.keys(verifyErrors).length ? (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
              {Object.entries(verifyErrors)
                .filter(([, message]) => Boolean(message))
                .map(([platform, message]) => (
                  <p key={platform}>
                    {platform}: {message}
                  </p>
                ))}
            </div>
          ) : null}
        </form>
      </section>

      <section className="panel">
        <h3 className="text-xl font-bold text-white">Leaderboard</h3>
        <p className="mt-1 text-sm text-slate-400">Students can always view leaderboard from this route.</p>
        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <table className="min-w-full divide-y divide-line text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <tr key={entry._id}>
                  <td className="px-4 py-3 font-mono text-accentBlue">#{index + 1}</td>
                  <td className="px-4 py-3">{entry.name}</td>
                  <td className="px-4 py-3 font-mono text-accentGreen">{entry.devScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Student;
