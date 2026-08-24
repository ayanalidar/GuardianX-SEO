import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.CEREBRAS_API_KEY || "";
  
  try {
    // List models
    const res = await fetch("https://api.cerebras.ai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    const data = await res.json();
    
    return NextResponse.json({
      status: res.status,
      models: data,
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "unknown" });
  }
}
