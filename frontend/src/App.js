import React, { useState, useEffect } from "react";
import Header from "./components/Header"; // ← Изменили путь
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (savedToken) {
      setToken(savedToken);
      setRole(savedRole);
    }
  }, []);

  const handleLogin = (newToken) => {
    const savedRole = localStorage.getItem("role");
    setToken(newToken);
    setRole(savedRole);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <div className="app">
      <div className="app-bg"></div>

      <Header
        isAuthenticated={!!token}
        userRole={role}
        onLogout={handleLogout}
      />

      {token ? (
        <Dashboard token={token} onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}

      <Footer />
    </div>
  );
}

export default App;
