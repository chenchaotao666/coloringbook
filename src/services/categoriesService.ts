import { ApiUtils } from '../utils/apiUtils';
import { SearchResult, ImageService } from './imageService';
import { UrlUtils } from '../utils/urlUtils';

// 分类接口
export interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
  imageCount?: number; // 可选，为了向后兼容
  tagCounts: { [key: string]: number }; // 标签统计
  thumbnailUrl: string;
}

// 分类服务类
export class CategoriesService {
  /**
   * 处理分类对象，确保缩略图URL是绝对路径
   */
  private static processCategoryUrls(category: Category): Category {
    return UrlUtils.processObjectUrls(category, ['thumbnailUrl']);
  }

  // 获取所有分类
  static async getCategories(): Promise<Category[]> {
    try {
      const data = await ApiUtils.get<{ categories: Category[] }>('/api/images/categories');
      const rawCategories = data.categories || [];
      
      // 处理分类缩略图URL，确保都是绝对路径
      const categories = rawCategories.map(category => this.processCategoryUrls(category));
      
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }

  // 根据名称获取分类
  static async getCategoryByName(categoryName: string): Promise<Category | null> {
    try {
      const rawCategory = await ApiUtils.get<Category>(`/api/images/categories/${categoryName}`);
      
      // 处理分类缩略图URL，确保是绝对路径
      const category = this.processCategoryUrls(rawCategory);
      
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
  static async getImagesByCategoryId(
    categoryId: string, 
    params: { currentPage?: number; pageSize?: number; query?: string } = {}
  ): Promise<SearchResult> {
    try {
      return await ImageService.getImagesByCategoryId(categoryId, params);
    } catch (error) {
      console.error(`Failed to get images by categoryId ${categoryId}:`, error);
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
        // 计算总的图片数量（所有标签的数量之和）
        const totalCount = Object.values(category.tagCounts).reduce((sum, count) => sum + count, 0);
        stats[category.name] = totalCount;
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
        .sort((a, b) => {
          const aCount = Object.values(a.tagCounts).reduce((sum, count) => sum + count, 0);
          const bCount = Object.values(b.tagCounts).reduce((sum, count) => sum + count, 0);
          return bCount - aCount;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get popular categories:', error);
      return [];
    }
  }

  // 获取分类的缩略图
  static getCategoryThumbnail(category: Category): string {
    const thumbnailUrl = category.thumbnailUrl || '/images/default-category.png';
    return UrlUtils.ensureAbsoluteUrl(thumbnailUrl);
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
