"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useState } from "react";
import { Copy, Check, Mail, ExternalLink } from "lucide-react";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";
import { buildCopyText } from "@/lib/utils/copy";
import { getMessageSubject } from "@/lib/utils/email";

export default function SwipeCard({
  card,
  onSwipe,
  isTop,
}: {
  card: WhatIf;
  onSwipe: (direction: "left" | "right") => void;
  isTop: boolean;
}) {
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
    const text = buildCopyText(getMessageSubject(card), card.message_body);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isTop) return null;

  const isEmail = card.recipient_contact?.includes("@");

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
      <div className="h-full rounded-3xl border border-border bg-white p-5 shadow-lg flex flex-col">
        {/* Swipe indicators */}
        <motion.div
          className="absolute top-5 right-5 rounded-lg bg-green-100 px-4 py-1.5 text-sm font-bold text-green-600 rotate-12 z-30"
          style={{ opacity: sendOpacity }}
        >
          SEND ✨
        </motion.div>
        <motion.div
          className="absolute top-5 left-5 rounded-lg bg-red-100 px-4 py-1.5 text-sm font-bold text-red-500 -rotate-12 z-30"
          style={{ opacity: skipOpacity }}
        >
          SKIP
        </motion.div>

        {/* Category + emoji */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{card.emoji}</span>
          <span className="rounded-full gradient-bg px-3 py-0.5 text-xs font-semibold text-white">
            {card.category}
          </span>
        </div>

        {/* Recipient */}
        <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold mb-1">
          {card.recipient_name}
        </h3>

        {/* Recipient description — who they are and why they matter */}
        {card.recipient_description && (
          <p className="text-xs text-muted mb-2 leading-relaxed">{card.recipient_description}</p>
        )}

        {/* Contact info */}
        {card.recipient_contact && (
          <div className="flex items-center gap-1 mb-3">
            {isEmail ? (
              <Mail className="h-3 w-3 text-accent-purple shrink-0" />
            ) : (
              <ExternalLink className="h-3 w-3 text-accent-purple shrink-0" />
            )}
            <span className="text-xs text-accent-purple truncate">{card.recipient_contact}</span>
          </div>
        )}

        {/* Message — full text, scrollable if needed */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {card.message_subject && (
            <p className="text-sm font-semibold mb-1.5">
              {card.message_subject}
            </p>
          )}
          <p className="text-sm text-muted leading-relaxed">
            {card.message_body}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-3 flex items-center justify-end pt-2 border-t border-border">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-foreground transition"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy message"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
