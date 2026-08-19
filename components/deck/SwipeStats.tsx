"use client";

import { Send } from "lucide-react";
import { deckProgress } from "@/lib/utils/deckProgress";

export default function SwipeStats({
  totalCount,
  queuedCount,
  currentIndex,
}: {
  totalCount: number;
  queuedCount: number;
  currentIndex: number;
}) {
  const { position, total, percent } = deckProgress(currentIndex, totalCount);

  return (
    <div className="w-full max-w-sm space-y-2">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{position} / {total}</span>
        <span className="flex items-center gap-1">
          <Send className="h-3 w-3" />
          {queuedCount} queued
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full gradient-bg transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
