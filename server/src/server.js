// 首先加载环境变量
require('dotenv').config();

// 设置默认环境变量（只在未设置时生效）
process.env.PORT = process.env.PORT || "3001";
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.JWT_SECRET = process.env.JWT_SECRET || "coloring-book-super-secret-jwt-key-2024";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "coloring-book-super-secret-refresh-key-2024";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const { connectDatabase, disconnectDatabase } = require('./config/database');
const { errorResponse } = require('./utils/response');
const { ERROR_CODES } = require('./config/constants');

// 导入路由
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// 请求日志
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10000, // 限制每个IP 15分钟内最多100个请求
  message: {
    status: 'fail',
    errorCode: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', limiter);

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/images-mock', express.static(path.join(__dirname, '../images-mock')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Coloring Book API Server is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
  });
});

// API路由
app.use('/api/users', userRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tasks', taskRoutes);

// 404处理
app.use('*', (req, res) => {
  return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '接口不存在', 404);
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误处理:', error);

  // Prisma错误处理
  if (error.code === 'P2002') {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '数据已存在，请检查输入', 409);
  }

  if (error.code === 'P2025') {
    return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '记录不存在', 404);
  }

  // 默认错误响应
  return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
});

// 启动服务器
async function startServer() {
  try {
    // 连接数据库
    await connectDatabase();

    // 启动服务器
    const server = app.listen(PORT, () => {
      console.log(`🚀 服务器运行在端口 ${PORT}`);
      console.log(`📖 API文档: http://localhost:${PORT}/health`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
    });

    // 优雅关闭
    process.on('SIGTERM', async () => {
      console.log('收到SIGTERM信号，开始优雅关闭...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('收到SIGINT信号，开始优雅关闭...');
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动应用
startServer();

module.exports = app; 