import React, { useEffect, useRef } from "react";
import "./Marquee.css";

function Marquee() {
  const marqueeRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Server LED effect: random speed changes
    const changeSpeed = () => {
      const duration = Math.random() * 20 + 15; // 15-35s
      marquee.style.animationDuration = `${duration}s`;

      // Next change in 3-8 seconds
      const nextChange = Math.random() * 5000 + 3000;
      timeoutRef.current = setTimeout(changeSpeed, nextChange);
    };

    changeSpeed();

    // ✅ Cleanup memory leak
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const technologies = [
    "PostgreSQL",
    "Redis",
    "React",
    "Node.js",
    "Socket.io",
    "Express",
    "OpenLayers",
  ];

  return (
    <div className="marquee-container">
      <div className="marquee-content" ref={marqueeRef}>
        {[...technologies, ...technologies, ...technologies].map(
          (tech, idx) => (
            <span key={idx} className="marquee-item">
              {tech}
            </span>
          )
        )}
      </div>
    </div>
  );
}

export default Marquee;
