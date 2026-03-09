import React, { useRef, useState } from "react";

export default function SpotlightText({
  children,
  className = "",
  glowColor = "#ff3232",
  baseColor = "#bac4d40",
  glowRadius = 150,
  activationZone = 600,
}) {
  const textRef = useRef(null);
  const [position, setPosition] = useState({ x: -500, y: -500 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!textRef.current) return;
    const rect = textRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });
  };

  return (
    <div
      style={{
        position: "relative",
        cursor: "default",
        // ← Расширяем зону реакции через padding
        padding: `${activationZone}px`,
        margin: `-${activationZone}px`,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={textRef}
        className={className}
        style={{
          position: "relative",
        }}
      >
        {/* Базовый текст (всегда виден, серый) */}
        <div style={{ color: baseColor }}>{children}</div>

        {/* Светящийся текст поверх (красный, через маску) */}
        {isHovered && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              color: glowColor,
              maskImage: `radial-gradient(circle ${glowRadius}px at ${position.x}px ${position.y}px, black, transparent)`,
              WebkitMaskImage: `radial-gradient(circle ${glowRadius}px at ${position.x}px ${position.y}px, black, transparent)`,
            }}
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
