"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatHeader } from "@/components/chat-header";
import { WelcomeScreen } from "@/components/welcome-screen";
import { ChatMessage, TypingIndicator } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";

const HISTORY_KEY = "slai_chat_history";
const TONE_KEY = "slai_tone";

export function ChatContainer() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("professional");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, stop, setMessages, error, regenerate } =
    useChat({
      api: "/api/chat",
      body: { tone },
    onError: (err) => {
      console.log("[v0] Chat error:", err.message);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  const getErrorMessage = (value: unknown): string => {
    if (!value) return "Something went wrong.";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const maybeError = value as { message?: string; error?: { message?: string } };
      return maybeError.error?.message || maybeError.message || "Something went wrong.";
    }
    return "Something went wrong.";
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    try {
      const storedTone = window.localStorage.getItem(TONE_KEY);
      if (storedTone) setTone(storedTone);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(TONE_KEY, tone);
    } catch {
      // ignore
    }
  }, [tone]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      if (stored && messages.length === 0) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, [messages.length, setMessages]);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        window.localStorage.setItem(HISTORY_KEY, JSON.stringify(messages));
      }
    } catch {
      // ignore
    }
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSuggestionClick = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
    try {
      window.localStorage.removeItem(HISTORY_KEY);
    } catch {
      // ignore
    }
  };

  const handleAttach = async (file: File) => {
    if (!file) return;
    const text = await file.text();
    const maxChars = 6000;
    const clipped =
      text.length > maxChars ? text.slice(0, maxChars) + "\n...[truncated]" : text;
    sendMessage({
      text: `Attached file: ${file.name}\n\n${clipped}`,
    });
  };

  const handleDeleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const lastAssistantId = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return last?.id;
  }, [messages]);

  const quickPrompts = [
    "Explain this in simple steps",
    "Answer in Krio",
    "Answer in Nigerian Pidgin",
    "Give me a short summary",
  ];

  return (
    <div className="flex flex-col h-dvh max-h-dvh bg-background">
      <ChatHeader onNewChat={handleNewChat} tone={tone} onToneChange={setTone} />

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="max-w-3xl mx-auto py-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onDelete={handleDeleteMessage}
                onRegenerate={regenerate}
                isLastAssistant={message.id === lastAssistantId}
              />
            ))}
            {(status === "submitted" || status === "streaming") && (
              <TypingIndicator />
            )}
            {error && (
              <div className="mx-4 mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {getErrorMessage(error)}
              </div>
            )}
          </div>
        )}
      </div>

      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
        quickPrompts={quickPrompts}
        onQuickPrompt={(prompt) => sendMessage({ text: prompt })}
        onAttach={handleAttach}
      />
    </div>
  );
}
