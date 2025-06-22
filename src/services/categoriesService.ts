import { ApiUtils } from '../utils/apiUtils';
import { SearchResult, ImageService } from './imageService';
import { UrlUtils } from '../utils/urlUtils';

// 标签统计接口
export interface TagCount {
  tagName: string;
  tagDisplayName: string;
  count: number;
}

// 分类接口
export interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
  imageCount?: number; // 可选，为了向后兼容
  tagCounts: TagCount[]; // 标签统计数组
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
  static async getCategories(lang: 'zh' | 'en' = 'en'): Promise<Category[]> {
    try {
      const data = await ApiUtils.get<{ categories: Category[] }>('/api/images/categories', { lang });
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
}

// 导出默认实例
export const categoriesService = new CategoriesService();
