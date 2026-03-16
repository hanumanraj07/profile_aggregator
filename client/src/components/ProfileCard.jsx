import { motion } from "framer-motion";

function ProfileCard({ profile }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      className="panel flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-4">
        <img
          src={profile?.avatar || "https://api.dicebear.com/9.x/initials/svg?seed=Dev"}
          alt={profile?.name || "Developer"}
          className="h-16 w-16 rounded-2xl border border-line object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">{profile?.name || "Developer"}</h1>
          <p className="text-sm text-accentBlue">@{profile?.username || "username"}</p>
          <p className="mt-1 text-sm text-slate-400">{profile?.bio || "No bio available."}</p>
        </div>
      </div>
      <div className="rounded-xl border border-accentGreen/60 bg-accentGreen/15 px-4 py-2 font-mono text-lg text-accentGreen">
        Dev Score: {profile?.devScore || 0}
      </div>
    </motion.article>
  );
}

export default ProfileCard;
