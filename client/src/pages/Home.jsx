import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const features = [
  "Unified dashboard for GitHub, LeetCode, YouTube, LinkedIn, Twitter, and Sololearn",
  "Verify Profile button to auto-fetch platform stats from APIs",
  "Developer Score system and live leaderboard",
  "Public Dev Card generator for social sharing"
];

function Home() {
  const { user } = useAuth();
  const primaryRoute = user?.role === "admin" ? "/admin" : "/student-dashboard";

  return (
    <div className="space-y-8">
      <section className="panel border-accentBlue/40 bg-gradient-to-br from-accentBlue/15 to-accentPurple/10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-4">
          <p className="inline-flex rounded-full border border-accentGreen/50 bg-accentGreen/15 px-3 py-1 text-xs text-accentGreen">
            MERN Developer Platform
          </p>
          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Aggregate every developer signal into one professional profile.
          </h1>
          <p className="max-w-3xl text-slate-300">
            Build your unified developer identity with API-powered stats, manual social metrics, score ranking, and viral dev cards.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to={primaryRoute} className="btn-primary">
              Open {user?.role === "admin" ? "Admin" : "Student"} Route
            </Link>
            <Link to="/leaderboard" className="btn-secondary">
              View Leaderboard + Cards
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => (
          <motion.article
            key={feature}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.08 }}
            className="panel"
          >
            <p className="text-sm text-slate-200">{feature}</p>
          </motion.article>
        ))}
      </section>
    </div>
  );
}

export default Home;
