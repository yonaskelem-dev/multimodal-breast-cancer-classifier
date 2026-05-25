import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ZoomIn } from "lucide-react";

export default function UploadZone({ label, subtitle, file, preview, onFile, icon: Icon, accentColor = "violet" }) {
  const [lightbox, setLightbox] = useState(false);

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 0) onFile(accepted[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"] },
    multiple: false,
  });

  const accent = accentColor === "amber"
    ? { border: "rgba(245,158,11,0.4)", bg: "rgba(245,158,11,0.04)", glow: "rgba(245,158,11,0.2)", text: "text-amber-400", ring: "ring-amber-500/40" }
    : { border: "rgba(124,58,237,0.4)", bg: "rgba(124,58,237,0.04)", glow: "rgba(124,58,237,0.2)", text: "text-violet-400", ring: "ring-violet-500/40" };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className={accent.text} />}
          <h3 className="text-sm font-semibold text-white font-display tracking-wide">{label}</h3>
          {file && (
            <span className="ml-auto text-xs text-gray-500 font-mono truncate max-w-[140px]">
              {file.name}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative group rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${accent.border}`, background: "#12121a" }}
            >
              <img
                src={preview}
                alt={label}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLightbox(true)}
                  className="p-2 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20"
                >
                  <ZoomIn size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onFile(null)}
                  className="p-2 rounded-lg bg-red-500/20 backdrop-blur-sm text-red-400 border border-red-500/30"
                >
                  <X size={16} />
                </motion.button>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, transparent, ${accent.border}, transparent)` }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              {...getRootProps()}
              className={`upload-zone rounded-2xl h-48 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${isDragActive ? "drag-over" : ""}`}
              style={{
                border: `2px dashed ${isDragActive ? accent.border : "rgba(255,255,255,0.08)"}`,
                background: isDragActive ? accent.bg : "rgba(255,255,255,0.02)",
              }}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center`}
                style={{ background: `${accent.bg}`, border: `1px solid ${accent.border}` }}
              >
                <Upload size={22} className={accent.text} />
              </motion.div>
              <div className="text-center px-4">
                <p className="text-sm font-medium text-gray-300">
                  {isDragActive ? "Drop to upload" : "Drop image or click to browse"}
                </p>
                <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
            onClick={() => setLightbox(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-2xl max-h-[80vh]"
              onClick={e => e.stopPropagation()}
            >
              <img src={preview} alt={label} className="rounded-2xl max-h-[75vh] object-contain" />
              <button
                onClick={() => setLightbox(false)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm"
              >
                <X size={14} />
              </button>
              <p className="text-center text-gray-400 text-sm mt-3 font-display">{label}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
