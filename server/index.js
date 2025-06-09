const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// 模拟数据存储
let generatedImages = [];
let taskStore = new Map();

// 工具函数
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const generateTaskId = () => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createMockImage = (prompt, ratio = '3:4') => {
  const id = generateId();
  const randomId = Math.floor(Math.random() * 1000);
  return {
    id,
    url: `https://picsum.photos/90/90?random=${randomId}`,
    fullSizeUrl: `https://picsum.photos/460/460?random=${randomId}`,
    thumbnailUrl: `https://picsum.photos/90/90?random=${randomId}`,
    createdAt: new Date().toISOString(),
    prompt,
    ratio,
    isPublic: true,
  };
};

// 示例数据
const exampleImages = {
  text: [
    {
      id: 'text-1',
      url: 'https://picsum.photos/250/250?random=11',
      fullSizeUrl: 'https://picsum.photos/460/460?random=11',
      category: 'text',
      prompt: 'A friendly dragon breathing colorful flowers',
    },
    {
      id: 'text-2',
      url: 'https://picsum.photos/250/250?random=12',
      fullSizeUrl: 'https://picsum.photos/460/460?random=12',
      category: 'text',
      prompt: 'Princess in a magical forest',
    },
    {
      id: 'text-3',
      url: 'https://picsum.photos/250/250?random=13',
      fullSizeUrl: 'https://picsum.photos/460/460?random=13',
      category: 'text',
      prompt: 'Superhero flying through the city',
    },
  ],
  image: [
    {
      id: 'image-1',
      url: 'https://picsum.photos/250/250?random=21',
      fullSizeUrl: 'https://picsum.photos/460/460?random=21',
      category: 'image',
    },
    {
      id: 'image-2',
      url: 'https://picsum.photos/250/250?random=22',
      fullSizeUrl: 'https://picsum.photos/460/460?random=22',
      category: 'image',
    },
    {
      id: 'image-3',
      url: 'https://picsum.photos/250/250?random=23',
      fullSizeUrl: 'https://picsum.photos/460/460?random=23',
      category: 'image',
    },
  ],
};

const styleSuggestions = [
  { id: '1', name: 'Traditional', category: 'classic' },
  { id: '2', name: 'Realistic', category: 'classic' },
  { id: '3', name: 'Watercolour', category: 'artistic' },
  { id: '4', name: 'Geometry', category: 'modern' },
  { id: '5', name: 'American', category: 'regional' },
  { id: '6', name: 'Minimalism', category: 'modern' },
  { id: '7', name: 'Cartoon', category: 'fun' },
  { id: '8', name: 'Vintage', category: 'classic' },
  { id: '9', name: 'Abstract', category: 'artistic' },
  { id: '10', name: 'Mandala', category: 'spiritual' },
];

// API 路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 文本转图片生成
app.post('/api/generate/text-to-image', async (req, res) => {
  try {
    const { prompt, ratio, isPublic, style } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required',
      });
    }
    
    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const taskId = generateTaskId();
    const images = Array.from({ length: 5 }, () => createMockImage(prompt, ratio));
    
    // 存储生成的图片
    generatedImages.push(...images);
    
    // 设置任务状态
    taskStore.set(taskId, {
      status: 'completed',
      progress: 100,
      images,
    });
    
    res.json({
      success: true,
      data: {
        images,
        taskId,
      },
      message: 'Images generated successfully',
    });
  } catch (error) {
    console.error('Text to image generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 图片转图片生成
app.post('/api/generate/image-to-image', upload.single('image'), async (req, res) => {
  try {
    const { ratio, isPublic } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required',
      });
    }
    
    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const taskId = generateTaskId();
    const images = Array.from({ length: 4 }, () => createMockImage('Image transformation', ratio));
    
    // 存储生成的图片
    generatedImages.push(...images);
    
    // 设置任务状态
    taskStore.set(taskId, {
      status: 'completed',
      progress: 100,
      images,
    });
    
    // 清理上传的文件
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });
    
    res.json({
      success: true,
      data: {
        images,
        taskId,
      },
      message: 'Images generated successfully from uploaded image',
    });
  } catch (error) {
    console.error('Image to image generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 获取示例图片
app.get('/api/examples/:category', (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['text', 'image'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be "text" or "image"',
      });
    }
    
    res.json(exampleImages[category]);
  } catch (error) {
    console.error('Get examples error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 获取风格建议
app.get('/api/styles/suggestions', (req, res) => {
  try {
    // 随机返回6个风格建议
    const shuffled = [...styleSuggestions].sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 6);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Get style suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 下载图片
app.get('/api/download/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { format = 'png' } = req.query;
    
    // 查找图片
    const image = generatedImages.find(img => img.id === imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }
    
    // 模拟下载延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 创建一个简单的1x1像素图片作为示例
    const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const buffer = Buffer.from(base64Data, 'base64');
    
    res.setHeader('Content-Type', format === 'pdf' ? 'application/pdf' : 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="coloring-page-${imageId}.${format}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 获取任务状态
app.get('/api/tasks/:taskId/status', (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = taskStore.get(taskId);
    if (!task) {
      return res.status(404).json({
        status: 'failed',
        progress: 0,
        error: 'Task not found',
      });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Get task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 重新创建示例图片
app.post('/api/examples/:exampleId/recreate', async (req, res) => {
  try {
    const { exampleId } = req.params;
    
    // 查找示例图片
    const textExample = exampleImages.text.find(img => img.id === exampleId);
    const imageExample = exampleImages.image.find(img => img.id === exampleId);
    const example = textExample || imageExample;
    
    if (!example) {
      return res.status(404).json({
        success: false,
        message: 'Example not found',
      });
    }
    
    // 模拟生成延迟
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    const taskId = generateTaskId();
    const prompt = example.prompt || 'Recreated from example';
    const images = Array.from({ length: 5 }, () => createMockImage(prompt, '3:4'));
    
    // 存储生成的图片
    generatedImages.push(...images);
    
    // 设置任务状态
    taskStore.set(taskId, {
      status: 'completed',
      progress: 100,
      images,
    });
    
    res.json({
      success: true,
      data: {
        images,
        taskId,
      },
      message: 'Example recreated successfully',
    });
  } catch (error) {
    console.error('Recreate example error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 获取所有生成的图片
app.get('/api/images', (req, res) => {
  try {
    res.json(generatedImages);
  } catch (error) {
    console.error('Get all images error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Coloring Book API Server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
}); 