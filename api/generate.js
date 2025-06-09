import express from 'express';

const router = express.Router();

// Mock 数据 - 生成的图片
const mockGeneratedImages = [
  {
    id: "gen_001",
    prompt: "一只可爱的小猫在花园里玩耍",
    imageUrl: "/images-mock/cat-default.png",
    status: "completed",
    createdAt: "2024-01-01T10:00:00Z",
    userId: "user_123",
    style: "cartoon"
  },
  {
    id: "gen_002", 
    prompt: "未来科技城市中的机器人",
    imageUrl: "/images-mock/robot-default.png",
    status: "completed",
    createdAt: "2024-01-01T11:00:00Z",
    userId: "user_123",
    style: "realistic"
  },
  {
    id: "gen_003",
    prompt: "神奇的独角兽在彩虹下",
    imageUrl: "/images-mock/unicorn-default.jpg",
    status: "completed",
    createdAt: "2024-01-01T12:00:00Z",
    userId: "user_456",
    style: "fantasy"
  },
  {
    id: "gen_004",
    prompt: "美丽的花朵在春天绽放",
    imageUrl: "/images-mock/flower-default.png",
    status: "processing",
    createdAt: "2024-01-01T13:00:00Z",
    userId: "user_789",
    style: "watercolor"
  }
];

// 获取生成历史
router.get('/history', (req, res) => {
  try {
    const { userId, page = '1', limit = '10', status, style } = req.query;
    
    let filteredImages = [...mockGeneratedImages];
    
    // 按用户筛选
    if (userId) {
      filteredImages = filteredImages.filter(img => img.userId === userId);
    }
    
    // 按状态筛选
    if (status) {
      filteredImages = filteredImages.filter(img => img.status === status);
    }
    
    // 按风格筛选
    if (style) {
      filteredImages = filteredImages.filter(img => img.style === style);
    }
    
    // 按时间倒序排列
    filteredImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedImages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredImages.length,
        totalPages: Math.ceil(filteredImages.length / limitNum)
      }
    });
  } catch (error) {
    console.error('Get Generated Images API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 创建新的图片生成请求
router.post('/text-to-image', (req, res) => {
  try {
    const { prompt, userId, style = 'default', size = 'medium' } = req.body;
    
    if (!prompt || !userId) {
      return res.status(400).json({
        success: false,
        error: 'Prompt and userId are required'
      });
    }
    
    // 验证提示词长度
    if (prompt.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be at least 5 characters long'
      });
    }
    
    if (prompt.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be less than 500 characters'
      });
    }
    
    // 模拟生成过程
    const newImage = {
      id: `gen_${Date.now()}`,
      prompt,
      imageUrl: null, // 初始为空，生成完成后会有URL
      status: "processing", // processing -> completed/failed
      createdAt: new Date().toISOString(),
      userId: userId,
      style,
      size,
      estimatedTime: 30 // 预估30秒完成
    };
    
    // 添加到生成列表
    mockGeneratedImages.push(newImage);
    
    // 模拟异步处理 - 3秒后变为完成状态
    setTimeout(() => {
      const imageIndex = mockGeneratedImages.findIndex(img => img.id === newImage.id);
      if (imageIndex !== -1) {
        // 随机选择一个图片作为生成结果
        const randomImages = [
          "/images-mock/cat-default.png",
          "/images-mock/robot-default.png",
          "/images-mock/unicorn-default.jpg",
          "/images-mock/flower-default.png",
          "/images-mock/cartoon-default.png",
          "/images-mock/magician-default.jpg"
        ];
        
        mockGeneratedImages[imageIndex].status = "completed";
        mockGeneratedImages[imageIndex].imageUrl = randomImages[Math.floor(Math.random() * randomImages.length)];
        mockGeneratedImages[imageIndex].completedAt = new Date().toISOString();
        
        console.log(`✅ 图片生成完成: ${newImage.id}`);
      }
    }, 3000);
    
    res.status(201).json({
      success: true,
      data: newImage,
      message: 'Image generation started successfully'
    });
  } catch (error) {
    console.error('Create Generate Request API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 图片转图片生成
router.post('/image-to-image', (req, res) => {
  try {
    const { userId, style = 'default', size = 'medium' } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'UserId is required'
      });
    }
    
    // 模拟生成过程
    const newImage = {
      id: `gen_${Date.now()}`,
      prompt: "基于上传图片的转换",
      imageUrl: null,
      status: "processing",
      createdAt: new Date().toISOString(),
      userId: userId,
      style,
      size,
      estimatedTime: 20
    };
    
    mockGeneratedImages.push(newImage);
    
    // 模拟异步处理
    setTimeout(() => {
      const imageIndex = mockGeneratedImages.findIndex(img => img.id === newImage.id);
      if (imageIndex !== -1) {
        const randomImages = [
          "/images-mock/cat-default.png",
          "/images-mock/robot-default.png",
          "/images-mock/unicorn-default.jpg"
        ];
        
        mockGeneratedImages[imageIndex].status = "completed";
        mockGeneratedImages[imageIndex].imageUrl = randomImages[Math.floor(Math.random() * randomImages.length)];
        mockGeneratedImages[imageIndex].completedAt = new Date().toISOString();
      }
    }, 2000);
    
    res.status(201).json({
      success: true,
      data: newImage,
      message: 'Image to image generation started successfully'
    });
  } catch (error) {
    console.error('Image to Image API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 获取单个生成任务状态
router.get('/status/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Generate ID is required'
      });
    }
    
    const generateTask = mockGeneratedImages.find(img => img.id === id);
    
    if (!generateTask) {
      return res.status(404).json({
        success: false,
        error: 'Generate task not found'
      });
    }
    
    res.json({
      success: true,
      data: generateTask
    });
  } catch (error) {
    console.error('Get Generate Status API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

// 获取生成统计
router.get('/stats', (req, res) => {
  try {
    const { userId } = req.query;
    
    let filteredImages = [...mockGeneratedImages];
    
    if (userId) {
      filteredImages = filteredImages.filter(img => img.userId === userId);
    }
    
    const stats = {
      total: filteredImages.length,
      completed: filteredImages.filter(img => img.status === 'completed').length,
      processing: filteredImages.filter(img => img.status === 'processing').length,
      failed: filteredImages.filter(img => img.status === 'failed').length,
      byStyle: {}
    };
    
    // 按风格统计
    filteredImages.forEach(img => {
      if (img.style) {
        stats.byStyle[img.style] = (stats.byStyle[img.style] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get Generate Stats API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error' 
    });
  }
});

export { router }; 