"use client";

import { Bot, RotateCcw } from "lucide-react";
import { SpeechControls } from "@/components/speech-controls";
import { ToneControls } from "@/components/tone-controls";

export function ChatHeader({
  onNewChat,
  tone,
  onToneChange,
}: {
  onNewChat: () => void;
  tone: string;
  onToneChange: (value: string) => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/15">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold font-display text-foreground tracking-tight">
            SL-AI
          </h1>
          <p className="text-xs text-muted-foreground">
            Your Smart Digital Assistant
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <SpeechControls />
        <ToneControls value={tone} onChange={onToneChange} />
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
          aria-label="Start new conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}
