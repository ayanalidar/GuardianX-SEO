import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/onboard — create a new company + client with unique portal token
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    name,
    website,
    description,
    location,
    employees,
    foundedYear,
    industry,
    domainSlug, // e.g. "ecommerce"
    clientName,
    email,
    phone,
    role,
    primaryGoal,
    targetKeywords,
    targetTraffic,
    targetDA,
  } = body;

  // Basic validation
  if (!name || !website || !domainSlug || !clientName || !email || !primaryGoal) {
    return NextResponse.json(
      { error: "Missing required fields: name, website, domainSlug, clientName, email, primaryGoal" },
      { status: 400 }
    );
  }

  const domain = await db.domain.findUnique({ where: { slug: domainSlug } });
  if (!domain) {
    return NextResponse.json({ error: "Invalid domain slug" }, { status: 400 });
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const logoText = name
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Check for duplicate website in this domain
  const existing = await db.company.findFirst({
    where: { domainId: domain.id, slug },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A company with this name already exists in this domain" },
      { status: 409 }
    );
  }

  // Clean website
  const cleanWebsite = website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Create company + client in a transaction
  const result = await db.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: {
        domainId: domain.id,
        name,
        slug,
        website: cleanWebsite,
        logoText,
        description: description || `${name} — ${industry || "business"} onboarded on RankForge.`,
        location: location || "Not specified",
        employees: employees || "1-10",
        foundedYear: foundedYear || new Date().getFullYear(),
        industry: industry || domain.name,
      },
    });

    const client = await tx.client.create({
      data: {
        companyId: company.id,
        name: clientName,
        email,
        phone: phone || null,
        role: role || "Owner",
        primaryGoal,
        targetKeywords: targetKeywords || 50,
        targetTraffic: targetTraffic || 100000,
        targetDA: targetDA || 50,
      },
    });

    // Seed initial 30-day metrics (starting low, trending up — fresh business)
    const baseTraffic = 5000;
    const baseDA = 18;
    const baseKeywords = 80;
    const baseBacklinks = 40;
    const basePosition = 45;
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayFactor = (29 - i) / 29;
      const traffic = Math.round(baseTraffic * (1 + dayFactor * 0.4 + Math.random() * 0.05));
      const da = Math.round((baseDA + dayFactor * 1.5) * 10) / 10;
      const kw = Math.round(baseKeywords * (1 + dayFactor * 0.3));
      const bl = Math.round(baseBacklinks * (1 + dayFactor * 0.25));
      const pos = Math.max(1, Math.round((basePosition - dayFactor * 2) * 10) / 10);
      const impressions = Math.round(traffic * (3 + Math.random()));
      const clicks = Math.round(traffic * 0.5);
      await tx.seoMetric.create({
        data: {
          companyId: company.id,
          date: d,
          organicTraffic: traffic,
          keywordsRanked: kw,
          backlinks: bl,
          referringDomains: Math.round(bl / 5),
          domainAuthority: da,
          pageAuthority: Math.round(da * 0.85 * 10) / 10,
          avgPosition: pos,
          visibilityScore: Math.round(Math.max(0, 100 - pos * 3) * 10) / 10,
          organicClicks: clicks,
          impressions,
          ctr: Math.round((clicks / impressions) * 1000) / 10,
          bounceRate: Math.round((35 + Math.random() * 15) * 10) / 10,
          avgLoadTime: Math.round((1.5 + Math.random() * 1.5) * 100) / 100,
        },
      });
    }

    // Seed default goals based on the primary goal
    const latest = await tx.seoMetric.findFirst({
      where: { companyId: company.id },
      orderBy: { date: "desc" },
    });
    if (latest) {
      await tx.clientGoal.create({
        data: {
          clientId: client.id,
          type: "traffic",
          label: "Organic Traffic",
          target: client.targetTraffic,
          current: latest.organicTraffic,
          deadline: new Date(Date.now() + 90 * 86400000),
        },
      });
      await tx.clientGoal.create({
        data: {
          clientId: client.id,
          type: "keywords",
          label: "Keywords Ranked",
          target: client.targetKeywords,
          current: latest.keywordsRanked,
          deadline: new Date(Date.now() + 90 * 86400000),
        },
      });
      await tx.clientGoal.create({
        data: {
          clientId: client.id,
          type: "authority",
          label: "Domain Authority",
          target: client.targetDA,
          current: latest.domainAuthority,
          deadline: new Date(Date.now() + 180 * 86400000),
        },
      });
      await tx.clientGoal.create({
        data: {
          clientId: client.id,
          type: "position",
          label: "Avg SERP Position",
          target: 5,
          current: latest.avgPosition,
          deadline: new Date(Date.now() + 120 * 86400000),
        },
      });
    }

    // Seed default tasks based on primary goal
    const defaultTasks = generateDefaultTasks(primaryGoal, industry || domain.name);
    for (const t of defaultTasks) {
      await tx.clientTask.create({
        data: {
          clientId: client.id,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority,
          dueDate: t.dueDays ? new Date(Date.now() + t.dueDays * 86400000) : null,
        },
      });
    }

    return { company, client };
  });

  return NextResponse.json({
    success: true,
    companyId: result.company.id,
    clientToken: result.client.token,
    portalUrl: `/portal/${result.client.token}`,
  });
}

