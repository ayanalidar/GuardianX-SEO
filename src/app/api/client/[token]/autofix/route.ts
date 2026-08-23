import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/autofix — generates ready-to-paste SEO code snippets
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

  const company = client.company;
  const website = (company.website || "").replace(/\/$/, "");
  const hostname = (() => {
    try { return new URL(website).hostname; } catch { return website; }
  })();
  const name = company.name;
  const description = company.description || company.industry;
  const logo = `${website}/logo.png`;

  const snippets = [
    {
      id: "jsonld-organization",
      type: "jsonld",
      title: "Organization Schema (JSON-LD)",
      description: "Tells Google who you are — boosts brand entity recognition and knowledge panel eligibility.",
      severity: "high",
      language: "html",
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${name}",
  "url": "${website}",
  "logo": "${logo}",
  "description": "${description}",
  "sameAs": [
    "https://twitter.com/${name.replace(/\s+/g, "").toLowerCase()}",
    "https://www.linkedin.com/company/${name.replace(/\s+/g, "-").toLowerCase()}",
    "https://www.facebook.com/${name.replace(/\s+/g, "").toLowerCase()}"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "${website}/contact"
  }
}
</script>`,
      instructions: [
        "Paste inside the <head> of your homepage or site-wide header template.",
        "Replace social URLs with your actual profiles.",
        "Validate at https://validator.schema.org/.",
      ],
    },
    {
      id: "jsonld-website",
      type: "jsonld",
      title: "WebSite Schema + Sitelinks Search Box",
      description: "Enables Google sitelinks search box and confirms your canonical site identity.",
      severity: "medium",
      language: "html",
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "${name}",
  "url": "${website}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "${website}/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>`,
      instructions: [
        "Add to the homepage <head>.",
        "Update the search URL pattern to match your internal search.",
      ],
    },
    {
      id: "jsonld-breadcrumb",
      type: "jsonld",
      title: "BreadcrumbList Schema",
      description: "Renders breadcrumb trails in SERPs — improves CTR and crawl efficiency.",
      severity: "medium",
      language: "html",
      code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "${website}" },
    { "@type": "ListItem", "position": 2, "name": "Category", "item": "${website}/category" },
    { "@type": "ListItem", "position": 3, "name": "Current Page", "item": "${website}/category/current" }
  ]
}
</script>`,
      instructions: [
        "Add to every non-homepage template.",
        "Dynamically replace position 2 & 3 with the actual breadcrumb trail.",
      ],
    },
    {
      id: "optimized-title-meta",
      type: "meta",
      title: "Optimized Title & Meta Description",
      description: "CTR-optimized tags with proper length, keyword placement, and brand suffix.",
      severity: "high",
      language: "html",
      code: `<title>${company.industry} Solutions | ${name}</title>
<meta name="description" content="${description.slice(0, 152)}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="author" content="${name}">`,
      instructions: [
        "Place inside <head>.",
        "Keep title under 60 characters, description under 155 characters.",
        "Front-load the primary keyword.",
      ],
    },
    {
      id: "open-graph",
      type: "meta",
      title: "Open Graph + Twitter Card Tags",
      description: "Controls how your pages render when shared on Facebook, LinkedIn, Twitter, Slack.",
      severity: "medium",
      language: "html",
      code: `<meta property="og:type" content="website">
<meta property="og:site_name" content="${name}">
<meta property="og:title" content="${company.industry} Solutions | ${name}">
<meta property="og:description" content="${description.slice(0, 152)}">
<meta property="og:url" content="${website}">
<meta property="og:image" content="${website}/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${company.industry} Solutions | ${name}">
<meta name="twitter:description" content="${description.slice(0, 152)}">
<meta name="twitter:image" content="${website}/og-image.png">`,
      instructions: [
        "Add to <head> on every shareable page.",
        "Create a 1200×630 OG image and upload to /og-image.png.",
      ],
    },
    {
      id: "robots-txt",
      type: "config",
      title: "robots.txt",
      description: "Directs crawlers to your sitemap and prevents indexing of admin/search URLs.",
      severity: "medium",
      language: "text",
      code: `User-agent: *
Allow: /
Disallow: /admin
Disallow: /search
Disallow: /*?q=
Disallow: /cart
Disallow: /checkout

Sitemap: ${website}/sitemap.xml`,
      instructions: [
        "Save as /robots.txt in your web root.",
        "Generate a sitemap.xml at the URL referenced above.",
      ],
    },
    {
      id: "viewport-canonical",
      type: "meta",
      title: "Viewport + Canonical Link",
      description: "Mobile-first viewport + canonical URL prevent duplicate content and mobile indexing issues.",
      severity: "high",
      language: "html",
      code: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="canonical" href="${website}${"/current-page"}">
<link rel="alternate" hreflang="en" href="${website}/current-page">
<link rel="alternate" hreflang="x-default" href="${website}/current-page">`,
      instructions: [
        "Add viewport meta to every page (must be first in <head> before any CSS).",
        "Replace /current-page with the actual canonical URL of each page.",
        "Add hreflang variants for international sites.",
      ],
    },
  ];

  return NextResponse.json({ snippets, website: hostname, generatedFor: name });
}
