"use client";

import { motion } from "framer-motion";

export default function ChatBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-accent-purple text-white rounded-br-md"
            : "bg-white border border-border text-foreground rounded-bl-md"
        }`}
      >
        {content}
      </div>
    </motion.div>
  );
}
