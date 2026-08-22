// Seed new feature models: CompetitorAlert, InternalLink, RankGeo
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const ALERT_TYPES = [
  { type: "rank-gain", severity: "info", title: "{comp} gained a top-3 ranking", desc: "They now rank #{pos} for \"{kw}\" — a keyword you also target." },
  { type: "rank-loss", severity: "warning", title: "{comp} overtook you for \"{kw}\"", desc: "They moved up to #{pos} while you dropped. Review their content." },
  { type: "new-content", severity: "info", title: "{comp} published new content", desc: "New guide targeting \"{kw}\" ({wc} words). May compete with your page." },
  { type: "backlink-surge", severity: "warning", title: "{comp} gained {n} new backlinks", desc: "Spike in referring domains (avg DA {da}). Their authority is rising." },
  { type: "feature-captured", severity: "critical", title: "{comp} captured a featured snippet", desc: "They took the featured snippet for \"{kw}\" from your domain." },
  { type: "feature-lost", severity: "info", title: "{comp} lost a SERP feature", desc: "They lost the sitelinks for \"{kw}\" — opportunity to capture." },
];

const INTERNAL_PAGES = [
  { title: "Homepage", url: "/", depth: 0, authority: 85 },
  { title: "Products", url: "/products", depth: 1, authority: 62 },
  { title: "Blog", url: "/blog", depth: 1, authority: 58 },
  { title: "About Us", url: "/about", depth: 1, authority: 45 },
  { title: "Pricing", url: "/pricing", depth: 1, authority: 55 },
  { title: "Contact", url: "/contact", depth: 1, authority: 40 },
  { title: "Category: Featured", url: "/category/featured", depth: 2, authority: 48 },
  { title: "Product: Best Seller", url: "/products/best-seller", depth: 2, authority: 52 },
  { title: "Blog: Ultimate Guide", url: "/blog/ultimate-guide", depth: 2, authority: 51 },
  { title: "Blog: How-To", url: "/blog/how-to", depth: 2, authority: 46 },
  { title: "FAQ", url: "/faq", depth: 1, authority: 43 },
  { title: "Checkout", url: "/checkout", depth: 2, authority: 38 },
  { title: "Account", url: "/account", depth: 2, authority: 35 },
  { title: "Search", url: "/search", depth: 1, authority: 42 },
  { title: "Orphan Page", url: "/legacy/old-promo", depth: 3, authority: 22 },
];

const GEO_COUNTRIES = [
  { country: "United States", countryCode: "US" },
  { country: "United Kingdom", countryCode: "GB" },
  { country: "India", countryCode: "IN" },
  { country: "Canada", countryCode: "CA" },
  { country: "Germany", countryCode: "DE" },
  { country: "Australia", countryCode: "AU" },
  { country: "France", countryCode: "FR" },
  { country: "Japan", countryCode: "JP" },
  { country: "Brazil", countryCode: "BR" },
  { country: "Singapore", countryCode: "SG" },
];

