import React from "react";

function StatWidget({ icon, label, value, colorClass = "", small = false }) {
  return (
    <div className={`widget stat-widget ${colorClass}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className={`stat-value ${small ? "small" : ""}`}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

export default StatWidget;
