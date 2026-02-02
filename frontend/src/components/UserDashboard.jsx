import React from "react";
import Map from "./Map";
import "./UserDashboard.css";

function UserDashboard({ robots, fetchRobots }) {
  const stats = {
    total: robots.length,
    active: robots.filter((r) => r.status === "active").length,
    idle: robots.filter((r) => r.status === "idle").length,
    lowBattery: robots.filter((r) => r.battery < 20).length,
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
    link.download = `robofleet-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="user-dashboard">
      <div className="container">
        <div className="top-bar">
          <h1>Fleet Overview</h1>
          <div className="top-actions">
            <button onClick={fetchRobots} className="btn-ghost">
              🔄 Refresh
            </button>
            <button onClick={downloadJSON} className="btn-secondary">
              ⬇ Export JSON
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
            <div className="stat-value warning">{stats.lowBattery}</div>
            <div className="stat-label">Low Battery</div>
          </div>
        </div>

        <div className="user-grid">
          <div className="panel">
            <h2>Instructions</h2>
            <ul className="instructions">
              <li>🟢 Green = Active robots</li>
              <li>⚪ Gray = Idle robots</li>
              <li>🟡 Yellow = Charging</li>
              <li>🔴 Red battery = Need charging</li>
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
                    <span>Type: {robot.type}</span>
                    <span>Battery: {robot.battery}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel map-panel">
            <h2>Map</h2>
            <Map robots={robots} onRobotClick={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
