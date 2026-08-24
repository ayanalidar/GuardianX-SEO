import { NextResponse } from "next/server";
import { createChatCompletion } from "@/lib/seo/llm";

export async function GET() {
  try {
    const completion = await createChatCompletion([
      { role: "user", content: "Say hello in exactly 5 words." },
    ]);
    return NextResponse.json({
      success: true,
      response: completion.choices[0]?.message?.content?.slice(0, 200),
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "unknown",
      cerebrasKey: (process.env.CEREBRAS_API_KEY || "").slice(0, 10),
      cerebrasModel: process.env.CEREBRAS_MODEL || "default",
    });
  }
}
