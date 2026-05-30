import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // allow attaching to globalThis for dev hot-reload
  var __prismaClient: PrismaClient | undefined;
}

export const prisma = global.__prismaClient ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.__prismaClient = prisma;
