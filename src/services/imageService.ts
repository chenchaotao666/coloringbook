import { ApiUtils, ApiResponse } from '../utils/apiUtils';

export interface HomeImage {
  id: string;
  name: string;
  defaultUrl: string;
  colorUrl: string;
  title: string;
  description: string;
  tags: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  additionalInfo: {
    features: string[];
    suitableFor: string[];
    coloringSuggestions: string[];
    creativeUses: string[];
  };
}

// 搜索结果接口
export interface SearchResult {
  images: HomeImage[];
  totalCount: number;
  hasMore: boolean;
}

// 搜索参数接口
export interface SearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  ratio?: '1:1' | '3:4' | '4:3';
  type?: 'text2image' | 'image2image';
  page?: number;
  limit?: number;
}

export class HomeImageService {
  /**
   * 搜索图片（根据标题、描述、标签）- 核心方法
   */
  static async searchImages(params: SearchParams = {}): Promise<SearchResult> {
    const {
      query = '',
      category = '',
      tags = [],
      ratio,
      type,
      page = 1,
      limit = 20
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('search', query);
      if (category) searchParams.append('category', category);
      if (ratio) searchParams.append('difficulty', ratio); // 使用difficulty参数映射ratio
      if (type) searchParams.append('type', type);
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      
      // 如果有标签，将其作为搜索词的一部分
      if (tags.length > 0) {
        const tagQuery = tags.join(' ');
        const combinedQuery = query ? `${query} ${tagQuery}` : tagQuery;
        searchParams.set('search', combinedQuery);
      }

      const response = await ApiUtils.apiRequest<ApiResponse<HomeImage[]>>(`/api/images?${searchParams.toString()}`);
      
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

  /**
   * 获取所有首页图片
   */
  static async getAllImages(): Promise<HomeImage[]> {
    try {
      const result = await this.searchImages({ limit: 100 });
      return result.images;
    } catch (error) {
      console.error('Failed to fetch all images:', error);
      return [];
    }
  }

  /**
   * 根据ID获取图片
   */
  static async getImageById(id: string): Promise<HomeImage | null> {
    try {
      const response = await ApiUtils.apiRequest<ApiResponse<HomeImage>>(`/api/images/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch image ${id}:`, error);
      return null;
    }
  }

  /**
   * 模拟API请求获取所有首页图片
   */
  static async fetchAllHomeImages(): Promise<HomeImage[]> {
    return this.getAllImages();
  }

  /**
   * 获取相关图片（基于当前图片信息）
   * @param imageId 当前图片ID
   * @param limit 返回图片数量限制，默认4张
   * @returns 相关图片数组
   */
  static async getRelatedImages(imageId: string, limit: number = 4): Promise<HomeImage[]> {
    try {
      // 首先获取目标图片信息
      const targetImage = await this.getImageById(imageId);
      if (!targetImage) return [];

      // 如果有标签，优先返回有相同标签的图片
      if (targetImage.tags && targetImage.tags.length > 0) {
        const result = await this.searchImages({
          tags: targetImage.tags,
          limit: limit * 2 // 获取更多图片以便过滤
        });
        
        // 过滤掉当前图片
        const relatedImages = result.images.filter(img => img.id !== imageId);
        
        if (relatedImages.length >= limit) {
          return relatedImages.slice(0, limit);
        }
        
        // 如果相关图片不够，补充其他图片
        const additionalResult = await this.searchImages({
          limit: limit * 2
        });
        
        const additionalImages = additionalResult.images.filter(img => 
          img.id !== imageId && !relatedImages.some(related => related.id === img.id)
        );
        
        return [...relatedImages, ...additionalImages].slice(0, limit);
      }
      
      // 如果没有标签，返回其他图片
      const result = await this.searchImages({ limit: limit + 1 });
      return result.images.filter(img => img.id !== imageId).slice(0, limit);
    } catch (error) {
      console.error(`Failed to get related images for ${imageId}:`, error);
      return [];
    }
  }
}