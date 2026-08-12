"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { shouldRefetchDeck } from "@/lib/utils/deckRefetch";

export interface DiscoveredEmail {
  email: string;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  type: string; // "personal" | "role" | "generic" | "guessed"
}

export interface WhatIf {
  id: string;
  card_index: number;
  category: string;
  emoji: string;
  recipient_name: string;
  recipient_description: string;
  recipient_contact: string;
  message_subject: string;
  message_body: string;
  status: string;
  swiped_at: string | null;
  sent_at: string | null;
  got_reply: boolean;
  discovered_emails: DiscoveredEmail[] | null;
  resolved_contact: string | null;
  email_discovery_status: string | null; // "pending" | "searching" | "found" | "not_found" | "manual"
}

export function useWhatIfs() {
  const [cards, setCards] = useState<WhatIf[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const fetchingRef = useRef(false);

  // `background: true` tops the deck up quietly — it does NOT toggle the global
  // `loading` flag (which would flash a full-screen loader mid-swipe) and skips
  // if a fetch is already in flight, so the low-cards top-up can't stack up.
  const fetchCards = useCallback(
    async ({ background = false }: { background?: boolean } = {}) => {
      if (background && fetchingRef.current) return;
      fetchingRef.current = true;
      if (!background) setLoading(true);
      try {
        const { data, count } = await supabase
          .from("what_ifs")
          .select("*", { count: "exact" })
          .eq("status", "unseen")
          .order("card_index", { ascending: true })
          .limit(20);

        setCards((data as WhatIf[]) || []);
        setTotalCount(count || 0);
      } finally {
        if (!background) setLoading(false);
        fetchingRef.current = false;
      }
    },
    [supabase]
  );

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  async function generateBatch(batchNumber = 1) {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchSize: 20, batchNumber }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      await fetchCards();
      return data;
    } finally {
      setGenerating(false);
    }
  }

  async function swipeCard(cardId: string, direction: "right" | "left") {
    const newStatus = direction === "right" ? "queued" : "skipped";
    await supabase
      .from("what_ifs")
      .update({ status: newStatus, swiped_at: new Date().toISOString() })
      .eq("id", cardId);

    setCards((prev) => prev.filter((c) => c.id !== cardId));

    // Auto-discover email on right swipe (fire and forget)
    if (direction === "right") {
      fetch("/api/discover-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatIfIds: [cardId] }),
      }).catch(() => {});
    }

    // Fetch more if running low, quietly in the background (no loader flash).
    // `cards` is this render's snapshot, so the swiped card is still counted —
    // subtract it to get the true remaining stack size.
    if (shouldRefetchDeck(cards.length - 1)) {
      fetchCards({ background: true });
    }
  }

  return { cards, loading, generating, totalCount, fetchCards, generateBatch, swipeCard };
}
