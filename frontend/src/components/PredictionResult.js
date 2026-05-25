import React from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar, Legend
} from "recharts";
import { AlertTriangle, CheckCircle, Brain, TrendingUp, Download } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a26] border border-violet-500/30 rounded-xl p-3 text-sm">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-white font-semibold font-mono">{payload[0].value.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

export default function PredictionResult({ result, onExportPDF, isExporting }) {
  if (!result) return null;

  const isMalignant = result.prediction === "MALIGNANT";

  const barData = [
    { name: "Benign",    value: result.benign_prob,    fill: "#10b981" },
    { name: "Malignant", value: result.malignant_prob, fill: "#ef4444" },
  ];

  const modalityData = [
    { name: "Mammo B",  value: result.mammogram_benign || 0,    fill: "#10b981" },
    { name: "Mammo M",  value: result.mammogram_malignant || 0, fill: "#ef4444" },
    { name: "US B",     value: result.ultrasound_benign || 0,   fill: "#34d399" },
    { name: "US M",     value: result.ultrasound_malignant || 0, fill: "#f87171" },
  ];

  const radialData = [
    { name: "Confidence", value: result.confidence, fill: isMalignant ? "#ef4444" : "#10b981" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Final verdict */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className={`relative rounded-2xl p-6 overflow-hidden ${
          isMalignant
            ? "bg-red-950/30 border border-red-500/30"
            : "bg-emerald-950/30 border border-emerald-500/30"
        }`}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: isMalignant
              ? "radial-gradient(circle at 70% 50%, #ef444444 0%, transparent 70%)"
              : "radial-gradient(circle at 70% 50%, #10b98144 0%, transparent 70%)"
          }}
        />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              isMalignant ? "bg-red-500/20 border border-red-500/40" : "bg-emerald-500/20 border border-emerald-500/40"
            }`}>
              {isMalignant
                ? <AlertTriangle size={24} className="text-red-400" />
                : <CheckCircle size={24} className="text-emerald-400" />
              }
            </div>
            <div>
              <p className="text-xs font-mono text-gray-500 mb-1 uppercase tracking-widest">Final Prediction</p>
              <h2 className={`text-3xl font-display font-bold tracking-tight ${
                isMalignant ? "text-red-400" : "text-emerald-400"
              }`}>
                {result.prediction}
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-mono">
                Patient: <span className="text-violet-400">{result.patient_id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">Confidence</p>
              <p className={`text-2xl font-display font-bold ${
                isMalignant ? "text-red-400" : "text-emerald-400"
              }`}>
                {result.confidence.toFixed(1)}%
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: "rgba(124,58,237,0.15)",
                border: "1px solid rgba(124,58,237,0.4)",
                color: "#a78bfa",
              }}
            >
              <Download size={15} />
              {isExporting ? "Generating..." : "Export PDF"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Probability bars + modality breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Main bar chart */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-violet-400" />
            Fused Probability
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Modality breakdown */}
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-display font-semibold text-white mb-4 flex items-center gap-2">
            <Brain size={15} className="text-amber-400" />
            Modality Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={modalityData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "DM Sans" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {modalityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Probability cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Benign Probability",    value: result.benign_prob,    color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)" },
          { label: "Malignant Probability", value: result.malignant_prob, color: "#ef4444", bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.25)"  },
        ].map(({ label, value, color, bg, border }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4"
            style={{ background: bg, border: `1px solid ${border}` }}
          >
            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-2">{label}</p>
            <p className="text-3xl font-display font-bold" style={{ color }}>
              {value.toFixed(1)}<span className="text-lg">%</span>
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-black/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-violet rounded-2xl p-5"
      >
        <h3 className="text-sm font-display font-semibold text-violet-300 mb-3 flex items-center gap-2">
          <Brain size={15} className="text-amber-400" />
          AI Analysis Explanation
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed">{result.explanation}</p>
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-300/80 leading-relaxed">
            This AI result is for research purposes only. Always consult a qualified radiologist or oncologist for clinical diagnosis and treatment decisions.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
