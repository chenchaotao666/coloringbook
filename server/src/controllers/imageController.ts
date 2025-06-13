import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiResponse } from '../types';
import { ImageSearchQuery, IdParam } from '../schemas';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// 搜索图片
export const searchImages = asyncHandler(async (req: Request<{}, {}, {}, ImageSearchQuery>, res: Response<ApiResponse>) => {
  const { 
    query, 
    category, 
    tags, 
    ratio, 
    difficulty, 
    type, 
    userId, 
    search, 
    page, 
    limit 
  } = req.query;

  // 处理搜索关键词（优先使用query，兼容search）
  const searchTerm = query || search;

  // 构建查询条件
  const where: any = {};

  if (searchTerm) {
    where.OR = [
      { title: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { hasSome: [searchTerm] } }
    ];
  }

  if (category) {
    where.category = { name: category };
  }

  if (tags) {
    const tagList = tags.split(',').map((t: string) => t.trim());
    where.tags = { hasSome: tagList };
  }

  if (ratio || difficulty) {
    where.ratio = ratio || difficulty;
  }

  if (type) {
    where.type = type;
  }

  if (userId) {
    where.userId = userId;
  }

  // 获取总数
  const total = await prisma.image.count({ where });

  // 分页查询
  const skip = (page - 1) * limit;
  const images = await prisma.image.findMany({
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
    take: limit
  });

  res.json({
    success: true,
    data: images,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + limit < total
    },
    searchInfo: {
      query: searchTerm || '',
      category: category || '',
             tags: tags ? tags.split(',').map((t: string) => t.trim()) : [],
      ratio: ratio || '',
      type: type || '',
      userId: userId || '',
      totalResults: total
    }
  });
});

// 通过分类ID获取图片列表
export const getImagesByCategory = asyncHandler(async (req: Request<{ categoryId: string }, {}, {}, ImageSearchQuery>, res: Response<ApiResponse>) => {
  const { categoryId } = req.params;
  const { page, limit, search } = req.query;

  // 验证分类是否存在
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryId },
        { name: categoryId }
      ]
    }
  });

  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  // 构建查询条件
  const where: any = {
    categoryId: category.id
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } }
    ];
  }

  // 获取总数
  const total = await prisma.image.count({ where });

  // 分页查询
  const skip = (page - 1) * limit;
  const images = await prisma.image.findMany({
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
    take: limit
  });

  res.json({
    success: true,
    data: images,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// 获取单个图片详情
export const getImageById = asyncHandler(async (req: Request<IdParam>, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          displayName: true
        }
      },
      generationTask: {
        select: {
          taskId: true,
          status: true,
          progress: true,
          type: true,
          prompt: true
        }
      }
    }
  });

  if (!image) {
    throw new AppError('图片不存在', 404);
  }

  res.json({
    success: true,
    data: image
  });
});

// 删除图片
export const deleteImage = asyncHandler(async (req: Request<IdParam>, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const image = await prisma.image.findUnique({
    where: { id },
    include: {
      category: true
    }
  });

  if (!image) {
    throw new AppError('图片不存在', 404);
  }

  // 删除图片（会级联删除相关的收藏和生成任务）
  await prisma.image.delete({
    where: { id }
  });

  // 更新分类的图片数量
  await prisma.category.update({
    where: { id: image.categoryId },
    data: {
      imageCount: {
        decrement: 1
      }
    }
  });

  res.json({
    success: true,
    data: {
      deletedImage: image,
      remainingCount: await prisma.image.count({
        where: { categoryId: image.categoryId }
      })
    },
    message: '图片删除成功'
  });
}); 