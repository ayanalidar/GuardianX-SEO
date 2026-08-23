import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/roi — calculates ROI from traffic + conversion rate + AOV.
// Query: ?cr=2.5&aov=85&spend=0
export async function GET(
  req: NextRequest,
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

  const sp = req.nextUrl.searchParams;
  const cr = Number(sp.get("cr") ?? "2.5") || 2.5;            // conversion rate %
  const aov = Number(sp.get("aov") ?? "85") || 85;            // average order value $
  const spend = Number(sp.get("spend") ?? "0") || 0;          // monthly SEO spend $

  const companyId = client.companyId;
  const [latest, first] = await Promise.all([
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "desc" } }),
    db.seoMetric.findFirst({ where: { companyId }, orderBy: { date: "asc" } }),
  ]);

  const traffic = latest?.organicTraffic ?? 0;
  const prevTraffic = first?.organicTraffic ?? traffic;

  // Monthly conversions + revenue from organic traffic
  const monthlyConversions = Math.round((traffic * cr) / 100);
  const monthlyRevenue = Math.round(monthlyConversions * aov);

  // Delta vs first snapshot (organic-revenue growth)
  const prevConversions = Math.round((prevTraffic * cr) / 100);
  const prevRevenue = Math.round(prevConversions * aov);
  const revenueDelta = monthlyRevenue - prevRevenue;

  // 90-day projection (compounded 3% MoM growth)
  const projected90Revenue = Math.round(
    monthlyRevenue * 3 + (monthlyRevenue * 0.03 * 3)
  );

  // Ad cost equivalent — what would this traffic cost on Google Ads (CPC ~ $1.50)
  const avgCpc = 1.5;
  const adCostEquivalent = Math.round(traffic * avgCpc);

  // ROI = (revenue - spend) / spend * 100; if spend = 0, use ad-cost-equivalent as basis
  const basis = spend > 0 ? spend : adCostEquivalent;
  const roi = basis > 0 ? Math.round(((monthlyRevenue - basis) / basis) * 1000) / 10 : 0;

  // Value per visitor
  const valuePerVisitor = traffic > 0 ? Math.round((monthlyRevenue / traffic) * 100) / 100 : 0;

  return NextResponse.json({
    traffic,
    conversionRate: cr,
    aov,
    spend,
    monthlyConversions,
    monthlyRevenue,
    revenueDelta,
    projected90Revenue,
    adCostEquivalent,
    roi,
    valuePerVisitor,
    avgCpc,
    prevTraffic,
    prevRevenue,
    currency: "USD",
    note: spend > 0
      ? "ROI computed against input monthly spend."
      : "No spend provided — ROI computed against equivalent Google Ads CPC cost.",
  });
}
