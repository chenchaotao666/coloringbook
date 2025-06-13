import { PrismaClient } from '@prisma/client';

// 创建全局Prisma客户端实例
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// 在开发环境中重用连接，避免热重载时创建过多连接
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env['NODE_ENV'] === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env['NODE_ENV'] === 'development') {
  globalThis.__prisma = prisma;
}

// 优雅关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma }; 