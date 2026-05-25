import React from "react";
import { motion } from "framer-motion";

export default function LoadingSpinner({ message = "Analyzing images..." }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 gap-6"
    >
      {/* Animated rings */}
      <div className="relative w-20 h-20 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: `${(i + 1) * 28}px`,
              height: `${(i + 1) * 28}px`,
              borderColor: i === 0 ? "#7c3aed" : i === 1 ? "#a78bfa44" : "#7c3aed22",
              borderTopColor: i === 0 ? "#f59e0b" : "transparent",
            }}
            animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
            transition={{
              duration: 1.5 + i * 0.5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        ))}
        <div className="w-6 h-6 rounded-full bg-violet-600/40 border border-violet-500/50" />
      </div>

      <div className="text-center space-y-2">
        <p className="text-white font-display font-semibold tracking-wide">{message}</p>
        <div className="flex items-center gap-1.5 justify-center">
          {["Preprocessing", "Inference", "Fusion"].map((step, i) => (
            <motion.div
              key={step}
              className="flex items-center gap-1.5"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.5, delay: i * 0.4, repeat: Infinity }}
              />
              <span className="text-xs text-gray-500 font-mono">{step}</span>
              {i < 2 && <span className="text-gray-700 text-xs">→</span>}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-[#1a1a26] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #7c3aed, #f59e0b)" }}
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
