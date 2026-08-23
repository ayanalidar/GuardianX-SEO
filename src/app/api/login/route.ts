import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/login — looks up a user by email
// Returns: role (admin/client), companyId, token, name
export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Admin check — emails containing "admin" get admin access
  if (cleanEmail.includes("admin")) {
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

  return NextResponse.json({
    role: "client",
    name: client.name,
    companyId: client.companyId,
    token: client.token,
    companySlug: client.company.slug,
    domainSlug: client.company.domain.slug,
  });
}
