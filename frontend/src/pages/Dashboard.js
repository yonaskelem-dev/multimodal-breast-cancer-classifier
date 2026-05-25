import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Scan, Microscope, Play, RotateCcw, Wifi, WifiOff,
  Activity, CheckCircle2, AlertCircle, Hash
} from "lucide-react";

import UploadZone from "../components/UploadZone";
import PredictionResult from "../components/PredictionResult";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import { runPrediction, exportPDFReport } from "../utils/api";

export default function Dashboard() {
  const [mammoFile, setMammoFile]   = useState(null);
  const [mammoPreview, setMammoPreview] = useState(null);
  const [usFile, setUsFile]         = useState(null);
  const [usPreview, setUsPreview]   = useState(null);
  const [patientId, setPatientId]   = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleMammoFile = useCallback((file) => {
    if (!file) {
      setMammoFile(null);
      setMammoPreview(null);
      return;
    }
    setMammoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setMammoPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleUsFile = useCallback((file) => {
    if (!file) {
      setUsFile(null);
      setUsPreview(null);
      return;
    }
    setUsFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setUsPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handlePredict = async () => {
    if (!mammoFile || !usFile) {
      toast.error("Please upload both mammogram and ultrasound images.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await runPrediction(mammoFile, usFile, patientId.trim());
      setResult(data);
      toast.success(`Prediction complete: ${data.prediction}`, { duration: 4000 });
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || "Prediction failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMammoFile(null);
    setMammoPreview(null);
    setUsFile(null);
    setUsPreview(null);
    setResult(null);
    setPatientId("");
  };

  const handleExportPDF = async () => {
    if (!result) return;
    setIsExporting(true);
    try {
      await exportPDFReport({
        patient_id: result.patient_id || "UNKNOWN",
        prediction: result.prediction,
        benign_prob: result.benign_prob,
        malignant_prob: result.malignant_prob,
        confidence: result.confidence,
        mammogram_benign: result.mammogram_benign,
        mammogram_malignant: result.mammogram_malignant,
        ultrasound_benign: result.ultrasound_benign,
        ultrasound_malignant: result.ultrasound_malignant,
        explanation: result.explanation,
        timestamp: result.timestamp,
      });
      toast.success("PDF report downloaded!");
    } catch (err) {
      toast.error("PDF export failed. Make sure reportlab is installed.");
    } finally {
      setIsExporting(false);
    }
  };

  const readyToPredict = mammoFile && usFile && !loading;

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
              <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">
                AI Diagnostic Tool
              </span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white leading-tight">
              Multimodal Breast Cancer
              <br />
              <span className="gradient-text">Classification System</span>
            </h1>
            <p className="text-gray-400 text-sm mt-2 max-w-lg">
              ResNet18 deep learning fusion of mammography and ultrasound imaging
              for early breast cancer detection.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-violet-900/30">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-xs text-emerald-400 font-mono">System Online</span>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Scan}       label="Modalities"  value="2"         sub="Mammo + US"          accent="violet" delay={0.05} />
        <StatCard icon={Activity}   label="Architecture" value="ResNet18"  sub="Late fusion"          accent="amber"  delay={0.1}  />
        <StatCard icon={CheckCircle2} label="Classes"   value="Binary"    sub="Benign / Malignant"   accent="green"  delay={0.15} />
        <StatCard icon={Microscope} label="Fusion"      value="Ensemble"  sub="Avg softmax scores"   accent="red"    delay={0.2}  />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left panel: Upload + Controls */}
        <div className="space-y-6">
          {/* Upload panel */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display font-semibold text-white text-base mb-5 flex items-center gap-2">
              <Scan size={16} className="text-violet-400" />
              Image Upload
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <UploadZone
                label="Mammogram"
                subtitle="JPEG, PNG, TIFF, BMP"
                file={mammoFile}
                preview={mammoPreview}
                onFile={handleMammoFile}
                icon={Scan}
                accentColor="violet"
              />
              <UploadZone
                label="Ultrasound"
                subtitle="JPEG, PNG, TIFF, BMP"
                file={usFile}
                preview={usPreview}
                onFile={handleUsFile}
                icon={Microscope}
                accentColor="amber"
              />
            </div>
          </motion.div>

          {/* Patient ID + Controls */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <h2 className="font-display font-semibold text-white text-base flex items-center gap-2">
              <Hash size={16} className="text-amber-400" />
              Patient Information
            </h2>

            <div>
              <label className="block text-xs text-gray-500 font-mono uppercase tracking-widest mb-2">
                Patient ID (optional)
              </label>
              <input
                type="text"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                placeholder="e.g. PAT-001 (auto-generated if blank)"
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.6)")}
                onBlur={e => (e.target.style.borderColor = "rgba(124,58,237,0.2)")}
              />
            </div>

            <div className="flex gap-3 pt-1">
              {/* Predict button */}
              <motion.button
                whileHover={{ scale: readyToPredict ? 1.02 : 1 }}
                whileTap={{ scale: readyToPredict ? 0.98 : 1 }}
                onClick={handlePredict}
                disabled={!readyToPredict}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl font-display font-semibold text-sm transition-all relative overflow-hidden ${
                  readyToPredict
                    ? "text-white cursor-pointer"
                    : "text-gray-600 cursor-not-allowed"
                }`}
                style={{
                  background: readyToPredict
                    ? "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
                    : "rgba(255,255,255,0.04)",
                  border: readyToPredict
                    ? "1px solid rgba(167,139,250,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: readyToPredict ? "0 0 20px rgba(124,58,237,0.35)" : "none",
                }}
              >
                <Play size={16} />
                Run Multimodal Prediction
                {readyToPredict && (
                  <motion.div
                    className="absolute inset-0 bg-white/5"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ clipPath: "polygon(0 0, 30% 0, 20% 100%, -10% 100%)" }}
                  />
                )}
              </motion.button>

              {/* Reset button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-all"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <RotateCcw size={16} />
              </motion.button>
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { label: "Mammogram", ready: !!mammoFile },
                { label: "Ultrasound", ready: !!usFile },
              ].map(({ label, ready }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className={`w-2 h-2 rounded-full ${ready ? "bg-emerald-400" : "bg-gray-600"}`} />
                  <span className="text-xs text-gray-500 font-mono">{label}</span>
                  <span className={`ml-auto text-xs font-mono ${ready ? "text-emerald-400" : "text-gray-600"}`}>
                    {ready ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right panel: Results */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="min-h-[400px]"
        >
          <div className="glass rounded-2xl p-6 min-h-[400px] flex flex-col">
            <h2 className="font-display font-semibold text-white text-base mb-5 flex items-center gap-2">
              <Activity size={16} className="text-violet-400" />
              Prediction Results
            </h2>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {loading ? (
                  <LoadingSpinner key="spinner" message="Running multimodal inference..." />
                ) : result ? (
                  <PredictionResult
                    key="result"
                    result={result}
                    onExportPDF={handleExportPDF}
                    isExporting={isExporting}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-64 gap-4 text-center"
                  >
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center"
                      style={{
                        background: "rgba(124,58,237,0.06)",
                        border: "1px solid rgba(124,58,237,0.15)",
                      }}
                    >
                      <Scan size={32} className="text-violet-800" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium">
                        Upload both images to begin analysis
                      </p>
                      <p className="text-gray-700 text-xs mt-1 font-mono">
                        Mammogram + Ultrasound → Multimodal Fusion
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Workflow diagram */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 glass rounded-2xl p-5"
      >
        <p className="text-xs text-gray-600 font-mono uppercase tracking-widest mb-4">
          Inference Pipeline
        </p>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {[
            "Upload Images",
            "Preprocess (224×224)",
            "ResNet18 Mammogram",
            "ResNet18 Ultrasound",
            "Late Fusion (avg softmax)",
            "Benign / Malignant",
          ].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div
                className="px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{
                  background: "rgba(124,58,237,0.08)",
                  border: "1px solid rgba(124,58,237,0.2)",
                  color: "#a78bfa",
                }}
              >
                {step}
              </div>
              {i < arr.length - 1 && (
                <span className="text-gray-700 text-xs">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
