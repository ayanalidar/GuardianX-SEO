import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.CEREBRAS_API_KEY || "";
  const model = process.env.CEREBRAS_MODEL || "gpt-oss-120b";
  
  // Direct Cerebras test
  try {
    const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: "Say hello" }],
        max_tokens: 20,
      }),
      signal: AbortSignal.timeout(15000),
    });
    
    const status = res.status;
    const text = await res.text();
    
    return NextResponse.json({
      key: key.slice(0, 15),
      model,
      status,
      response: text.slice(0, 500),
      success: status === 200,
    });
  } catch (err) {
    return NextResponse.json({
      key: key.slice(0, 15),
      model,
      error: err instanceof Error ? err.message : "unknown",
      errorName: err instanceof Error ? err.name : "unknown",
    });
  }
}
