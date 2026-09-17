import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

/**
 * Which model /ask runs on, decided by whichever key is present.
 *
 * Free keys come first so dropping one into .env.local just works:
 *   GOOGLE_GENERATIVE_AI_API_KEY → Gemini. Free tier, reads handwriting well,
 *                                  does tool calling. The default.
 *   GROQ_API_KEY                 → Llama on Groq. Free and very fast, but
 *                                  weaker at photos of a whiteboard.
 *   ANTHROPIC_API_KEY            → Claude. Best quality, costs money per message.
 *
 * Override the model itself with GOOGLE_MODEL / GROQ_MODEL / ANTHROPIC_MODEL.
 */
export function resolveModel(): { model: LanguageModel; label: string; vision: boolean } | null {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const id = process.env.GOOGLE_MODEL || "gemini-3-flash-preview";
    return { model: google(id), label: `google/${id}`, vision: true };
  }
  if (process.env.GROQ_API_KEY) {
    const id = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    // the default Llama text model has no vision; board photos won't be read
    return { model: groq(id), label: `groq/${id}`, vision: Boolean(process.env.GROQ_VISION) };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const id = process.env.ANTHROPIC_MODEL || "claude-opus-5";
    return { model: anthropic(id), label: `anthropic/${id}`, vision: true };
  }
  return null;
}

export function hasModelCredential(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.ANTHROPIC_API_KEY,
  );
}
