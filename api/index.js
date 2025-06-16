// Vercel API 入口文件
const path = require('path');

// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// 确保数据库连接在 Vercel 环境中正确初始化
async function initializeDatabase() {
  try {
    const { connectDatabase } = require('../server/src/config/database');
    await connectDatabase();
    console.log('✅ 数据库连接成功 (Vercel)');
  } catch (error) {
    console.error('❌ 数据库连接失败 (Vercel):', error);
  }
}

// 在 Vercel 环境中初始化数据库
if (process.env.VERCEL) {
  initializeDatabase();
}

// 导入服务器应用
const app = require('../server/src/server');

// 导出为 Vercel 函数
module.exports = app; 