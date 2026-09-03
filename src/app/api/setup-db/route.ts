import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { db } from "@/lib/db";

// GET /api/setup-db — runs prisma db push + seed from within the serverless function
// Visit this URL once after deploying to initialize the database
export async function GET() {
  const results: string[] = [];
  
  // Step 1: Check if tables exist
  try {
    const count = await db.domain.count();
    results.push(`✅ Database connected — ${count} domains found`);
    if (count > 0) {
      return NextResponse.json({ status: "ready", results, message: "Database already initialized!" });
    }
  } catch (err) {
    results.push(`❌ DB check failed: ${err instanceof Error ? err.message.slice(0, 100) : "unknown"}`);
  }

  // Step 2: Run prisma db push to create tables
  try {
    results.push("⏳ Running prisma db push...");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "pipe",
      timeout: 30000,
      env: { ...process.env },
    });
    results.push("✅ Schema pushed successfully");
  } catch (err) {
    results.push(`❌ prisma db push failed: ${err instanceof Error ? err.message.slice(0, 100) : "unknown"}`);
  }

  // Step 3: Seed basic data
  try {
    results.push("⏳ Seeding domains...");
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
      await db.domain.create({ data: d }).catch(() => {});
    }
    results.push("✅ 10 domains seeded");

    // Create sample company + client
    const domain = await db.domain.findFirst({ where: { slug: "ecommerce" } });
    if (domain) {
      const company = await db.company.create({
        data: {
          domainId: domain.id,
          name: "ShopMax",
          slug: "shopmax",
          website: "shopmax.com",
          logoText: "SM",
          description: "Multi-category online marketplace with 2M+ SKUs.",
          location: "San Francisco, US",
          employees: "1,200",
          foundedYear: 2014,
          industry: "Marketplace",
        },
      }).catch(() => null);

      if (company) {
        // Seed 30 days of metrics
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const f = (29 - i) / 29;
          await db.seoMetric.create({
            data: {
              companyId: company.id,
              date: d,
              organicTraffic: Math.round(4800000 * (0.85 + f * 0.15)),
              keywordsRanked: Math.round(184000 * (0.85 + f * 0.15)),
              backlinks: Math.round(920000 * (0.85 + f * 0.15)),
              referringDomains: Math.round(920000 / 8),
              domainAuthority: Math.round((78 + f * 1.5) * 10) / 10,
              pageAuthority: Math.round((66 + f) * 10) / 10,
              avgPosition: Math.max(1, Math.round((8.4 - f * 1.5) * 10) / 10),
              visibilityScore: Math.round(76 + f * 5),
              organicClicks: Math.round(2400000 * (0.85 + f * 0.15)),
              impressions: Math.round(16800000 * (0.85 + f * 0.15)),
              ctr: 14.2,
              bounceRate: 42.5,
              avgLoadTime: 1.8,
            },
          });
        }
        results.push("✅ ShopMax company + 30 days metrics seeded");

        // Create demo client
        const client = await db.client.create({
          data: {
            companyId: company.id,
            name: "Demo Client",
            email: "client@guardianx.com",
            phone: "GuardianX@2024",
            role: "Owner",
            primaryGoal: "Increase organic traffic",
            targetKeywords: 100,
            targetTraffic: 100000,
            targetDA: 50,
          },
        }).catch(() => null);

        if (client) {
          results.push("✅ Demo client created (client@guardianx.com / GuardianX@2024)");
          
          // Create goals
          await db.clientGoal.create({ data: { clientId: client.id, type: "traffic", label: "Organic Traffic", target: 100000, current: 50000, deadline: new Date(Date.now() + 90 * 86400000) } });
          await db.clientGoal.create({ data: { clientId: client.id, type: "keywords", label: "Keywords Ranked", target: 100, current: 45, deadline: new Date(Date.now() + 90 * 86400000) } });
          await db.clientGoal.create({ data: { clientId: client.id, type: "authority", label: "Domain Authority", target: 50, current: 30, deadline: new Date(Date.now() + 180 * 86400000) } });
          results.push("✅ 3 goals created");

          // Create tasks
          const tasks = [
            { title: "Fix Core Web Vitals issues", category: "technical", priority: "high" },
            { title: "Publish 4 cornerstone content pieces", category: "content", priority: "high" },
            { title: "Launch guest posting outreach campaign", category: "outreach", priority: "high" },
            { title: "Optimize title tags & meta descriptions", category: "optimization", priority: "medium" },
            { title: "Set up Google Search Console & GA4", category: "monitoring", priority: "high" },
            { title: "Research 50 seed keywords", category: "content", priority: "medium" },
          ];
          for (const t of tasks) {
            await db.clientTask.create({
              data: { clientId: client.id, title: t.title, description: "SEO action item", category: t.category, priority: t.priority, status: "todo", dueDate: new Date(Date.now() + Math.floor(Math.random() * 23 + 7) * 86400000) },
            });
          }
          results.push("✅ 6 tasks created");
        }
      }
    }
  } catch (err) {
    results.push(`❌ Seeding failed: ${err instanceof Error ? err.message.slice(0, 100) : "unknown"}`);
  }

  const finalCount = await db.domain.count().catch(() => 0);
  
  return NextResponse.json({
    status: finalCount > 0 ? "ready" : "failed",
    domains: finalCount,
    results,
    login: finalCount > 0 ? {
      admin: "admin@guardianx.com / GuardianX@2024",
      client: "client@guardianx.com / GuardianX@2024",
    } : null,
    message: finalCount > 0
      ? "🎉 Database initialized! Your app is ready."
      : "❌ Database setup failed. Check if DATABASE_URL env var is correct and Neon DB is active.",
  });
}
