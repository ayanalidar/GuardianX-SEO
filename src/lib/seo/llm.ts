// Unified LLM wrapper — uses Grok (xAI) API in production, z-ai SDK in sandbox
// Grok API is OpenAI-compatible: https://api.x.ai/v1/chat/completions

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

const GROK_API_KEY = process.env.GROK_API_KEY || process.env.XAI_API_KEY || "";
const GROK_MODEL = process.env.GROK_MODEL || "grok-2-latest";
const GROK_BASE_URL = "https://api.x.ai/v1/chat/completions";

/**
 * Create a chat completion using Grok API (production) or z-ai SDK (sandbox fallback)
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options?: { thinking?: "enabled" | "disabled" }
): Promise<ChatCompletion> {
  // Try Grok first (works on Render/Vercel/any host)
  if (GROK_API_KEY) {
    try {
      const res = await fetch(GROK_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
        signal: AbortSignal.timeout(55000), // 55s timeout
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[LLM] Grok API error:", res.status, errText.slice(0, 200));
        throw new Error(`Grok API returned ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";

      return {
        choices: [{ message: { content } }],
      };
    } catch (err) {
      console.error("[LLM] Grok failed, falling back to z-ai:", err instanceof Error ? err.message : "unknown");
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
