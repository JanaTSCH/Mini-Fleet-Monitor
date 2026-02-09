import React, { useState, useEffect, useRef } from "react";
import Map from "./Map";
import {
  Home,
  Battery,
  Download,
  Mail,
  Phone,
  MessageCircle,
  Headphones,
  Book,
  Bot,
  MapPin,
  Activity,
} from "lucide-react";
import "../styles/userDashboard.css";

function UserDashboard({ robots, fetchRobots }) {
  const myRobot = robots[0] || null;
  const cardRef = useRef(null);

  const [battery, setBattery] = useState(myRobot?.battery || 30);
  const [status, setStatus] = useState("moving");
  const [isCharging, setIsCharging] = useState(false);
  const [chargeTarget, setChargeTarget] = useState(100);
  const [notification, setNotification] = useState(null);
  const [position, setPosition] = useState({
    lat: parseFloat(myRobot?.lat || 50.9787),
    lon: parseFloat(myRobot?.lon || 11.0328),
  });

  useEffect(() => {
    if (!myRobot) return;

    const interval = setInterval(() => {
      // move and battery
      if (!isCharging && battery > 0) {
        setBattery((prev) => {
          const newBat = Math.max(0, prev - 0.5);
          if (newBat <= 20 && prev > 20)
            showNotification("Battery Low", "warning");
          if (newBat <= 10 && prev > 10)
            showNotification("Critical Battery Level", "error");
          if (newBat === 0) {
            setStatus("idle");
            showNotification("Battery Depleted", "error");
          } else {
            setStatus("moving");
          }
          return newBat;
        });

        // random moving
        setPosition((prev) => ({
          lat: Math.max(
            50.9,
            Math.min(51.0, prev.lat + (Math.random() - 0.5) * 0.001)
          ),
          lon: Math.max(
            11.0,
            Math.min(11.1, prev.lon + (Math.random() - 0.5) * 0.001)
          ),
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [myRobot, isCharging, battery]); // Зависимость от battery предотвращает зацикливание

  // Зарядка
  useEffect(() => {
    if (!isCharging) return;

    const interval = setInterval(() => {
      setBattery((prev) => {
        if (prev >= chargeTarget) {
          setIsCharging(false);
          setStatus("moving");
          showNotification("Charging Complete", "success");
          return chargeTarget;
        }
        return Math.min(chargeTarget, prev + 1);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isCharging, chargeTarget]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const sendCommand = (command) => {
    if (command === "CHARGE") {
      if (battery >= 100) {
        showNotification("Battery already full", "info");
        return;
      }
      setIsCharging(true);
      setStatus("charging");
      showNotification(`Charging to ${chargeTarget}%`, "info");
    } else if (command === "HOME") {
      if (battery === 0 || isCharging) {
        showNotification("Cannot move - battery depleted or charging", "error");
        return;
      }
      setStatus("moving");
      showNotification("Returning home", "info");
      // to Erfurt
      setPosition({ lat: 50.9787, lon: 11.0328 });
    }
  };

  const handleMouseMove = (e) => {
    if (!cardRef.current || battery === 0 || isCharging) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `
      perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)
    `;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  if (!myRobot) {
    return (
      <div className="user-dashboard">
        <div className="empty-state">
          <h2>No Robot Assigned</h2>
          <p>Contact administrator to assign a robot to your account.</p>
        </div>
      </div>
    );
  }

  const lat = position.lat;
  const lon = position.lon;

  return (
    <div className="user-dashboard">
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="dashboard-header">
        <div>
          <h1 className="text-3xl font-bold">My RoboFleet Dashboard</h1>
          <p className="text-secondary">
            Real-time fleet monitoring and management
          </p>
        </div>
        <button className="btn-ghost">
          <Download size={16} />
          Export
        </button>
      </div>

      <div className="dashboard-grid">
        {/* LEFT SIDEBAR */}
        <div className="sidebar-left">
          {/* Robot Card */}
          <div
            ref={cardRef}
            className={`widget robot-card-square ${status}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div className="robot-card-inner">
              <Bot size={150} className="robot-avatar" />
              <h3 className="robot-name">{myRobot.name}</h3>
            </div>
          </div>

          {/* Info Widget */}
          <div className="widget info-compact">
            <div className="info-row">
              <Battery size={20} className="info-icon-lucid" />
              <div className="info-content">
                <span className="info-label">Battery</span>
                <span className="info-value">{Math.round(battery)}%</span>
              </div>
            </div>
            <div className="info-row">
              <Activity size={20} className="info-icon-lucid" />
              <div className="info-content">
                <span className="info-label">Status</span>
                <span className="info-value">{status}</span>
              </div>
            </div>
            <div className="info-row">
              <MapPin size={20} className="info-icon-lucid" />
              <div className="info-content">
                <span className="info-label">Position</span>
                <span className="info-value small">
                  {lat.toFixed(2)}, {lon.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Commands */}
          <div className="widget commands-compact">
            <h4 className="widget-subtitle">Commands</h4>
            <div className="commands-list">
              <button
                onClick={() => sendCommand("HOME")}
                className="command-btn-compact"
                disabled={battery === 0 || isCharging}
              >
                <Home size={16} />
                <span>Return Home</span>
              </button>
              <button
                onClick={() => sendCommand("CHARGE")}
                className="command-btn-compact"
                disabled={isCharging || battery >= 100}
              >
                <Battery size={16} />
                <span>{isCharging ? `${Math.round(battery)}%` : "Charge"}</span>
              </button>
            </div>
          </div>

          {/* Charge Settings */}
          <div className="widget settings-compact">
            <h4 className="widget-subtitle">Charge Target</h4>
            <select
              value={chargeTarget}
              onChange={(e) => setChargeTarget(Number(e.target.value))}
              className="select-input-compact"
            >
              <option value={50}>50%</option>
              <option value={75}>75%</option>
              <option value={80}>80%</option>
              <option value={90}>90%</option>
              <option value={100}>100%</option>
            </select>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="content-right">
          <div className="widget map-widget-main">
            <Map
              robots={
                battery > 0 && !isCharging
                  ? [
                      {
                        ...myRobot,
                        lat: position.lat,
                        lon: position.lon,
                        battery: Math.round(battery),
                        status,
                      },
                    ]
                  : []
              }
            />
          </div>

          <div className="bottom-row">
            <div className="widget support-widget">
              <div className="widget-header">
                <Headphones size={18} />
                <h3 className="widget-title">Support</h3>
              </div>
              <div className="support-list">
                <a href="mailto:support@robofleet.com" className="support-item">
                  <Mail size={16} />
                  <span>support@robofleet.com</span>
                </a>
                <a href="tel:+498001234567" className="support-item">
                  <Phone size={16} />
                  <span>+49 800 123 4567</span>
                </a>
                <button
                  className="support-item clickable"
                  onClick={() => showNotification("Live chat opening", "info")}
                >
                  <MessageCircle size={16} />
                  <span>Live Chat</span>
                </button>
              </div>
            </div>

            <div className="widget guide-widget">
              <div className="widget-header">
                <Book size={18} />
                <h3 className="widget-title">User Guide</h3>
              </div>
              <div className="guide-list">
                <button
                  className="guide-item"
                  onClick={() =>
                    showNotification("Opening user manual", "info")
                  }
                >
                  Quick Start Guide
                </button>
                <button
                  className="guide-item"
                  onClick={() =>
                    showNotification("Opening video tutorials", "info")
                  }
                >
                  Video Tutorials
                </button>
                <button
                  className="guide-item"
                  onClick={() => showNotification("Opening FAQ", "info")}
                >
                  FAQ & Troubleshooting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
