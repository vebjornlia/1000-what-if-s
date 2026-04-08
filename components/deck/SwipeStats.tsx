"use client";

import { Send } from "lucide-react";

export default function SwipeStats({
  totalCount,
  queuedCount,
  currentIndex,
}: {
  totalCount: number;
  queuedCount: number;
  currentIndex: number;
}) {
  const progress = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;

  return (
    <div className="w-full max-w-sm space-y-2">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{currentIndex + 1} / {totalCount}</span>
        <span className="flex items-center gap-1">
          <Send className="h-3 w-3" />
          {queuedCount} queued
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full gradient-bg transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}
