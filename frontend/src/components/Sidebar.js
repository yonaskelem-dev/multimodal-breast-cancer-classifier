import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, History, Info, Sun, Moon, ChevronLeft, ChevronRight,
  Cpu, BarChart2, Menu
} from "lucide-react";

const navItems = [
  { path: "/",        label: "Classifier",  icon: Activity  },
  { path: "/history", label: "History",     icon: History   },
  { path: "/about",   label: "About",       icon: Info      },
];

export default function Sidebar({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d0d18 0%, #12121a 100%)",
        borderRight: "1px solid rgba(124,58,237,0.15)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-violet-900/30">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center glow-violet">
            <Cpu size={18} className="text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-[#0d0d18]" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-white font-display font-700 text-sm leading-none">MedAI</p>
              <p className="text-violet-400 text-xs mt-0.5 font-mono">v1.0 · ResNet18</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <NavLink key={path} to={path}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-violet-600/20 border border-violet-500/30"
                    : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors ${
                    active ? "text-violet-400" : "text-gray-500 group-hover:text-violet-400"
                  }`}
                />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-sm font-medium transition-colors ${
                        active ? "text-violet-300" : "text-gray-400 group-hover:text-white"
                      }`}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1 h-5 bg-amber-400 rounded-full"
                  />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom controls */}
      <div className="px-2 pb-4 space-y-1 border-t border-violet-900/30 pt-3">
        {/* Dark mode toggle */}
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent transition-all group"
        >
          {darkMode
            ? <Sun size={18} className="flex-shrink-0 text-amber-400" />
            : <Moon size={18} className="flex-shrink-0 text-violet-400" />
          }
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-400 group-hover:text-white transition-colors"
              >
                {darkMode ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Collapse toggle */}
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 border border-transparent transition-all group"
        >
          {sidebarOpen
            ? <ChevronLeft size={18} className="flex-shrink-0 text-gray-500 group-hover:text-white" />
            : <ChevronRight size={18} className="flex-shrink-0 text-gray-500 group-hover:text-white" />
          }
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-gray-400 group-hover:text-white transition-colors"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
