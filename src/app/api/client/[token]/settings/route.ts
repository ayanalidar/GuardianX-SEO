import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/settings — returns integration cards
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

  const integrations = [
    {
      id: "gsc",
      name: "Google Search Console",
      description: "Verify site ownership, submit sitemaps, see real search queries, impressions, CTR, and indexation status.",
      status: "available",
      benefits: [
        "Real query + click data straight from Google",
        "Index coverage + URL inspection",
        "Submit / resubmit sitemaps",
        "Core Web Vitals by URL",
      ],
      connectUrl: "https://search.google.com/search-console",
      docs: "https://developers.google.com/webmaster-tools/v1/sites",
      icon: "search",
      category: "search",
    },
    {
      id: "ga4",
      name: "Google Analytics 4",
      description: "Stream real traffic, engagement, and conversion events into your GuardianX portal.",
      status: "available",
      benefits: [
        "Real session + engagement metrics",
        "Conversion funnels",
        "Audience + retention reports",
        "Server-side GA4 measurement protocol",
      ],
      connectUrl: "https://analytics.google.com",
      docs: "https://developers.google.com/analytics/devguides/reporting/data/v1",
      icon: "analytics",
      category: "analytics",
    },
    {
      id: "serp",
      name: "SERP Tracking API",
      description: "Pull daily rank positions, SERP features, and competitor movements from any SERP API provider (e.g. DataForSEO, SerpApi, AccuRanker).",
      status: "available",
      benefits: [
        "Daily rank tracking across geos / devices",
        "SERP feature capture (featured snippets, PAA, local packs)",
        "Competitor rank monitoring",
        "Historical rank volatility",
      ],
      connectUrl: "/portal/settings/serp",
      docs: "https://docs.dataforseo.com/v3/serp/",
      icon: "trophy",
      category: "tracking",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Alerts",
      description: "Get instant WhatsApp notifications for critical SEO alerts, rank changes, and weekly digest.",
      status: "available",
      benefits: [
        "Instant critical-issue alerts",
        "Weekly performance digest",
        "Competitor movement alerts",
        "Two-way chat with your account manager",
      ],
      connectUrl: "/portal/settings/whatsapp",
      docs: "https://developers.facebook.com/docs/whatsapp/cloud-api",
      icon: "message-circle",
      category: "notifications",
    },
    {
      id: "telegram",
      name: "Telegram Bot",
      description: "Pipe your GuardianX alerts, crawls, and AI insights to a Telegram channel or private chat.",
      status: "available",
      benefits: [
        "Channel broadcast for teams",
        "Real-time alert delivery",
        "Slash commands: /rank, /issues, /audit",
        "Markdown-formatted digests",
      ],
      connectUrl: "/portal/settings/telegram",
      docs: "https://core.telegram.org/bots/api",
      icon: "send",
      category: "notifications",
    },
  ];

  return NextResponse.json({
    integrations,
    portal: {
      token,
      clientName: client.name,
      companyName: client.company.name,
      website: client.company.website,
    },
  });
}
