// Unified LLM wrapper — multi-provider with automatic fallback
// Supports: Cerebras (fastest), OpenRouter (free models), z-ai SDK (sandbox)
// All providers use OpenAI-compatible API format

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

// Provider configs
const CEREBRAS_KEY = process.env.CEREBRAS_API_KEY || process.env.GROQ_API_KEY || "";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "gpt-oss-120b";

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  timeoutMs: number = 55000
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(url.includes("openrouter") ? { "HTTP-Referer": "https://guardianx-seo.com", "X-Title": "GuardianX-SEO" } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 8000,
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error(`[LLM] API error from ${url}:`, res.status, errText.slice(0, 200));
    throw new Error(`API returned ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Create a chat completion using multiple providers with fallback
 * Order: Cerebras → OpenRouter → z-ai SDK (sandbox)
 */
export async function createChatCompletion(
  messages: ChatMessage[],
  options?: { thinking?: "enabled" | "disabled" }
): Promise<ChatCompletion> {
  // 1. Try Cerebras (super fast, Llama 3.3 70B)
  if (CEREBRAS_KEY) {
    try {
      const content = await callOpenAICompatible(CEREBRAS_URL, CEREBRAS_KEY, CEREBRAS_MODEL, messages);
      return { choices: [{ message: { content } }] };
    } catch (err) {
      console.error("[LLM] Cerebras failed:", err instanceof Error ? err.message : "unknown");
    }
  }

  // 2. Try OpenRouter (free models, works from any IP)
  if (OPENROUTER_KEY) {
    try {
      const content = await callOpenAICompatible(OPENROUTER_URL, OPENROUTER_KEY, OPENROUTER_MODEL, messages);
      return { choices: [{ message: { content } }] };
    } catch (err) {
      console.error("[LLM] OpenRouter failed:", err instanceof Error ? err.message : "unknown");
    }
  }

  // 3. Fallback: z-ai SDK (works in Z.ai sandbox only)
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: options?.thinking === "enabled" ? "enabled" : "disabled" },
  });

  return {
    choices: [{ message: { content: completion.choices[0]?.message?.content ?? "" } }],
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

  try {
    const match = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : raw);
  } catch {
    throw new Error(`LLM did not return valid JSON: ${raw.slice(0, 200)}`);
  }
}
