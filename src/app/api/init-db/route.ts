import { NextResponse } from "next/server";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { db } from "@/lib/db";

// GET /api/init-db — initializes the SQLite database with schema + seed data
// Call this once after deploying to Vercel: https://your-app.vercel.app/api/init-db
export async function GET() {
  const dbPath = process.env.DATABASE_URL || "file:./db/custom.db";
  const filePath = dbPath.replace("file:", "");

  try {
    // Check if DB already has data
    const domainCount = await db.domain.count().catch(() => -1);

    if (domainCount > 0) {
      return NextResponse.json({
        status: "already-initialized",
        domains: domainCount,
        message: "Database already has data. No action needed.",
      });
    }

    // Run prisma db push to create schema
    try {
      execSync("npx prisma db push --accept-data-loss", {
        stdio: "pipe",
        timeout: 30000,
        env: { ...process.env },
      });
    } catch (e) {
      // Schema might already exist
    }

    // Run seed scripts
    let seedResult = "skipped";
    try {
      execSync("node prisma/seed.ts", { stdio: "pipe", timeout: 60000, env: { ...process.env } });
      seedResult = "seed OK";
    } catch (e1) {
      try {
        execSync("npx tsx prisma/seed.ts", { stdio: "pipe", timeout: 60000, env: { ...process.env } });
        seedResult = "seed OK (tsx)";
      } catch (e2) {
        seedResult = "seed failed (use manual SQL)";
      }
    }

    let featuresResult = "skipped";
    try {
      execSync("npx tsx prisma/seed-features.ts", { stdio: "pipe", timeout: 60000, env: { ...process.env } });
      featuresResult = "features OK";
    } catch {
      featuresResult = "features failed (non-critical)";
    }

    // Verify
    const finalCount = await db.domain.count().catch(() => 0);

    return NextResponse.json({
      status: "initialized",
      domains: finalCount,
      seed: seedResult,
      features: featuresResult,
      dbPath: filePath,
      message: finalCount > 0
        ? "Database initialized successfully! Your app is ready to use."
        : "Schema pushed but seeding may have failed. Check server logs.",
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      error: err instanceof Error ? err.message : "Unknown error",
      dbPath: filePath,
      message: "Database initialization failed. For production, switch to PostgreSQL (Vercel Postgres / Supabase / Neon).",
    }, { status: 200 }); // 200 so user sees the error
  }
}
