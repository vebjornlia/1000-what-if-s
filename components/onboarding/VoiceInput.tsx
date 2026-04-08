"use client";

import { Mic, MicOff, Send, Keyboard } from "lucide-react";
import { useVoiceInput } from "@/lib/hooks/useVoiceInput";
import { useState, useEffect } from "react";

export default function VoiceInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening } =
    useVoiceInput();
  const [textMode, setTextMode] = useState(false);
  const [textInput, setTextInput] = useState("");

  // Auto-send when voice transcript is finalized
  useEffect(() => {
    if (transcript && !isListening) {
      onSend(transcript);
    }
  }, [transcript, isListening, onSend]);

  function handleTextSend() {
    if (!textInput.trim()) return;
    onSend(textInput.trim());
    setTextInput("");
  }

  if (textMode || !isSupported) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder="Type your response..."
          disabled={disabled}
          className="flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent-purple/50 disabled:opacity-50"
        />
        <button
          onClick={handleTextSend}
          disabled={disabled || !textInput.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg text-white transition hover:opacity-90 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
        {isSupported && (
          <button
            onClick={() => setTextMode(false)}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-muted transition hover:bg-gray-50"
          >
            <Mic className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Interim transcript */}
      {(isListening || interimTranscript) && (
        <p className="text-sm text-muted italic text-center min-h-[20px]">
          {interimTranscript || "Listening..."}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`relative flex h-16 w-16 items-center justify-center rounded-full text-white transition disabled:opacity-50 ${
            isListening
              ? "bg-red-500 hover:bg-red-600"
              : "gradient-bg hover:opacity-90"
          }`}
        >
          {isListening && (
            <span className="absolute inset-0 rounded-full animate-ping gradient-bg opacity-30" />
          )}
          {isListening ? <MicOff className="h-6 w-6 relative z-10" /> : <Mic className="h-6 w-6" />}
        </button>

        <button
          onClick={() => setTextMode(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted transition hover:bg-gray-50"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted">
        {isListening ? "Tap to stop" : "Tap to talk"}
      </p>
    </div>
  );
}
