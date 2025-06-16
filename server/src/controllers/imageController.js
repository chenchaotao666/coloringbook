const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { prisma } = require('../config/database');
const { successResponse, errorResponse, createdResponse } = require('../utils/response');
const { ERROR_CODES, IMAGE_TYPES, TASK_STATUS } = require('../config/constants');
const { 
  validateImageQuery, 
  validateText2Image, 
  validateImage2Image, 
  validateImageReport 
} = require('../validation/imageValidation');
const { deleteFile, compressImage, copyFile } = require('../utils/fileUtils');
const sharp = require('sharp');

/**
 * 格式化图片响应数据
 */
function formatImageResponse(image) {
  return {
    id: image.id,
    name: image.name,
    title: image.title,
    description: image.description || '',
    defaultUrl: image.defaultUrl,
    colorUrl: image.colorUrl || '',
    tags: image.tags || [],
    ratio: image.ratio,
    type: image.type,
    isPublic: image.isPublic,
    size: image.size || '',
    additionalInfo: image.additionalInfo || '',
    category: image.category ? {
      id: image.category.id,
      name: image.category.name,
      displayName: image.category.displayName
    } : null,
    createdAt: image.createdAt.toISOString()
  };
}

/**
 * 查询图片
 */
async function queryImages(req, res) {
  console.log('into queryImages', req.query, req.body);
  try {
    // 验证查询参数
    const validation = validateImageQuery({ ...req.query, ...req.body });
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const {
      imageId,
      query,
      categoryId,
      tags,
      ratio,
      type,
      userId,
      isPublic,
      currentPage,
      pageSize,
      isRelated
    } = validation.data;

    // 构建查询条件
    const where = {};
    
    // 处理相关图片查询逻辑
    if (isRelated && imageId) {
      console.log('执行相关图片查询，目标图片ID:', imageId);
      
      // 首先获取目标图片的信息
      const targetImage = await prisma.image.findUnique({
        where: { id: imageId },
        select: { categoryId: true, tags: true }
      });
      
      if (!targetImage) {
        return errorResponse(res, ERROR_CODES.IMAGE_NOT_FOUND, '目标图片不存在', 404);
      }
      
      console.log('目标图片信息:', targetImage);
      
      // 构建相关图片查询条件
      const relatedConditions = [];
      
      // 1. 同分类的图片
      if (targetImage.categoryId || categoryId) {
        const useCategoryId = categoryId || targetImage.categoryId;
        relatedConditions.push({
          categoryId: useCategoryId
        });
        console.log('添加分类查询条件:', useCategoryId);
      }
      
      // 2. 有相同标签的图片
      if (targetImage.tags && targetImage.tags.length > 0) {
        relatedConditions.push({
          tags: { hasSome: targetImage.tags }
        });
        console.log('添加标签查询条件:', targetImage.tags);
      }
      
      // 3. 如果传入了额外的tags参数，也加入查询
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        relatedConditions.push({
          tags: { hasSome: tagArray }
        });
        console.log('添加额外标签查询条件:', tagArray);
      }
      
      // 组合查询条件（OR关系）
      if (relatedConditions.length > 0) {
        where.OR = relatedConditions;
      }
      
      // 排除目标图片本身
      where.NOT = { id: imageId };
      
      console.log('相关图片查询条件:', JSON.stringify(where, null, 2));
      
    } else {
      // 普通查询逻辑
      if (imageId) {
        where.id = imageId;
      }
      
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query] } }
        ];
      }
      
      if (categoryId) {
        where.categoryId = categoryId;
      }
      
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        where.tags = { hasSome: tagArray };
      }
      
      if (ratio) {
        where.ratio = ratio;
      }
      
      if (type) {
        where.type = type;
      }
      
      if (userId) {
        where.userId = userId;
      }
      
      if (isPublic !== undefined) {
        where.isPublic = isPublic;
      }
    }

    // 如果没有指定用户ID且没有登录，只显示公开图片
    if (!userId && !req.user) {
      where.isPublic = true;
    }

    // 计算分页
    const skip = (currentPage - 1) * pageSize;

    // 设置排序规则
    let orderBy = { createdAt: 'desc' };
    
    // 相关图片查询时，使用随机排序以增加多样性
    if (isRelated && imageId) {
      // 注意：Prisma 不直接支持 RANDOM()，这里先按创建时间排序
      // 如果需要真正的随机排序，可以在应用层处理
      orderBy = { createdAt: 'desc' };
    }

    // 查询图片
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.image.count({ where })
    ]);

    // 如果查询单个图片且找不到
    if (imageId && !isRelated && images.length === 0) {
      return errorResponse(res, ERROR_CODES.IMAGE_NOT_FOUND, '图片不存在', 404);
    }

    let formattedImages = images.map(formatImageResponse);
    
    // 相关图片查询时，对结果进行随机排序以增加多样性
    if (isRelated && imageId) {
      console.log(`相关图片查询结果: 找到 ${formattedImages.length} 张相关图片`);
      
      if (formattedImages.length > 1) {
        // Fisher-Yates 洗牌算法
        for (let i = formattedImages.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [formattedImages[i], formattedImages[j]] = [formattedImages[j], formattedImages[i]];
        }
        console.log('已对相关图片进行随机排序');
      }
    }

    return successResponse(res, {
      images: formattedImages,
      total
    }, total);
  } catch (error) {
    console.error('查询图片错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 文本生成图片
 */
async function text2Image(req, res) {
  console.log('into text2Image', req.body);
  try {
    // 验证请求数据
    const validation = validateText2Image(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { prompt, ratio, isPublic } = validation.data;
    const userId = req.user.id;

    // 检查用户积分
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (user.credits < 20) {
      return errorResponse(res, ERROR_CODES.INSUFFICIENT_BALANCE, '积分不足，需要20积分', 402);
    }

    // 生成任务ID
    const taskId = `task_${uuidv4()}`;

    // 创建生成任务
    const task = await prisma.generationTask.create({
      data: {
        taskId,
        status: TASK_STATUS.PROCESSING,
        type: IMAGE_TYPES.TEXT2IMAGE,
        prompt,
        ratio,
        isPublic,
        userId,
        progress: 0,
        estimatedTime: 30
      }
    });

    // 扣除用户积分
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: 20 }
      }
    });

    // 模拟异步图片生成
    setTimeout(async () => {
      try {
        console.log('into simulateImageGeneration............');
        await simulateImageGeneration(task.id, prompt, ratio, isPublic, userId);
      } catch (error) {
        console.error('图片生成失败:', error);
        await prisma.generationTask.update({
          where: { id: task.id },
          data: {
            status: TASK_STATUS.FAILED,
            errorCode: ERROR_CODES.IMAGE_GENERATION_FAILED,
            message: '图片生成失败',
            failedAt: new Date()
          }
        });
      }
    }, 1000);

    return createdResponse(res, {
      taskId: task.taskId,
      status: task.status,
      progress: task.progress,
      estimatedTime: task.estimatedTime,
      createdAt: task.createdAt.toISOString()
    });
  } catch (error) {
    console.error('文本生成图片错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 图片转换
 */
async function image2Image(req, res) {
  try {
    if (!req.file) {
      return errorResponse(res, ERROR_CODES.VALIDATION_ERROR, '请选择要转换的图片文件', 400);
    }

    // 验证请求数据
    const validation = validateImage2Image(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { isPublic } = validation.data;
    const userId = req.user.id;

    // 检查用户积分
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (user.credits < 20) {
      return errorResponse(res, ERROR_CODES.INSUFFICIENT_BALANCE, '积分不足，需要20积分', 402);
    }

    // 生成任务ID
    const taskId = `task_${uuidv4()}`;

    // 创建生成任务
    const task = await prisma.generationTask.create({
      data: {
        taskId,
        status: TASK_STATUS.PROCESSING,
        type: IMAGE_TYPES.IMAGE2IMAGE,
        isPublic,
        userId,
        progress: 0,
        estimatedTime: 45
      }
    });

    // 扣除用户积分
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: 20 }
      }
    });

    // 模拟异步图片转换
    setTimeout(async () => {
      try {
        await simulateImageConversion(task.id, req.file.path, isPublic, userId);
      } catch (error) {
        console.error('图片转换失败:', error);
        await prisma.generationTask.update({
          where: { id: task.id },
          data: {
            status: TASK_STATUS.FAILED,
            errorCode: ERROR_CODES.IMAGE_CONVERSION_FAILED,
            message: '图片转换失败',
            failedAt: new Date()
          }
        });
      }
    }, 1000);

    return createdResponse(res, {
      taskId: task.taskId,
      status: task.status,
      progress: task.progress,
      estimatedTime: task.estimatedTime,
      createdAt: task.createdAt.toISOString()
    });
  } catch (error) {
    console.error('图片转换错误:', error);
    
    // 清理上传的文件
    if (req.file) {
      await deleteFile(req.file.path);
    }
    
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 删除图片
 */
async function deleteImage(req, res) {
  try {
    const { imageId } = req.params;
    const userId = req.user.id;

    // 查找图片
    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return errorResponse(res, ERROR_CODES.IMAGE_NOT_FOUND, '图片不存在', 404);
    }

    // 检查权限（只有图片创建者可以删除）
    if (image.userId !== userId) {
      return errorResponse(res, ERROR_CODES.IMAGE_DELETE_DENIED, '无权删除此图片', 403);
    }

    // 删除图片文件
    if (image.defaultUrl) {
      const defaultPath = path.join(process.cwd(), image.defaultUrl);
      await deleteFile(defaultPath);
    }
    
    if (image.colorUrl) {
      const colorPath = path.join(process.cwd(), image.colorUrl);
      await deleteFile(colorPath);
    }

    // 删除数据库记录
    await prisma.image.delete({
      where: { id: imageId }
    });

    return successResponse(res, {
      message: '图片删除成功',
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('删除图片错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 举报图片
 */
async function reportImage(req, res) {
  try {
    // 验证请求数据
    const validation = validateImageReport(req.body);
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const { content, imageId } = validation.data;
    const userId = req.user.id;

    // 检查图片是否存在
    const image = await prisma.image.findUnique({
      where: { id: imageId }
    });

    if (!image) {
      return errorResponse(res, ERROR_CODES.IMAGE_NOT_FOUND, '图片不存在', 404);
    }

    // 检查是否已经举报过
    const existingReport = await prisma.imageReport.findUnique({
      where: {
        userId_imageId: {
          userId,
          imageId
        }
      }
    });

    if (existingReport) {
      return errorResponse(res, ERROR_CODES.DUPLICATE_REPORT, '您已经举报过此图片', 409);
    }

    // 创建举报记录
    const report = await prisma.imageReport.create({
      data: {
        userId,
        imageId,
        content,
        type: 'other',
        status: 'pending'
      }
    });

    return createdResponse(res, {
      reportId: report.id,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      message: '举报提交成功，我们会尽快处理'
    });
  } catch (error) {
    console.error('举报图片错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 模拟图片生成
 */
async function simulateImageGeneration(taskId, prompt, ratio, isPublic, userId) {
  console.log('into simulateImageGeneration............');
  // 更新进度
  await prisma.generationTask.update({
    where: { id: taskId },
    data: { progress: 50 }
  });

  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 从预制图片中随机选择一张作为生成结果
  const mockImages = [
    { default: 'spider-man-default.png', color: 'spider-man-color.png', name: 'spider-man' },
    { default: 'cartoon-default.png', color: 'cartoon-color.png', name: 'cartoon' },
    { default: 'cat-default.png', color: 'cat-color.png', name: 'cat' },
    { default: 'mario-default.png', color: 'mario-color.png', name: 'mario' },
    { default: 'flower-default.png', color: 'flower-color.png', name: 'flower' },
    { default: 'robot-default.png', color: 'robot-color.png', name: 'robot' }
  ];

  const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
  
  console.log('randomImage............');
  // 复制预制图片到上传目录
  const sourceDefaultPath = path.join(process.cwd(), 'uploads/preset-images', randomImage.default);
  const sourceColorPath = path.join(process.cwd(), 'uploads/preset-images', randomImage.color);
  
  const targetDefaultPath = path.join(process.cwd(), 'uploads/images', `generated_${uuidv4()}_default.png`);
  const targetColorPath = path.join(process.cwd(), 'uploads/images', `generated_${uuidv4()}_color.png`);
  
  console.log('before copyFile............');
  await copyFile(sourceDefaultPath, targetDefaultPath);
  await copyFile(sourceColorPath, targetColorPath);
  console.log('copyFile............');

  // 获取默认分类
  const defaultCategory = await prisma.category.findFirst({
    where: { name: 'cartoon' }
  });

  // 创建图片记录
  const image = await prisma.image.create({
    data: {
      name: `generated-${randomImage.name}-${Date.now()}`,
      title: `AI生成: ${prompt.substring(0, 50)}`,
      description: `基于提示词"${prompt}"生成的图片`,
      defaultUrl: `/uploads/images/${path.basename(targetDefaultPath)}`,
      colorUrl: `/uploads/images/${path.basename(targetColorPath)}`,
      tags: prompt.split(' ').slice(0, 5),
      ratio,
      type: IMAGE_TYPES.TEXT2IMAGE,
      isPublic,
      prompt,
      userId,
      categoryId: defaultCategory.id,
      size: '512,512',
      additionalInfo: JSON.stringify({ generatedBy: 'AI', model: 'stable-diffusion' })
    }
  });
  console.log('image............');

  // 更新任务状态
  await prisma.generationTask.update({
    where: { id: taskId },
    data: {
      status: TASK_STATUS.COMPLETED,
      progress: 100,
      imageId: image.id,
      completedAt: new Date()
    }
  });
}

/**
 * 模拟图片转换
 */
async function simulateImageConversion(taskId, uploadedFilePath, isPublic, userId) {
  // 更新进度
  await prisma.generationTask.update({
    where: { id: taskId },
    data: { progress: 30 }
  });

  // 模拟处理时间
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    // 生成目标文件路径
    const targetDefaultPath = path.join(process.cwd(), 'uploads/images', `converted_${uuidv4()}_default.png`);
    const targetColorPath = path.join(process.cwd(), 'uploads/images', `converted_${uuidv4()}_color.png`);

    // 更新进度
    await prisma.generationTask.update({
      where: { id: taskId },
      data: { progress: 50 }
    });

    // 随机选择处理风格
    const processingStyles = [
      {
        name: 'classic-outline',
        description: '经典轮廓风格',
        filters: ['blur', 'grayscale', 'threshold', 'edge-detection']
      },
      {
        name: 'artistic-sketch',
        description: '艺术素描风格',
        filters: ['blur', 'contrast', 'edge-enhance', 'threshold']
      },
      {
        name: 'cartoon-style',
        description: '卡通风格',
        filters: ['blur', 'saturation-reduce', 'contrast', 'smooth-edges']
      },
      {
        name: 'detailed-lines',
        description: '精细线条风格',
        filters: ['sharpen', 'edge-detection', 'threshold', 'clean-lines']
      }
    ];

    const selectedStyle = processingStyles[Math.floor(Math.random() * processingStyles.length)];
    console.log(`应用处理风格: ${selectedStyle.name} - ${selectedStyle.description}`);

    // 根据选择的风格应用不同的处理效果
    let sharpProcessor = sharp(uploadedFilePath)
      .resize(512, 512, { 
        fit: 'inside',
        withoutEnlargement: true 
      });

    sharpProcessor = sharpProcessor
      .blur(0.8)
      .linear(1.5, -(128 * 1.5) + 128) // 增强对比度
      .modulate({ brightness: 1.0, saturation: 0.1, hue: 0 })
      .grayscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0] // 锐化核
      })
      .threshold(140)
      .modulate({ brightness: 1.2, saturation: 0, hue: 0 });

    // 应用最终处理并保存
    await sharpProcessor
      .png({ quality: 90 })
      .toFile(targetDefaultPath);

    // 更新进度
    await prisma.generationTask.update({
      where: { id: taskId },
      data: { progress: 70 }
    });

    // 创建彩色版本 - 根据风格调整颜色处理
    let colorProcessor = sharp(uploadedFilePath)
      .resize(512, 512, { 
        fit: 'inside',
        withoutEnlargement: true 
      });

    // 根据风格调整彩色版本的处理
    switch (selectedStyle.name) {
      case 'classic-outline':
        colorProcessor = colorProcessor
          .blur(0.5)
          .modulate({ brightness: 1.1, saturation: 0.7, hue: 0 })
          .linear(1.1, -(128 * 1.1) + 128);
        break;

      case 'artistic-sketch':
        colorProcessor = colorProcessor
          .blur(0.3)
          .modulate({ brightness: 1.0, saturation: 0.8, hue: 0 })
          .linear(1.2, -(128 * 1.2) + 128);
        break;

      case 'cartoon-style':
        colorProcessor = colorProcessor
          .blur(0.8)
          .modulate({ brightness: 1.2, saturation: 0.9, hue: 0 })
          .linear(1.0, -(128 * 1.0) + 128);
        break;

      case 'detailed-lines':
        colorProcessor = colorProcessor
          .modulate({ brightness: 1.0, saturation: 0.6, hue: 0 })
          .linear(1.3, -(128 * 1.3) + 128);
        break;
    }

    await colorProcessor
      .png({ quality: 90 })
      .toFile(targetColorPath);

    // 更新进度
    await prisma.generationTask.update({
      where: { id: taskId },
      data: { progress: 90 }
    });

    // 删除原始上传文件
    await deleteFile(uploadedFilePath);

    // 获取默认分类
    const defaultCategory = await prisma.category.findFirst({
      where: { name: 'custom' }
    });

    // 创建图片记录
    const image = await prisma.image.create({
      data: {
        name: `converted-${selectedStyle.name}-${Date.now()}`,
        title: `图片转换结果 - ${selectedStyle.description}`,
        description: `通过AI图片转换功能生成的涂色图，应用了${selectedStyle.description}处理效果`,
        defaultUrl: `/uploads/images/${path.basename(targetDefaultPath)}`,
        colorUrl: `/uploads/images/${path.basename(targetColorPath)}`,
        tags: ['converted', 'custom', 'ai-processed', selectedStyle.name],
        ratio: '1:1',
        type: IMAGE_TYPES.IMAGE2IMAGE,
        isPublic,
        userId,
        categoryId: defaultCategory?.id || null,
        size: '512,512',
        additionalInfo: JSON.stringify({ 
          convertedBy: 'AI', 
          method: 'advanced-image-processing',
          style: selectedStyle.name,
          styleDescription: selectedStyle.description,
          filters: selectedStyle.filters,
          processedAt: new Date().toISOString()
        })
      }
    });

    // 更新任务状态
    await prisma.generationTask.update({
      where: { id: taskId },
      data: {
        status: TASK_STATUS.COMPLETED,
        progress: 100,
        imageId: image.id,
        completedAt: new Date()
      }
    });

  } catch (error) {
    console.error('图片处理失败:', error);
    
    // 如果 Sharp 处理失败，回退到原来的简单压缩方法
    console.log('回退到简单压缩方法...');
    
    const targetDefaultPath = path.join(process.cwd(), 'uploads/images', `converted_${uuidv4()}_default.png`);
    await compressImage(uploadedFilePath, targetDefaultPath, {
      width: 512,
      height: 512,
      quality: 90
    });

    // 从预制图片中选择一张作为彩色版本
    const colorImages = [
      'spider-man-color.png', 'cartoon-color.png', 'cat-color.png', 
      'mario-color.png', 'flower-color.png', 'robot-color.png'
    ];
    const randomColorImage = colorImages[Math.floor(Math.random() * colorImages.length)];
    const sourceColorPath = path.join(process.cwd(), 'uploads/preset-images', randomColorImage);
    const targetColorPath = path.join(process.cwd(), 'uploads/images', `converted_${uuidv4()}_color.png`);
    
    await copyFile(sourceColorPath, targetColorPath);
    await deleteFile(uploadedFilePath);

    // 获取默认分类
    const defaultCategory = await prisma.category.findFirst({
      where: { name: 'custom' }
    });

    // 创建图片记录
    const image = await prisma.image.create({
      data: {
        name: `converted-${Date.now()}`,
        title: '图片转换结果',
        description: '通过图片转换功能生成的涂色图',
        defaultUrl: `/uploads/images/${path.basename(targetDefaultPath)}`,
        colorUrl: `/uploads/images/${path.basename(targetColorPath)}`,
        tags: ['converted', 'custom'],
        ratio: '1:1',
        type: IMAGE_TYPES.IMAGE2IMAGE,
        isPublic,
        userId,
        categoryId: defaultCategory?.id || null,
        size: '512,512',
        additionalInfo: JSON.stringify({ convertedBy: 'AI', method: 'fallback-compression' })
      }
    });

    // 更新任务状态
    await prisma.generationTask.update({
      where: { id: taskId },
      data: {
        status: TASK_STATUS.COMPLETED,
        progress: 100,
        imageId: image.id,
        completedAt: new Date()
      }
    });
  }
}

module.exports = {
  queryImages,
  text2Image,
  image2Image,
  deleteImage,
  reportImage
}; 