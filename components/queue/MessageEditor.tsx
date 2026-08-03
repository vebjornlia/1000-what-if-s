"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import type { WhatIf } from "@/lib/hooks/useWhatIfs";
import { resolveContactEdit } from "@/lib/utils/messageEditorContact";

export default function MessageEditor({
  card,
  onSave,
  onClose,
}: {
  card: WhatIf;
  onSave: (body: string, subject: string, contact?: string) => void;
  onClose: () => void;
}) {
  const initialTo = card.resolved_contact || card.recipient_contact || "";
  const [to, setTo] = useState(initialTo);
  const [subject, setSubject] = useState(card.message_subject || "");
  const [body, setBody] = useState(card.message_body);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-[family-name:var(--font-playfair)] text-lg font-bold">
            Edit message to {card.recipient_name}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">To</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@email.com"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50 resize-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(body, subject, resolveContactEdit(initialTo, to))}
            className="flex items-center gap-1 rounded-lg gradient-bg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
