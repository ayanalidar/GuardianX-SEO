import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/ab-test — returns A/B test data for top keywords (variant A vs B).
// POST — creates a new test.

type AbTest = {
  id: string;
  keyword: string;
  variantA: { title: string; ctr: number; impressions: number; clicks: number; position: number };
  variantB: { title: string; ctr: number; impressions: number; clicks: number; position: number };
  winner: "A" | "B" | "tie";
  improvement: number; // % lift of winner over loser
  status: "running" | "completed" | "draft";
  createdAt: string;
  daysRun: number;
};

// In-memory store (per server process). Replace with a real table when persistent tests are needed.
const testStore = new Map<string, AbTest[]>();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({
    where: { token },
    include: { company: true },
  });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const companyId = client.companyId;
  const keywords = await db.keyword.findMany({
    where: { companyId },
    orderBy: { position: "asc" },
    take: 10,
  });

  // Seed synthetic A/B tests from the top keywords if none exist
  const existing = testStore.get(token) ?? [];
  if (existing.length === 0 && keywords.length > 0) {
    const seeded: AbTest[] = keywords.slice(0, 5).map((k, i) => {
      const baseTitleA = `${k.keyword} — Complete Guide`;
      const baseTitleB = `${k.keyword}: The Definitive ${k.searchVolume > 2000 ? "2025" : "Pro"} Guide`;
      const ctrA = Math.max(0.8, Math.min(8.5, 6 - k.position * 0.2));
      const ctrB = Math.max(0.9, Math.min(9.5, ctrA * (1 + (0.05 + (i % 3) * 0.04))));
      const impressions = k.searchVolume;
      const clicksA = Math.round((impressions * ctrA) / 100);
      const clicksB = Math.round((impressions * ctrB) / 100);
      const winner: "A" | "B" | "tie" = ctrB > ctrA * 1.03 ? "B" : ctrA > ctrB * 1.03 ? "A" : "tie";
      const improvement = winner === "B"
        ? Math.round(((ctrB - ctrA) / ctrA) * 1000) / 10
        : winner === "A"
          ? Math.round(((ctrA - ctrB) / ctrB) * 1000) / 10
          : 0;
      return {
        id: `seed-${i + 1}-${k.id}`,
        keyword: k.keyword,
        variantA: { title: baseTitleA, ctr: Math.round(ctrA * 100) / 100, impressions, clicks: clicksA, position: k.position },
        variantB: { title: baseTitleB, ctr: Math.round(ctrB * 100) / 100, impressions, clicks: clicksB, position: Math.max(1, k.position - 1) },
        winner,
        improvement,
        status: i < 3 ? "running" : i < 5 ? "completed" : "draft",
        createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
        daysRun: i + 1,
      };
    });
    testStore.set(token, seeded);
  }

  const tests = testStore.get(token) ?? [];

  const summary = {
    total: tests.length,
    running: tests.filter((t) => t.status === "running").length,
    completed: tests.filter((t) => t.status === "completed").length,
    draft: tests.filter((t) => t.status === "draft").length,
    avgImprovement: tests.length > 0
      ? Math.round((tests.reduce((s, t) => s + t.improvement, 0) / tests.length) * 10) / 10
      : 0,
    winnersB: tests.filter((t) => t.winner === "B").length,
    winnersA: tests.filter((t) => t.winner === "A").length,
  };

  return NextResponse.json({ tests, summary });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({ where: { token } });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const body = await req.json();
  const { keyword, variantA, variantB } = body;
  if (!keyword || !variantA?.title || !variantB?.title) {
    return NextResponse.json(
      { error: "keyword, variantA.title, variantB.title required" },
      { status: 400 }
    );
  }

  const existing = testStore.get(token) ?? [];
  const test: AbTest = {
    id: `test-${Date.now()}`,
    keyword,
    variantA: {
      title: variantA.title,
      ctr: Number(variantA.ctr ?? 0),
      impressions: Number(variantA.impressions ?? 0),
      clicks: Number(variantA.clicks ?? 0),
      position: Number(variantA.position ?? 0),
    },
    variantB: {
      title: variantB.title,
      ctr: Number(variantB.ctr ?? 0),
      impressions: Number(variantB.impressions ?? 0),
      clicks: Number(variantB.clicks ?? 0),
      position: Number(variantB.position ?? 0),
    },
    winner: "tie",
    improvement: 0,
    status: "running",
    createdAt: new Date().toISOString(),
    daysRun: 0,
  };
  existing.push(test);
  testStore.set(token, existing);

  return NextResponse.json({ test, created: true });
}
