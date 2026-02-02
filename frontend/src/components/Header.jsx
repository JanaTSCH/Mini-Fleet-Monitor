import React, { useState, useEffect } from "react";
import { Moon, Sun, Monitor, Smartphone, LogOut } from "lucide-react";
import "./Header.css";

function Header({ onLogout }) {
  const [theme, setTheme] = useState("light");
  const [viewMode, setViewMode] = useState("desktop");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedViewMode = localStorage.getItem("viewMode") || "desktop";
    setTheme(savedTheme);
    setViewMode(savedViewMode);
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.setAttribute("data-view-mode", savedViewMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "desktop" ? "mobile" : "desktop";
    setViewMode(newMode);
    localStorage.setItem("viewMode", newMode);
    document.documentElement.setAttribute("data-view-mode", newMode);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-brand">
          <span className="brand-name">RoboFleet</span>
        </div>

        <div className="header-controls">
          <button
            onClick={toggleTheme}
            className="header-btn"
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button
            onClick={toggleViewMode}
            className="header-btn"
            title="Toggle view"
          >
            {viewMode === "desktop" ? (
              <Smartphone size={18} />
            ) : (
              <Monitor size={18} />
            )}
          </button>

          <button onClick={onLogout} className="header-btn" title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