const ANCHORS = ["click here", "learn more", "read our guide", "best deals", "top rated", "official site", "get started", "see pricing", "home", "contact us", "our blog", "visit store", "check out", "more info", "buy now"];

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function randInt(min: number, max: number) { return Math.floor(rand(min, max + 1)); }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  console.log("🧹 Cleaning new feature models...");
  await db.rankGeo.deleteMany();
  await db.internalLink.deleteMany();
  await db.contentBrief.deleteMany();
  await db.competitorAlert.deleteMany();

  const companies = await db.company.findMany({ include: { competitors: true, keywords: true } });
  console.log(`🌱 Seeding feature data for ${companies.length} companies...`);

  for (const c of companies) {
    // ---- Competitor Alerts: 5-8 per company ----
    const alertCount = randInt(5, 8);
    for (let i = 0; i < alertCount; i++) {
      const comp = c.competitors[randInt(0, c.competitors.length - 1)] ?? { name: "ApexRival" };
      const kw = c.keywords[randInt(0, Math.max(0, c.keywords.length - 1))]?.keyword ?? "target keyword";
      const tmpl = pick(ALERT_TYPES);
      const title = tmpl.title
        .replace("{comp}", comp.name)
        .replace("{kw}", kw)
        .replace("{pos}", String(randInt(1, 5)))
        .replace("{wc}", String(randInt(800, 3500)))
        .replace("{n}", String(randInt(5, 40)))
        .replace("{da}", String(randInt(35, 75)));
      const desc = tmpl.desc
        .replace("{comp}", comp.name)
        .replace("{kw}", kw)
        .replace("{pos}", String(randInt(1, 5)))
        .replace("{wc}", String(randInt(800, 3500)))
        .replace("{n}", String(randInt(5, 40)))
        .replace("{da}", String(randInt(35, 75)));
      await db.competitorAlert.create({
        data: {
          companyId: c.id,
          type: tmpl.type,
          severity: tmpl.severity,
          title,
          description: desc,
          competitor: comp.name,
          metric: pick(["position", "traffic", "backlinks", "visibility"]),
          value: String(randInt(1, 50)),
          read: Math.random() > 0.6,
          createdAt: new Date(Date.now() - randInt(1, 168) * 3600000),
        },
      });
    }

    // ---- Internal Links: build a graph from INTERNAL_PAGES ----
    const pages = INTERNAL_PAGES.map((p) => ({ ...p, url: `${c.website}${p.url}` }));
    // Homepage links to all depth-1 pages
    for (const target of pages.filter((p) => p.depth === 1)) {
      await db.internalLink.create({
        data: {
          companyId: c.id,
          sourceUrl: pages[0].url,
          targetUrl: target.url,
          anchorText: target.title.toLowerCase(),
          sourceTitle: pages[0].title,
          targetTitle: target.title,
          sourceDepth: 0,
          linkType: "dofollow",
          authority: target.authority,
        },
      });
    }
    // Blog links to blog posts
    const blog = pages.find((p) => p.title === "Blog")!;
    for (const target of pages.filter((p) => p.depth === 2 && p.url.includes("blog"))) {
      await db.internalLink.create({
        data: {
          companyId: c.id,
          sourceUrl: blog.url,
          targetUrl: target.url,
          anchorText: pick(ANCHORS),
          sourceTitle: blog.title,
          targetTitle: target.title,
          sourceDepth: 1,
          linkType: "dofollow",
          authority: target.authority,
        },
      });
    }
    // Products links to product pages
    const products = pages.find((p) => p.title === "Products")!;
    for (const target of pages.filter((p) => p.depth === 2 && p.url.includes("products"))) {
      await db.internalLink.create({
        data: {
          companyId: c.id,
          sourceUrl: products.url,
          targetUrl: target.url,
          anchorText: pick(ANCHORS),
          sourceTitle: products.title,
          targetTitle: target.title,
          sourceDepth: 1,
          linkType: "dofollow",
          authority: target.authority,
        },
      });
    }
    // Some cross-links (blog → products, faq → blog)
    const faq = pages.find((p) => p.title === "FAQ");
    if (faq) {
      const targets = pages.filter((p) => p.url.includes("blog")).slice(0, 2);
      for (const target of targets) {
        await db.internalLink.create({
          data: {
            companyId: c.id,
            sourceUrl: faq.url,
            targetUrl: target.url,
            anchorText: pick(ANCHORS),
            sourceTitle: faq.title,
            targetTitle: target.title,
            sourceDepth: 1,
            linkType: pick(["dofollow", "nofollow"]),
            authority: target.authority,
          },
        });
      }
    }

    // ---- Rank Geo: top 5 keywords across 10 countries ----
    const topKws = c.keywords.slice(0, 5);
    for (const kw of topKws) {
      if (!kw) continue;
      for (const geo of GEO_COUNTRIES) {
        await db.rankGeo.create({
          data: {
            companyId: c.id,
            country: geo.country,
            countryCode: geo.countryCode,
            keyword: kw.keyword,
            position: Math.max(1, kw.position + randInt(-8, 8)),
            searchVolume: Math.round(kw.searchVolume * rand(0.2, 1.0)),
          },
        });
      }
    }
  }

  console.log("✅ Feature seed complete!");
  const counts = {
    alerts: await db.competitorAlert.count(),
    internalLinks: await db.internalLink.count(),
    rankGeo: await db.rankGeo.count(),
  };
  console.log(counts);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await db.$disconnect(); });
