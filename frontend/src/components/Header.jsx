import React, { useState, useEffect } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import "./Header.css";

function Header({ onLogout }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">RoboFleet</h1>
        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="btn-ghost btn-sm"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button onClick={onLogout} className="btn-ghost btn-sm">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
