import { google, createGoogleGenerativeAI } from "@ai-sdk/google";
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
export interface Resolved {
  model: LanguageModel;
  label: string;
  vision: boolean;
  /** true when this is the student's own key rather than the shared one */
  own: boolean;
}

/**
 * A student's own Gemini key wins over the server's. Sixty people on one
 * free-tier key hit its per-minute limit on the first busy evening; each
 * person's own key is free and is theirs alone.
 */
export function resolveModel(ownKey?: string | null): Resolved | null {
  const key = ownKey?.trim();
  if (key) {
    const id = process.env.GOOGLE_MODEL || "gemini-3-flash-preview";
    const own = createGoogleGenerativeAI({ apiKey: key });
    return { model: own(id), label: `google/${id}`, vision: true, own: true };
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const id = process.env.GOOGLE_MODEL || "gemini-3-flash-preview";
    return { model: google(id), label: `google/${id}`, vision: true, own: false };
  }
  if (process.env.GROQ_API_KEY) {
    const id = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    // the default Llama text model has no vision; board photos won't be read
    return { model: groq(id), label: `groq/${id}`, vision: Boolean(process.env.GROQ_VISION), own: false };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const id = process.env.ANTHROPIC_MODEL || "claude-opus-5";
    return { model: anthropic(id), label: `anthropic/${id}`, vision: true, own: false };
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