function generateDefaultTasks(primaryGoal: string, industry: string): Array<{
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDays?: number;
}> {
  const tasks: Array<{ title: string; description: string; category: string; priority: string; dueDays?: number }> = [];

  if (primaryGoal.includes("traffic")) {
    tasks.push({
      title: "Publish 4 cornerstone content pieces",
      description: `Create in-depth, 2000+ word articles targeting high-volume ${industry} keywords with proper internal linking.`,
      category: "content",
      priority: "high",
      dueDays: 30,
    });
  }
  if (primaryGoal.includes("keywords") || primaryGoal.includes("Rank")) {
    tasks.push({
      title: "Optimize title tags & meta descriptions",
      description: "Review and rewrite title tags (under 60 chars) and meta descriptions (under 155 chars) for top 20 pages.",
      category: "optimization",
      priority: "high",
      dueDays: 14,
    });
  }
  if (primaryGoal.includes("backlinks")) {
    tasks.push({
      title: "Launch guest posting outreach campaign",
      description: "Identify 30 DA 40+ sites in the industry and pitch guest articles with contextual backlinks.",
      category: "outreach",
      priority: "high",
      dueDays: 45,
    });
  }
  if (primaryGoal.includes("technical")) {
    tasks.push({
      title: "Fix Core Web Vitals issues",
      description: "Optimize LCP (images, fonts), reduce CLS (reserve space for ads/images), improve INP (defer JS).",
      category: "technical",
      priority: "high",
      dueDays: 21,
    });
  }
  tasks.push(
    {
      title: "Set up Google Search Console & GA4",
      description: "Verify ownership, submit XML sitemap, enable enhanced measurement in GA4.",
      category: "monitoring",
      priority: "high",
      dueDays: 7,
    },
    {
      title: "Conduct full site technical audit",
      description: "Crawl site, identify broken links, duplicate content, missing schema, indexation issues.",
      category: "technical",
      priority: "medium",
      dueDays: 14,
    },
    {
      title: "Research 50 seed keywords",
      description: `Build a keyword map for ${industry} with search volume, difficulty, and intent classification.`,
      category: "content",
      priority: "medium",
      dueDays: 10,
    },
    {
      title: "Optimize existing top pages",
      description: "Refresh content, add FAQs, improve internal links, update publish dates for pages ranking 5-15.",
      category: "optimization",
      priority: "medium",
      dueDays: 21,
    },
  );
  return tasks;
}
