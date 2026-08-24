import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    hasCerebras: !!process.env.CEREBRAS_API_KEY,
    hasGroq: !!process.env.GROQ_API_KEY,
    cerebrasKey: (process.env.CEREBRAS_API_KEY || "").slice(0, 10),
    model: process.env.CEREBRAS_MODEL || "llama-3.3-70b",
  });
}
