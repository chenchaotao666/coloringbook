import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ApiResponse } from '../types';
import { CategoryCreateData, CategoryUpdateData, IdParam } from '../schemas';
import { AppError, asyncHandler } from '../middleware/errorHandler';

// 获取所有分类
export const getCategories = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: categories,
    total: categories.length
  });
});

// 获取单个分类
export const getCategoryById = asyncHandler(async (req: Request<IdParam>, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id },
        { name: id }
      ]
    },
    include: {
      _count: {
        select: { images: true }
      }
    }
  });

  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  res.json({
    success: true,
    data: {
      ...category,
      imageCount: category._count.images
    }
  });
});

// 创建分类
export const createCategory = asyncHandler(async (req: Request<{}, {}, CategoryCreateData>, res: Response<ApiResponse>) => {
  const { name, displayName, description, thumbnailUrl } = req.body;

  // 检查是否已存在相同名称的分类
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { name: name.toLowerCase() },
        { displayName }
      ]
    }
  });

  if (existingCategory) {
    throw new AppError('分类名称已存在', 400);
  }

  const newCategory = await prisma.category.create({
    data: {
      name: name.toLowerCase(),
      displayName,
      description,
      thumbnailUrl: thumbnailUrl || "/images-mock/default.png"
    }
  });

  res.status(201).json({
    success: true,
    data: newCategory,
    message: '分类创建成功'
  });
});

// 更新分类
export const updateCategory = asyncHandler(async (req: Request<IdParam, {}, CategoryUpdateData>, res: Response<ApiResponse>) => {
  const { id } = req.params;
  const updateData = req.body;

  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id },
        { name: id }
      ]
    }
  });

  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  const updatedCategory = await prisma.category.update({
    where: { id: category.id },
    data: updateData
  });

  res.json({
    success: true,
    data: updatedCategory,
    message: '分类更新成功'
  });
});

// 删除分类
export const deleteCategory = asyncHandler(async (req: Request<IdParam>, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id },
        { name: id }
      ]
    },
    include: {
      _count: {
        select: { images: true }
      }
    }
  });

  if (!category) {
    throw new AppError('分类不存在', 404);
  }

  // 检查是否有关联的图片
  if (category._count.images > 0) {
    throw new AppError('无法删除包含图片的分类', 400);
  }

  await prisma.category.delete({
    where: { id: category.id }
  });

  res.json({
    success: true,
    data: category,
    message: '分类删除成功'
  });
}); 