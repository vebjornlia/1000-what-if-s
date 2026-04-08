"use client";

import { AnimatePresence } from "framer-motion";
import SwipeCard from "./SwipeCard";
import SwipeStats from "./SwipeStats";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";
import { X, Heart } from "lucide-react";

export default function SwipeDeck({
  cards,
  onSwipe,
  totalCount,
  queuedCount,
}: {
  cards: WhatIf[];
  onSwipe: (cardId: string, direction: "left" | "right") => void;
  totalCount: number;
  queuedCount: number;
}) {
  const currentCard = cards[0];

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6">
      <SwipeStats totalCount={totalCount} queuedCount={queuedCount} currentIndex={currentCard?.card_index || 0} />

      <div className="relative h-[460px] w-full max-w-sm mx-auto">
        {/* Background stacked cards */}
        {cards.slice(1, 3).map((card, i) => (
          <div
            key={card.id}
            className="absolute inset-0 rounded-3xl border border-border bg-white shadow-sm"
            style={{
              transform: `scale(${1 - (i + 1) * 0.03}) translateY(${(i + 1) * 10}px)`,
              opacity: 1 - (i + 1) * 0.12,
              zIndex: 10 - (i + 1),
            }}
          />
        ))}

        <AnimatePresence mode="popLayout">
          {currentCard && (
            <SwipeCard
              key={currentCard.id}
              card={currentCard}
              onSwipe={(dir) => onSwipe(currentCard.id, dir)}
              isTop={true}
            />
          )}
        </AnimatePresence>

        {!currentCard && (
          <div className="flex h-full items-center justify-center rounded-3xl border-2 border-dashed border-border">
            <p className="text-muted text-center px-8">
              No more cards! Generate more or check your queue.
            </p>
          </div>
        )}
      </div>

      {/* Buttons */}
      {currentCard && (
        <div className="flex gap-8">
          <button
            onClick={() => onSwipe(currentCard.id, "left")}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-200 text-red-400 transition hover:bg-red-50 hover:border-red-300 hover:scale-105 active:scale-95"
          >
            <X className="h-7 w-7" />
          </button>
          <button
            onClick={() => onSwipe(currentCard.id, "right")}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-200 text-green-500 transition hover:bg-green-50 hover:border-green-300 hover:scale-105 active:scale-95"
          >
            <Heart className="h-7 w-7" />
          </button>
        </div>
      )}
    </div>
  );
}
