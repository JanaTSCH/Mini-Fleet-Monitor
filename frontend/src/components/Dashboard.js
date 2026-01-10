import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import MapComponent from "./Map";

function Dashboard({ token, onLogout }) {
  const [robots, setRobots] = useState([]);
  const [adding, setAdding] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [history, setHistory] = useState({});
  const [showHistory, setShowHistory] = useState({});

  useEffect(() => {
    const fetchRobots = async () => {
      try {
        const response = await axios.get("http://localhost:3002/robots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRobots(response.data);
      } catch (error) {
        console.error("Failed to load robots:", error);
      }
    };

    fetchRobots();

    const newSocket = io("http://localhost:3002");

    newSocket.on("robotUpdate", (data) => {
      setRobots((prev) =>
        prev.map((robot) =>
          robot.id === data.id
            ? { ...robot, lat: data.lat, lon: data.lon, status: data.status }
            : robot
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const handleAddRobot = async () => {
    setAdding(true);
    try {
      const lat = 50.9787 + (Math.random() - 0.5) * 0.01;
      const lon = 11.0328 + (Math.random() - 0.5) * 0.01;
      const name = `Robot-${Date.now()}`;

      const response = await axios.post(
        "http://localhost:3002/robots",
        { name, lat, lon },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRobots((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Failed to add robot:", error);
    } finally {
      setAdding(false);
    }
  };

  const toggleSimulation = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3002/simulation/toggle",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSimulationRunning(response.data.running);
    } catch (error) {
      console.error("Failed to toggle simulation:", error);
    }
  };

  const loadHistory = async (robotId) => {
    try {
      const response = await axios.get(
        `http://localhost:3002/robots/${robotId}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory((prev) => ({ ...prev, [robotId]: response.data }));
      setShowHistory((prev) => ({ ...prev, [robotId]: true }));
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const hideHistory = (robotId) => {
    setShowHistory((prev) => ({ ...prev, [robotId]: false }));
  };

  return (
    <div>
      <div
        style={{
          background: "#333",
          color: "white",
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>Fleet Monitor</h1>
        <div>
          <button
            onClick={toggleSimulation}
            style={{
              padding: "8px 15px",
              marginRight: "10px",
              background: simulationRunning ? "#ff9800" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {simulationRunning ? "⏸ Stop Simulation" : "▶ Start Simulation"}
          </button>
          <button
            onClick={handleAddRobot}
            disabled={adding}
            style={{
              padding: "8px 15px",
              marginRight: "10px",
              cursor: adding ? "not-allowed" : "pointer",
              background: adding ? "#666" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            {adding ? "Adding..." : "+ Add Robot"}
          </button>
          <button
            onClick={onLogout}
            style={{
              padding: "8px 15px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 60px)" }}>
        <div style={{ flex: 3 }}>
          <MapComponent robots={robots} />
        </div>

        <div
          style={{
            flex: 1,
            padding: "20px",
            background: "#f5f5f5",
            overflowY: "auto",
          }}
        >
          <h3>Robots ({robots.length})</h3>
          {robots.map((robot) => (
            <div
              key={robot.id}
              style={{
                background: "white",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "4px",
              }}
            >
              <strong>{robot.name}</strong>
              <br />
              <span
                style={{
                  color: robot.status === "moving" ? "green" : "orange",
                }}
              >
                {robot.status}
              </span>
              <br />
              <small>
                {parseFloat(robot.lat).toFixed(4)},{" "}
                {parseFloat(robot.lon).toFixed(4)}
              </small>
              <br />
              <button
                onClick={() =>
                  showHistory[robot.id]
                    ? hideHistory(robot.id)
                    : loadHistory(robot.id)
                }
                style={{
                  marginTop: "8px",
                  padding: "5px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                  background: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                }}
              >
                {showHistory[robot.id] ? "Hide History" : "Show History"}
              </button>

              {showHistory[robot.id] && history[robot.id] && (
                <div
                  style={{
                    marginTop: "10px",
                    fontSize: "11px",
                    maxHeight: "150px",
                    overflowY: "auto",
                    background: "#f9f9f9",
                    padding: "5px",
                    borderRadius: "3px",
                  }}
                >
                  <strong>Last 20 positions:</strong>
                  {history[robot.id].map((pos, idx) => (
                    <div key={idx}>
                      {new Date(pos.recorded_at).toLocaleTimeString()}:{" "}
                      {parseFloat(pos.lat).toFixed(4)},{" "}
                      {parseFloat(pos.lon).toFixed(4)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
