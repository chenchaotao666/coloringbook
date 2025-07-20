import { ApiUtils } from '../utils/apiUtils';
import { SearchResult, ImageService } from './imageService';
import { UrlUtils } from '../utils/urlUtils';
import { LocalizedText } from '../utils/textUtils';

// 标签统计接口
export interface TagCount {
  tagId: string;
  displayName: LocalizedText | string;
  description: string;
  count: number;
}



// 分类接口
export interface Category {
  categoryId: string;
  name: string;
  displayName: LocalizedText | string;
  display_name: LocalizedText | string;
  description: LocalizedText | string;
  seoTitle?: LocalizedText | string; // SEO标题，可选
  seoDesc?: LocalizedText | string; // SEO描述，可选
  hotness: number; // 热度值
  imageCount?: number; // 可选，为了向后兼容
  tagCounts: TagCount[]; // 标签统计数组
  thumbnailUrl: string; // 保持向后兼容
  defaultUrl: string; // 默认图片URL
  colorUrl: string; // 彩色图片URL
  coloringUrl: string; // 上色后图片URL
}

// 分类服务类
export class CategoriesService {
  /**
   * 处理分类对象，确保图片URL是绝对路径
   */
  private static processCategoryUrls(category: Category): Category {
    return UrlUtils.processObjectUrls(category, ['thumbnailUrl', 'defaultUrl', 'colorUrl', 'coloringUrl']);
  }

  // 获取所有分类
  static async getCategories(lang: 'zh' | 'en' | 'ja' = 'zh'): Promise<Category[]> {
    try {
      const data = await ApiUtils.get<Category[]>('/api/images/categories', { lang });
      const rawCategories = data || [];
      
      // 处理分类缩略图URL，确保都是绝对路径
      const categories = rawCategories.map(category => this.processCategoryUrls(category));
      
      return categories;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }

  // 根据分类名称获取分类详情
  static async getCategoryByName(categoryName: string, lang: 'zh' | 'en' | 'ja' = 'zh'): Promise<Category | null> {
    try {
      const categories = await this.getCategories(lang);
      // 查找匹配的分类（支持name字段）
      const category = categories.find(cat => 
        cat.name && cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      return category || null;
    } catch (error) {
      console.error(`Failed to get category by name ${categoryName}:`, error);
      return null;
    }
  }

  // 根据分类ID获取分类详情
  static async getCategoryById(categoryId: string, lang: 'zh' | 'en' | 'ja' = 'zh'): Promise<Category | null> {
    try {
      const categories = await this.getCategories(lang);
      const category = categories.find(cat => cat.categoryId === categoryId);
      return category || null;
    } catch (error) {
      console.error(`Failed to get category by id ${categoryId}:`, error);
      return null;
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
