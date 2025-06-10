import { ApiUtils, ApiResponse } from '../utils/apiUtils';
import { HomeImage, SearchResult } from './imageService';

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
      const response = await ApiUtils.apiRequest<ApiResponse<Category[]>>('/api/categories');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // 返回空数组作为降级处理
      return [];
    }
  }

  // 根据ID获取分类
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const response = await ApiUtils.apiRequest<ApiResponse<Category>>(`/api/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${categoryId}:`, error);
      return null;
    }
  }

  // 通过分类ID获取图片列表
  static async getImagesByCategory(categoryId: string, params: { page?: number; limit?: number; search?: string } = {}): Promise<SearchResult> {
    const { page = 1, limit = 20, search } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      if (search) {
        searchParams.append('search', search);
      }

      const response = await ApiUtils.apiRequest<ApiResponse<HomeImage[]>>(`/api/images/category/${categoryId}?${searchParams.toString()}`);
      
      return {
        images: response.data,
        totalCount: response.pagination?.total || response.data.length,
        hasMore: response.pagination ? 
          (response.pagination.page * response.pagination.limit) < response.pagination.total : 
          false
      };
    } catch (error) {
      console.error(`Failed to get images by category ${categoryId}:`, error);
      return {
        images: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

}

// 导出默认实例
export const categoriesService = new CategoriesService();
