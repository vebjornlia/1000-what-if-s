"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import ChatBubble from "./ChatBubble";
import VoiceInput from "./VoiceInput";
import ProfileReview, { type Profile } from "./ProfileReview";
import { createClient } from "@/lib/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Phase = "chat" | "extracting" | "review" | "saving";

export default function OnboardingFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<Phase>("chat");
  const [extractedProfile, setExtractedProfile] = useState<Profile | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const initialSent = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Send initial greeting — AI starts the interview
  useEffect(() => {
    if (initialSent.current) return;
    initialSent.current = true;

    async function greet() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "Start the interview. Ask me your first question." }],
          }),
        });
        const data = await res.json();
        if (data.message) {
          setMessages([{ role: "assistant", content: cleanMessage(data.message) }]);
          setQuestionCount(1);
        }
      } catch (err) {
        console.error("Greeting failed:", err);
      }
      setIsLoading(false);
    }

    greet();
  }, []);

  // Clean AI response — remove [INTERVIEW_COMPLETE] marker from display
  function cleanMessage(text: string) {
    return text.replace(/\[INTERVIEW_COMPLETE\]/g, "").trim();
  }

  const handleSend = useCallback(
    async (text: string) => {
      if (isLoading || phase !== "chat") return;

      const userMsg: Message = { role: "user", content: text };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated }),
        });
        const data = await res.json();
        const aiMsg: Message = { role: "assistant", content: cleanMessage(data.message || "") };
        const withAi = [...updated, aiMsg];
        setMessages(withAi);
        setQuestionCount((c) => c + 1);

        // Check if AI signaled interview is complete
        if (data.message?.includes("[INTERVIEW_COMPLETE]")) {
          // Auto-extract after a short delay
          setTimeout(() => handleExtract(withAi), 1500);
        }
      } catch (err) {
        console.error("Chat failed:", err);
      }
      setIsLoading(false);
    },
    [messages, isLoading, phase]
  );

  async function handleExtract(chatMessages?: Message[]) {
    setPhase("extracting");
    const msgs = chatMessages || messages;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs, action: "extract_profile" }),
      });
      const data = await res.json();
      setExtractedProfile(data.profile);
      setPhase("review");
    } catch (err) {
      console.error("Profile extraction failed:", err);
      setPhase("chat"); // Fall back to chat if extraction fails
    }
  }

  async function handleConfirmProfile(editedProfile: Profile) {
    setPhase("saving");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          raw_conversation: messages,
          structured_profile: editedProfile,
          display_name: (editedProfile.display_name as string) || "Friend",
        });

        // Set cookie so middleware knows profile exists
        document.cookie = "x-has-profile=1; path=/; max-age=86400";
      }

      router.push("/deck?generate=true");
    } catch (err) {
      console.error("Save failed:", err);
      setPhase("review");
    }
  }

  function handleRedo() {
    setMessages([]);
    setExtractedProfile(null);
    setPhase("chat");
    setQuestionCount(0);
    initialSent.current = false;
  }

  // Extracting state
  if (phase === "extracting" || phase === "saving") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCFA] px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Sparkles className="mx-auto mb-6 h-16 w-16 text-accent-purple animate-pulse" />
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-3">
            {phase === "extracting" ? "Analyzing your interview..." : "Saving your profile..."}
          </h2>
          <p className="text-muted">
            {phase === "extracting"
              ? "Building your profile from our conversation"
              : "Setting up your 1,000 what-ifs"}
          </p>
          <div className="mt-8 mx-auto w-64 h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full gradient-bg rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: phase === "saving" ? "100%" : "70%" }}
              transition={{ duration: phase === "saving" ? 2 : 4, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // Review state
  if (phase === "review" && extractedProfile) {
    return (
      <div className="min-h-screen bg-[#FCFCFA] px-4 py-8">
        <ProfileReview
          profile={extractedProfile}
          onConfirm={handleConfirmProfile}
          onRedo={handleRedo}
        />
      </div>
    );
  }

  // Chat state (the interview)
  const userMsgCount = messages.filter((m) => m.role === "user").length;
  const showFinishButton = userMsgCount >= 3;

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFCFA]">
      {/* Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-purple" />
              The Interview
            </h1>
            <p className="text-xs text-muted mt-0.5">Tell me about yourself — 2 minutes is all I need</p>
          </div>
          {questionCount > 0 && (
            <span className="text-xs text-muted bg-gray-100 rounded-full px-3 py-1">
              Q{Math.min(questionCount, 6)} of ~6
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-2xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-accent-purple" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">
          <VoiceInput onSend={handleSend} disabled={isLoading} />

          {showFinishButton && (
            <button
              onClick={() => handleExtract()}
              disabled={isLoading}
              className="w-full rounded-xl border border-accent-purple/30 bg-accent-purple/5 py-2.5 text-sm font-medium text-accent-purple transition hover:bg-accent-purple/10 disabled:opacity-50"
            >
              That&apos;s enough — show me my profile →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
