"use client";

import { Bot, User, Volume2, Square, Copy, Trash2, RefreshCcw } from "lucide-react";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

function getMessageText(message: UIMessage): string {
  if (!message.parts || !Array.isArray(message.parts)) return "";
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function ChatMessage({
  message,
  onDelete,
  onRegenerate,
  isLastAssistant = false,
}: {
  message: UIMessage;
  onDelete?: (id: string) => void;
  onRegenerate?: () => void;
  isLastAssistant?: boolean;
}) {
  const isAssistant = message.role === "assistant";
  const text = getMessageText(message);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [copied, setCopied] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const canSpeak = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );

  useEffect(() => {
    if (!canSpeak) return;
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [canSpeak]);

  const detectPreferredLang = useCallback((value: string) => {
    const lower = value.toLowerCase();
    const krioHints = [
      "na",
      "leh",
      "wetin",
      "una",
      "dey",
      "nor",
      "sef",
      "sabi",
      "pikin",
      "tori",
      "waka",
      "boku",
      "small",
    ];
    const pidginHints = [
      "naija",
      "abeg",
      "abi",
      "dey",
      "wahala",
      "make we",
      "no wahala",
      "oga",
      "sha",
    ];
    const hits = krioHints.filter((h) => lower.includes(h)).length;
    const pidginHits = pidginHints.filter((h) => lower.includes(h)).length;
    if (hits >= 2 || pidginHits >= 2) return "en-GB";
    return "en-US";
  }, []);

  const cleanTextForSpeech = useCallback((value: string) => {
    return value
      .replace(/[\u{1F300}-\u{1F6FF}]/gu, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`{1,3}.*?`{1,3}/gs, "")
      .replace(/\n/g, ". ");
  }, []);

  const normalizeKrioForSpeech = useCallback((value: string) => {
    return value
      .replace(/\bdey\b/gi, "day")
      .replace(/\bnor\b/gi, "no")
      .replace(/\bwan\b/gi, "wahn")
      .replace(/\bmek\b/gi, "mehk")
      .replace(/\buna\b/gi, "oo-na")
      .replace(/\bwetin\b/gi, "weh-tin")
      .replace(/\bpikin\b/gi, "pee-kin");
  }, []);

  const pickVoice = useCallback(
    (lang: string) => {
      if (!voices.length) return undefined;
      const storedVoiceUri =
        typeof window !== "undefined"
          ? window.localStorage.getItem("slai_voice_uri")
          : null;
      if (storedVoiceUri) {
        const stored = voices.find((v) => v.voiceURI === storedVoiceUri);
        if (stored) return stored;
      }
      return (
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ||
        voices[0]
      );
    },
    [voices]
  );

  const stopSpeaking = useCallback(() => {
    if (!canSpeak) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [canSpeak]);

  const handleSpeak = useCallback(() => {
    if (!canSpeak || !text) return;

    const synthesis = window.speechSynthesis;
    if (isSpeaking) {
      stopSpeaking();
      return;
    }
    synthesis.cancel();

    let speechText = cleanTextForSpeech(text);
    const preferredLang = detectPreferredLang(text);
    if (preferredLang === "en-GB") {
      speechText = normalizeKrioForSpeech(speechText);
    }
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = preferredLang;
    const voice = pickVoice(preferredLang);
    if (voice) utterance.voice = voice;
    const storedRate =
      typeof window !== "undefined"
        ? Number(window.localStorage.getItem("slai_voice_rate"))
        : NaN;
    const storedPitch =
      typeof window !== "undefined"
        ? Number(window.localStorage.getItem("slai_voice_pitch"))
        : NaN;
    const defaultRate = preferredLang === "en-GB" ? 0.88 : 0.98;
    utterance.rate = Number.isFinite(storedRate) ? storedRate : defaultRate;
    utterance.pitch = Number.isFinite(storedPitch)
      ? storedPitch
      : preferredLang === "en-GB"
      ? 0.92
      : 1.0;
    utterance.volume = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;

    setIsSpeaking(true);
    synthesis.speak(utterance);
  }, [canSpeak, detectPreferredLang, isSpeaking, pickVoice, stopSpeaking, text]);

  if (!text) return null;

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-3",
        isAssistant ? "items-start" : "items-start flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5",
          isAssistant ? "bg-primary/15" : "bg-accent/15"
        )}
      >
        {isAssistant ? (
          <Bot className="w-4 h-4 text-primary" />
        ) : (
          <User className="w-4 h-4 text-accent" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%] sm:max-w-[75%] relative",
          isAssistant
            ? "bg-card border border-border text-foreground"
            : "bg-primary text-primary-foreground"
        )}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              code({ className, children }) {
                const isBlock = /language-/.test(className || "");
                if (isBlock) {
                  return (
                    <pre className="mt-2 overflow-x-auto rounded-md bg-secondary/80 p-3 text-xs">
                      <code className={className}>{children}</code>
                    </pre>
                  );
                }
                return (
                  <code className="rounded bg-secondary/70 px-1 py-0.5 text-xs">
                    {children}
                  </code>
                );
              },
              ul({ children }) {
                return <ul className="ml-4 list-disc space-y-1">{children}</ul>;
              },
              ol({ children }) {
                return (
                  <ol className="ml-4 list-decimal space-y-1">{children}</ol>
                );
              },
              h3({ children }) {
                return (
                  <h3 className="mt-3 text-sm font-semibold text-foreground">
                    {children}
                  </h3>
                );
              },
              p({ children }) {
                return <p className="leading-relaxed">{children}</p>;
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
        {isAssistant && canSpeak && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
                "border border-border/60 bg-background/60 hover:bg-background/80 transition-colors",
                isSpeaking ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
            >
              {isSpeaking ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  Stop
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  Speak
                </>
              )}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!text) return;
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                } catch {
                  setCopied(false);
                }
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border border-border/60 bg-background/60 hover:bg-background/80 transition-colors text-muted-foreground"
              aria-label="Copy message"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied" : "Copy"}
            </button>
            {isLastAssistant && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border border-border/60 bg-background/60 hover:bg-background/80 transition-colors text-muted-foreground"
                aria-label="Regenerate response"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Regenerate
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(message.id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs border border-border/60 bg-background/60 hover:bg-background/80 transition-colors text-muted-foreground"
                aria-label="Delete message"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3 items-start">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-primary/15">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-card border border-border rounded-2xl px-4 py-3">
        <div className="flex gap-1.5 items-center h-5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
