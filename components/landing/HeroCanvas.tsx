"use client";

import { useEffect, useRef } from "react";

export default function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;

    const blobs = [
      { x: 0.3, y: 0.3, r: 250, color: "rgba(123,104,238,0.15)", vx: 0.0003, vy: 0.0002 },
      { x: 0.7, y: 0.6, r: 300, color: "rgba(0,184,148,0.12)", vx: -0.0002, vy: 0.0003 },
      { x: 0.5, y: 0.2, r: 200, color: "rgba(123,104,238,0.08)", vx: 0.0004, vy: -0.0001 },
    ];

    function resize() {
      canvas!.width = canvas!.offsetWidth * 2;
      canvas!.height = canvas!.offsetHeight * 2;
    }

    function draw(t: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx.clearRect(0, 0, w, h);

      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.vx) * 0.1) * w;
        const cy = (b.y + Math.cos(t * b.vy) * 0.1) * h;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, b.r * 2);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      style={{ filter: "blur(60px)" }}
    />
  );
}
