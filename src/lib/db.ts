import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Recreate the client if the cached instance is missing newer models
// (happens after a schema change + prisma generate while the dev server runs)
function createPrisma(): PrismaClient {
  return new PrismaClient({
    log: ['error', 'warn'],
  })
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma
  // Validate the cached client has the expected models; otherwise recreate
  if (cached && typeof (cached as any).coreWebVital === 'object') {
    return cached
  }
  const client = createPrisma()
  globalForPrisma.prisma = client
  return client
}

export const db = getPrisma()

if (process.env.NODE_ENV !== 'production') {
  // Keep the global in sync so HMR doesn't leak instances
  globalForPrisma.prisma = db
}
