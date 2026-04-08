"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";

export default function SwipeCard({
  card,
  onSwipe,
  isTop,
}: {
  card: WhatIf;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-20, 20]);
  const sendOpacity = useTransform(x, [0, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, 0], [1, 0]);

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const threshold = 100;
    const velocityThreshold = 500;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      animate(x, 600, { duration: 0.3 });
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(30);
      setTimeout(() => onSwipe("right"), 200);
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      animate(x, -600, { duration: 0.3 });
      if (navigator.vibrate) navigator.vibrate(15);
      setTimeout(() => onSwipe("left"), 200);
    } else {
      animate(x, 0, { type: "spring", stiffness: 400, damping: 30 });
    }
  }

  async function handleCopy() {
    const text = card.message_subject
      ? `Subject: ${card.message_subject}\n\n${card.message_body}`
      : card.message_body;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isTop) return null;

  return (
    <motion.div
      className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="h-full rounded-3xl border border-border bg-white p-6 shadow-lg flex flex-col">
        {/* Swipe indicators */}
        <motion.div
          className="absolute top-6 right-6 rounded-lg bg-green-100 px-4 py-1.5 text-sm font-bold text-green-600 rotate-12 z-30"
          style={{ opacity: sendOpacity }}
        >
          SEND ✨
        </motion.div>
        <motion.div
          className="absolute top-6 left-6 rounded-lg bg-red-100 px-4 py-1.5 text-sm font-bold text-red-500 -rotate-12 z-30"
          style={{ opacity: skipOpacity }}
        >
          SKIP
        </motion.div>

        {/* Category + emoji */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{card.emoji}</span>
          <span className="rounded-full gradient-bg px-3 py-0.5 text-xs font-semibold text-white">
            {card.category}
          </span>
        </div>

        {/* Recipient */}
        <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-1">To:</p>
        <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-1">
          {card.recipient_name}
        </h3>
        {card.recipient_description && (
          <p className="text-xs text-muted mb-4">{card.recipient_description}</p>
        )}

        {/* Message preview */}
        <div className="flex-1 overflow-y-auto">
          {card.message_subject && (
            <p className="text-sm font-semibold mb-2">
              Re: {card.message_subject}
            </p>
          )}
          <p className={`text-sm text-muted leading-relaxed ${!expanded ? "line-clamp-4" : ""}`}>
            {card.message_body}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center gap-1 text-xs font-medium text-accent-purple"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Collapse" : "Read full message"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
