// 设置默认环境变量
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/coloring_book_db";
process.env.PORT = process.env.PORT || "3008";
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
const PORT = process.env.PORT || 3008;

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

// 模拟图片列表端点 - 支持示例图片查询
app.get('/api/images', (req, res) => {
  const { type, isPublic, currentPage = '1', pageSize = '20' } = req.query;
  
  // 模拟图片数据
  const mockImages = [
    // text2image 类型图片 (12张)
    {
      id: 'spiderman_1',
      name: 'spiderman-coloring',
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
      category: { id: '1', name: 'cartoon', displayName: '卡通动漫' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'robot_1',
      name: 'robot-coloring',
      title: '机器人涂色图',
      description: '未来感十足的机器人涂色图',
      defaultUrl: '/images-mock/robot-default.png',
      colorUrl: '/images-mock/robot-color.png',
      tags: ['robot', 'future', 'technology'],
      ratio: '1:1',
      type: 'text2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '1', name: 'cartoon', displayName: '卡通动漫' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'princess_1',
      name: 'princess-coloring',
      title: '公主涂色图',
      description: '美丽的公主涂色图，适合小朋友',
      defaultUrl: '/images-mock/princess-default.png',
      colorUrl: '/images-mock/princess-color.png',
      tags: ['princess', 'fairy tale', 'girl'],
      ratio: '3:4',
      type: 'text2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '1', name: 'cartoon', displayName: '卡通动漫' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'dragon_1',
      name: 'dragon-coloring',
      title: '龙涂色图',
      description: '威武的龙涂色图，充满神秘色彩',
      defaultUrl: '/images-mock/dragon-default.png',
      colorUrl: '/images-mock/dragon-color.png',
      tags: ['dragon', 'fantasy', 'mythical'],
      ratio: '4:3',
      type: 'text2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '4', name: 'fantasy', displayName: '奇幻世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'castle_1',
      name: 'castle-coloring',
      title: '城堡涂色图',
      description: '童话般的城堡涂色图',
      defaultUrl: '/images-mock/castle-default.png',
      colorUrl: '/images-mock/castle-color.png',
      tags: ['castle', 'fairy tale', 'architecture'],
      ratio: '3:4',
      type: 'text2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '4', name: 'fantasy', displayName: '奇幻世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'car_1',
      name: 'car-coloring',
      title: '汽车涂色图',
      description: '酷炫的汽车涂色图，适合车迷',
      defaultUrl: '/images-mock/car-default.png',
      colorUrl: '/images-mock/car-color.png',
      tags: ['car', 'vehicle', 'transport'],
      ratio: '4:3',
      type: 'text2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '5', name: 'vehicle', displayName: '交通工具' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'airplane_1',
      name: 'airplane-coloring',
      title: '飞机涂色图',
      description: '翱翔天空的飞机涂色图',
      defaultUrl: '/images-mock/airplane-default.png',
      colorUrl: '/images-mock/airplane-color.png',
      tags: ['airplane', 'vehicle', 'sky'],
      ratio: '4:3',
      type: 'text2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '5', name: 'vehicle', displayName: '交通工具' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'house_1',
      name: 'house-coloring',
      title: '房子涂色图',
      description: '温馨的房子涂色图',
      defaultUrl: '/images-mock/house-default.png',
      colorUrl: '/images-mock/house-color.png',
      tags: ['house', 'home', 'building'],
      ratio: '3:4',
      type: 'text2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '6', name: 'building', displayName: '建筑物' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'tree_1',
      name: 'tree-coloring',
      title: '大树涂色图',
      description: '茂盛的大树涂色图',
      defaultUrl: '/images-mock/tree-default.png',
      colorUrl: '/images-mock/tree-color.png',
      tags: ['tree', 'nature', 'plant'],
      ratio: '3:4',
      type: 'text2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '3', name: 'nature', displayName: '自然风光' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'sun_1',
      name: 'sun-coloring',
      title: '太阳涂色图',
      description: '温暖的太阳涂色图',
      defaultUrl: '/images-mock/sun-default.png',
      colorUrl: '/images-mock/sun-color.png',
      tags: ['sun', 'nature', 'weather'],
      ratio: '1:1',
      type: 'text2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '3', name: 'nature', displayName: '自然风光' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'star_1',
      name: 'star-coloring',
      title: '星星涂色图',
      description: '闪亮的星星涂色图',
      defaultUrl: '/images-mock/star-default.png',
      colorUrl: '/images-mock/star-color.png',
      tags: ['star', 'space', 'night'],
      ratio: '1:1',
      type: 'text2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '7', name: 'space', displayName: '太空宇宙' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'rocket_1',
      name: 'rocket-coloring',
      title: '火箭涂色图',
      description: '探索太空的火箭涂色图',
      defaultUrl: '/images-mock/rocket-default.png',
      colorUrl: '/images-mock/rocket-color.png',
      tags: ['rocket', 'space', 'exploration'],
      ratio: '3:4',
      type: 'text2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '7', name: 'space', displayName: '太空宇宙' },
      createdAt: new Date().toISOString()
    },

    // image2image 类型图片 (12张)
    {
      id: 'unicorn_1',
      name: 'unicorn-coloring',
      title: '独角兽涂色图',
      description: '梦幻的独角兽涂色图，适合喜欢童话的朋友',
      defaultUrl: '/images-mock/unicorn-default.png',
      colorUrl: '/images-mock/unicorn-color.png',
      tags: ['fantasy', 'unicorn', 'magic'],
      ratio: '1:1',
      type: 'image2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '1', name: 'cartoon', displayName: '卡通动漫' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'cat_1',
      name: 'cat-coloring',
      title: '小猫涂色图',
      description: '可爱的小猫涂色图，适合动物爱好者',
      defaultUrl: '/images-mock/cat-default.png',
      colorUrl: '/images-mock/cat-color.png',
      tags: ['animal', 'cat', 'cute'],
      ratio: '1:1',
      type: 'image2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'flower_1',
      name: 'flower-coloring',
      title: '花朵涂色图',
      description: '美丽的花朵涂色图，适合自然爱好者',
      defaultUrl: '/images-mock/flower-default.png',
      colorUrl: '/images-mock/flower-color.png',
      tags: ['nature', 'flower', 'beautiful'],
      ratio: '1:1',
      type: 'image2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '3', name: 'nature', displayName: '自然风光' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'dog_1',
      name: 'dog-coloring',
      title: '小狗涂色图',
      description: '忠诚的小狗涂色图',
      defaultUrl: '/images-mock/dog-default.png',
      colorUrl: '/images-mock/dog-color.png',
      tags: ['animal', 'dog', 'pet'],
      ratio: '4:3',
      type: 'image2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'butterfly_1',
      name: 'butterfly-coloring',
      title: '蝴蝶涂色图',
      description: '美丽的蝴蝶涂色图',
      defaultUrl: '/images-mock/butterfly-default.png',
      colorUrl: '/images-mock/butterfly-color.png',
      tags: ['animal', 'butterfly', 'insect'],
      ratio: '4:3',
      type: 'image2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'fish_1',
      name: 'fish-coloring',
      title: '鱼儿涂色图',
      description: '游泳的鱼儿涂色图',
      defaultUrl: '/images-mock/fish-default.png',
      colorUrl: '/images-mock/fish-color.png',
      tags: ['animal', 'fish', 'ocean'],
      ratio: '4:3',
      type: 'image2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'bird_1',
      name: 'bird-coloring',
      title: '小鸟涂色图',
      description: '自由飞翔的小鸟涂色图',
      defaultUrl: '/images-mock/bird-default.png',
      colorUrl: '/images-mock/bird-color.png',
      tags: ['animal', 'bird', 'fly'],
      ratio: '3:4',
      type: 'image2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'elephant_1',
      name: 'elephant-coloring',
      title: '大象涂色图',
      description: '温和的大象涂色图',
      defaultUrl: '/images-mock/elephant-default.png',
      colorUrl: '/images-mock/elephant-color.png',
      tags: ['animal', 'elephant', 'big'],
      ratio: '4:3',
      type: 'image2image',
      isPublic: true,
      size: '680,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'lion_1',
      name: 'lion-coloring',
      title: '狮子涂色图',
      description: '威武的狮子涂色图',
      defaultUrl: '/images-mock/lion-default.png',
      colorUrl: '/images-mock/lion-color.png',
      tags: ['animal', 'lion', 'wild'],
      ratio: '1:1',
      type: 'image2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'bear_1',
      name: 'bear-coloring',
      title: '熊涂色图',
      description: '可爱的熊涂色图',
      defaultUrl: '/images-mock/bear-default.png',
      colorUrl: '/images-mock/bear-color.png',
      tags: ['animal', 'bear', 'forest'],
      ratio: '3:4',
      type: 'image2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'rabbit_1',
      name: 'rabbit-coloring',
      title: '兔子涂色图',
      description: '蹦蹦跳跳的兔子涂色图',
      defaultUrl: '/images-mock/rabbit-default.png',
      colorUrl: '/images-mock/rabbit-color.png',
      tags: ['animal', 'rabbit', 'cute'],
      ratio: '3:4',
      type: 'image2image',
      isPublic: true,
      size: '512,680',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    },
    {
      id: 'owl_1',
      name: 'owl-coloring',
      title: '猫头鹰涂色图',
      description: '智慧的猫头鹰涂色图',
      defaultUrl: '/images-mock/owl-default.png',
      colorUrl: '/images-mock/owl-color.png',
      tags: ['animal', 'owl', 'wise'],
      ratio: '1:1',
      type: 'image2image',
      isPublic: true,
      size: '512,512',
      additionalInfo: '',
      category: { id: '2', name: 'animal', displayName: '动物世界' },
      createdAt: new Date().toISOString()
    }
  ];

  // 根据查询参数筛选图片
  let filteredImages = mockImages;
  
  if (type) {
    filteredImages = filteredImages.filter(img => img.type === type);
  }
  
  if (isPublic !== undefined) {
    const isPublicBool = isPublic === 'true';
    filteredImages = filteredImages.filter(img => img.isPublic === isPublicBool);
  }

  // 分页处理
  const page = parseInt(currentPage);
  const limit = parseInt(pageSize);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedImages = filteredImages.slice(startIndex, endIndex);

  res.json({
    status: 'success',
    data: {
      images: paginatedImages,
      total: filteredImages.length
    }
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