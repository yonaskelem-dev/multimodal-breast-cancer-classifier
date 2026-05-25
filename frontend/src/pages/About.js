import React from "react";
import { motion } from "framer-motion";
import { Brain, Layers, Cpu, GitMerge, FlaskConical, GraduationCap, Shield, Zap } from "lucide-react";

const techItems = [
  { label: "PyTorch",        sub: "ResNet18 deep learning backbone",          icon: Brain,       accent: "violet" },
  { label: "FastAPI",        sub: "High-performance Python REST API",          icon: Zap,         accent: "amber"  },
  { label: "React.js",       sub: "Dynamic single-page application",           icon: Layers,      accent: "violet" },
  { label: "Framer Motion",  sub: "Production-grade UI animations",            icon: Cpu,         accent: "amber"  },
  { label: "Late Fusion",    sub: "Average softmax ensemble strategy",         icon: GitMerge,    accent: "violet" },
  { label: "Tailwind CSS",   sub: "Utility-first responsive styling",          icon: FlaskConical, accent: "amber" },
];

const accents = {
  violet: { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", icon: "text-violet-400" },
  amber:  { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", icon: "text-amber-400"  },
};

const steps = [
  { n: "01", title: "Upload",     desc: "Drag and drop or browse mammogram and ultrasound images."         },
  { n: "02", title: "Preprocess", desc: "Images are resized to 224×224 and normalized for ResNet18."       },
  { n: "03", title: "Inference",  desc: "Two separate ResNet18 models independently analyze each modality." },
  { n: "04", title: "Fusion",     desc: "Softmax probabilities are averaged via late fusion ensemble."      },
  { n: "05", title: "Result",     desc: "Final prediction (Benign/Malignant) with confidence scores."       },
  { n: "06", title: "Export",     desc: "Download a full PDF diagnostic report for clinical review."        },
];

export default function About() {
  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
          <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Project Overview</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white">
          About This <span className="gradient-text">System</span>
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-2xl leading-relaxed">
          A university final-year project / research demo demonstrating multimodal AI for
          breast cancer classification, combining mammography and ultrasound imaging using
          deep learning fusion techniques.
        </p>
      </motion.div>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <h2 className="font-display font-semibold text-white text-lg mb-5 flex items-center gap-2">
          <GitMerge size={17} className="text-violet-400" />
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map(({ n, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="glass rounded-2xl p-4 relative overflow-hidden"
            >
              <div
                className="absolute top-3 right-3 text-3xl font-display font-bold opacity-10"
                style={{ color: "#7c3aed" }}
              >
                {n}
              </div>
              <p className="text-xs font-mono text-violet-500 mb-1.5">{n}</p>
              <h3 className="font-display font-semibold text-white text-sm mb-2">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Tech stack */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-10"
      >
        <h2 className="font-display font-semibold text-white text-lg mb-5 flex items-center gap-2">
          <Cpu size={17} className="text-amber-400" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techItems.map(({ label, sub, icon: Icon, accent }, i) => {
            const c = accents[accent];
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl p-4"
                style={{ background: c.bg, border: `1px solid ${c.border}` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <Icon size={16} className={c.icon} />
                  </div>
                  <div>
                    <p className="text-sm font-display font-semibold text-white">{label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl p-5"
        style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400 mb-1">Medical Disclaimer</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              This system is intended for <strong className="text-white">educational and research purposes only</strong>.
              It is not a certified medical device and must not be used for clinical diagnosis or
              treatment decisions. All AI predictions should be reviewed by a qualified radiologist
              or oncologist before any medical action is taken. The authors assume no liability for
              any clinical use of this software.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-700 font-mono">
          Multimodal Breast Cancer Classification System · Final Year Project · Built with PyTorch + React
        </p>
      </div>
    </div>
  );
}
