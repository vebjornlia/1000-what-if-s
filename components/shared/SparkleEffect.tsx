"use client";

import { useCallback } from "react";

export function useSparkle() {
  const sparkle = useCallback((e: React.MouseEvent) => {
    const colors = ["#7B68EE", "#00B894", "#FFD700", "#FF6B6B", "#4ECDC4"];
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement("div");
      const angle = (i / 8) * 2 * Math.PI;
      const velocity = 40 + Math.random() * 40;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      dot.style.cssText = `
        position:fixed;left:${e.clientX}px;top:${e.clientY}px;
        width:6px;height:6px;border-radius:50%;pointer-events:none;z-index:9999;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        transition:all 0.6s cubic-bezier(.25,.46,.45,.94);opacity:1;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate(${dx}px, ${dy}px) scale(0)`;
        dot.style.opacity = "0";
      });
      setTimeout(() => dot.remove(), 600);
    }
  }, []);

  return sparkle;
}
