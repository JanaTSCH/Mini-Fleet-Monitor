import React from "react";
import { Battery, BatteryCharging } from "lucide-react";

function BatteryWidget({ battery }) {
  const isLow = battery < 20;
  const getColor = () => {
    if (battery < 20) return "rgb(var(--color-error))";
    if (battery < 50) return "rgb(var(--color-warning))";
    return "rgb(var(--color-success))";
  };

  return (
    <div className={`widget battery-widget ${isLow ? "low" : ""}`}>
      <div className="battery-icon">
        {isLow ? <BatteryCharging size={32} /> : <Battery size={32} />}
      </div>
      <div className="battery-content">
        <div className="battery-percentage">{battery}%</div>
        <div className="battery-bar">
          <div
            className="battery-fill"
            style={{
              width: `${battery}%`,
              background: getColor(),
            }}
          />
        </div>
        <div className="battery-label">Battery Level</div>
      </div>
    </div>
  );
}

export default BatteryWidget;
