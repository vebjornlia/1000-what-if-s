"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Trash2, Copy, Check, Mail } from "lucide-react";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";
import MessageEditor from "./MessageEditor";
import { openGmailCompose, getMessageSubject } from "@/lib/utils/email";

export default function QueueList({
  items,
  onRemove,
  onUpdate,
  onMarkSent,
}: {
  items: WhatIf[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, body: string, subject: string) => void;
  onMarkSent: (id: string) => void;
}) {
  const [editing, setEditing] = useState<WhatIf | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(card: WhatIf) {
    const text = card.message_subject
      ? `Subject: ${card.message_subject}\n\n${card.message_body}`
      : card.message_body;
    await navigator.clipboard.writeText(text);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleSendViaGmail(card: WhatIf) {
    openGmailCompose({
      to: card.recipient_contact || "",
      subject: getMessageSubject(card),
      body: card.message_body,
    });
    onMarkSent(card.id);
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted text-lg">No messages in your queue yet.</p>
        <p className="text-sm text-muted mt-2">Swipe right on cards in the Deck to add them here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {items.map((card) => (
            <motion.div
              key={card.id}
              className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              layout
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{card.emoji}</span>
                    <span className="rounded-full gradient-bg px-2 py-0.5 text-[10px] font-semibold text-white">
                      {card.category}
                    </span>
                  </div>
                  <h4 className="font-semibold">{card.recipient_name}</h4>

                  {card.recipient_description && (
                    <p className="text-xs text-muted mt-0.5">{card.recipient_description}</p>
                  )}

                  {card.recipient_contact && (
                    <p className="text-xs text-accent-purple mt-0.5 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {card.recipient_contact}
                    </p>
                  )}

                  <p className="text-sm text-muted mt-2 leading-relaxed line-clamp-5">{card.message_body}</p>

                  {/* Send via Gmail button */}
                  <button
                    onClick={() => handleSendViaGmail(card)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg gradient-bg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    <Mail className="h-3 w-3" />
                    {card.recipient_contact ? "Send via Gmail" : "Open in Gmail"}
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={() => setEditing(card)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-gray-50 transition"
                    title="Edit"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleCopy(card)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted hover:bg-gray-50 transition"
                    title="Copy"
                  >
                    {copiedId === card.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onRemove(card.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {editing && (
        <MessageEditor
          card={editing}
          onSave={(body, subject) => {
            onUpdate(editing.id, body, subject);
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
