import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入各个API模块
import { router as imagesRouter } from './images.js';
import { router as categoriesRouter } from './categories.js';
import { router as generateRouter } from './generate.js';
import { router as usersRouter } from './users.js';

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'API服务器运行正常'
  });
});

// API路由
app.use('/api/images', imagesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/generate', generateRouter);
app.use('/api/users', usersRouter);

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: 'Coloring Book API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      images: '/api/images',
      categories: '/api/categories',
      generate: '/api/generate',
      users: '/api/users'
    },
    documentation: {
      images: {
        'GET /api/images': '获取图片列表，支持分页、搜索、筛选',
        'GET /api/images/:id': '获取单个图片详情',
        'PUT /api/images/:id': '更新图片信息'
      },
      categories: {
        'GET /api/categories': '获取所有分类',
        'GET /api/categories/:id': '获取单个分类详情',
        'POST /api/categories': '创建新分类',
        'PUT /api/categories/:id': '更新分类',
        'DELETE /api/categories/:id': '删除分类'
      },
      generate: {
        'POST /api/generate/text-to-image': '文本生成图片',
        'POST /api/generate/image-to-image': '图片转换',
        'GET /api/generate/status/:taskId': '查询生成状态',
        'GET /api/generate/history': '获取生成历史',
        'GET /api/generate/stats': '获取生成统计'
      },
      users: {
        'GET /api/users/:id': '获取用户信息',
        'PUT /api/users/:id': '更新用户信息',
        'GET /api/users/:id/favorites': '获取用户收藏',
        'POST /api/users/:id/favorites': '添加收藏',
        'DELETE /api/users/:id/favorites/:imageId': '删除收藏',
        'GET /api/users/:id/stats': '获取用户统计'
      }
    }
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API端点不存在',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  // 如果响应已经发送，则交给默认的Express错误处理器
  if (res.headersSent) {
    return next(err);
  }
  
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试',
    timestamp: new Date().toISOString()
  });
});

// 优雅关闭处理
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

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`🚀 API服务器启动成功！`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
  console.log(`📚 API文档: http://localhost:${PORT}/`);
  console.log(`⏰ 启动时间: ${new Date().toISOString()}`);
  console.log('');
  console.log('可用的API端点:');
  console.log('  GET  /health                    - 健康检查');
  console.log('  GET  /api/categories            - 获取分类列表');
  console.log('  GET  /api/categories/:id        - 获取单个分类');
  console.log('  GET  /api/images                - 获取图片列表');
  console.log('  GET  /api/images/:id            - 获取单个图片');
  console.log('  POST /api/generate/text-to-image - 文本生成图片');
  console.log('  POST /api/generate/image-to-image - 图片转换');
  console.log('  GET  /api/users/:id             - 获取用户信息');
  console.log('');
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