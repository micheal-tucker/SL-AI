"use client";

import React from "react"

import { useRef, useEffect } from "react";
import { ArrowUp, Square, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
  quickPrompts = [],
  onQuickPrompt,
  onAttach,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onStop: () => void;
  quickPrompts?: string[];
  onQuickPrompt?: (prompt: string) => void;
  onAttach?: (file: File) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-border bg-card/90 px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-4">
      {quickPrompts.length > 0 && (
        <div className="mx-auto mb-2 flex max-w-3xl gap-2 overflow-x-auto pb-1">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onQuickPrompt?.(prompt)}
              className="shrink-0 rounded-full border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) onSubmit();
        }}
        className="mx-auto flex max-w-3xl items-end gap-2"
      >
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className={cn(
              "w-full resize-none rounded-xl border border-border bg-secondary/50 px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-primary/40",
              "transition-colors leading-relaxed"
            )}
            disabled={false}
            aria-label="Chat message input"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && onAttach) onAttach(file);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors shrink-0"
          aria-label="Attach text file"
        >
          <Paperclip className="w-4 h-4" />
        </button>
        {isLoading ? (
          <button
            type="button"
            onClick={onStop}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shrink-0"
            aria-label="Stop generating"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-colors shrink-0",
              input.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </form>
      <p className="text-center text-[11px] text-muted-foreground/60 mt-2 max-w-3xl mx-auto">
        SL-AI can make mistakes. Verify important information.
      </p>
    </div>
  );
}
