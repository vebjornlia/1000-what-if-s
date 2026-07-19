"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Edit3, Check, RotateCcw, X } from "lucide-react";
import { boldnessClass } from "@/lib/utils/boldness";

export interface Profile {
  display_name?: string;
  summary?: string;
  occupation?: string;
  skills?: string[];
  interests?: string[];
  goals?: string[];
  tone?: string;
  edge_factors?: string[];
  opportunity_types?: string[];
  boldness_level?: string;
  [key: string]: unknown;
}

export default function ProfileReview({
  profile: initialProfile,
  onConfirm,
  onRedo,
  confirmLabel = "Looks good — Generate my What Ifs ✨",
  showRedo = true,
}: {
  profile: Profile;
  onConfirm: (editedProfile: Profile) => void;
  onRedo?: () => void;
  confirmLabel?: string;
  showRedo?: boolean;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function startEdit(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
  }

  function saveEdit(field: string) {
    setProfile((prev) => ({ ...prev, [field]: editValue }));
    setEditingField(null);
  }

  function startEditTags(field: string, tags: string[]) {
    setEditingField(field);
    setEditValue(tags.join(", "));
  }

  function saveEditTags(field: string) {
    const tags = editValue.split(",").map((t) => t.trim()).filter(Boolean);
    setProfile((prev) => ({ ...prev, [field]: tags }));
    setEditingField(null);
  }

  function removeTag(field: string, index: number) {
    setProfile((prev) => {
      const arr = [...((prev[field as keyof Profile] as string[]) || [])];
      arr.splice(index, 1);
      return { ...prev, [field]: arr };
    });
  }

  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <Sparkles className="mx-auto h-8 w-8 text-accent-purple mb-2" />
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold">
          Here&apos;s what I learned about you
        </h2>
        <p className="text-sm text-muted mt-1">Review and edit anything before we generate your what-ifs</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl border border-border bg-white p-6 space-y-5">
        {/* Name + Summary */}
        <div>
          <EditableText
            label="Name"
            value={profile.display_name || ""}
            editing={editingField === "display_name"}
            editValue={editValue}
            onStartEdit={() => startEdit("display_name", profile.display_name || "")}
            onSave={() => saveEdit("display_name")}
            onCancel={() => setEditingField(null)}
            onChange={setEditValue}
          />
        </div>

        <div>
          <EditableText
            label="Summary"
            value={profile.summary || ""}
            editing={editingField === "summary"}
            editValue={editValue}
            onStartEdit={() => startEdit("summary", profile.summary || "")}
            onSave={() => saveEdit("summary")}
            onCancel={() => setEditingField(null)}
            onChange={setEditValue}
            multiline
          />
        </div>

        <div>
          <EditableText
            label="What you do"
            value={profile.occupation || ""}
            editing={editingField === "occupation"}
            editValue={editValue}
            onStartEdit={() => startEdit("occupation", profile.occupation || "")}
            onSave={() => saveEdit("occupation")}
            onCancel={() => setEditingField(null)}
            onChange={setEditValue}
          />
        </div>

        {/* Tag sections */}
        <TagSection
          label="Skills"
          tags={profile.skills || []}
          editing={editingField === "skills"}
          editValue={editValue}
          onStartEdit={() => startEditTags("skills", profile.skills || [])}
          onSave={() => saveEditTags("skills")}
          onCancel={() => setEditingField(null)}
          onChange={setEditValue}
          onRemoveTag={(i) => removeTag("skills", i)}
          color="bg-purple-100 text-purple-700"
        />

        <TagSection
          label="Interests"
          tags={profile.interests || []}
          editing={editingField === "interests"}
          editValue={editValue}
          onStartEdit={() => startEditTags("interests", profile.interests || [])}
          onSave={() => saveEditTags("interests")}
          onCancel={() => setEditingField(null)}
          onChange={setEditValue}
          onRemoveTag={(i) => removeTag("interests", i)}
          color="bg-teal-100 text-teal-700"
        />

        <TagSection
          label="Goals"
          tags={profile.goals || []}
          editing={editingField === "goals"}
          editValue={editValue}
          onStartEdit={() => startEditTags("goals", profile.goals || [])}
          onSave={() => saveEditTags("goals")}
          onCancel={() => setEditingField(null)}
          onChange={setEditValue}
          onRemoveTag={(i) => removeTag("goals", i)}
          color="bg-blue-100 text-blue-700"
        />

        <TagSection
          label="What makes you unique"
          tags={profile.edge_factors || []}
          editing={editingField === "edge_factors"}
          editValue={editValue}
          onStartEdit={() => startEditTags("edge_factors", profile.edge_factors || [])}
          onSave={() => saveEditTags("edge_factors")}
          onCancel={() => setEditingField(null)}
          onChange={setEditValue}
          onRemoveTag={(i) => removeTag("edge_factors", i)}
          color="bg-orange-100 text-orange-700"
        />

        <TagSection
          label="Opportunity types"
          tags={profile.opportunity_types || []}
          editing={editingField === "opportunity_types"}
          editValue={editValue}
          onStartEdit={() => startEditTags("opportunity_types", profile.opportunity_types || [])}
          onSave={() => saveEditTags("opportunity_types")}
          onCancel={() => setEditingField(null)}
          onChange={setEditValue}
          onRemoveTag={(i) => removeTag("opportunity_types", i)}
          color="bg-pink-100 text-pink-700"
        />

        {/* Tone + Boldness */}
        <div className="flex gap-4">
          <div className="flex-1">
            <EditableText
              label="Communication tone"
              value={profile.tone || ""}
              editing={editingField === "tone"}
              editValue={editValue}
              onStartEdit={() => startEdit("tone", profile.tone || "")}
              onSave={() => saveEdit("tone")}
              onCancel={() => setEditingField(null)}
              onChange={setEditValue}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-muted mb-1">Boldness</p>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${boldnessClass(profile.boldness_level)}`}>
              {profile.boldness_level || "medium"}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => onConfirm(profile)}
          className="w-full rounded-2xl gradient-bg py-4 text-lg font-semibold text-white transition hover:opacity-90"
        >
          {confirmLabel}
        </button>
        {showRedo && onRedo && (
          <button
            onClick={onRedo}
            className="flex items-center justify-center gap-2 w-full rounded-2xl border border-border py-3 font-medium text-muted transition hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" />
            Redo Interview
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* Editable text field */
function EditableText({
  label,
  value,
  editing,
  editValue,
  onStartEdit,
  onSave,
  onCancel,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  editing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  if (editing) {
    return (
      <div>
        <p className="text-xs font-medium text-muted mb-1">{label}</p>
        <div className="flex gap-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50 resize-none"
              rows={3}
              autoFocus
            />
          ) : (
            <input
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50"
              autoFocus
            />
          )}
          <button onClick={onSave} className="text-accent-teal hover:opacity-70"><Check className="h-4 w-4" /></button>
          <button onClick={onCancel} className="text-muted hover:opacity-70"><X className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <p className="text-xs font-medium text-muted mb-1">{label}</p>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm">{value || <span className="italic text-muted">Not set</span>}</p>
        <button onClick={onStartEdit} className="opacity-0 group-hover:opacity-100 text-muted hover:text-foreground transition">
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/* Tag section with edit */
function TagSection({
  label,
  tags,
  editing,
  editValue,
  onStartEdit,
  onSave,
  onCancel,
  onChange,
  onRemoveTag,
  color,
}: {
  label: string;
  tags: string[];
  editing: boolean;
  editValue: string;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
  onRemoveTag: (i: number) => void;
  color: string;
}) {
  if (editing) {
    return (
      <div>
        <p className="text-xs font-medium text-muted mb-1">{label} (comma-separated)</p>
        <div className="flex gap-2">
          <input
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50"
            autoFocus
          />
          <button onClick={onSave} className="text-accent-teal hover:opacity-70"><Check className="h-4 w-4" /></button>
          <button onClick={onCancel} className="text-muted hover:opacity-70"><X className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-xs font-medium text-muted">{label}</p>
        <button onClick={onStartEdit} className="opacity-0 group-hover:opacity-100 text-muted hover:text-foreground transition">
          <Edit3 className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.length > 0 ? (
          tags.map((tag, i) => (
            <span key={i} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
              {tag}
              <button onClick={() => onRemoveTag(i)} className="hover:opacity-70">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))
        ) : (
          <span className="text-xs italic text-muted">None yet</span>
        )}
      </div>
    </div>
  );
}
