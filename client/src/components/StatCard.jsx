import { motion } from "framer-motion";

function StatCard({ title, value, subValue = "", tone = "blue" }) {
  const toneClass = {
    blue: "hover:shadow-glowBlue hover:border-accentBlue/70",
    green: "hover:shadow-glowGreen hover:border-accentGreen/70",
    purple: "hover:shadow-glowPurple hover:border-accentPurple/70",
    orange: "hover:shadow-glowOrange hover:border-accentOrange/70"
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -4 }}
      className={`panel transition ${toneClass[tone] || toneClass.blue}`}
    >
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 font-mono text-2xl font-bold text-white">{value}</p>
      {subValue ? <p className="mt-1 text-xs text-slate-500">{subValue}</p> : null}
    </motion.article>
  );
}

export default StatCard;
