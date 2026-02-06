import React, { useState } from "react";
import axios from "axios";
import SpotlightText from "./ui/SpotlightText";
import "../styles/login.css";

function Login({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      localStorage.setItem("role", response.data.user.role || role.id);
      onLogin(response.data.token);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check backend.");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg"></div>

      <main className="login-content">
        <div className="login-container">
          <div className="login-brand">
            <SpotlightText
              className="login-brand-title"
              glowColor="#DC2626"
              baseColor="#bac1c5"
              glowRadius={150}
              activationZone={600}
            >
              RoboFleet Sicherheit
            </SpotlightText>

            <div className="login-brand-subtitle">Monitoring System</div>
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
