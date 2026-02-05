import React, { useState, useEffect } from "react";
import axios from "axios";
import { Play, Plus, Download, History, Clock } from "lucide-react";
import Map from "./Map";
import "./TechnicalDashboard.css";

function TechnicalDashboard({ robots, role, fetchRobots }) {
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [cacheStatus, setCacheStatus] = useState(null);
  const [cacheTTL, setCacheTTL] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [newRobot, setNewRobot] = useState({
    name: "",
    lat: 50.9787,
    lon: 11.0328,
  });

  // Таймер обратного отсчёта TTL
  useEffect(() => {
    if (cacheTTL && cacheStatus === "HIT") {
      setCountdown(cacheTTL);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cacheTTL, cacheStatus]);

  const handleAddRobot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3002/robots", newRobot, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewRobot({ name: "", lat: 50.9787, lon: 11.0328 });
      setShowAddForm(false);
      fetchRobots();
    } catch (err) {
      console.error("Failed to add robot:", err);
      alert("Failed to add robot");
    }
  };

  const toggleSimulation = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3002/simulation/toggle",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSimulationRunning(response.data.running);
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const loadHistory = async (robotId) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3002/robots/${robotId}/history`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // reading headers
      const cacheStatusHeader = response.headers["x-cache-status"];
      const cacheTTLHeader = parseInt(response.headers["x-cache-ttl"]);

      setHistory(response.data);
      setCacheStatus(cacheStatusHeader);
      setCacheTTL(cacheTTLHeader);

      console.log(
        `Loaded ${response.data.length} positions [Cache: ${cacheStatusHeader}, TTL: ${cacheTTLHeader}s]`
      );
    } catch (err) {
      console.error("Failed to load history:", err);
      setHistory([]);
      setCacheStatus(null);
      setCacheTTL(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  const downloadJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      role: role,
      robots: robots,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `robofleet-${role}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatCoord = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "N/A" : num.toFixed(4);
  };

  const formatCoordLong = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? "N/A" : num.toFixed(6);
  };

  return (
    <div className="tech-dashboard">
      <div className="container">
        <div className="toolbar">
          <div className="toolbar-left">
            <button onClick={toggleSimulation} className="btn-primary">
              <Play size={16} />
              {simulationRunning ? "Pause" : "Start"}
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-secondary"
            >
              <Plus size={16} />
              {showAddForm ? "Cancel" : "Add Robot"}
            </button>
          </div>
          <div className="toolbar-right">
            <button onClick={downloadJSON} className="btn-ghost">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddRobot} className="add-form">
            <input
              type="text"
              placeholder="Robot name"
              value={newRobot.name}
              onChange={(e) =>
                setNewRobot({ ...newRobot, name: e.target.value })
              }
              required
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Latitude"
              value={newRobot.lat}
              onChange={(e) =>
                setNewRobot({ ...newRobot, lat: parseFloat(e.target.value) })
              }
              required
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitude"
              value={newRobot.lon}
              onChange={(e) =>
                setNewRobot({ ...newRobot, lon: parseFloat(e.target.value) })
              }
              required
            />
            <button type="submit" className="btn-primary">
              Add
            </button>
          </form>
        )}

        <div className="tech-grid">
          <div className="panel map-panel">
            <Map robots={robots} />
          </div>

          <div className="panel table-panel">
            <h3>Fleet ({robots.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {robots.map((robot) => (
                    <tr
                      key={robot.id}
                      onClick={() => {
                        setSelectedRobot(robot);
                        setHistory([]);
                        setCacheStatus(null);
                        setCacheTTL(null);
                      }}
                      className={
                        selectedRobot?.id === robot.id ? "selected" : ""
                      }
                    >
                      <td className="mono">#{robot.id}</td>
                      <td className="bold">{robot.name}</td>
                      <td>
                        <span className={`badge ${robot.status}`}>
                          {robot.status}
                        </span>
                      </td>
                      <td className="mono small">
                        {formatCoord(robot.lat)}, {formatCoord(robot.lon)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedRobot && (
            <div className="panel details-panel">
              <div className="details-header">
                <h3>Robot Details</h3>
                <button
                  onClick={() => {
                    setSelectedRobot(null);
                    setHistory([]);
                    setCacheStatus(null);
                    setCacheTTL(null);
                  }}
                  className="btn-close"
                >
                  ×
                </button>
              </div>

              <div className="details">
                <div className="detail">
                  <span>ID</span>
                  <span className="mono">#{selectedRobot.id}</span>
                </div>
                <div className="detail">
                  <span>Name</span>
                  <span className="bold">{selectedRobot.name}</span>
                </div>
                <div className="detail">
                  <span>Status</span>
                  <span className={`badge ${selectedRobot.status}`}>
                    {selectedRobot.status}
                  </span>
                </div>
                <div className="detail">
                  <span>Latitude</span>
                  <span className="mono">
                    {formatCoordLong(selectedRobot.lat)}
                  </span>
                </div>
                <div className="detail">
                  <span>Longitude</span>
                  <span className="mono">
                    {formatCoordLong(selectedRobot.lon)}
                  </span>
                </div>
              </div>

              {history.length === 0 && !loadingHistory && (
                <div className="load-history-link">
                  <button
                    onClick={() => loadHistory(selectedRobot.id)}
                    className="link-button"
                  >
                    <History size={14} />
                    <span>Load Positions</span>
                  </button>
                </div>
              )}

              {loadingHistory && (
                <div className="loading-history">Loading positions...</div>
              )}

              {history.length > 0 && (
                <div className="history-section">
                  <div className="history-header">
                    <h4>Position History</h4>
                    <div className="cache-info">
                      {/* Cache Status */}
                      <span
                        className={`cache-badge ${cacheStatus?.toLowerCase()}`}
                      >
                        {cacheStatus === "HIT" ? "Cached" : "From DB"}
                      </span>
                      {/* TTL with timer */}
                      {cacheStatus === "HIT" && countdown > 0 && (
                        <span className="cache-ttl">
                          <Clock size={12} />
                          {countdown}s
                        </span>
                      )}
                      <span className="history-count">{history.length}</span>
                    </div>
                  </div>
                  <div className="history-table-wrap">
                    <table className="history-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Time</th>
                          <th>Latitude</th>
                          <th>Longitude</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((pos, idx) => (
                          <tr key={idx}>
                            <td className="mono small">{idx + 1}</td>
                            <td className="mono small">
                              {new Date(pos.recorded_at).toLocaleTimeString(
                                "de-DE"
                              )}
                            </td>
                            <td className="mono">{formatCoordLong(pos.lat)}</td>
                            <td className="mono">{formatCoordLong(pos.lon)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TechnicalDashboard;
