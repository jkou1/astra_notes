import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // allow attaching to globalThis for dev hot-reload
  var __prismaClient: PrismaClient | undefined;
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to initialize Prisma Client.');
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });

  return new PrismaClient({ adapter });
}

export const prisma = global.__prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') global.__prismaClient = prisma;
