// Unified LLM wrapper — multi-provider with automatic fallback
// Supports: Cerebras, Google Gemini, OpenRouter, z-ai SDK (sandbox)

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

// Cerebras config
const CEREBRAS_KEY = process.env.CEREBRAS_API_KEY || "";
const CEREBRAS_URL = "https://api.cerebras.ai/v1/chat/completions";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "gpt-oss-120b";

// Gemini config
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// OpenRouter config (fallback)
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";

async function callOpenAICompatible(
  url: string, apiKey: string, model: string, messages: ChatMessage[], timeoutMs = 55000
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  if (url.includes("openrouter")) {
    headers["HTTP-Referer"] = "https://guardianx-seo.com";
    headers["X-Title"] = "GuardianX-SEO";
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 8000 }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${res.status}: ${errText.slice(0, 150)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(messages: ChatMessage[], timeoutMs = 55000): Promise<string> {
  // Convert OpenAI messages to Gemini format
  const systemMsg = messages.find(m => m.role === "system" || m.role === "assistant");
  const userMsgs = messages.filter(m => m.role === "user");

  const contents = userMsgs.map(m => ({
    role: "user",
    parts: [{ text: m.content }],
  }));

  const body: any = {
    contents,
    generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
  };
  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg.content }] };
  }

  const res = await fetch(`${GEMINI_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 150)}`);
  }
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("") ?? "";
  return text;
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options?: { thinking?: "enabled" | "disabled" }
): Promise<ChatCompletion> {
  // 1. Try Cerebras
  if (CEREBRAS_KEY) {
    try {
      const content = await callOpenAICompatible(CEREBRAS_URL, CEREBRAS_KEY, CEREBRAS_MODEL, messages);
      return { choices: [{ message: { content } }] };
    } catch (err) {
      console.error("[LLM] Cerebras failed:", err instanceof Error ? err.message : "unknown");
    }
  }

  // 2. Try Gemini (Google AI Studio)
  if (GEMINI_KEY) {
    try {
      const content = await callGemini(messages);
      return { choices: [{ message: { content } }] };
    } catch (err) {
      console.error("[LLM] Gemini failed:", err instanceof Error ? err.message : "unknown");
    }
  }

  // 3. Try OpenRouter (free models)
  if (OPENROUTER_KEY) {
    try {
      const content = await callOpenAICompatible(OPENROUTER_URL, OPENROUTER_KEY, OPENROUTER_MODEL, messages);
      return { choices: [{ message: { content } }] };
    } catch (err) {
      console.error("[LLM] OpenRouter failed:", err instanceof Error ? err.message : "unknown");
    }
  }

  // 4. Fallback: z-ai SDK (sandbox only)
  const zai = await ZAI.create();
  const completion = await zai.chat.completions.create({
    messages,
    thinking: { type: options?.thinking === "enabled" ? "enabled" : "disabled" },
  });
  return { choices: [{ message: { content: completion.choices[0]?.message?.content ?? "" } }] };
}

export async function generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
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
