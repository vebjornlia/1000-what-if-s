"use client";

import { useEffect, useRef } from "react";

const EMOJIS = ["✨", "🚀", "💡", "🎯", "⭐", "🔥", "💜", "🌊"];

export default function AmbientParticles() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const particles: HTMLDivElement[] = [];

    for (let i = 0; i < 6; i++) {
      const p = document.createElement("div");
      p.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      p.style.cssText = `
        position:absolute;
        font-size:${14 + Math.random() * 10}px;
        left:${Math.random() * 100}%;
        top:${Math.random() * 100}%;
        opacity:0.15;
        animation:float ${6 + Math.random() * 8}s ease-in-out infinite;
        animation-delay:${Math.random() * 5}s;
        pointer-events:none;
      `;
      el.appendChild(p);
      particles.push(p);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(5deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }
      `}</style>
    </>
  );
}
