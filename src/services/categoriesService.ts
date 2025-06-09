// 分类图片数据类型
export interface CategoryImage {
  id: string;
  title: string;
  url: string;
  colorUrl?: string; // 彩色版本URL
  tags: string[];
  category: string;
  ratio: string;
  description?: string;
}

// 分类数据类型
export interface Category {
  id: string;
  name: string;
  displayName: string;
  description: string;
  imageCount: number;
  thumbnailUrl: string;
}

// 搜索结果接口
export interface SearchResult {
  images: CategoryImage[];
  totalCount: number;
  hasMore: boolean;
}

// 搜索参数接口
export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  ratio?: '1:1' | '3:4' | '4:3';
  page?: number;
  limit?: number;
}

// API 响应接口
interface ApiResponse<T> {
  success: boolean;
  data: T;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// API 配置
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : '';

// 分类服务类
export class CategoriesService {
  // 通用API请求方法
  private static async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // 获取所有分类
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await this.apiRequest<ApiResponse<Category[]>>('/api/categories');
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
      const response = await this.apiRequest<ApiResponse<Category>>(`/api/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch category ${categoryId}:`, error);
      return null;
    }
  }

  // 搜索图片
  static async searchImages(params: SearchParams = {}): Promise<SearchResult> {
    const {
      query = '',
      category = '',
      tags = [],
      ratio,
      page = 1,
      limit = 20
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('search', query);
      if (category) searchParams.append('category', category);
      if (ratio) searchParams.append('difficulty', ratio); // 使用difficulty参数映射ratio
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      
      // 如果有标签，将其作为搜索词的一部分
      if (tags.length > 0) {
        const tagQuery = tags.join(' ');
        const combinedQuery = query ? `${query} ${tagQuery}` : tagQuery;
        searchParams.set('search', combinedQuery);
      }

      const response = await this.apiRequest<ApiResponse<CategoryImage[]>>(`/api/images?${searchParams.toString()}`);
      
      return {
        images: response.data,
        totalCount: response.pagination?.total || response.data.length,
        hasMore: response.pagination ? 
          (response.pagination.page * response.pagination.limit) < response.pagination.total : 
          false
      };
    } catch (error) {
      console.error('Failed to search images:', error);
      return {
        images: [],
        totalCount: 0,
        hasMore: false
      };
    }
  }

  // 获取热门搜索词
  static async getPopularSearchTerms(): Promise<string[]> {
    // 这个可以从API获取，或者保持静态数据
    return [
      'cat', 'dog', 'flower', 'car', 'princess', 'dragon',
      'robot', 'butterfly', 'tree', 'castle', 'superhero', 'cartoon'
    ];
  }

  // 获取推荐标签
  static async getRecommendedTags(): Promise<string[]> {
    // 这个可以从API获取，或者保持静态数据
    return [
      'cute', 'fun', 'colorful', 'simple', 'detailed', 'fantasy',
      'realistic', 'cartoon', 'nature', 'adventure'
    ];
  }

  // 根据ID获取图片
  static async getImageById(imageId: string): Promise<CategoryImage | null> {
    try {
      const response = await this.apiRequest<ApiResponse<CategoryImage>>(`/api/images/${imageId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch image ${imageId}:`, error);
      return null;
    }
  }

  // 获取相关图片
  static async getRelatedImages(imageId: string, limit: number = 8): Promise<CategoryImage[]> {
    try {
      // 首先获取目标图片信息
      const targetImage = await this.getImageById(imageId);
      if (!targetImage) return [];

      // 获取同分类的其他图片
      const searchResult = await this.searchImages({
        category: targetImage.category,
        limit: limit * 2 // 获取更多图片以便过滤
      });

      // 过滤掉当前图片，并限制数量
      const relatedImages = searchResult.images
        .filter(img => img.id !== imageId)
        .slice(0, limit);

      return relatedImages;
    } catch (error) {
      console.error(`Failed to fetch related images for ${imageId}:`, error);
      return [];
    }
  }
}

// 导出默认实例
export const categoriesService = new CategoriesService();
