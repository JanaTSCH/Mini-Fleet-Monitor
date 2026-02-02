import React, { useState } from "react";
import axios from "axios";
import Map from "./Map";
import "./TechnicalDashboard.css";

function TechnicalDashboard({ robots, role, fetchRobots }) {
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRobot, setNewRobot] = useState({
    name: "",
    type: "warehouse",
    latitude: 50.9,
    longitude: 11.0,
  });

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
      setShowAddForm(false);
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
      alert("Simulation started");
    } catch (err) {
      alert("Simulation failed");
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

  return (
    <div className="tech-dashboard">
      <div className="container">
        <div className="toolbar">
          <div className="toolbar-left">
            <button onClick={startSimulation} className="btn-primary">
              ▶ Simulate
            </button>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-secondary"
            >
              + Add Robot
            </button>
            <button onClick={fetchRobots} className="btn-ghost">
              🔄
            </button>
          </div>
          <div className="toolbar-right">
            <button onClick={downloadJSON} className="btn-ghost">
              ⬇ JSON
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddRobot} className="add-form">
            <input
              type="text"
              placeholder="Name"
              value={newRobot.name}
              onChange={(e) =>
                setNewRobot({ ...newRobot, name: e.target.value })
              }
              required
            />
            <select
              value={newRobot.type}
              onChange={(e) =>
                setNewRobot({ ...newRobot, type: e.target.value })
              }
            >
              <option value="warehouse">Warehouse</option>
              <option value="delivery">Delivery</option>
              <option value="cleaning">Cleaning</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Lat"
              value={newRobot.latitude}
              onChange={(e) =>
                setNewRobot({
                  ...newRobot,
                  latitude: parseFloat(e.target.value),
                })
              }
              required
            />
            <input
              type="number"
              step="0.01"
              placeholder="Lng"
              value={newRobot.longitude}
              onChange={(e) =>
                setNewRobot({
                  ...newRobot,
                  longitude: parseFloat(e.target.value),
                })
              }
              required
            />
            <button type="submit" className="btn-primary">
              Create
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-ghost"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="tech-grid">
          <div className="panel map-panel">
            <Map robots={robots} onRobotClick={setSelectedRobot} />
          </div>

          <div className="panel table-panel">
            <h3>Fleet ({robots.length})</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Battery</th>
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
                        <span className={`badge ${robot.status}`}>
                          {robot.status}
                        </span>
                      </td>
                      <td>{robot.battery}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedRobot && (
            <div className="panel details-panel">
              <div className="details-header">
                <h3>Details</h3>
                <button
                  onClick={() => setSelectedRobot(null)}
                  className="btn-close"
                >
                  ✕
                </button>
              </div>
              <div className="details">
                <div className="detail">
                  <span>ID:</span>
                  <span className="mono">#{selectedRobot.id}</span>
                </div>
                <div className="detail">
                  <span>Name:</span>
                  <span className="bold">{selectedRobot.name}</span>
                </div>
                <div className="detail">
                  <span>Type:</span>
                  <span>{selectedRobot.type}</span>
                </div>
                <div className="detail">
                  <span>Status:</span>
                  <span className={`badge ${selectedRobot.status}`}>
                    {selectedRobot.status}
                  </span>
                </div>
                <div className="detail">
                  <span>Battery:</span>
                  <span>{selectedRobot.battery}%</span>
                </div>
                <div className="detail">
                  <span>Position:</span>
                  <span className="mono small">
                    {selectedRobot.latitude.toFixed(4)},{" "}
                    {selectedRobot.longitude.toFixed(4)}
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

export default TechnicalDashboard;
