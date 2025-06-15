const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { ERROR_CODES } = require('../config/constants');

/**
 * 格式化分类响应数据
 */
function formatCategoryResponse(category) {
  return {
    id: category.id,
    name: category.name,
    displayName: category.displayName,
    description: category.description,
    imageCount: category.imageCount,
    thumbnailUrl: category.thumbnailUrl || '',
    createdAt: category.createdAt.toISOString()
  };
}

/**
 * 获取所有分类
 */
async function getAllCategories(req, res) {
  try {
    // 查询所有分类
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    });

    // 为每个分类统计标签数量
    const formattedCategories = await Promise.all(
      categories.map(async (category) => {
        // 获取该分类下所有公开图片的标签
        const images = await prisma.image.findMany({
          where: {
            categoryId: category.id,
            isPublic: true
          },
          select: {
            tags: true
          }
        });

        // 统计标签出现次数
        const tagCounts = {};
        images.forEach(image => {
          if (image.tags && Array.isArray(image.tags)) {
            image.tags.forEach(tag => {
              if (tag && tag.trim()) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              }
            });
          }
        });

        return {
          id: category.id,
          name: category.name,
          displayName: category.displayName,
          description: category.description,
          tagCounts: tagCounts,
          thumbnailUrl: category.thumbnailUrl || ''
        };
      })
    );

    return successResponse(res, {
      categories: formattedCategories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

/**
 * 根据分类名称获取分类详情
 */
async function getCategoryByName(req, res) {
  try {
    const { categoryName } = req.params;

    const category = await prisma.category.findUnique({
      where: { name: categoryName },
      include: {
        _count: {
          select: {
            images: {
              where: {
                isPublic: true
              }
            }
          }
        }
      }
    });

    if (!category) {
      return errorResponse(res, ERROR_CODES.CATEGORY_NOT_FOUND, '分类不存在', 404);
    }

    const formattedCategory = {
      ...formatCategoryResponse(category),
      imageCount: category._count.images
    };

    return successResponse(res, formattedCategory);
  } catch (error) {
    console.error('获取分类详情错误:', error);
    return errorResponse(res, ERROR_CODES.INTERNAL_SERVER_ERROR, '服务器内部错误', 500);
  }
}

module.exports = {
  getAllCategories,
  getCategoryByName
}; 