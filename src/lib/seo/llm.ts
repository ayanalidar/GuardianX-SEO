// Unified LLM wrapper — uses Groq API in production, z-ai SDK in sandbox fallback
// Groq is OpenAI-compatible: https://api.groq.com/openai/v1/chat/completions

import ZAI from "z-ai-web-dev-sdk";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatCompletion = {
  choices: Array<{
    message: { content: string };
  }>;
};

const GROQ_API_KEY = process.env.GROQ_API_KEY || process.env.GROG_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Create a chat completion using Groq API (production) or z-ai SDK (sandbox fallback)
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options?: { thinking?: "enabled" | "disabled" }
): Promise<ChatCompletion> {
  // Try Groq first (works on Render/Vercel/any host)
  if (GROQ_API_KEY) {
    try {
      const res = await fetch(GROQ_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 8000,
        }),
        signal: AbortSignal.timeout(55000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[LLM] Groq API error:", res.status, errText.slice(0, 200));
        throw new Error(`Groq API returned ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      return {
        choices: [{ message: { content } }],
      };
    } catch (err) {
      console.error("[LLM] Groq failed, falling back to z-ai:", err instanceof Error ? err.message : "unknown");
      // Fall through to z-ai
    }
  }

  // Fallback: z-ai SDK (works in Z.ai sandbox only)
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: options?.thinking === "enabled" ? "enabled" : "disabled" },
  });

  return {
    choices: [
      {
        message: {
          content: completion.choices[0]?.message?.content ?? "",
        },
      },
    ],
  };
}

/**
 * Helper: generate JSON from a prompt using the LLM
 */
export async function generateJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<T> {
  const completion = await createChatCompletion([
    { role: "assistant", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  const raw = completion.choices[0]?.message?.content ?? "";

  // Try to extract JSON from the response
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : raw);
  } catch {
    throw new Error(`LLM did not return valid JSON: ${raw.slice(0, 200)}`);
  }
}
