import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/init-db — initializes the database with schema + demo data directly via Prisma
// No external CLI needed — all seeding happens via Prisma Client
export async function GET() {
  try {
    // Check if already initialized
    let existing = 0;
    try {
      existing = await db.domain.count();
    } catch {
      // Table doesn't exist — need to push schema
      // On Vercel, we can't run prisma CLI, so we use raw SQL to create tables
      // The schema was pushed during build, but the bundled DB might be read-only
      // Try creating tables via raw SQL
      try {
        await db.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Domain" (
          "id" TEXT PRIMARY KEY NOT NULL,
          "name" TEXT NOT NULL UNIQUE,
          "slug" TEXT NOT NULL UNIQUE,
          "description" TEXT NOT NULL,
          "icon" TEXT NOT NULL,
          "color" TEXT NOT NULL,
          "accent" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`);
        // If this works, we're on a writable SQLite. Run full schema creation.
        // For simplicity, if the Domain table creation works, try the rest of the seeding.
      } catch (schemaErr) {
        return NextResponse.json({
          status: "error",
          error: "Database is read-only or tables can't be created. SQLite doesn't persist on Vercel serverless.",
          message: "For production, switch to PostgreSQL (Vercel Postgres / Supabase / Neon). SQLite works locally but not on Vercel serverless because the filesystem is read-only at runtime.",
          solution: "1. Create a free PostgreSQL database at supabase.com or neon.tech\n2. Set DATABASE_URL to the PostgreSQL connection string\n3. Run prisma db push\n4. Redeploy",
        }, { status: 200 });
      }
    }

    if (existing > 0) {
      const companies = await db.company.count().catch(() => 0);
      const keywords = await db.keyword.count().catch(() => 0);
      return NextResponse.json({
        status: "already-initialized",
        domains: existing,
        companies,
        keywords,
        message: "Database already has data. All ready!",
      });
    }

    // Seed domains
    const DOMAINS = [
      { name: "E-Commerce", slug: "ecommerce", icon: "ShoppingCart", color: "emerald", accent: "#10b981", description: "Online retail, marketplaces & DTC brands" },
      { name: "Healthcare", slug: "healthcare", icon: "HeartPulse", color: "rose", accent: "#f43f5e", description: "Clinics, telehealth, medical devices & pharma" },
      { name: "SaaS / Tech", slug: "saas", icon: "Cpu", color: "violet", accent: "#8b5cf6", description: "Software, cloud platforms & developer tools" },
      { name: "Real Estate", slug: "real-estate", icon: "Building2", color: "amber", accent: "#f59e0b", description: "Property portals, brokerages & rentals" },
      { name: "Finance", slug: "finance", icon: "Landmark", color: "teal", accent: "#14b8a6", description: "Banking, fintech, investing & insurance" },
      { name: "Hospitality", slug: "hospitality", icon: "Plane", color: "cyan", accent: "#06b6d4", description: "Hotels, travel, booking & experiences" },
      { name: "Legal", slug: "legal", icon: "Scale", color: "stone", accent: "#78716c", description: "Law firms, legal services & compliance" },
      { name: "Education", slug: "education", icon: "GraduationCap", color: "orange", accent: "#f97316", description: "EdTech, courses, universities & e-learning" },
      { name: "Food & Restaurant", slug: "food", icon: "UtensilsCrossed", color: "lime", accent: "#84cc16", description: "Restaurants, delivery, food brands & recipes" },
      { name: "Automotive", slug: "automotive", icon: "Car", color: "sky", accent: "#0ea5e9", description: "Dealers, auto parts, EV & mobility" },
    ];

    for (const d of DOMAINS) {
      await db.domain.create({ data: d });
    }

    // Create a sample company + client for each domain
    const SAMPLE = [
      { name: "ShopMax", website: "shopmax.com", logo: "SM", industry: "Marketplace", traffic: 4800000, da: 78, kw: 184000, bl: 920000, pos: 8.4, domain: "ecommerce" },
      { name: "MediCare Plus", website: "medicareplus.com", logo: "MC", industry: "Telehealth", traffic: 2600000, da: 76, kw: 88400, bl: 540000, pos: 7.9, domain: "healthcare" },
      { name: "CloudFlow", website: "cloudflow.com", logo: "CF", industry: "Workflow SaaS", traffic: 1800000, da: 74, kw: 64200, bl: 480000, pos: 8.6, domain: "saas" },
      { name: "EstatePrime", website: "estateprime.com", logo: "EP", industry: "Luxury Real Estate", traffic: 1600000, da: 73, kw: 58400, bl: 420000, pos: 9.1, domain: "real-estate" },
      { name: "FinEdge", website: "finedge.com", logo: "FE", industry: "Digital Banking", traffic: 2200000, da: 77, kw: 72800, bl: 560000, pos: 7.6, domain: "finance" },
    ];

    for (const s of SAMPLE) {
      const domain = await db.domain.findUnique({ where: { slug: s.domain } });
      if (!domain) continue;

      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const company = await db.company.create({
        data: {
          domainId: domain.id,
          name: s.name,
          slug,
          website: s.website,
          logoText: s.logo,
          description: `${s.name} — ${s.industry} tracked by GuardianX-SEO.`,
          location: "Global",
          employees: "100-500",
          foundedYear: 2015,
          industry: s.industry,
        },
      });

      // Seed 30 days of metrics
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayFactor = (29 - i) / 29;
        await db.seoMetric.create({
          data: {
            companyId: company.id,
            date: d,
            organicTraffic: Math.round(s.traffic * (0.85 + dayFactor * 0.15)),
            keywordsRanked: Math.round(s.kw * (0.85 + dayFactor * 0.15)),
            backlinks: Math.round(s.bl * (0.85 + dayFactor * 0.15)),
            referringDomains: Math.round(s.bl / 8),
            domainAuthority: Math.round((s.da + dayFactor * 1.5) * 10) / 10,
            pageAuthority: Math.round((s.da * 0.85 + dayFactor) * 10) / 10,
            avgPosition: Math.max(1, Math.round((s.pos - dayFactor * 1.5) * 10) / 10),
            visibilityScore: Math.round(Math.max(0, 100 - s.pos * 3 + dayFactor * 5)),
            organicClicks: Math.round(s.traffic * 0.5),
            impressions: Math.round(s.traffic * 3.5),
            ctr: 14.2,
            bounceRate: 42.5,
            avgLoadTime: 1.8,
          },
        });
      }

      // Seed keywords
      const KW_POOL: Record<string, string[]> = {
        ecommerce: ["buy shoes online", "best wireless headphones", "discount electronics", "online clothing store", "free shipping deals", "gift ideas under 50", "black friday offers", "home decor sale", "smartphone deals", "laptop backpack"],
        healthcare: ["telehealth appointment", "online doctor consultation", "covid testing near me", "health insurance plans", "symptoms checker", "mental health therapy", "primary care clinic", "prescription delivery", "wellness programs", "find a specialist"],
        saas: ["workflow automation", "ci cd pipeline", "project management software", "crm integration", "api monitoring", "team collaboration tool", "log analytics", "customer onboarding", "marketing automation", "accounting software"],
        "real-estate": ["houses for sale", "apartments for rent", "luxury homes", "real estate agents", "mortgage calculator", "property management", "commercial real estate", "new construction homes", "waterfront properties", "studio apartments"],
        finance: ["online banking", "high yield savings", "best credit cards", "personal loans", "investment portfolio", "retirement planning", "stock trading app", "crypto exchange", "insurance quotes", "mortgage rates"],
      };
      const pool = KW_POOL[s.domain] || KW_POOL.ecommerce;
      for (let i = 0; i < 10; i++) {
        const kw = pool[i % pool.length];
        await db.keyword.create({
          data: {
            companyId: company.id,
            keyword: kw,
            position: randInt(1, 50),
            previousPosition: randInt(1, 55),
            searchVolume: randInt(500, 24000),
            difficulty: Math.round(Math.random() * 70 + 10),
            cpc: Math.round(Math.random() * 5 + 0.5),
            intent: ["commercial", "informational", "transactional"][randInt(0, 2)],
            url: `https://${s.website}/${kw.replace(/\s+/g, "-")}`,
            trend: "[]",
          },
        });
      }

      // Seed backlinks
      for (let i = 0; i < 10; i++) {
        await db.backlink.create({
          data: {
            companyId: company.id,
            sourceDomain: `blog${i}.com`,
            sourceUrl: `https://blog${i}.com/article-${i}`,
            anchorText: ["click here", s.name, "best " + s.industry.toLowerCase(), "visit " + s.name][i % 4],
            domainAuthority: Math.round(Math.random() * 60 + 20),
            linkType: Math.random() > 0.3 ? "dofollow" : "nofollow",
            status: ["active", "new", "lost"][randInt(0, 2)],
            firstSeen: new Date(Date.now() - randInt(3, 180) * 86400000),
            traffic: randInt(0, 3000),
          },
        });
      }

      // Seed technical issues
      const ISSUE_TYPES = [
        { type: "core-web-vitals", severity: "warning", title: "LCP above 2.5s on mobile homepage" },
        { type: "crawlability", severity: "info", title: "Orphan pages detected in sitemap" },
        { type: "mobile", severity: "warning", title: "Tap targets too small on blog" },
        { type: "schema", severity: "warning", title: "Missing Product schema on 142 pages" },
        { type: "security", severity: "info", title: "Missing HSTS header" },
      ];
      for (const issue of ISSUE_TYPES) {
        await db.technicalIssue.create({
          data: {
            companyId: company.id,
            type: issue.type,
            severity: issue.severity,
            title: issue.title,
            description: "Detected during automated crawl.",
            affectedCount: randInt(1, 240),
            status: "open",
            detectedAt: new Date(Date.now() - randInt(1, 30) * 86400000),
          },
        });
      }

      // Seed content gaps
      for (let i = 0; i < 8; i++) {
        await db.contentGap.create({
          data: {
            companyId: company.id,
            keyword: pool[randInt(0, pool.length - 1)],
            competitorRanking: "ApexRival, NextGen Co",
            searchVolume: randInt(800, 28000),
            difficulty: Math.round(Math.random() * 60 + 15),
            opportunity: Math.round(Math.random() * 60 + 35),
          },
        });
      }

      // Seed competitors
      for (let i = 0; i < 5; i++) {
        await db.competitor.create({
          data: {
            companyId: company.id,
            name: ["ApexRival", "PrimeContender", "NextGen Co", "TopRank Co", "MarketLeader"][i],
            domain: `competitor${i}.com`,
            domainAuthority: Math.round((s.da + randInt(-10, 10)) * 10) / 10,
            organicTraffic: Math.round(s.traffic * (0.3 + Math.random() * 1.5)),
            commonKeywords: randInt(800, 9200),
            trafficOverlap: Math.round(Math.random() * 60 + 12),
            backlinks: Math.round(s.bl * (0.4 + Math.random() * 1.2)),
          },
        });
      }
    }

    // Create one demo client
    const firstCompany = await db.company.findFirst();
    if (firstCompany) {
      const client = await db.client.create({
        data: {
          companyId: firstCompany.id,
          name: "Demo Client",
          email: "client@guardianx.com",
          phone: "GuardianX@2024",
          role: "Owner",
          primaryGoal: "Increase organic traffic",
          targetKeywords: 100,
          targetTraffic: 100000,
          targetDA: 50,
        },
      });

      // Seed goals
      await db.clientGoal.create({ data: { clientId: client.id, type: "traffic", label: "Organic Traffic", target: 100000, current: 50000, deadline: new Date(Date.now() + 90 * 86400000) } });
      await db.clientGoal.create({ data: { clientId: client.id, type: "keywords", label: "Keywords Ranked", target: 100, current: 45, deadline: new Date(Date.now() + 90 * 86400000) } });
      await db.clientGoal.create({ data: { clientId: client.id, type: "authority", label: "Domain Authority", target: 50, current: 30, deadline: new Date(Date.now() + 180 * 86400000) } });

      // Seed tasks
      const TASKS = [
        { title: "Fix Core Web Vitals issues", category: "technical", priority: "high" },
        { title: "Publish 4 cornerstone content pieces", category: "content", priority: "high" },
        { title: "Launch guest posting outreach campaign", category: "outreach", priority: "high" },
        { title: "Optimize title tags & meta descriptions", category: "optimization", priority: "medium" },
        { title: "Set up Google Search Console & GA4", category: "monitoring", priority: "high" },
        { title: "Research 50 seed keywords", category: "content", priority: "medium" },
      ];
      for (const t of TASKS) {
        await db.clientTask.create({
          data: {
            clientId: client.id,
            title: t.title,
            description: "SEO action item from GuardianX-SEO.",
            category: t.category,
            priority: t.priority,
            status: "todo",
            dueDate: new Date(Date.now() + randInt(7, 30) * 86400000),
          },
        });
      }
    }

    // Verify
    const finalDomains = await db.domain.count();
    const finalCompanies = await db.company.count();
    const finalKeywords = await db.keyword.count();
    const finalClients = await db.client.count();

    return NextResponse.json({
      status: "success",
      domains: finalDomains,
      companies: finalCompanies,
      keywords: finalKeywords,
      clients: finalClients,
      message: "Database initialized successfully! Your app is ready to use. Visit the home page and login with admin@guardianx.com or client@guardianx.com",
      loginInfo: {
        admin: "admin@guardianx.com (any password)",
        client: "client@guardianx.com (any password)",
      },
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message.slice(0, 300) : "Unknown error",
      message: "DB initialization failed. For production use PostgreSQL (Vercel Postgres / Supabase / Neon).",
    }, { status: 200 });
  }
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
