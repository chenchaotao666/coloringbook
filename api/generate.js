import express from 'express';
import multer from 'multer';

const router = express.Router();

// 存储生成任务的状态
const generationTasks = new Map();

// Mock 数据 - 生成的图片
const mockGeneratedImages = [];

// 配置multer用于处理文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// 文本生成图片接口
router.post('/text-to-image', (req, res) => {
  try {
    const { prompt, ratio, isPublic, style, userId } = req.body;
    
    // 验证必需参数
    if (!prompt || !ratio || typeof isPublic !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: prompt, ratio, and isPublic are required'
      });
    }
    
    // 验证ratio值
    const validRatios = ['3:4', '4:3', '1:1'];
    if (!validRatios.includes(ratio)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid ratio. Must be one of: 3:4, 4:3, 1:1'
      });
    }
    
    if (prompt.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Prompt must be less than 500 characters'
      });
    }
    
    // 生成任务ID和图片ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newImageId = `gen_text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建新图片对象
    const newImage = {
      id: newImageId,
      name: newImageId,
      defaultUrl: `/images-mock/flower-default.png`,
      colorUrl: `/images-mock/flower-color.png`,
      title: prompt.length > 50 ? prompt.substring(0, 50) + '...' : prompt,
      description: prompt,
      tags: ['Generated', 'AI', 'Text2Image'],
      type: 'text2image',
      ratio: ratio,
      isPublic: isPublic,
      createdAt: new Date().toISOString(),
      prompt: prompt,
      userId: userId || 'anonymous',
      category: 'generated',
      style: style || 'default',
      status: 'processing', // 初始状态为处理中
      additionalInfo: {
        features: [
          'AI生成的图片，基于文本描述',
          '高质量的涂色页设计',
          '适合各年龄段用户',
          '支持多种风格选择'
        ],
        suitableFor: [
          '创意涂色：发挥想象力进行个性化涂色',
          '艺术学习：学习不同的绘画风格和技巧',
          '休闲娱乐：放松身心的涂色活动',
          '教育用途：结合学习内容的涂色练习'
        ],
        coloringSuggestions: [
          '根据生成内容选择合适的颜色搭配',
          '可以尝试不同的色彩风格',
          '注意明暗对比和色彩层次',
          '发挥创意，不局限于现实色彩'
        ],
        creativeUses: [
          '个人收藏：保存喜欢的AI生成作品',
          '分享交流：与朋友分享创意涂色',
          '学习参考：作为绘画学习的参考素材',
          '装饰用途：完成后可用于装饰空间'
        ]
      }
    };
    
    // 创建任务状态记录
    const taskInfo = {
      taskId: taskId,
      imageId: newImageId,
      status: 'processing',
      progress: 0,
      type: 'text2image',
      prompt: prompt,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      estimatedTime: 30, // 预估30秒完成
      image: null // 完成后会包含图片数据
    };
    
    // 存储任务状态
    generationTasks.set(taskId, taskInfo);
    
    // 添加到图片数组（模拟保存）
    mockGeneratedImages.push(newImage);
    
    // 模拟异步处理 - 渐进式更新进度
    const progressSteps = [10, 30, 50, 70, 90, 100];
    let stepIndex = 0;
    
    const updateProgress = () => {
      const task = generationTasks.get(taskId);
      if (task && stepIndex < progressSteps.length) {
        task.progress = progressSteps[stepIndex];
        
        if (progressSteps[stepIndex] === 100) {
          // 完成生成
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          task.image = newImage;
          
          // 更新图片状态
          const imageIndex = mockGeneratedImages.findIndex(img => img.id === newImageId);
          if (imageIndex !== -1) {
            mockGeneratedImages[imageIndex].status = 'completed';
          }
          
          console.log(`✅ 文本生成图片完成: ${newImageId} (任务: ${taskId})`);
        } else {
          // 继续下一步
          stepIndex++;
          setTimeout(updateProgress, 500);
        }
      }
    };
    
    // 开始进度更新
    setTimeout(updateProgress, 500);
    
    res.status(201).json({
      success: true,
      data: {
        taskId: taskId,
        imageId: newImageId,
        status: 'processing',
        progress: 0,
        estimatedTime: 30
      },
      message: 'Text to image generation started successfully'
    });
  } catch (error) {
    console.error('Text to Image Generation API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// 图片转图片生成接口
router.post('/image-to-image', upload.single('image'), (req, res) => {
  console.log('into image-to-image', req.body);
  try {
    const { ratio, isPublic, userId } = req.body;
    const imageFile = req.file;
    
    // 验证必需参数
    if (!imageFile || typeof isPublic !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: image file and isPublic are required'
      });
    }
    
    // 验证ratio值（可选）
    if (ratio) {
      const validRatios = ['3:4', '4:3', '1:1'];
      if (!validRatios.includes(ratio)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ratio. Must be one of: 3:4, 4:3, 1:1'
        });
      }
    }
    
    // 生成任务ID和图片ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newImageId = `gen_img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 创建新图片对象
    const newImage = {
      id: newImageId,
      name: newImageId,
      defaultUrl: `/images-mock/cat-default.png`,
      colorUrl: `/images-mock/cat-color.png`,
      title: `基于 ${imageFile.originalname} 的转换`,
      description: `基于上传图片 "${imageFile.originalname}" 生成的涂色页`,
      tags: ['Generated', 'AI', 'Image2Image', 'Converted'],
      type: 'image2image',
      ratio: ratio || '1:1',
      isPublic: isPublic,
      createdAt: new Date().toISOString(),
      prompt: `基于上传图片的转换: ${imageFile.originalname}`,
      userId: userId || 'anonymous',
      category: 'generated',
      originalFileName: imageFile.originalname,
      status: 'processing', // 初始状态为处理中
      additionalInfo: {
        features: [
          'AI图片转换技术，保持原图特征',
          '自动生成适合涂色的线条图',
          '保留原图的主要构图和元素',
          '优化线条清晰度和涂色适用性'
        ],
        suitableFor: [
          '个性化涂色：将喜欢的图片转为涂色页',
          '照片转换：将照片转为艺术涂色作品',
          '创意改造：给现有图片赋予新的艺术形式',
          '学习练习：基于真实图片进行涂色练习'
        ],
        coloringSuggestions: [
          '参考原图的色彩搭配',
          '可以尝试与原图不同的色彩风格',
          '注意保持图片的整体协调性',
          '发挥创意，创造独特的色彩效果'
        ],
        creativeUses: [
          '个人纪念：将珍贵照片转为涂色纪念品',
          '艺术创作：结合涂色创造新的艺术作品',
          '教学工具：用于美术教学和色彩练习',
          '礼品制作：制作独特的个性化礼品'
        ]
      }
    };
    
    // 创建任务状态记录
    const taskInfo = {
      taskId: taskId,
      imageId: newImageId,
      status: 'processing',
      progress: 0,
      type: 'image2image',
      prompt: `基于上传图片的转换: ${imageFile.originalname}`,
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      estimatedTime: 20, // 预估20秒完成
      originalFileName: imageFile.originalname,
      image: null // 完成后会包含图片数据
    };
    
    // 存储任务状态
    generationTasks.set(taskId, taskInfo);
    
    // 添加到图片数组（模拟保存）
    mockGeneratedImages.push(newImage);
    
    // 模拟异步处理 - 渐进式更新进度
    const progressSteps = [20, 40, 60, 80, 100];
    let stepIndex = 0;
    
    const updateProgress = () => {
      const task = generationTasks.get(taskId);
      if (task && stepIndex < progressSteps.length) {
        task.progress = progressSteps[stepIndex];
        
        if (progressSteps[stepIndex] === 100) {
          // 完成生成
          task.status = 'completed';
          task.completedAt = new Date().toISOString();
          task.image = newImage;
          
          // 更新图片状态
          const imageIndex = mockGeneratedImages.findIndex(img => img.id === newImageId);
          if (imageIndex !== -1) {
            mockGeneratedImages[imageIndex].status = 'completed';
          }
          
          console.log(`✅ 图片转换完成: ${newImageId} (任务: ${taskId})`);
        } else {
          // 继续下一步
          stepIndex++;
          setTimeout(updateProgress, 400);
        }
      }
    };
    
    // 开始进度更新
    setTimeout(updateProgress, 400);
    
    res.status(201).json({
      success: true,
      data: {
        taskId: taskId,
        imageId: newImageId,
        status: 'processing',
        progress: 0,
        estimatedTime: 20
      },
      message: 'Image to image generation started successfully'
    });
  } catch (error) {
    console.error('Image to Image Generation API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// 查询生成任务状态接口
router.get('/status/:taskId', (req, res) => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
    }
    
    const taskInfo = generationTasks.get(taskId);
    
    if (!taskInfo) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }
    
    // 构建响应数据
    const responseData = {
      taskId: taskInfo.taskId,
      imageId: taskInfo.imageId,
      status: taskInfo.status,
      progress: taskInfo.progress,
      type: taskInfo.type,
      prompt: taskInfo.prompt,
      userId: taskInfo.userId,
      createdAt: taskInfo.createdAt,
      estimatedTime: taskInfo.estimatedTime
    };
    
    // 如果任务完成，包含完整的图片数据
    if (taskInfo.status === 'completed' && taskInfo.image) {
      responseData.image = taskInfo.image;
      responseData.completedAt = taskInfo.completedAt;
    }
    
    // 如果是图片转换任务，包含原始文件名
    if (taskInfo.originalFileName) {
      responseData.originalFileName = taskInfo.originalFileName;
    }
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get Task Status API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// 获取用户的所有生成任务
router.get('/tasks', (req, res) => {
  try {
    const { userId, status, type, page = '1', limit = '10' } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'UserId is required'
      });
    }
    
    // 获取所有任务并转换为数组
    let userTasks = Array.from(generationTasks.values())
      .filter(task => task.userId === userId);
    
    // 按状态筛选
    if (status) {
      userTasks = userTasks.filter(task => task.status === status);
    }
    
    // 按类型筛选
    if (type) {
      userTasks = userTasks.filter(task => task.type === type);
    }
    
    // 按创建时间倒序排列
    userTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedTasks = userTasks.slice(startIndex, endIndex);
    
    // 构建响应数据
    const responseData = paginatedTasks.map(task => {
      const taskData = {
        taskId: task.taskId,
        imageId: task.imageId,
        status: task.status,
        progress: task.progress,
        type: task.type,
        prompt: task.prompt,
        createdAt: task.createdAt,
        estimatedTime: task.estimatedTime
      };
      
      if (task.status === 'completed' && task.completedAt) {
        taskData.completedAt = task.completedAt;
      }
      
      if (task.originalFileName) {
        taskData.originalFileName = task.originalFileName;
      }
      
      return taskData;
    });
    
    res.json({
      success: true,
      data: responseData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: userTasks.length,
        totalPages: Math.ceil(userTasks.length / limitNum),
        hasMore: endIndex < userTasks.length
      },
      stats: {
        total: userTasks.length,
        processing: userTasks.filter(task => task.status === 'processing').length,
        completed: userTasks.filter(task => task.status === 'completed').length,
        failed: userTasks.filter(task => task.status === 'failed').length,
        text2image: userTasks.filter(task => task.type === 'text2image').length,
        image2image: userTasks.filter(task => task.type === 'image2image').length
      }
    });
  } catch (error) {
    console.error('Get User Tasks API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// 获取用户生成历史 - 调用images API获取用户生成的图片
router.get('/history', async (req, res) => {
  try {
    const { userId, page = '1', limit = '10', status, style, type } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'UserId is required'
      });
    }
    
    // 首先从本地mock数据获取生成记录
    let generatedRecords = [...mockGeneratedImages];
    
    // 按用户筛选
    generatedRecords = generatedRecords.filter(img => img.userId === userId);
    
    // 按状态筛选
    if (status) {
      generatedRecords = generatedRecords.filter(img => img.status === status);
    }
    
    // 按风格筛选
    if (style) {
      generatedRecords = generatedRecords.filter(img => img.style === style);
    }
    
    // 调用images API获取用户的图片数据
    try {
      const imagesApiUrl = `http://localhost:3001/api/images?userId=${userId}&limit=100`;
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(imagesApiUrl);
      const imagesData = await response.json();
      
      if (imagesData.success && imagesData.data.length > 0) {
        // 将images API的数据转换为生成历史格式
        const imageHistoryRecords = imagesData.data.map(img => ({
          id: `img_${img.id}`,
          prompt: img.prompt || img.description || img.title,
          imageUrl: img.defaultUrl,
          fullSizeUrl: img.colorUrl,
          thumbnailUrl: img.defaultUrl,
          status: "completed",
          createdAt: img.createdAt || new Date().toISOString(),
          userId: img.userId,
          style: img.type || 'default',
          type: img.type || 'text2image',
          title: img.title,
          description: img.description,
          tags: img.tags || [],
          ratio: img.ratio || '1:1',
          category: img.category,
          isFromImagesApi: true // 标记来源
        }));
        
        // 按类型筛选（如果指定了type参数）
        const filteredImageRecords = type ? 
          imageHistoryRecords.filter(img => img.type === type) : 
          imageHistoryRecords;
        
        // 合并两个数据源
        generatedRecords = [...generatedRecords, ...filteredImageRecords];
      }
    } catch (apiError) {
      console.warn('Failed to fetch from images API:', apiError.message);
      // 如果API调用失败，继续使用本地数据
    }
    
    // 按时间倒序排列
    generatedRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 10));
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedImages = generatedRecords.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedImages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: generatedRecords.length,
        totalPages: Math.ceil(generatedRecords.length / limitNum),
        hasMore: endIndex < generatedRecords.length
      },
      // 添加统计信息
      stats: {
        total: generatedRecords.length,
        completed: generatedRecords.filter(img => img.status === 'completed').length,
        processing: generatedRecords.filter(img => img.status === 'processing').length,
        failed: generatedRecords.filter(img => img.status === 'failed').length,
        fromImagesApi: generatedRecords.filter(img => img.isFromImagesApi).length,
        fromGenerate: generatedRecords.filter(img => !img.isFromImagesApi).length
      },
      // 搜索信息
      searchInfo: {
        userId: userId,
        status: status || '',
        style: style || '',
        type: type || '',
        totalResults: generatedRecords.length
      }
    });
  } catch (error) {
    console.error('Get User Generated Images API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// 获取用户生成的图片 - 专门的接口
router.get('/user/:userId/images', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '20', type, status = 'completed' } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'UserId is required'
      });
    }
    
    let userImages = [];
    
    // 调用images API获取用户的图片
    try {
      const queryParams = new URLSearchParams({
        userId: userId,
        limit: '100' // 获取更多数据用于筛选
      });
      
      if (type) {
        queryParams.append('type', type);
      }
      
      const imagesApiUrl = `http://localhost:3001/api/images?${queryParams.toString()}`;
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(imagesApiUrl);
      const imagesData = await response.json();
      
      if (imagesData.success && imagesData.data.length > 0) {
        // 转换为统一的生成图片格式
        userImages = imagesData.data.map(img => ({
          id: img.id,
          title: img.title,
          description: img.description,
          prompt: img.prompt || img.description || img.title,
          defaultUrl: img.defaultUrl,
          colorUrl: img.colorUrl,
          thumbnailUrl: img.defaultUrl,
          tags: img.tags || [],
          type: img.type || 'text2image',
          ratio: img.ratio || '1:1',
          category: img.category,
          createdAt: img.createdAt || new Date().toISOString(),
          userId: img.userId,
          status: 'completed', // 来自images API的都是已完成的
          isPublic: img.isPublic || false,
          additionalInfo: img.additionalInfo || {}
        }));
      }
    } catch (apiError) {
      console.warn('Failed to fetch user images from API:', apiError.message);
    }
    
    // 从本地生成记录中获取用户的图片
    const localGeneratedImages = mockGeneratedImages
      .filter(img => img.userId === userId)
      .filter(img => status ? img.status === status : true)
      .map(img => ({
        id: img.id,
        title: img.prompt,
        description: img.prompt,
        prompt: img.prompt,
        defaultUrl: img.imageUrl,
        colorUrl: img.imageUrl,
        thumbnailUrl: img.imageUrl,
        tags: [],
        type: 'text2image',
        ratio: '1:1',
        category: 'generated',
        createdAt: img.createdAt,
        userId: img.userId,
        status: img.status,
        style: img.style,
        isPublic: false,
        isFromGenerate: true // 标记来源
      }));
    
    // 合并数据
    const allUserImages = [...userImages, ...localGeneratedImages];
    
    // 按类型筛选
    let filteredImages = type ? 
      allUserImages.filter(img => img.type === type) : 
      allUserImages;
    
    // 按状态筛选
    if (status) {
      filteredImages = filteredImages.filter(img => img.status === status);
    }
    
    // 按时间倒序排列
    filteredImages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // 分页
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit) || 20));
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
        totalPages: Math.ceil(filteredImages.length / limitNum),
        hasMore: endIndex < filteredImages.length
      },
      stats: {
        total: filteredImages.length,
        completed: filteredImages.filter(img => img.status === 'completed').length,
        processing: filteredImages.filter(img => img.status === 'processing').length,
        failed: filteredImages.filter(img => img.status === 'failed').length,
        text2image: filteredImages.filter(img => img.type === 'text2image').length,
        image2image: filteredImages.filter(img => img.type === 'image2image').length
      },
      searchInfo: {
        userId: userId,
        type: type || '',
        status: status || '',
        totalResults: filteredImages.length
      }
    });
  } catch (error) {
    console.error('Get User Images API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

export { router }; 