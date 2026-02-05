import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import UserDashboard from "./UserDashboard";
import TechnicalDashboard from "./TechnicalDashboard";
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
    socket.on("robotUpdate", (data) => {
      setRobots((prev) =>
        prev.map((robot) =>
          robot.id === data.id ? { ...robot, ...data } : robot
        )
      );
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
  if (role === "user") {
    return <UserDashboard robots={robots} fetchRobots={fetchRobots} />;
  }

  // admin, technician, economist видят TechnicalDashboard
  return (
    <TechnicalDashboard robots={robots} role={role} fetchRobots={fetchRobots} />
  );
}

export default Dashboard;
