import 'server-only';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Prisma client singleton, or `null` when no database is configured.
 *
 * The platform runs in a demo mode without Postgres, so persistence is
 * best-effort: callers check for `null` and degrade gracefully rather than
 * crashing when `DATABASE_URL` is unset. The global cache avoids exhausting
 * connections across hot reloads in development.
 */
export const prisma: PrismaClient | null = process.env.DATABASE_URL
  ? (globalForPrisma.prisma ?? new PrismaClient())
  : null;

if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}
