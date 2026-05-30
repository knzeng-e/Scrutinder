import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Neon free tier terminates idle connections (E57P01 admin_shutdown).
// Prisma reconnects automatically on the next query - the error logged is
// cosmetic. Add ?connect_timeout=10 to DATABASE_URL to reduce cold-start
// latency on the first connection after Neon suspends.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
