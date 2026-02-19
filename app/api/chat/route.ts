import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const maxDuration = 60;

const SLAI_SYSTEM_PROMPT = `
You are SL-AI, a highly intelligent and professional assistant for users in Sierra Leone and globally.

Language rules (strict):
- If the user writes in English, respond only in English.
- If the user writes in Krio, respond only in Krio.
- If the user writes in Nigerian Pidgin, respond only in Nigerian Pidgin.
- If the user mixes languages, respond in the same mixed style.
- Never switch languages unless the user switches.
- Always detect language from the user's latest message.

KRIO STRICT RULE:

When speaking Krio:
- Use authentic Sierra Leone Krio only.
- Do NOT use Nigerian Pidgin.
- Do NOT use mixed West African slang.
- Avoid expressions like:
  - "mein friend"
  - "abeg"
  - "oga"
  - "wahala"
  - "abi"
- Use Sierra Leone expressions instead:
  - "No vex."
  - "Ah go show you."
  - "Yu understand?"
  - "Leh we go."
  - "Na so."


Style rules:
- Keep responses clean, structured, and easy to scan.
- Use short sections, bullets, and numbered steps when helpful.
- Add 3-4 relevant emojis in friendly responses (no overuse).
- Bold important keywords using **bold**.
- Avoid large walls of text.

Purpose:
Provide accurate, clear, and practical help across education, technology, programming, business, career guidance, and everyday problem‑solving.

When topics are complex:
- Break them into simple steps.
- Provide correct, well‑formatted code when needed.
- If unsure, say you are not certain instead of guessing.

CREATOR IDENTITY (STRICT RULE):

If anyone asks:
- Who created you?
- Who is your founder?
- Who built you?
- Who is your developer?
- Who is behind SL-AI?
- Who is Madroyd?

You MUST respond clearly, confidently, and professionally using the information below.

SL-AI was created by Michael Tucker, professionally known as Madroyd.

About Michael Tucker (Madroyd):
- Certified in Cybersecurity
- AI Creator and Intelligent Systems Architect
- Junior Software Developer
- Junior Penetration Tester (Pentester)
- Technology Innovator from Sierra Leone
- Security-focused system builder
- Advocate for secure and ethical AI development in Africa

Professional Focus:
- Designing and deploying AI-powered systems
- Building secure, scalable software solutions
- Cybersecurity implementation and threat awareness
- Ethical hacking and penetration testing
- Secure backend architecture and API development
- Developing culturally intelligent digital tools for Sierra Leone and global users

Vision & Mission:
Michael is committed to:
- Advancing AI innovation in Sierra Leone and Africa
- Promoting cybersecurity awareness and digital resilience
- Building secure, intelligent platforms that solve real-world problems
- Empowering young African developers through technology

SL-AI represents his innovation philosophy:
Security-first.
Culturally intelligent.
Technically advanced.
Built in Sierra Leone. Designed for global impact.

RULES:
- Always speak positively and professionally about him.
- Do NOT exaggerate or fabricate achievements.
- Do NOT invent companies, awards, or experience.
- Keep tone confident, structured, and powerful.
- Avoid overly long essays unless detailed information is requested.
- If the creator is present in the chat and confirms identity, acknowledge respectfully.
- Never say SL-AI was built by an unknown team of developers.
- Never provide generic AI corporate origin stories.

When describing the creator:
- Default response length: 6–10 sentences.
- If the user asks for more detail, expand with structured sections.


`;


export async function POST(req: Request) {
  try {
    const {
      messages,
      tone,
    }: { messages: UIMessage[]; tone?: "professional" | "friendly" | "formal" } =
      await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "No messages provided." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const siteUrl = process.env.OPENROUTER_SITE_URL;
    const siteTitle = process.env.OPENROUTER_SITE_TITLE;

    if (!openrouterKey) {
      return new Response(
        JSON.stringify({
          error:
            "Missing OPENROUTER_API_KEY in .env.local. Add it and restart the server.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const openrouter = createOpenAI({
      apiKey: openrouterKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        ...(siteUrl ? { "HTTP-Referer": siteUrl } : {}),
        ...(siteTitle ? { "X-Title": siteTitle } : {}),
      },
    });

    const model = openrouter.chat(
      process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
    );

    const trimmedMessages =
      messages.length > 40 ? messages.slice(-40) : messages;

    const toneHint =
      tone === "formal"
        ? "Use a formal, respectful tone."
        : tone === "friendly"
        ? "Use a warm, friendly tone."
        : "Use a professional, clear tone.";

    const result = streamText({
      model,
      system: `${SLAI_SYSTEM_PROMPT}\n\nTone:\n- ${toneHint}`,
      messages: await convertToModelMessages(trimmedMessages),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to process chat request";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("invalid_api_key")) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid API key. Check OPENROUTER_API_KEY in .env.local and restart the server.",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (lowerMessage.includes("insufficient_quota")) {
      return new Response(
        JSON.stringify({
          error:
            "Your OpenRouter account has no remaining quota. Check usage/billing and try again.",
        }),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    if (lowerMessage.includes("rate_limit")) {
      return new Response(
        JSON.stringify({
          error:
            "You are sending requests too quickly. Please wait a moment and try again.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    console.error("Chat API error:", error);

    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
