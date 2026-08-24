import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/login — looks up a user by email + validates password
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Admin login — hardcoded credentials
  // In production, store this in an env var
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@guardianx.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "GuardianX@2024";

  if (cleanEmail === ADMIN_EMAIL.toLowerCase()) {
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    return NextResponse.json({
      role: "admin",
      name: "Admin",
      companyId: null,
      token: null,
    });
  }

  // Look up client by email
  const client = await db.client.findFirst({
    where: { email: cleanEmail },
    select: {
      id: true,
      name: true,
      email: true,
      token: true,
      companyId: true,
      company: { select: { name: true, slug: true, domain: { select: { slug: true } } } },
    },
  });

  if (!client) {
    return NextResponse.json(
      { error: "No account found with this email. Contact your SEO provider for access." },
      { status: 404 }
    );
  }

  // Client password validation
  // During onboarding, the client sets their own password (stored as phone field for now)
  // For demo clients created via seed, the default password is "GuardianX@2024"
  const clientPassword = (client as any).phone || "GuardianX@2024";
  if (password !== clientPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({
    role: "client",
    name: client.name,
    companyId: client.companyId,
    token: client.token,
    companySlug: client.company.slug,
    domainSlug: client.company.domain.slug,
  });
}
