import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY || "";
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";
  
  // Test Gemini directly
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Say hello in 5 words" }] }],
          generationConfig: { maxOutputTokens: 50 },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );
    
    const status = res.status;
    const text = await res.text();
    
    return NextResponse.json({
      geminiKey: key.slice(0, 20),
      model,
      status,
      response: text.slice(0, 500),
      success: status === 200,
    });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "unknown",
      geminiKey: key.slice(0, 20),
      model,
    });
  }
}
