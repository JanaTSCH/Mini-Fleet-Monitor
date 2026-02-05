import React from "react";
import { Download } from "lucide-react";
import Map from "./Map";
import "../styles/userDashboard.css";

function UserDashboard({ robots, fetchRobots }) {
  const stats = {
    total: robots.length,
    active: robots.filter((r) => r.status === "moving").length,
    idle: robots.filter((r) => r.status === "idle").length,
    online: robots.filter((r) => r.status !== "offline").length,
  };

  const downloadJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      robots: robots,
      stats: stats,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `robofleet-user-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Безопасное форматирование координат
  const formatCoord = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "N/A" : num.toFixed(4);
  };

  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="top-bar">
          <h1>Fleet Dashboard</h1>
          <div className="top-actions">
            <button onClick={downloadJSON} className="btn-ghost">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Robots</div>
          </div>
          <div className="stat-card">
            <div className="stat-value success">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.idle}</div>
            <div className="stat-label">Idle</div>
          </div>
          <div className="stat-card">
            <div className="stat-value success">{stats.online}</div>
            <div className="stat-label">Online</div>
          </div>
        </div>

        <div className="user-grid">
          <div className="panel">
            <h2>Instructions</h2>
            <ul className="instructions">
              <li>✓ View real-time robot positions on the map</li>
              <li>✓ Monitor fleet status and activity</li>
              <li>✓ Track robot movements and updates</li>
              <li>✓ Export data for analysis</li>
            </ul>
          </div>

          <div className="panel robot-list">
            <h2>Fleet ({robots.length})</h2>
            <div className="robots">
              {robots.map((robot) => (
                <div key={robot.id} className="robot-item">
                  <div className="robot-header">
                    <span className="robot-name">{robot.name}</span>
                    <span className={`badge ${robot.status}`}>
                      {robot.status}
                    </span>
                  </div>
                  <div className="robot-info">
                    <span className="mono">#{robot.id}</span>
                    <span className="mono small">
                      {formatCoord(robot.lat)}, {formatCoord(robot.lon)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel map-panel">
            <Map robots={robots} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
