const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// 数据库连接测试
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 优雅关闭数据库连接
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 数据库连接已关闭');
}

module.exports = {
  prisma,
  connectDatabase,
  disconnectDatabase
}; 