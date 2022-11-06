import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let client = (globalThis.prisma || undefined) as PrismaClient;
if (typeof window === 'undefined') {
  client = globalThis.prisma || new PrismaClient();
  if (!globalThis.prisma)
    client.$use(async (params, next) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);
      return result;
    });
  if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;
}

export { client };
export * from '@prisma/client';
