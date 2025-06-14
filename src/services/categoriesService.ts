import { ApiUtils, ApiError } from '../utils/apiUtils';
import { HomeImage, SearchResult, ImageService } from './imageService';

// 分类接口
export interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
  imageCount: number;
  thumbnailUrl: string;
}

// 分类服务类
export class CategoriesService {
  // 获取所有分类
  static async getCategories(): Promise<Category[]> {
    try {
      const categories = await ApiUtils.get<Category[]>('/api/categories');
      return categories || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }

  // 根据名称获取分类
  static async getCategoryByName(categoryName: string): Promise<Category | null> {
    try {
      const category = await ApiUtils.get<Category>(`/api/categories/${categoryName}`);
      return category;
    } catch (error) {
      console.error(`Failed to fetch category ${categoryName}:`, error);
      return null;
    }
  }

  // 根据ID获取分类（兼容旧代码）
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    return this.getCategoryByName(categoryId);
  }

  // 通过分类名称获取图片列表
  static async getImagesByCategory(
    categoryName: string, 
    params: { currentPage?: number; pageSize?: number; query?: string } = {}
  ): Promise<SearchResult> {
    try {
      return await ImageService.getImagesByCategory(categoryName, params);
    } catch (error) {
      console.error(`Failed to get images by category ${categoryName}:`, error);
      return {
        images: [],
        totalCount: 0,
        hasMore: false,
        currentPage: 1,
        pageSize: 20
      };
    }
  }

  // 获取分类统计信息
  static async getCategoryStats(): Promise<{ [key: string]: number }> {
    try {
      const categories = await this.getCategories();
      const stats: { [key: string]: number } = {};
      
      categories.forEach(category => {
        stats[category.name] = category.imageCount;
      });
      
      return stats;
    } catch (error) {
      console.error('Failed to get category stats:', error);
      return {};
    }
  }

  // 搜索分类
  static async searchCategories(searchTerm: string): Promise<Category[]> {
    try {
      const allCategories = await this.getCategories();
      
      if (!searchTerm) return allCategories;
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      return allCategories.filter(category => 
        category.name.toLowerCase().includes(lowerSearchTerm) ||
        category.displayName.toLowerCase().includes(lowerSearchTerm) ||
        category.description.toLowerCase().includes(lowerSearchTerm)
      );
    } catch (error) {
      console.error('Failed to search categories:', error);
      return [];
    }
  }

  // 获取热门分类（按图片数量排序）
  static async getPopularCategories(limit: number = 10): Promise<Category[]> {
    try {
      const categories = await this.getCategories();
      return categories
        .sort((a, b) => b.imageCount - a.imageCount)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get popular categories:', error);
      return [];
    }
  }

  // 获取分类的缩略图
  static getCategoryThumbnail(category: Category): string {
    return category.thumbnailUrl || '/images/default-category.png';
  }

  // 格式化分类显示名称
  static formatCategoryDisplayName(category: Category): string {
    const parts = category.displayName.split('|');
    return parts.length > 1 ? parts[1] : parts[0];
  }

  // 获取分类的英文名称
  static getCategoryEnglishName(category: Category): string {
    const parts = category.displayName.split('|');
    return parts[0];
  }
}

// 导出默认实例
export const categoriesService = new CategoriesService();
