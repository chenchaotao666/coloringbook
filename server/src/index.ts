import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// 导入路由
import categoryRoutes from './routes/categoryRoutes';
import imageRoutes from './routes/imageRoutes';
import userRoutes from './routes/userRoutes';
import generateRoutes from './routes/generateRoutes';

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求日志
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 解析请求体
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'API服务器运行正常',
    version: '1.0.0'
  });
});

// API路由
app.use('/api/categories', categoryRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/generate', generateRoutes);

// 根路径 - API文档
app.get('/', (req, res) => {
  res.json({
    message: 'Coloring Book API Server',
    version: '1.0.0',
    environment: config.nodeEnv,
    endpoints: {
      health: '/health',
      categories: '/api/categories',
      images: '/api/images',
      users: '/api/users',
      generate: '/api/generate'
    },
    documentation: {
      categories: {
        'GET /api/categories': '获取所有分类',
        'GET /api/categories/:id': '获取单个分类详情',
        'POST /api/categories': '创建新分类',
        'PUT /api/categories/:id': '更新分类',
        'DELETE /api/categories/:id': '删除分类'
      },
      images: {
        'GET /api/images': '搜索图片，支持分页、搜索、筛选',
        'GET /api/images/category/:categoryId': '获取分类下的图片',
        'GET /api/images/:id': '获取单个图片详情',
        'DELETE /api/images/:id': '删除图片'
      },
      users: {
        'GET /api/users/:id': '获取用户信息',
        'PUT /api/users/:id': '更新用户信息',
        'GET /api/users/:id/favorites': '获取用户收藏',
        'POST /api/users/:id/favorites': '添加收藏',
        'DELETE /api/users/:id/favorites/:imageId': '删除收藏',
        'GET /api/users/:id/stats': '获取用户统计'
      },
      generate: {
        'POST /api/generate/text-to-image': '文本生成图片',
        'POST /api/generate/image-to-image': '图片转换',
        'GET /api/generate/status/:taskId': '查询生成状态'
      }
    }
  });
});

// 404处理
app.use('*', notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 优雅关闭处理
const server = app.listen(config.port, () => {
  console.log(`🚀 API服务器启动成功！`);
  console.log(`📍 服务地址: http://localhost:${config.port}`);
  console.log(`🏥 健康检查: http://localhost:${config.port}/health`);
  console.log(`📚 API文档: http://localhost:${config.port}/`);
  console.log(`🌍 环境: ${config.nodeEnv}`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
  console.log('');
  console.log('可用的API端点:');
  console.log('  GET  /health                         - 健康检查');
  console.log('  GET  /api/categories                 - 获取分类列表');
  console.log('  GET  /api/categories/:id             - 获取单个分类');
  console.log('  GET  /api/images                     - 搜索图片');
  console.log('  GET  /api/images/category/:categoryId - 获取分类图片');
  console.log('  GET  /api/images/:id                 - 获取单个图片');
  console.log('  POST /api/generate/text-to-image     - 文本生成图片');
  console.log('  POST /api/generate/image-to-image    - 图片转换');
  console.log('  GET  /api/users/:id                  - 获取用户信息');
  console.log('');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在优雅关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

export default app; 