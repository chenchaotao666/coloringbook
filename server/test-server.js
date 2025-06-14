// 设置默认环境变量
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/coloring_book_db";
process.env.PORT = process.env.PORT || "3002";
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

const { errorResponse } = require('./src/utils/response');
const { ERROR_CODES } = require('./src/config/constants');

const app = express();
const PORT = process.env.PORT || 3002;

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
  max: 100, // 限制每个IP 15分钟内最多100个请求
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images-mock', express.static(path.join(__dirname, 'images-mock')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'Coloring Book API Server is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV
    }
  });
});

// 测试端点
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    data: {
      message: 'API 测试成功',
      endpoints: [
        'GET /health - 健康检查',
        'GET /api/test - API测试',
        'GET /images-mock/* - 预制图片',
        'POST /api/users/register - 用户注册',
        'POST /api/users/login - 用户登录',
        'GET /api/categories - 获取分类',
        'GET /api/images/query - 查询图片'
      ]
    }
  });
});

// 模拟分类端点
app.get('/api/categories', (req, res) => {
  res.json({
    status: 'success',
    data: {
      categories: [
        {
          id: '1',
          name: 'cartoon',
          displayName: '卡通动漫',
          description: '可爱的卡通角色和动漫人物涂色图',
          imageCount: 3,
          thumbnailUrl: '/images-mock/cartoon-default.png',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'animal',
          displayName: '动物世界',
          description: '各种可爱的动物涂色图',
          imageCount: 2,
          thumbnailUrl: '/images-mock/cat-default.png',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'nature',
          displayName: '自然风光',
          description: '美丽的花朵和自然景观涂色图',
          imageCount: 1,
          thumbnailUrl: '/images-mock/flower-default.png',
          createdAt: new Date().toISOString()
        }
      ]
    }
  });
});

// 模拟图片查询端点
app.get('/api/images/query', (req, res) => {
  res.json({
    status: 'success',
    data: {
      images: [
        {
          id: '1',
          name: 'spider-man-coloring',
          title: '蜘蛛侠涂色图',
          description: '经典的蜘蛛侠角色涂色图，适合超级英雄爱好者',
          defaultUrl: '/images-mock/spider-man-default.png',
          colorUrl: '/images-mock/spider-man-color.png',
          tags: ['superhero', 'spiderman', 'marvel'],
          ratio: '1:1',
          type: 'text2image',
          isPublic: true,
          size: '512,512',
          additionalInfo: '',
          category: {
            id: '1',
            name: 'cartoon',
            displayName: '卡通动漫'
          },
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        currentPage: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1
      }
    },
    total: 1
  });
});

// 404处理
app.use('*', (req, res) => {
  return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '接口不存在', 404);
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误处理:', error);
  return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 测试服务器运行在端口 ${PORT}`);
  console.log(`📖 健康检查: http://localhost:${PORT}/health`);
  console.log(`🧪 API测试: http://localhost:${PORT}/api/test`);
  console.log(`📂 分类列表: http://localhost:${PORT}/api/categories`);
  console.log(`🖼️ 图片查询: http://localhost:${PORT}/api/images/query`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('✅ 服务器启动成功！可以开始测试API了。');
});

module.exports = app; 