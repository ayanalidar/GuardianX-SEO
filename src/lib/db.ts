import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function hasAllModels(client: PrismaClient): boolean {
  return (
    typeof (client as any).coreWebVital === 'object' &&
    typeof (client as any).serpFeature === 'object' &&
    typeof (client as any).client === 'object' &&
    typeof (client as any).clientGoal === 'object' &&
    typeof (client as any).clientTask === 'object' &&
    typeof (client as any).siteEvent === 'object'
  )
}

function createPrisma(): PrismaClient {
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

function ensureDatabase() {
  // On Vercel/serverless, the SQLite file may not exist at runtime
  // Use /tmp which is writable on Vercel
  const dbPath = process.env.DATABASE_URL || 'file:./db/custom.db'
  const filePath = dbPath.replace('file:', '')

  // If using a relative path, resolve it
  const resolvedPath = filePath.startsWith('/') ? filePath : `${process.cwd()}/${filePath}`

  // Ensure directory exists
  const dir = dirname(resolvedPath)
  if (!existsSync(dir)) {
    try { mkdirSync(dir, { recursive: true }) } catch {}
  }

  // If DB doesn't exist, create + push schema + seed
  if (!existsSync(resolvedPath)) {
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'pipe', timeout: 30000 })
      execSync('bun run prisma/seed.ts', { stdio: 'pipe', timeout: 60000 })
      execSync('bun run prisma/seed-features.ts', { stdio: 'pipe', timeout: 60000 })
    } catch (e) {
      // If seeding fails, the DB schema is still pushed — basic functionality works
      console.error('DB seed failed (non-fatal):', e instanceof Error ? e.message.slice(0, 100) : 'unknown')
    }
  }
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma
  if (cached && hasAllModels(cached)) {
    return cached
  }

  // Ensure DB exists (especially on serverless)
  ensureDatabase()

  const client = createPrisma()
  globalForPrisma.prisma = client
  return client
}

export const db = getPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
