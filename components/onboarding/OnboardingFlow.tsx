"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import ChatBubble from "./ChatBubble";
import VoiceInput from "./VoiceInput";
import { createClient } from "@/lib/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function OnboardingFlow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const initialSent = useRef(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Send initial greeting
  useEffect(() => {
    if (initialSent.current) return;
    initialSent.current = true;

    async function greet() {
      setIsLoading(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hi, I just signed up. Let's go!" }],
        }),
      });
      const data = await res.json();
      setMessages([{ role: "assistant", content: data.message }]);
      setIsLoading(false);
    }

    greet();
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      if (isLoading || isComplete) return;

      const userMsg: Message = { role: "user", content: text };
      const updated = [...messages, userMsg];
      setMessages(updated);
      setIsLoading(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      const aiMsg: Message = { role: "assistant", content: data.message };
      const withAi = [...updated, aiMsg];
      setMessages(withAi);
      setIsLoading(false);

      // Check if AI says it has enough info (after 5+ exchanges)
      const userMsgCount = withAi.filter((m) => m.role === "user").length;
      const doneIndicators = ["generate", "enough", "ready to", "1,000", "1000", "what-ifs"];
      const lastMsg = data.message.toLowerCase();
      if (userMsgCount >= 3 && doneIndicators.some((d) => lastMsg.includes(d))) {
        setIsComplete(true);
      }
    },
    [messages, isLoading, isComplete]
  );

  async function handleFinish() {
    setIsExtracting(true);

    try {
      // Extract profile
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, action: "extract_profile" }),
      });
      const data = await res.json();

      // Save to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          raw_conversation: messages,
          structured_profile: data.profile,
          display_name: data.profile.display_name || "Friend",
        });
      }

      router.push("/deck?generate=true");
    } catch (err) {
      console.error("Profile extraction failed:", err);
      setIsExtracting(false);
    }
  }

  if (isExtracting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FCFCFA] px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative mx-auto mb-6 h-20 w-20">
            <Sparkles className="absolute inset-0 h-20 w-20 text-accent-purple animate-pulse" />
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold mb-3">
            Generating your 1,000 what-ifs...
          </h2>
          <p className="text-muted">
            Analyzing your profile and finding opportunities you&apos;d never think of.
          </p>
          <div className="mt-8 mx-auto w-64 h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full gradient-bg rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FCFCFA]">
      {/* Header */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md px-4 py-4 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold">
          <Sparkles className="inline h-5 w-5 text-accent-purple mr-1 -mt-1" />
          Tell us about you
        </h1>
        <p className="text-sm text-muted mt-1">Talk or type — 2 minutes is all we need</p>
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
        <div className="mx-auto max-w-2xl">
          {isComplete ? (
            <button
              onClick={handleFinish}
              className="w-full rounded-2xl gradient-bg py-4 text-lg font-semibold text-white transition hover:opacity-90"
            >
              Generate My 1,000 What Ifs ✨
            </button>
          ) : (
            <VoiceInput onSend={handleSend} disabled={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
