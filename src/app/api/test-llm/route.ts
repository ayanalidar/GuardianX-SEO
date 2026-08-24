import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/seo/llm";

export async function GET() {
  try {
    const completion = await createChatCompletion([
      { role: "user", content: "Say hello in exactly 5 words." },
    ]);
    const response = completion.choices[0]?.message?.content ?? "";
    return NextResponse.json({ success: true, response: response.slice(0, 200) });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "unknown",
      geminiKey: (process.env.GEMINI_API_KEY || "").slice(0, 15),
      geminiModel: process.env.GEMINI_MODEL || "default",
      cerebrasKey: (process.env.CEREBRAS_API_KEY || "").slice(0, 15),
    });
  }
}
