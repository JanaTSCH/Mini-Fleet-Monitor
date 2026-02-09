import axios from "axios";
import { Edit2, Play, Plus, Trash2, Users, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import "../styles/adminDashboard.css";
import Map from "./Map";

function AdminDashboard({ robots: initialRobots, fetchRobots }) {
  const [robots, setRobots] = useState(initialRobots);
  const [users, setUsers] = useState([]);
  const [selectedRobot, setSelectedRobot] = useState(null);
  const [showAddRobot, setShowAddRobot] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newRobot, setNewRobot] = useState({
    name: "",
    lat: 50.9787,
    lon: 11.0328,
  });
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // sync robots from the backend
  useEffect(() => {
    setRobots(initialRobots);
  }, [initialRobots]);

  // fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3002/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3002/users", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUser({ name: "", email: "", password: "", role: "user" });
      fetchUsers();
      console.log("✅ User added");
    } catch (err) {
      console.error("Failed to add user:", err);
      alert("Failed to add user");
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3002/users/${editingUser.id}`,
        editingUser,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEditingUser(null);
      fetchUsers();
      console.log("✅ User updated");
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3002/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      console.log("✅ User deleted");
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user");
    }
  };

  const handleToggleSimulation = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3002/simulation/toggle",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Simulation failed:", err);
    }
  };

  const handleAddRobot = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3002/robots", newRobot, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewRobot({ name: "", lat: 50.9787, lon: 11.0328 });
      setShowAddRobot(false);
      fetchRobots();
    } catch (err) {
      console.error("Failed to add robot:", err);
    }
  };

  const handleDeleteRobot = async (robotId) => {
    if (!window.confirm("Delete this robot?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3002/robots/${robotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRobots();
    } catch (err) {
      console.error("Failed to delete robot:", err);
    }
  };

  const selectedRobotData = robots.find((r) => r.id === selectedRobot);

  return (
    <div className="admin-dashboard">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button
            onClick={handleToggleSimulation}
            className="btn-primary btn-md"
          >
            <Play size={16} />
            Toggle Simulation
          </button>
          <button
            onClick={() => setShowAddRobot(!showAddRobot)}
            className="btn-secondary btn-md"
          >
            {showAddRobot ? <X size={16} /> : <Plus size={16} />}
            Robot
          </button>
          <button
            onClick={() => setShowUserPanel(!showUserPanel)}
            className="btn-secondary btn-md"
          >
            <Users size={16} />
            Users ({users.length})
          </button>
        </div>
      </div>

      {/* Add Robot Form */}
      {showAddRobot && (
        <form onSubmit={handleAddRobot} className="add-form">
          <input
            type="text"
            placeholder="Robot name"
            value={newRobot.name}
            onChange={(e) => setNewRobot({ ...newRobot, name: e.target.value })}
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
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            value={newRobot.lon}
            onChange={(e) =>
              setNewRobot({ ...newRobot, lon: parseFloat(e.target.value) })
            }
          />
          <button type="submit" className="btn-primary btn-md">
            Add
          </button>
        </form>
      )}

      {/* User Panel */}
      {showUserPanel && (
        <div className="panel user-panel">
          <div className="user-panel-header">
            <h3>Users ({users.length})</h3>
          </div>

          {/* Add User Form */}
          <form
            onSubmit={handleAddUser}
            className="add-form"
            style={{ marginTop: "1rem" }}
          >
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) =>
                setNewUser({ ...newUser, password: e.target.value })
              }
              required
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="technician">Technician</option>
              <option value="economist">Economist</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-primary btn-md">
              <Plus size={16} />
              Add User
            </button>
          </form>

          {/* user table */}
          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="bold">{user.name}</td>
                    <td className="mono small">{user.email}</td>
                    <td>
                      <span className={`badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="btn-icon"
                        title="Edit user"
                        style={{ marginRight: "0.5rem" }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="btn-icon btn-danger"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* user editing form */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4>Edit User</h4>
            <form
              onSubmit={handleEditUser}
              className="add-form"
              style={{ padding: 0 }}
            >
              <input
                type="text"
                placeholder="Name"
                value={editingUser.name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                required
              />
              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="technician">Technician</option>
                <option value="economist">Economist</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="btn-primary btn-md">
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="btn-ghost btn-md"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid */}
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
                  <th>Name</th>
                  <th>Status</th>
                  <th>Battery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {robots.map((robot) => (
                  <tr
                    key={robot.id}
                    onClick={() => setSelectedRobot(robot.id)}
                    className={selectedRobot === robot.id ? "selected" : ""}
                  >
                    <td className="bold">{robot.name}</td>
                    <td>
                      <span className={`badge ${robot.status}`}>
                        {robot.status}
                      </span>
                    </td>
                    <td className="mono">{robot.battery}%</td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRobot(robot.id);
                        }}
                        className="btn-icon btn-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedRobotData && (
          <div className="panel details-panel">
            <div className="details-header">
              <h3>Details</h3>
              <button
                onClick={() => setSelectedRobot(null)}
                className="btn-close"
              >
                ×
              </button>
            </div>
            <div className="details">
              <div className="detail">
                <span>ID</span>
                <span className="mono">#{selectedRobotData.id}</span>
              </div>
              <div className="detail">
                <span>Name</span>
                <span className="bold">{selectedRobotData.name}</span>
              </div>
              <div className="detail">
                <span>Status</span>
                <span className={`badge ${selectedRobotData.status}`}>
                  {selectedRobotData.status}
                </span>
              </div>
              <div className="detail">
                <span>Battery</span>
                <span>{selectedRobotData.battery}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
