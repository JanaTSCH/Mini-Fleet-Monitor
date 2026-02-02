import React, { useState, useEffect } from "react";
import axios from "axios";
import Map from "./Map";
import ReportDownload from "./ReportDownload";
import "./Dashboard.css";

function Dashboard({ onLogout }) {
  const [robots, setRobots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [role, setRole] = useState("");

  // Action panel state
  const [showAddRobot, setShowAddRobot] = useState(false);
  const [newRobot, setNewRobot] = useState({
    name: "",
    type: "warehouse",
    latitude: 50.9,
    longitude: 11.0,
  });

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    setRole(userRole);
    fetchRobots();
  }, []);

  const fetchRobots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3002/api/robots", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRobots(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch robots");
      setLoading(false);
    }
  };

  const handleAddRobot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3002/api/robots", newRobot, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewRobot({
        name: "",
        type: "warehouse",
        latitude: 50.9,
        longitude: 11.0,
      });
      setShowAddRobot(false);
      fetchRobots();
    } catch (err) {
      alert("Failed to add robot");
    }
  };

  const startSimulation = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3002/api/robots/simulate",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Simulation started!");
    } catch (err) {
      alert("Simulation failed");
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading fleet data...</p>
      </div>
    );
  }

  // Render based on role
  if (role === "user") {
    return <DashboardUser robots={robots} onLogout={onLogout} />;
  }

  return (
    <DashboardTechnical
      robots={robots}
      role={role}
      selectedRobot={selectedRobot}
      setSelectedRobot={setSelectedRobot}
      showAddRobot={showAddRobot}
      setShowAddRobot={setShowAddRobot}
      newRobot={newRobot}
      setNewRobot={setNewRobot}
      handleAddRobot={handleAddRobot}
      startSimulation={startSimulation}
      fetchRobots={fetchRobots}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════
// USER DASHBOARD - Больше виджетов, простые инструкции
// ═══════════════════════════════════════════════════════════════════════

function DashboardUser({ robots }) {
  const stats = {
    total: robots.length,
    active: robots.filter((r) => r.status === "active").length,
    idle: robots.filter((r) => r.status === "idle").length,
    charging: robots.filter((r) => r.status === "charging").length,
    lowBattery: robots.filter((r) => r.battery < 20).length,
    avgBattery: Math.round(
      robots.reduce((sum, r) => sum + r.battery, 0) / robots.length
    ),
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Action Panel */}
        <div className="action-panel">
          <h2 className="panel-title">Fleet Overview</h2>
          <ReportDownload robots={robots} role="user" />
        </div>

        {/* Widget Grid */}
        <div className="widget-grid user-grid">
          {/* Stats Widgets */}
          <div className="widget stat-widget">
            <div className="widget-icon">🤖</div>
            <div className="widget-content">
              <div className="widget-value">{stats.total}</div>
              <div className="widget-label">Total Robots</div>
            </div>
          </div>

          <div className="widget stat-widget success">
            <div className="widget-icon">✅</div>
            <div className="widget-content">
              <div className="widget-value">{stats.active}</div>
              <div className="widget-label">Active Now</div>
            </div>
          </div>

          <div className="widget stat-widget warning">
            <div className="widget-icon">🔋</div>
            <div className="widget-content">
              <div className="widget-value">{stats.lowBattery}</div>
              <div className="widget-label">Low Battery</div>
            </div>
          </div>

          <div className="widget stat-widget">
            <div className="widget-icon">⚡</div>
            <div className="widget-content">
              <div className="widget-value">{stats.avgBattery}%</div>
              <div className="widget-label">Avg Battery</div>
            </div>
          </div>

          {/* Instructions Widget */}
          <div className="widget instructions-widget">
            <h3 className="widget-title">Quick Guide</h3>
            <ul className="instruction-list">
              <li>
                ✨ <strong>Green robots</strong> are active and working
              </li>
              <li>
                ⏸️ <strong>Gray robots</strong> are idle and ready
              </li>
              <li>
                🔌 <strong>Yellow robots</strong> are charging
              </li>
              <li>
                🔋 <strong>Battery below 20%</strong> needs charging
              </li>
              <li>📍 Click robot on map for details</li>
            </ul>
          </div>

          {/* Robot List Widget */}
          <div className="widget robot-list-widget">
            <h3 className="widget-title">Robot Fleet</h3>
            <div className="robot-cards">
              {robots.map((robot) => (
                <div
                  key={robot.id}
                  className={`robot-card status-${robot.status}`}
                >
                  <div className="robot-card-header">
                    <span className="robot-name">{robot.name}</span>
                    <span className={`status-badge ${robot.status}`}>
                      {robot.status}
                    </span>
                  </div>
                  <div className="robot-card-body">
                    <div className="robot-detail">
                      <span className="detail-label">Type:</span>
                      <span className="detail-value">{robot.type}</span>
                    </div>
                    <div className="robot-detail">
                      <span className="detail-label">Battery:</span>
                      <div className="battery-bar">
                        <div
                          className="battery-fill"
                          style={{
                            width: `${robot.battery}%`,
                            background:
                              robot.battery < 20
                                ? "rgb(var(--color-error))"
                                : robot.battery < 50
                                ? "rgb(var(--color-warning))"
                                : "rgb(var(--color-success))",
                          }}
                        ></div>
                        <span className="battery-text">{robot.battery}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Widget */}
          <div className="widget map-widget">
            <h3 className="widget-title">Fleet Map</h3>
            <Map robots={robots} onRobotClick={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// TECHNICAL DASHBOARD - Компактная техническая информация
// ═══════════════════════════════════════════════════════════════════════

function DashboardTechnical({
  robots,
  role,
  selectedRobot,
  setSelectedRobot,
  showAddRobot,
  setShowAddRobot,
  newRobot,
  setNewRobot,
  handleAddRobot,
  startSimulation,
  fetchRobots,
}) {
  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Action Panel */}
        <div className="action-panel">
          <div className="action-left">
            <button
              onClick={startSimulation}
              className="btn btn-md btn-primary"
            >
              ▶ Start Simulation
            </button>
            <button
              onClick={() => setShowAddRobot(!showAddRobot)}
              className="btn btn-md btn-secondary"
            >
              + Add Robot
            </button>
            <button onClick={fetchRobots} className="btn btn-md btn-ghost">
              🔄 Refresh
            </button>
          </div>

          <div className="action-right">
            <ReportDownload robots={robots} role={role} />
          </div>
        </div>

        {/* Add Robot Form */}
        {showAddRobot && (
          <div className="add-robot-panel">
            <form onSubmit={handleAddRobot} className="add-robot-form">
              <input
                type="text"
                placeholder="Robot name"
                value={newRobot.name}
                onChange={(e) =>
                  setNewRobot({ ...newRobot, name: e.target.value })
                }
                className="input"
                required
              />
              <select
                value={newRobot.type}
                onChange={(e) =>
                  setNewRobot({ ...newRobot, type: e.target.value })
                }
                className="input"
              >
                <option value="warehouse">Warehouse</option>
                <option value="delivery">Delivery</option>
                <option value="cleaning">Cleaning</option>
              </select>
              <input
                type="number"
                step="0.01"
                placeholder="Latitude"
                value={newRobot.latitude}
                onChange={(e) =>
                  setNewRobot({
                    ...newRobot,
                    latitude: parseFloat(e.target.value),
                  })
                }
                className="input"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Longitude"
                value={newRobot.longitude}
                onChange={(e) =>
                  setNewRobot({
                    ...newRobot,
                    longitude: parseFloat(e.target.value),
                  })
                }
                className="input"
                required
              />
              <button type="submit" className="btn btn-md btn-primary">
                Create Robot
              </button>
              <button
                type="button"
                onClick={() => setShowAddRobot(false)}
                className="btn btn-md btn-ghost"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Technical Grid */}
        <div className="tech-grid">
          {/* Map */}
          <div className="tech-panel map-panel">
            <Map robots={robots} onRobotClick={setSelectedRobot} />
          </div>

          {/* Robot Table */}
          <div className="tech-panel table-panel">
            <div className="panel-header">
              <h3>Fleet Data ({robots.length})</h3>
            </div>
            <div className="robot-table-wrapper">
              <table className="robot-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Battery</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {robots.map((robot) => (
                    <tr
                      key={robot.id}
                      onClick={() => setSelectedRobot(robot)}
                      className={
                        selectedRobot?.id === robot.id ? "selected" : ""
                      }
                    >
                      <td className="mono">#{robot.id}</td>
                      <td className="bold">{robot.name}</td>
                      <td>{robot.type}</td>
                      <td>
                        <span className={`status-badge ${robot.status}`}>
                          {robot.status}
                        </span>
                      </td>
                      <td>
                        <div className="battery-inline">
                          <div
                            className="battery-bar-inline"
                            style={{
                              width: `${robot.battery}%`,
                              background:
                                robot.battery < 20
                                  ? "rgb(var(--color-error))"
                                  : robot.battery < 50
                                  ? "rgb(var(--color-warning))"
                                  : "rgb(var(--color-success))",
                            }}
                          ></div>
                          <span className="battery-value">
                            {robot.battery}%
                          </span>
                        </div>
                      </td>
                      <td className="mono small">
                        {robot.latitude.toFixed(2)},{" "}
                        {robot.longitude.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Robot Details */}
          {selectedRobot && (
            <div className="tech-panel details-panel">
              <div className="panel-header">
                <h3>Robot Details</h3>
                <button
                  onClick={() => setSelectedRobot(null)}
                  className="btn btn-sm btn-ghost"
                >
                  ✕
                </button>
              </div>
              <div className="details-content">
                <div className="detail-row">
                  <span className="detail-key">ID:</span>
                  <span className="detail-val mono">#{selectedRobot.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Name:</span>
                  <span className="detail-val bold">{selectedRobot.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Type:</span>
                  <span className="detail-val">{selectedRobot.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Status:</span>
                  <span className={`status-badge ${selectedRobot.status}`}>
                    {selectedRobot.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Battery:</span>
                  <span className="detail-val">{selectedRobot.battery}%</span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Latitude:</span>
                  <span className="detail-val mono">
                    {selectedRobot.latitude}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Longitude:</span>
                  <span className="detail-val mono">
                    {selectedRobot.longitude}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-key">Updated:</span>
                  <span className="detail-val small">
                    {new Date(selectedRobot.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
