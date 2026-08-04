"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import QueueList from "@/components/queue/QueueList";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";
import { Mail, Loader2 } from "lucide-react";
import { openGmailCompose, getMessageSubject } from "@/lib/utils/email";
import { partitionSendable } from "@/lib/utils/queueSend";

export default function QueuePage() {
  const [items, setItems] = useState<WhatIf[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

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

  // Poll for email discovery updates
  useEffect(() => {
    fetchQueue();
    const interval = setInterval(() => {
      const hasPending = items.some(
        (i) =>
          !i.email_discovery_status ||
          i.email_discovery_status === "pending" ||
          i.email_discovery_status === "searching"
      );
      if (hasPending) fetchQueue();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchQueue, items]);

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
    // Only open Gmail for — and mark as sent — cards with a valid recipient
    // email. Cards with a blank or non-email contact stay in the queue so the
    // outreach is not silently lost.
    const { sendable, skipped } = partitionSendable(items);

    if (sendable.length === 0) {
      alert(
        "None of these cards have a valid recipient email yet, so nothing was sent. They stay in your queue."
      );
      return;
    }

    sendable.forEach((card, i) => {
      setTimeout(() => {
        openGmailCompose({
          to: card.resolved_contact || card.recipient_contact || "",
          subject: getMessageSubject(card),
          body: card.message_body,
        });
      }, i * 500);
    });

    const ids = sendable.map((i) => i.id);
    supabase
      .from("what_ifs")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .in("id", ids)
      .then(() => setItems(skipped));

    if (skipped.length > 0) {
      alert(
        `Opened ${sendable.length} message${sendable.length === 1 ? "" : "s"} in Gmail. ${skipped.length} card${skipped.length === 1 ? "" : "s"} had no valid email and stayed in your queue.`
      );
    }
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
