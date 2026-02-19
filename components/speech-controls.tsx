"use client";

import { useEffect, useMemo, useState } from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const VOICE_KEY = "slai_voice_uri";
const RATE_KEY = "slai_voice_rate";

export function SpeechControls() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [rate, setRate] = useState<number>(0.95);

  const canSpeak = useMemo(
    () => typeof window !== "undefined" && "speechSynthesis" in window,
    []
  );

  useEffect(() => {
    if (!canSpeak) return;
    const savedVoice = window.localStorage.getItem(VOICE_KEY);
    const savedRate = window.localStorage.getItem(RATE_KEY);
    if (savedVoice) setSelectedVoice(savedVoice);
    if (savedRate && !Number.isNaN(Number(savedRate))) {
      setRate(Number(savedRate));
    }

    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [canSpeak]);

  useEffect(() => {
    if (!canSpeak) return;
    window.localStorage.setItem(VOICE_KEY, selectedVoice);
  }, [canSpeak, selectedVoice]);

  useEffect(() => {
    if (!canSpeak) return;
    window.localStorage.setItem(RATE_KEY, rate.toString());
  }, [canSpeak, rate]);

  if (!canSpeak) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
        <Volume2 className="h-3.5 w-3.5" />
        Voice
      </div>
      <select
        value={selectedVoice}
        onChange={(e) => setSelectedVoice(e.target.value)}
        className={cn(
          "h-8 rounded-md border border-border bg-secondary/60 px-2 text-xs",
          "text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
        )}
        aria-label="Select voice"
      >
        <option value="">Auto voice</option>
        {voices.map((voice) => (
          <option key={voice.voiceURI} value={voice.voiceURI}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
      <input
        type="range"
        min={0.8}
        max={1.2}
        step={0.05}
        value={rate}
        onChange={(e) => setRate(Number(e.target.value))}
        className="w-20 accent-primary"
        aria-label="Speech rate"
        title={`Speech rate: ${rate.toFixed(2)}`}
      />
    </div>
  );
}
