import React, { useState, useEffect } from "react";
import { Menu, X, Moon, Sun, LogOut, Bot } from "lucide-react";
import "../styles/header.css";

const ROLE_LABELS = {
  admin: "Administrator",
  technician: "Technical Specialist",
  economist: "Economist",
  user: "Robot Owner",
};

function Header({ isAuthenticated = false, userRole = null, onLogout }) {
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLang = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLang);
    document.documentElement.setAttribute("data-theme", savedTheme);
    document.documentElement.setAttribute("lang", savedLang);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleLanguage = () => {
    const newLang = language === "en" ? "de" : "en";
    setLanguage(newLang);
    localStorage.setItem("language", newLang);
    document.documentElement.setAttribute("lang", newLang);
  };

  const handleLogoutClick = () => {
    onLogout?.();
    setMobileMenuOpen(false);
  };

  const t = {
    en: {
      services: "Services",
      products: "Products",
      contact: "Contact",
      logout: "Logout",
    },
    de: {
      services: "Dienstleistungen",
      products: "Produkte",
      contact: "Kontakt",
      logout: "Abmelden",
    },
  };

  const text = t[language];

  return (
    <header className="universal-header" data-authenticated={isAuthenticated}>
      <div className="header-container">
        <div className="header-logo">
          <Bot size={28} strokeWidth={2} className="logo-icon" />
          <span className="logo-text">RoboFleet</span>
        </div>

        <nav className="header-nav desktop-only">
          {!isAuthenticated ? (
            <>
              <a href="#services" className="nav-link">
                {text.services}
              </a>
              <a href="#products" className="nav-link">
                {text.products}
              </a>
              <a href="#contact" className="nav-link">
                {text.contact}
              </a>
            </>
          ) : (
            <div className="role-badge" data-role={userRole}>
              <span className="role-dot"></span>
              <span className="role-text">{ROLE_LABELS[userRole]}</span>
            </div>
          )}
        </nav>

        <div className="header-actions">
          <button
            onClick={toggleTheme}
            className="icon-btn"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            onClick={toggleLanguage}
            className="lang-btn"
            aria-label="Switch language"
          >
            {language.toUpperCase()}
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogoutClick}
              className="icon-btn"
              aria-label="Logout"
              title={text.logout}
            >
              <LogOut size={20} />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="icon-btn mobile-only"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu">
          {!isAuthenticated ? (
            <>
              <a
                href="#services"
                className="mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {text.services}
              </a>
              <a
                href="#products"
                className="mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {text.products}
              </a>
              <a
                href="#contact"
                className="mobile-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {text.contact}
              </a>
            </>
          ) : (
            <div className="mobile-role">{ROLE_LABELS[userRole]}</div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
