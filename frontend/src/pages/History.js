import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { format } from "date-fns";
import {
  History as HistoryIcon, Search, Trash2, RefreshCw,
  AlertTriangle, CheckCircle, Calendar, User, BarChart2, Filter
} from "lucide-react";
import { fetchHistory, deleteHistoryEntry } from "../utils/api";

function PredBadge({ prediction }) {
  const isMal = prediction === "MALIGNANT";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold ${
        isMal ? "text-red-400" : "text-emerald-400"
      }`}
      style={{
        background: isMal ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
        border: `1px solid ${isMal ? "rgba(239,68,68,0.25)" : "rgba(16,185,129,0.25)"}`,
      }}
    >
      {isMal ? <AlertTriangle size={11} /> : <CheckCircle size={11} />}
      {prediction}
    </span>
  );
}

export default function History() {
  const [entries, setEntries]       = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [filterPred, setFilterPred] = useState("ALL");
  const [deleting, setDeleting]     = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHistory();
      const sorted = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setEntries(sorted);
    } catch (err) {
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    let result = entries;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.patient_id?.toLowerCase().includes(q) ||
        e.prediction?.toLowerCase().includes(q)
      );
    }
    if (filterPred !== "ALL") {
      result = result.filter(e => e.prediction === filterPred);
    }
    setFiltered(result);
  }, [entries, search, filterPred]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteHistoryEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success("Entry deleted.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const malCount = entries.filter(e => e.prediction === "MALIGNANT").length;
  const benCount = entries.filter(e => e.prediction === "BENIGN").length;

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
          <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Records</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Prediction <span className="gradient-text">History</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">All past diagnostic sessions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={loadHistory}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-violet-300 transition-all"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)" }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total",     value: entries.length, color: "violet", icon: BarChart2 },
          { label: "Benign",    value: benCount,        color: "green",  icon: CheckCircle },
          { label: "Malignant", value: malCount,        color: "red",    icon: AlertTriangle },
        ].map(({ label, value, color, icon: Icon }, i) => {
          const styles = {
            violet: { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)", text: "text-violet-400" },
            green:  { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", text: "text-emerald-400" },
            red:    { bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)",  text: "text-red-400"    },
          }[color];
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4"
              style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={styles.text} />
                <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">{label}</p>
              </div>
              <p className={`text-3xl font-display font-bold ${styles.text}`}>{value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Patient ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {["ALL", "BENIGN", "MALIGNANT"].map(opt => (
            <button
              key={opt}
              onClick={() => setFilterPred(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                filterPred === opt
                  ? "bg-violet-600 text-white"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.12)" }}>
            <HistoryIcon size={28} className="text-violet-800" />
          </div>
          <p className="text-gray-500 text-sm">No prediction records found.</p>
        </motion.div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["#", "Patient ID", "Prediction", "Benign %", "Malignant %", "Confidence", "Date & Time", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-mono text-gray-600 uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((entry, i) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5 text-xs text-gray-600 font-mono">{entry.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-violet-500" />
                          <span className="text-sm text-white font-mono">{entry.patient_id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <PredBadge prediction={entry.prediction} />
                      </td>
                      <td className="px-4 py-3.5 text-sm font-mono text-emerald-400">{entry.benign_prob?.toFixed(1)}%</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-red-400">{entry.malignant_prob?.toFixed(1)}%</td>
                      <td className="px-4 py-3.5 text-sm font-mono text-amber-400">{entry.confidence?.toFixed(1)}%</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={11} />
                          <span className="font-mono">
                            {entry.timestamp
                              ? format(new Date(entry.timestamp), "MMM dd, yyyy HH:mm")
                              : entry.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleting === entry.id}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          {deleting === entry.id
                            ? <RefreshCw size={13} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
