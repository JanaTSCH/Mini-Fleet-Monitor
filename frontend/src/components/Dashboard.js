import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import UserDashboard from "./UserDashboard";
import TechnicalDashboard from "./TechnicalDashboard";
import EconomistDashboard from "./EconomistDashboard";
import AdminDashboard from "./AdminDashboard";
import "../styles/dashboard.css";

function Dashboard({ token, onLogout }) {
  const [robots, setRobots] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Получаем роль из localStorage
    const savedRole = localStorage.getItem("role");
    setRole(savedRole);

    // Фетчим роботов
    fetchRobots();

    // Socket.io для real-time обновлений
    const socket = io("http://localhost:3002");

    socket.on("connect", () => {
      console.log("✅ Socket.IO connected");
    });

    socket.on("robotUpdate", (data) => {
      console.log("📡 Robot update:", data);
      setRobots((prev) =>
        prev.map((robot) =>
          robot.id === data.id ? { ...robot, ...data } : robot
        )
      );
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const fetchRobots = async () => {
    try {
      const response = await axios.get("http://localhost:3002/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRobots(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load robots:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Роутинг по ролям
  switch (role) {
    case "admin":
      return <AdminDashboard robots={robots} fetchRobots={fetchRobots} />;

    case "technician":
      return (
        <TechnicalDashboard
          robots={robots}
          role={role}
          fetchRobots={fetchRobots}
        />
      );

    case "economist":
      return <EconomistDashboard robots={robots} fetchRobots={fetchRobots} />;

    case "user":
      return <UserDashboard robots={robots} fetchRobots={fetchRobots} />;

    default:
      return (
        <div className="loading">
          <p>Unknown role: {role}</p>
          <button onClick={onLogout} className="btn-primary">
            Logout
          </button>
        </div>
      );
  }
}

export default Dashboard;
