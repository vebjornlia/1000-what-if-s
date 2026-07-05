"use client";

import { useState } from "react";
import { Mail, AlertCircle, Loader2, ChevronDown, ChevronUp, Pencil } from "lucide-react";
import type { WhatIf, DiscoveredEmail } from "@/lib/hooks/useWhatIfs";
import { isValidEmail } from "@/lib/utils/validateEmail";

const confidenceColors = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-red-100 text-red-700",
};

export default function ContactWidget({
  card,
  onSetManual,
}: {
  card: WhatIf;
  onSetManual: (email: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState(false);
  const [manualEmail, setManualEmail] = useState("");

  const status = card.email_discovery_status || "pending";
  const resolvedEmail = card.resolved_contact;
  const candidates = card.discovered_emails || [];
  const bestCandidate = candidates[0];

  // Commit a manually typed address only if it is a valid email, storing the
  // trimmed value so stray whitespace never reaches the recipient field.
  function commitManualEmail() {
    const trimmed = manualEmail.trim();
    if (!isValidEmail(trimmed)) return;
    onSetManual(trimmed);
    setEditing(false);
  }

  // Manual entry mode
  if (editing) {
    return (
      <div className="mt-1 flex items-center gap-1.5">
        <input
          type="email"
          value={manualEmail}
          onChange={(e) => setManualEmail(e.target.value)}
          placeholder="Enter email..."
          className="flex-1 rounded-md border border-border px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-accent-purple/50"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") commitManualEmail();
            if (e.key === "Escape") setEditing(false);
          }}
        />
        <button
          onClick={commitManualEmail}
          disabled={!isValidEmail(manualEmail)}
          className="rounded-md gradient-bg px-2 py-1 text-[10px] font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Found state - show best email with confidence
  if (status === "found" && resolvedEmail && bestCandidate) {
    return (
      <div className="mt-1">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3 w-3 text-accent-purple" />
          <span className="text-xs text-accent-purple font-medium">
            {resolvedEmail}
          </span>
          <span
            className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
              confidenceColors[bestCandidate.confidence]
            }`}
          >
            {bestCandidate.confidence}
          </span>
          <button
            onClick={() => {
              setManualEmail(resolvedEmail);
              setEditing(true);
            }}
            className="text-muted hover:text-foreground transition"
            title="Edit email"
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
        </div>

        <p className="text-[10px] text-muted mt-0.5">{bestCandidate.reasoning}</p>

        {candidates.length > 1 && (
          <div className="mt-1">
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center gap-0.5 text-[10px] text-muted hover:text-foreground transition"
            >
              {showAll ? (
                <ChevronUp className="h-2.5 w-2.5" />
              ) : (
                <ChevronDown className="h-2.5 w-2.5" />
              )}
              {candidates.length - 1} more option{candidates.length > 2 ? "s" : ""}
            </button>
            {showAll && (
              <div className="mt-1 space-y-1">
                {candidates.slice(1).map((c: DiscoveredEmail, i: number) => (
                  <button
                    key={i}
                    onClick={() => onSetManual(c.email)}
                    className="flex w-full items-center gap-1.5 rounded-md border border-border px-2 py-1 text-left hover:bg-gray-50 transition"
                  >
                    <span className="text-[10px] text-foreground">{c.email}</span>
                    <span
                      className={`rounded-full px-1 py-0.5 text-[8px] font-semibold ${
                        confidenceColors[c.confidence]
                      }`}
                    >
                      {c.confidence}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Manual state - show user-entered email
  if (status === "manual" && resolvedEmail) {
    return (
      <div className="flex items-center gap-1.5 mt-1">
        <Mail className="h-3 w-3 text-accent-purple" />
        <span className="text-xs text-accent-purple font-medium">
          {resolvedEmail}
        </span>
        <button
          onClick={() => {
            setManualEmail(resolvedEmail);
            setEditing(true);
          }}
          className="text-muted hover:text-foreground transition"
          title="Edit email"
        >
          <Pencil className="h-2.5 w-2.5" />
        </button>
      </div>
    );
  }

  // Not found state
  if (status === "not_found") {
    return (
      <div className="mt-1">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="h-3 w-3 text-muted" />
          <span className="text-xs text-muted">No email found</span>
          <button
            onClick={() => setEditing(true)}
            className="text-[10px] text-accent-purple hover:underline"
          >
            Enter manually
          </button>
        </div>
        {card.recipient_contact && (
          <p className="text-[10px] text-muted mt-0.5">
            Original: {card.recipient_contact}
          </p>
        )}
      </div>
    );
  }

  // Searching state
  if (status === "searching") {
    return (
      <div className="flex items-center gap-2 mt-1">
        <Loader2 className="h-3 w-3 animate-spin text-accent-purple" />
        <span className="text-xs text-muted">Finding best email...</span>
      </div>
    );
  }

  // Pending state (default) - still waiting for auto-discovery
  return (
    <div className="flex items-center gap-2 mt-1">
      <Loader2 className="h-3 w-3 animate-spin text-accent-purple" />
      <span className="text-xs text-muted">Finding best email...</span>
    </div>
  );
}
