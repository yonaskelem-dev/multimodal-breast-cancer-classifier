import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import About from "./pages/About";

export default function App() {
  const [darkMode, setDarkMode] = useState(false); // ← was true
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <Router>
      <div
        className={`min-h-screen flex ${darkMode ? "bg-[#0a0a0f]" : "bg-[#F3F4F6]"} transition-colors duration-300`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#ffffff", // ← was #1a1a26
              color: "#1f2937", // ← was #f9fafb
              border: "1px solid rgba(124,58,237,0.15)", // ← softer border
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#7c3aed", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />

        <Sidebar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"} min-h-screen overflow-y-auto`}
        >
          <Routes>
            <Route path="/" element={<Dashboard darkMode={darkMode} />} />
            <Route path="/history" element={<History darkMode={darkMode} />} />
            <Route path="/about" element={<About darkMode={darkMode} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
