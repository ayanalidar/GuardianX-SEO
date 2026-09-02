import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/track — lightweight collector endpoint for the GuardianX tracking script
// Client websites POST visitor events here (pageview, click, scroll, conversion)
// Identified by the client token (from the embed script)
// CORS-enabled so any website can call it
export async function POST(req: NextRequest) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = await req.json();
    const { token, type, path, referrer, device, sessionId, duration, meta } = body;

    if (!token || !type || !path) {
      return NextResponse.json(
        { error: "Missing required fields: token, type, path" },
        { status: 400, headers }
      );
    }

    // Look up the client by token to get companyId
    const client = await db.client.findUnique({
      where: { token },
      select: { id: true, companyId: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid tracking token" },
        { status: 401, headers }
      );
    }

    // Derive country from headers (basic — Cloudflare/proxy headers)
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      req.headers.get("x-country") ||
      null;

    await db.siteEvent.create({
      data: {
        companyId: client.companyId,
        token,
        type,
        path: String(path).slice(0, 500),
        referrer: referrer ? String(referrer).slice(0, 500) : null,
        country,
        device: device || null,
        sessionId: sessionId ? String(sessionId).slice(0, 100) : null,
        duration: duration ? Number(duration) : null,
        meta: meta ? JSON.stringify(meta).slice(0, 2000) : null,
      },
    });

    return NextResponse.json(
      { success: true, tracked: true },
      { status: 200, headers }
    );
  } catch (err) {
    console.error("Track error:", err);
    return NextResponse.json(
      { error: "Tracking failed" },
      { status: 500, headers }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
