import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    hasDb: !!process.env.DATABASE_URL,
    dbUrl: (process.env.DATABASE_URL || "").slice(0, 30),
    hasGemini: !!process.env.GEMINI_API_KEY,
  });
}
