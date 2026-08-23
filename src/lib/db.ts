import { PrismaClient } from '@prisma/client'

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
    log: ['error'],
  })
}

function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma
  if (cached && hasAllModels(cached)) {
    return cached
  }
  const client = createPrisma()
  globalForPrisma.prisma = client
  return client
}

export const db = getPrisma()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
