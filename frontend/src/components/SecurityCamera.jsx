import React, { useEffect, useRef, useState } from "react";
import "../styles/securityCamera.css";

function SecurityCamera({ isAlarm = false }) {
  const cameraRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cameraRef.current) return;

      const rect = cameraRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      // Базовые углы поворота
      const baseRotateY = Math.max(-30, Math.min(30, deltaX / 8));
      const baseRotateX = Math.max(-30, Math.min(30, -deltaY / 8));

      setRotation({ x: baseRotateX, y: baseRotateY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className={`security-camera-container ${isAlarm ? "alarm" : ""}`}>
      <div ref={cameraRef} className="security-camera">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* СЛОЙ 1: Задний круг (самый медленный) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          className="camera-layer camera-layer-1"
          style={{
            transform: `perspective(1000px) rotateX(${
              rotation.x * 0.2
            }deg) rotateY(${rotation.y * 0.2}deg) translateZ(-30px)`,
          }}
        ></div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* СЛОЙ 2: Средний круг */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          className="camera-layer camera-layer-2"
          style={{
            transform: `perspective(1000px) rotateX(${
              rotation.x * 0.5
            }deg) rotateY(${rotation.y * 0.5}deg) translateZ(-15px)`,
          }}
        ></div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* СЛОЙ 3: Передний круг (основа) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div
          className="camera-layer camera-layer-3"
          style={{
            transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(0px)`,
          }}
        >
          {/* Объектив */}
          <div
            className="camera-lens"
            style={{
              transform: `perspective(1000px) rotateX(${
                rotation.x * 0.7
              }deg) rotateY(${rotation.y * 0.7}deg) translateZ(10px)`,
            }}
          >
            <div className="lens-inner">
              <div className="lens-pupil"></div>
            </div>
            <div className="lens-reflection"></div>
          </div>

          {/* Красный индикатор */}
          <div
            className="recording-indicator"
            style={{
              transform: `translateZ(20px)`,
            }}
          ></div>
        </div>

        {/* Тень */}
        <div className="camera-shadow"></div>
      </div>
    </div>
  );
}

export default SecurityCamera;
