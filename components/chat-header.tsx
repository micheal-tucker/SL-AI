"use client";

import { Bot, RotateCcw } from "lucide-react";
import { SpeechControls } from "@/components/speech-controls";
import { ToneControls } from "@/components/tone-controls";
import { Globe, Database } from "lucide-react";

export function ChatHeader({
  onNewChat,
  tone,
  onToneChange,
  webSearchEnabled,
  onToggleWebSearch,
  kbCount,
  onClearKb,
}: {
  onNewChat: () => void;
  tone: string;
  onToneChange: (value: string) => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: (value: boolean) => void;
  kbCount: number;
  onClearKb: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-card/80 px-3 py-3 backdrop-blur-sm sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold font-display tracking-tight text-foreground">
              SL-AI
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              Your Smart Digital Assistant
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
          aria-label="Start new conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 sm:mt-2 sm:gap-3">
        <SpeechControls />
        <ToneControls value={tone} onChange={onToneChange} />
        <button
          type="button"
          onClick={() => onToggleWebSearch(!webSearchEnabled)}
          className="flex shrink-0 items-center gap-2 rounded-md border border-border/60 bg-secondary/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
          aria-label="Toggle web search"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Web {webSearchEnabled ? "On" : "Off"}</span>
        </button>
        <button
          type="button"
          onClick={onClearKb}
          className="flex shrink-0 items-center gap-2 rounded-md border border-border/60 bg-secondary/60 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
          aria-label="Clear knowledge base"
        >
          <Database className="h-3.5 w-3.5" />
          <span>KB {kbCount}</span>
        </button>
        <button
          type="button"
          onClick={onNewChat}
          className="hidden items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
          aria-label="Start new conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Chat</span>
        </button>
      </div>
    </header>
  );
}
