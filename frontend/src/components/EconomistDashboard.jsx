import {
  Activity,
  Battery,
  DollarSign,
  Download,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import "../styles/economistDashboard.css";
import Map from "./Map";

function EconomistDashboard({ robots: initialRobots }) {
  const [robots, setRobots] = useState(initialRobots);

  useEffect(() => {
    setRobots(initialRobots);
  }, [initialRobots]);

  // Статистика
  const stats = {
    total: robots.length,
    active: robots.filter((r) => r.status === "active").length,
    idle: robots.filter((r) => r.status === "idle").length,
    charging: robots.filter((r) => r.status === "charging").length,
    avgBattery:
      robots.length > 0
        ? (
            robots.reduce((sum, r) => sum + r.battery, 0) / robots.length
          ).toFixed(1)
        : 0,
    lowBattery: robots.filter((r) => r.battery < 20).length,
  };

  // Данные для графиков
  const batteryDistribution = [
    {
      range: "0-20%",
      count: robots.filter((r) => r.battery < 20).length,
      color: "#DC2626",
    },
    {
      range: "20-50%",
      count: robots.filter((r) => r.battery >= 20 && r.battery < 50).length,
      color: "#FBBF24",
    },
    {
      range: "50-80%",
      count: robots.filter((r) => r.battery >= 50 && r.battery < 80).length,
      color: "#3B82F6",
    },
    {
      range: "80-100%",
      count: robots.filter((r) => r.battery >= 80).length,
      color: "#22C55E",
    },
  ];

  const statusDistribution = [
    {
      status: "Active",
      count: stats.active,
      color: "#22C55E",
      percentage: ((stats.active / stats.total) * 100).toFixed(0),
    },
    {
      status: "Idle",
      count: stats.idle,
      color: "#A3A3A3",
      percentage: ((stats.idle / stats.total) * 100).toFixed(0),
    },
    {
      status: "Charging",
      count: stats.charging,
      color: "#FBBF24",
      percentage: ((stats.charging / stats.total) * 100).toFixed(0),
    },
  ];

  // Экспорт отчёта
  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary: stats,
      batteryDistribution,
      statusDistribution,
      robots: robots.map((r) => ({
        id: r.id,
        name: r.name,
        status: r.status,
        battery: r.battery,
        position: { lat: r.lat, lon: r.lon },
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fleet-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxBatteryCount = Math.max(...batteryDistribution.map((d) => d.count));
  const maxStatusCount = Math.max(...statusDistribution.map((d) => d.count));

  return (
    <div className="economist-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Fleet Economics Dashboard</h2>
          <p className="text-secondary">
            Real-time fleet statistics and analytics
          </p>
        </div>
        <button onClick={downloadReport} className="btn-primary btn-md">
          <Download size={16} />
          Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{ background: "rgba(34, 197, 94, 0.1)" }}
          >
            <Activity size={24} style={{ color: "#22C55E" }} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Total Fleet</div>
            <div className="kpi-value">{stats.total}</div>
            <div className="kpi-detail">{stats.active} active</div>
          </div>
        </div>

        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{ background: "rgba(59, 130, 246, 0.1)" }}
          >
            <Battery size={24} style={{ color: "#3B82F6" }} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Avg Battery</div>
            <div className="kpi-value">{stats.avgBattery}%</div>
            <div className="kpi-detail">{stats.lowBattery} below 20%</div>
          </div>
        </div>

        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{ background: "rgba(251, 191, 36, 0.1)" }}
          >
            <TrendingUp size={24} style={{ color: "#FBBF24" }} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Utilization</div>
            <div className="kpi-value">
              {((stats.active / stats.total) * 100).toFixed(0)}%
            </div>
            <div className="kpi-detail">{stats.idle} idle units</div>
          </div>
        </div>

        <div className="kpi-card">
          <div
            className="kpi-icon"
            style={{ background: "rgba(168, 85, 247, 0.1)" }}
          >
            <DollarSign size={24} style={{ color: "#A855F7" }} />
          </div>
          <div className="kpi-content">
            <div className="kpi-label">Efficiency</div>
            <div className="kpi-value">
              {((stats.active / stats.total) * 100).toFixed(0)}%
            </div>
            <div className="kpi-detail">Operational</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Battery Distribution Chart */}
        <div className="panel chart-panel">
          <h3>Battery Distribution</h3>
          <div className="chart-container">
            {batteryDistribution.map((item, idx) => (
              <div key={idx} className="bar-chart-item">
                <div className="bar-label">{item.range}</div>
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      width: `${(item.count / maxBatteryCount) * 100}%`,
                      background: item.color,
                    }}
                  >
                    <span className="bar-value">{item.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="panel chart-panel">
          <h3>Status Distribution</h3>
          <div className="chart-container">
            {statusDistribution.map((item, idx) => (
              <div key={idx} className="bar-chart-item">
                <div className="bar-label">{item.status}</div>
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{
                      width: `${(item.count / maxStatusCount) * 100}%`,
                      background: item.color,
                    }}
                  >
                    <span className="bar-value">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map and Robot List */}
      <div className="content-grid">
        <div className="panel map-panel">
          <h3>Fleet Location</h3>
          <Map robots={robots} />
        </div>

        <div className="panel list-panel">
          <h3>Robot List ({robots.length})</h3>
          <div className="robot-list">
            {robots.map((robot) => (
              <div key={robot.id} className="robot-card">
                <div className="robot-header">
                  <span className="robot-name">{robot.name}</span>
                  <span className={`badge ${robot.status}`}>
                    {robot.status}
                  </span>
                </div>
                <div className="robot-stats">
                  <div className="stat-item">
                    <Battery size={14} />
                    <span>{robot.battery}%</span>
                  </div>
                  <div className="stat-item mono small">
                    {parseFloat(robot.lat).toFixed(4)},{" "}
                    {parseFloat(robot.lon).toFixed(4)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EconomistDashboard;
