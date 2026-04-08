"use client";

import { Mic, MicOff, Send, ArrowUp } from "lucide-react";
import { useVoiceInput } from "@/lib/hooks/useVoiceInput";
import { useState, useEffect } from "react";

export default function VoiceInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled: boolean;
}) {
  const { isListening, transcript, interimTranscript, isSupported, startListening, stopListening, resetTranscript } =
    useVoiceInput();
  const [textInput, setTextInput] = useState("");

  // When voice transcript updates, put it in the text input (don't auto-send!)
  useEffect(() => {
    if (transcript) {
      setTextInput(transcript);
    }
  }, [transcript]);

  function handleSend() {
    const value = textInput.trim();
    if (!value) return;
    onSend(value);
    setTextInput("");
    resetTranscript();
    if (isListening) stopListening();
  }

  function handleVoiceToggle() {
    if (isListening) {
      stopListening();
    } else {
      setTextInput("");
      resetTranscript();
      startListening();
    }
  }

  return (
    <div className="space-y-2">
      {/* Interim voice feedback */}
      {isListening && interimTranscript && (
        <p className="text-xs text-accent-purple italic text-center animate-pulse">
          {interimTranscript}
        </p>
      )}

      <div className="flex items-end gap-2">
        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? "Listening... tap mic to stop" : "Type your answer..."}
            disabled={disabled || isListening}
            rows={1}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-accent-purple/30 disabled:opacity-50 resize-none min-h-[48px] max-h-[120px]"
            style={{ height: "auto" }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
          />
        </div>

        {/* Voice button */}
        {isSupported && (
          <button
            onClick={handleVoiceToggle}
            disabled={disabled}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-50 ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "border border-border text-muted hover:bg-gray-50"
            }`}
            title={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !textInput.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl gradient-bg text-white transition hover:opacity-90 disabled:opacity-30"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
