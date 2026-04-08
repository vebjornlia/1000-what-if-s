"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface WhatIf {
  id: string;
  card_index: number;
  category: string;
  emoji: string;
  recipient_name: string;
  recipient_description: string;
  message_subject: string;
  message_body: string;
  status: string;
  swiped_at: string | null;
  sent_at: string | null;
  got_reply: boolean;
}

export function useWhatIfs() {
  const [cards, setCards] = useState<WhatIf[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const fetchCards = useCallback(async () => {
    setLoading(true);
    const { data, count } = await supabase
      .from("what_ifs")
      .select("*", { count: "exact" })
      .eq("status", "unseen")
      .order("card_index", { ascending: true })
      .limit(20);

    setCards((data as WhatIf[]) || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [supabase]);

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

    // Fetch more if running low
    if (cards.length <= 5) {
      fetchCards();
    }
  }

  return { cards, loading, generating, totalCount, fetchCards, generateBatch, swipeCard };
}
