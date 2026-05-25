import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, sub, accent = "violet", delay = 0 }) {
  const colors = {
    violet: { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", icon: "text-violet-400", value: "text-violet-300" },
    amber:  { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: "text-amber-400",  value: "text-amber-300"  },
    green:  { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", icon: "text-emerald-400", value: "text-emerald-300" },
    red:    { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  icon: "text-red-400",    value: "text-red-300"    },
  };
  const c = colors[accent] || colors.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">{label}</p>
          <p className={`text-2xl font-display font-bold ${c.value}`}>{value}</p>
          {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          <Icon size={18} className={c.icon} />
        </div>
      </div>
    </motion.div>
  );
}
