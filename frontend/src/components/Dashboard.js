import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import MapComponent from "./Map";

function Dashboard({ token, onLogout }) {
  const [robots, setRobots] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connects robots from backend
    const fetchRobots = async () => {
      try {
        const response = await axios.get("http://localhost:3001/robots", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRobots(response.data);
      } catch (error) {
        console.error("Failed to load robots:", error);
      }
    };

    fetchRobots();

    // Connect WebSocket
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

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
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Fleet Monitor Dashboard</h1>
        <button onClick={onLogout} style={styles.logoutButton}>
          Logout
        </button>
      </header>

      <div style={styles.content}>
        <div style={styles.mapContainer}>
          <MapComponent robots={robots} />
        </div>

        <div style={styles.sidebar}>
          <h3>Robots ({robots.length})</h3>
          <ul style={styles.list}>
            {robots.map((robot) => (
              <li key={robot.id} style={styles.listItem}>
                <strong>{robot.name}</strong>
                <br />
                <span
                  style={{
                    ...styles.status,
                    color: robot.status === "moving" ? "#4CAF50" : "#FF9800",
                  }}
                >
                  {robot.status}
                </span>
                <br />
                <small>
                  {parseFloat(robot.lat).toFixed(4)},{" "}
                  {parseFloat(robot.lon).toFixed(4)}
                </small>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#282c34",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutButton: {
    padding: "10px 20px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  content: {
    display: "flex",
    flex: 1,
  },
  mapContainer: {
    flex: 3,
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: "20px",
    overflowY: "auto",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    backgroundColor: "white",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  status: {
    fontWeight: "bold",
    textTransform: "uppercase",
    fontSize: "12px",
  },
};

export default Dashboard;
