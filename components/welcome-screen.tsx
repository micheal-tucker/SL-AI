"use client";

import { Bot, BookOpen, Code2, Briefcase, Lightbulb } from "lucide-react";

const suggestions = [
  {
    icon: BookOpen,
    label: "Education",
    prompt: "Explain the water cycle in simple terms for a student",
  },
  {
    icon: Code2,
    label: "Programming",
    prompt: "How do I start learning Python from scratch?",
  },
  {
    icon: Briefcase,
    label: "Business",
    prompt: "Give me tips for starting a small business in Sierra Leone",
  },
  {
    icon: Lightbulb,
    label: "General",
    prompt: "Wetin na di capital of Sierra Leone an wetin mek am important?",
  },
];

export function WelcomeScreen({
  onSuggestionClick,
}: {
  onSuggestionClick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12">
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 mb-6">
        <Bot className="w-9 h-9 text-primary" />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground text-center text-balance mb-2 tracking-tight">
        Welcome to SL-AI
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-10 leading-relaxed">
        Your intelligent assistant for education, technology, business, and
        more. Ask me anything in English, Krio, or Nigerian Pidgin.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {suggestions.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSuggestionClick(item.prompt)}
            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/60 transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary shrink-0 group-hover:bg-primary/15 transition-colors">
              <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-primary mb-0.5">
                {item.label}
              </span>
              <span className="block text-xs text-muted-foreground leading-relaxed">
                {item.prompt}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
