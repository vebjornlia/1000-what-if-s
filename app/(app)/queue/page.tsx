"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import QueueList from "@/components/queue/QueueList";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";
import { Mail, Loader2 } from "lucide-react";
import { openGmailCompose, getMessageSubject } from "@/lib/utils/email";
import { queueHasPending } from "@/lib/utils/queuePolling";

export default function QueuePage() {
  const [items, setItems] = useState<WhatIf[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  // Latest items for the poll to read without being in the effect deps — see below.
  const itemsRef = useRef<WhatIf[]>(items);
  itemsRef.current = items;

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("what_ifs")
      .select("*")
      .eq("status", "queued")
      .order("swiped_at", { ascending: false });
    setItems((data as WhatIf[]) || []);
    setLoading(false);
  }, [supabase]);

  // Poll for email discovery updates. The interval reads the latest items via a
  // ref so `items` is NOT an effect dependency: otherwise every fetchQueue()
  // replaces items with a fresh array reference, re-running this effect and
  // firing another immediate fetchQueue() — a tight refetch loop that hammers
  // the database instead of polling once every 3s.
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => {
      if (queueHasPending(itemsRef.current)) fetchQueue();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  async function handleRemove(id: string) {
    await supabase.from("what_ifs").update({ status: "skipped" }).eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleUpdate(id: string, body: string, subject: string) {
    await supabase
      .from("what_ifs")
      .update({ message_body: body, message_subject: subject })
      .eq("id", id);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, message_body: body, message_subject: subject } : i
      )
    );
  }

  async function handleUpdateContact(id: string, email: string) {
    await supabase
      .from("what_ifs")
      .update({ resolved_contact: email, email_discovery_status: "manual" })
      .eq("id", id);
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, resolved_contact: email, email_discovery_status: "manual" }
          : i
      )
    );
  }

  async function handleMarkSent(id: string) {
    await supabase
      .from("what_ifs")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSendAllViaGmail() {
    items.forEach((card, i) => {
      setTimeout(() => {
        openGmailCompose({
          to: card.resolved_contact || card.recipient_contact || "",
          subject: getMessageSubject(card),
          body: card.message_body,
        });
      }, i * 500);
    });

    const ids = items.map((i) => i.id);
    supabase
      .from("what_ifs")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .in("id", ids)
      .then(() => setItems([]));
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-purple" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold">
            Send Queue
          </h1>
          <p className="text-sm text-muted mt-1">
            {items.length} messages ready to send
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleSendAllViaGmail}
            className="flex items-center gap-2 rounded-xl gradient-bg px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
          >
            <Mail className="h-4 w-4" />
            Open All in Gmail
          </button>
        )}
      </div>

      <QueueList
        items={items}
        onRemove={handleRemove}
        onUpdate={handleUpdate}
        onMarkSent={handleMarkSent}
        onUpdateContact={handleUpdateContact}
      />
    </div>
  );
}
