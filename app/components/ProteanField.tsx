"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number; vx: number; vy: number; seed: number };

export function ProteanField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [density, setDensity] = useState(58);
  const [drift, setDrift] = useState(36);
  const [reach, setReach] = useState(118);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frame = 0;
    let points: Point[] = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      points = Array.from({ length: density }, (_, index) => ({
        x: (index * 137.5) % width,
        y: (index * 83.2) % height,
        vx: Math.sin(index * 2.1) * 0.1,
        vy: Math.cos(index * 1.7) * 0.1,
        seed: index * 0.31,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#090b0a";
      context.fillRect(0, 0, width, height);

      for (const point of points) {
        point.vx += Math.cos(time * 0.0003 + point.seed) * drift * 0.000012;
        point.vy += Math.sin(time * 0.00026 + point.seed) * drift * 0.000012;
        point.vx *= 0.992;
        point.vy *= 0.992;
        point.x = (point.x + point.vx + width) % width;
        point.y = (point.y + point.vy + height) % height;
      }

      for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
          const a = points[i];
          const b = points[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < reach) {
            const alpha = 1 - distance / reach;
            context.strokeStyle = `rgba(211, 218, 208, ${alpha * 0.32})`;
            context.lineWidth = 0.7;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      points.forEach((point, index) => {
        context.fillStyle = index % 11 === 0 ? "#c35b3b" : index % 7 === 0 ? "#2948ff" : "#f5f1e8";
        context.beginPath();
        context.arc(point.x, point.y, index % 11 === 0 ? 3.8 : 1.6, 0, Math.PI * 2);
        context.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density, drift, reach]);

  return (
    <div className="playground-tool">
      <div className="playground-canvas"><canvas ref={canvasRef} aria-label="Adjustable field of moving project-like nodes" /></div>
      <aside className="playground-controls">
        <p className="micro">Proteus / field study 01</p>
        <h2>Relationship field</h2>
        <label>Density <output>{density}</output><input type="range" min="20" max="110" value={density} onChange={(event) => setDensity(Number(event.target.value))} /></label>
        <label>Drift <output>{drift}</output><input type="range" min="0" max="100" value={drift} onChange={(event) => setDrift(Number(event.target.value))} /></label>
        <label>Reach <output>{reach}</output><input type="range" min="60" max="220" value={reach} onChange={(event) => setReach(Number(event.target.value))} /></label>
        <button type="button" onClick={() => { setDensity(58); setDrift(36); setReach(118); }}>Reset field</button>
      </aside>
    </div>
  );
}

