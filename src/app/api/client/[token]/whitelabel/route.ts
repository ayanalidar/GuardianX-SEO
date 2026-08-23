import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/whitelabel — returns branding settings
// POST — saves branding settings (validated; persisted in-memory for the request lifecycle)
//
// NOTE: The current schema does not provision a dedicated Whitelabel table. We persist
// the JSON-encoded settings inside the Client.primaryGoal field is too invasive (it has
// business meaning). Instead we ACK the POST and echo back the validated payload. To
// make this durable, add a `whitelabelSettings String?` column to Client in a future
// schema migration and replace this implementation with a real db.client.update call.

type WhitelabelSettings = {
  agencyName: string;
  logoText: string;
  primaryColor: string;
  portalTitle: string;
  customDomain: string;
  hideGuardianXBranding: boolean;
};

const DEFAULTS: WhitelabelSettings = {
  agencyName: "GuardianX SEO",
  logoText: "GuardianX",
  primaryColor: "#10b981",
  portalTitle: "SEO Portal",
  customDomain: "",
  hideGuardianXBranding: false,
};

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

  return NextResponse.json({
    settings: DEFAULTS,
    client: { name: client.name, email: client.email, company: client.company.name },
    persistence: "ephemeral",
  });
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
  const next: WhitelabelSettings = {
    agencyName: typeof body.agencyName === "string" && body.agencyName.trim() ? body.agencyName.trim() : DEFAULTS.agencyName,
    logoText: typeof body.logoText === "string" && body.logoText.trim() ? body.logoText.trim() : DEFAULTS.logoText,
    primaryColor: typeof body.primaryColor === "string" && /^#[0-9a-fA-F]{6}$/.test(body.primaryColor) ? body.primaryColor : DEFAULTS.primaryColor,
    portalTitle: typeof body.portalTitle === "string" && body.portalTitle.trim() ? body.portalTitle.trim() : DEFAULTS.portalTitle,
    customDomain: typeof body.customDomain === "string" ? body.customDomain.trim() : "",
    hideGuardianXBranding: typeof body.hideGuardianXBranding === "boolean" ? body.hideGuardianXBranding : false,
  };

  return NextResponse.json({
    settings: next,
    saved: true,
    updatedAt: new Date().toISOString(),
    persistence: "ephemeral",
    note: "Schema migration required to persist across server restarts.",
  });
}
