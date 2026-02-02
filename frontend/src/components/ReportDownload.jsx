import React, { useState } from "react";
import axios from "axios";

function ReportDownload({ robots, role }) {
  const [loading, setLoading] = useState(false);

  const downloadJSON = () => {
    const data = {
      timestamp: new Date().toISOString(),
      role: role,
      robots: robots,
      totalRobots: robots.length,
      activeRobots: robots.filter((r) => r.status === "active").length,
      lowBattery: robots.filter((r) => r.battery < 20).length,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `robofleet-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-download">
      <button
        onClick={downloadJSON}
        disabled={loading}
        className="btn btn-sm btn-secondary"
        title="Download JSON report"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        JSON
      </button>
    </div>
  );
}

export default ReportDownload;
