import React, { useRef, useState } from "react";

export default function SpotlightText({
  children,
  className = "",
  glowColor = "#DC2626",
  baseColor = "#99a3b3",
}) {
  const textRef = useRef(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
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
      ref={textRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        position: "relative",
        cursor: "default",
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
            // КЛЮЧ: maskImage создаёт "окно" которое показывает красный текст
            maskImage: `radial-gradient(circle 150px at ${position.x}px ${position.y}px, black, transparent)`,
            WebkitMaskImage: `radial-gradient(circle 150px at ${position.x}px ${position.y}px, black, transparent)`,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
