import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/integration — returns embed tracking script + instructions
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const client = await db.client.findUnique({
    where: { token },
    include: { company: { include: { domain: true } } },
  });
  if (!client) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const website = client.company.website || "";
  const trackerUrl = `${website.replace(/\/$/, "")}/api/track`;

  // Tracking script that posts to /api/track on every page view.
  const embedScript = `<!-- GuardianX SEO Tracker -->
<script>
(function(){
  var TOKEN = "${token}";
  var ENDPOINT = "/api/track";
  function send(payload){
    payload.token = TOKEN;
    payload.url = window.location.href;
    payload.referrer = document.referrer;
    payload.ts = Date.now();
    try {
      navigator.sendBeacon(ENDPOINT, JSON.stringify(payload));
    } catch(e){
      fetch(ENDPOINT, { method: "POST", body: JSON.stringify(payload), keepalive: true });
    }
  }
  function collectDevice(){
    var ua = navigator.userAgent;
    return /Mobi|Android|iPhone|iPod/i.test(ua) ? "mobile" : /iPad|Tablet/i.test(ua) ? "tablet" : "desktop";
  }
  var start = Date.now();
  send({ event: "pageview", device: collectDevice(), lang: navigator.language });
  window.addEventListener("beforeunload", function(){
    send({ event: "engagement", durationMs: Date.now() - start, scroll: (window.scrollY + window.innerHeight) / document.body.scrollHeight });
  });
  document.addEventListener("click", function(e){
    var t = e.target;
    if (t && t.tagName === "A" && t.href) send({ event: "click", href: t.href, anchor: t.textContent });
  }, { capture: true });
})();
</script>`;

  const instructions = [
    "Copy the embed script below.",
    "Paste it just before the closing </body> tag of every page you want to track.",
    "Make sure your site exposes /api/track as a POST endpoint that accepts the JSON payload and persists it.",
    "Verify the tracker is firing by visiting your site and checking the Analytics tab in this portal.",
    "If using a CMS (WordPress / Shopify / Webflow), inject the snippet via the header/footer code block.",
  ];

  const capabilities = [
    "Real-time pageview tracking",
    "Unique visitor deduplication",
    "Session duration measurement",
    "Scroll-depth and click tracking",
    "Device, language, and referrer detection",
    "Geo (country) breakdown",
    "Top pages report",
    "Daily / weekly / monthly aggregation",
    "Custom event capture",
  ];

  return NextResponse.json({
    embedScript,
    instructions,
    capabilities,
    trackerUrl,
    website,
    token,
  });
}
