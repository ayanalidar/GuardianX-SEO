import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/client/[token]/inject-schema — returns a single <script> tag that auto-injects
// JSON-LD schema markup into client sites. Detects page type (blog/product/FAQ) and injects
// appropriate schema.
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

  const website = client.company.website?.replace(/\/$/, "") || "";
  const name = client.company.name;
  const description = client.company.description || client.company.industry;

  // The injected script reads the page, detects type, and inserts the right JSON-LD.
  const script = `<!-- GuardianX Schema Auto-Injector -->
<script id="guardianx-schema-${token}" data-token="${token}">
(function(){
  var SITE = "${website}";
  var NAME = ${JSON.stringify(name)};
  var DESC = ${JSON.stringify(description)};
  function inject(jsonld, id){
    if (document.getElementById(id)) return;
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = id;
    s.textContent = JSON.stringify(jsonld);
    document.head.appendChild(s);
  }
  function detectPageType(){
    var p = location.pathname;
    var h = document.documentElement.outerHTML.toLowerCase();
    if (/\\/product|\\/products|\\[itemprop=["']?product/i.test(p + h)) return "product";
    if (/faq|frequently-asked/i.test(p + h)) return "faq";
    if (/\\/(blog|article|post|news)|<article/i.test(p + h)) return "blog";
    if (p === "/" || p === "") return "home";
    return "page";
  }
  function breadCrumbs(){
    var trail = [{ name: "Home", url: SITE }];
    var crumbs = document.querySelectorAll('nav[aria-label="breadcrumb"] a, .breadcrumb a, ol.breadcrumb li a');
    crumbs.forEach(function(c, i){
      trail.push({ name: c.textContent.trim(), url: c.href });
    });
    if (trail.length === 1) trail.push({ name: document.title, url: location.href });
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": trail.map(function(t, i){
        return { "@type": "ListItem", "position": i + 1, "name": t.name, "item": t.url };
      })
    };
  }
  function orgSchema(){
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": NAME,
      "url": SITE,
      "description": DESC,
      "logo": SITE + "/logo.png",
      "sameAs": []
    };
  }
  function productSchema(){
    var name = (document.querySelector('h1') || {}).textContent || document.title;
    var priceEl = document.querySelector('[itemprop="price"], .price, .product-price');
    var img = (document.querySelector('img[itemprop="image"], .product-image img') || {}).src;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": name.trim(),
      "image": img,
      "description": DESC,
      "brand": { "@type": "Brand", "name": NAME },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": priceEl ? priceEl.textContent.replace(/[^0-9.]/g, "") : "0",
        "availability": "https://schema.org/InStock"
      }
    };
  }
  function faqSchema(){
    var faqs = [];
    document.querySelectorAll('h2, h3').forEach(function(h){
      var next = h.nextElementSibling;
      if (next && /^(P|DIV|UL)$/.test(next.tagName)) {
        var q = h.textContent.trim();
        var a = next.textContent.trim();
        if (q.length > 5 && q.length < 200 && a.length > 5) faqs.push({ "@type": "Question", "name": q, "acceptedAnswer": { "@type": "Answer", "text": a } });
      }
    });
    return { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs.slice(0, 10) };
  }
  function blogSchema(){
    var title = (document.querySelector('article h1, h1') || {}).textContent || document.title;
    var dateEl = document.querySelector('time, .date, .published, [itemprop="datePublished"]');
    var author = (document.querySelector('[itemprop="author"], .author, .byline') || {}).textContent || NAME;
    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": title.trim(),
      "description": DESC,
      "author": { "@type": "Organization", "name": author.trim() || NAME },
      "publisher": { "@type": "Organization", "name": NAME, "logo": { "@type": "ImageObject", "url": SITE + "/logo.png" } },
      "datePublished": dateEl ? (dateEl.getAttribute("datetime") || dateEl.textContent) : new Date().toISOString(),
      "mainEntityOfPage": { "@type": "WebPage", "@id": location.href }
    };
  }
  var type = detectPageType();
  inject(orgSchema(), "guardianx-org");
  inject(breadCrumbs(), "guardianx-breadcrumbs");
  if (type === "product") inject(productSchema(), "guardianx-product");
  else if (type === "faq") inject(faqSchema(), "guardianx-faq");
  else if (type === "blog") inject(blogSchema(), "guardianx-blog");
})();
</script>`;

  return NextResponse.json({
    script,
    token,
    website,
    detectedTypes: ["home", "blog", "product", "faq"],
    installHint: "Paste before </body> on every page. The script auto-detects page type and injects the matching JSON-LD.",
  });
}
