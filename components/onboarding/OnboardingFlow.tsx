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
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const initialSent = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  // AI starts the conversation
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
            messages: [{ role: "user", content: "Start the interview. Introduce yourself warmly and ask your first question." }],
          }),
        });
        const data = await res.json();
        if (data.message) {
          setMessages([{ role: "assistant", content: cleanMessage(data.message) }]);
        }
      } catch (err) {
        console.error("Greeting failed:", err);
      }
      setIsLoading(false);
    }

    greet();
  }, []);

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
        const rawMessage = data.message || "";
        const aiMsg: Message = { role: "assistant", content: cleanMessage(rawMessage) };
        const withAi = [...updated, aiMsg];
        setMessages(withAi);

        // Check if AI signaled completion
        if (rawMessage.includes("[INTERVIEW_COMPLETE]")) {
          setTimeout(() => handleExtract(withAi), 2000);
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
      setPhase("chat");
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
          display_name: editedProfile.display_name || "Friend",
        });
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
    initialSent.current = false;
  }

  // --- EXTRACTING / SAVING SCREEN ---
  if (phase === "extracting" || phase === "saving") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCFA] px-6">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Sparkles className="mx-auto mb-6 h-14 w-14 text-accent-purple animate-pulse" />
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">
            {phase === "extracting" ? "Building your profile..." : "Setting things up..."}
          </h2>
          <p className="text-muted text-sm">
            {phase === "extracting"
              ? "Analyzing our conversation to understand who you are"
              : "Preparing to find your 1,000 opportunities"}
          </p>
          <div className="mt-8 mx-auto w-48 h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full gradient-bg rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: phase === "saving" ? "100%" : "70%" }}
              transition={{ duration: phase === "saving" ? 2 : 5, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  // --- REVIEW SCREEN ---
  if (phase === "review" && extractedProfile) {
    return (
      <div className="min-h-screen bg-[#FCFCFA] px-4 py-10">
        <ProfileReview
          profile={extractedProfile}
          onConfirm={handleConfirmProfile}
          onRedo={handleRedo}
        />
      </div>
    );
  }

  // --- CHAT SCREEN (the interview) ---
  const userMsgCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFCFA]">
      {/* Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md px-4 py-5">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-purple" />
            Let&apos;s get to know you
          </h1>
          <p className="text-xs text-muted mt-1">
            Answer a few questions so we can find the right opportunities for you
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-5 max-w-xl mx-auto w-full">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <ChatBubble key={i} role={msg.role} content={msg.content} />
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className="flex items-end gap-2 justify-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-bg">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border bg-white px-4 py-4">
        <div className="mx-auto max-w-xl space-y-3">
          <VoiceInput onSend={handleSend} disabled={isLoading} />

          {userMsgCount >= 3 && (
            <button
              onClick={() => handleExtract()}
              disabled={isLoading}
              className="w-full rounded-xl border border-accent-purple/20 bg-accent-purple/5 py-2 text-xs font-medium text-accent-purple transition hover:bg-accent-purple/10 disabled:opacity-50"
            >
              I&apos;m done — show me my profile →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
