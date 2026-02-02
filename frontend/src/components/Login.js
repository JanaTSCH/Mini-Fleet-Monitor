import React, { useState } from "react";
import axios from "axios";
import SpotlightText from "./ui/SpotlightText";

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState("light");

  const roles = [
    {
      id: "admin",
      label: "Admin",
      desc: "Full Access",
      email: "admin@test.com",
      password: "test123",
    },
    {
      id: "technician",
      label: "Technician",
      desc: "Full Control",
      email: "technician@robot.com",
      password: "test123",
    },
    {
      id: "economist",
      label: "Economist",
      desc: "Analytics",
      email: "economist@robot.com",
      password: "test123",
    },
    {
      id: "user",
      label: "User",
      desc: "View Only",
      email: "user@robot.com",
      password: "test123",
    },
  ];

  const handleRoleClick = async (role) => {
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3002/auth/login", {
        email: role.email,
        password: role.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role || role.id);
      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check backend.");
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>

      <header className="login-header">
        <button
          onClick={toggleTheme}
          className="btn btn-md btn-ghost"
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </header>

      <main className="login-content">
        <div className="login-container">
          <div className="login-brand">
            <SpotlightText
              className="login-brand-title"
              glowColor="#DC2626" // Selectel red
              baseColor="#99a3b3" // Gray
            >
              RoboFleet Sicherheit
            </SpotlightText>

            <p className="login-brand-subtitle">
              Robot Fleet Monitoring System
            </p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-roles">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleClick(role)}
                disabled={loading}
                className="role-card"
              >
                <div className="role-card-label">{role.label}</div>
                <div className="role-card-desc">{role.desc}</div>
                <div className="role-card-email">{role.email}</div>
              </button>
            ))}
          </div>

          <p className="login-hint">Click on any role to sign in</p>
        </div>
      </main>
    </div>
  );
}

export default Login;
