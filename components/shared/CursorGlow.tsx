"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    function handleMove(e: MouseEvent) {
      el!.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
      el!.style.opacity = "1";
    }

    function handleLeave() {
      el!.style.opacity = "0";
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed z-0 h-[300px] w-[300px] rounded-full opacity-0 transition-opacity duration-300"
      style={{
        background: "radial-gradient(circle, rgba(123,104,238,0.06) 0%, transparent 70%)",
      }}
    />
  );
}
