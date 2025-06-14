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
  try {
    // 验证查询参数
    const validation = validateImageQuery({ ...req.query, ...req.body });
    if (!validation.isValid) {
      return errorResponse(res, validation.errorCode, validation.message, 400);
    }

    const {
      imageId,
      query,
      category,
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
    
    if (category) {
      where.category = {
        name: category
      };
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

    // 如果没有指定用户ID且没有登录，只显示公开图片
    if (!userId && !req.user) {
      where.isPublic = true;
    }

    // 计算分页
    const skip = (currentPage - 1) * pageSize;

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
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.image.count({ where })
    ]);

    // 如果查询单个图片且找不到
    if (imageId && images.length === 0) {
      return errorResponse(res, ERROR_CODES.IMAGE_NOT_FOUND, '图片不存在', 404);
    }

    const formattedImages = images.map(formatImageResponse);

    return successResponse(res, {
      images: formattedImages,
      pagination: {
        currentPage,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
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

    if (user.credits < 1) {
      return errorResponse(res, ERROR_CODES.INSUFFICIENT_BALANCE, '积分不足，请先充值', 402);
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
        credits: { decrement: 1 }
      }
    });

    // 模拟异步图片生成
    setTimeout(async () => {
      try {
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

    if (user.credits < 2) {
      return errorResponse(res, ERROR_CODES.INSUFFICIENT_BALANCE, '积分不足，图片转换需要2积分', 402);
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
        credits: { decrement: 2 }
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
  
  // 复制预制图片到上传目录
  const sourceDefaultPath = path.join(process.cwd(), 'images-mock', randomImage.default);
  const sourceColorPath = path.join(process.cwd(), 'images-mock', randomImage.color);
  
  const targetDefaultPath = path.join(process.cwd(), 'uploads/images', `generated_${uuidv4()}_default.png`);
  const targetColorPath = path.join(process.cwd(), 'uploads/images', `generated_${uuidv4()}_color.png`);
  
  await copyFile(sourceDefaultPath, targetDefaultPath);
  await copyFile(sourceColorPath, targetColorPath);

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
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 压缩上传的图片作为默认图片
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
  const sourceColorPath = path.join(process.cwd(), 'images-mock', randomColorImage);
  const targetColorPath = path.join(process.cwd(), 'uploads/images', `converted_${uuidv4()}_color.png`);
  
  await copyFile(sourceColorPath, targetColorPath);

  // 删除原始上传文件
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
      additionalInfo: JSON.stringify({ convertedBy: 'AI', method: 'edge-detection' })
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

module.exports = {
  queryImages,
  text2Image,
  image2Image,
  deleteImage,
  reportImage
}; 