import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import MapComponent from "./Map";

function Dashboard({ token, onLogout }) {
  const [robots, setRobots] = useState([]);

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

  return (
    <div>
      <div
        style={{
          background: "#333",
          color: "white",
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1 style={{ margin: 0 }}>Fleet Monitor</h1>
        <button onClick={onLogout} style={{ padding: "8px 15px" }}>
          Logout
        </button>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
