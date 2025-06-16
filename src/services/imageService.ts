uiimport { ApiUtils, ApiError } from '../utils/apiUtils';

export interface HomeImage {
  id: string;
  name: string;
  defaultUrl: string;
  colorUrl: string;
  title: string;
  description: string;
  tags: string;
  type: 'text2image' | 'image2image';
  ratio: '3:4' | '4:3' | '1:1' | '';
  isPublic: boolean;
  createdAt: string;
  prompt: string;
  userId: string;
  category: string;
  size: string;
  additionalInfo: string;
}

// 搜索结果接口
export interface SearchResult {
  images: HomeImage[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  pageSize: number;
}

// 搜索参数接口
export interface SearchParams {
  imageId?: string;
  query?: string;
  categoryId?: string;
  tags?: string;
  ratio?: '1:1' | '3:4' | '4:3';
  type?: 'text2image' | 'image2image';
  userId?: string;
  isPublic?: boolean;
  currentPage?: number;
  pageSize?: number;
  isRelated?: boolean;
}

// 举报请求接口
export interface ReportImageRequest {
  content: string;
  imageId: string;
}

export class ImageService {
  /**
   * 搜索图片（根据标题、描述、标签）- 核心方法
   */
  static async searchImages(params: SearchParams = {}): Promise<SearchResult> {
    const {
      imageId,
      query,
      categoryId,
      tags,
      ratio,
      type,
      userId,
      isPublic,
      currentPage = 1,
      pageSize = 20,
      isRelated = false
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      
      if (imageId) searchParams.append('imageId', imageId);
      if (query) searchParams.append('query', query);
      if (categoryId) searchParams.append('categoryId', categoryId);
      if (tags) searchParams.append('tags', tags);
      if (ratio) searchParams.append('ratio', ratio);
      if (type) searchParams.append('type', type);
      if (userId) searchParams.append('userId', userId);
      if (isPublic !== undefined) searchParams.append('isPublic', isPublic.toString());
      if (isRelated) searchParams.append('isRelated', isRelated.toString());
      
      searchParams.append('currentPage', currentPage.toString());
      searchParams.append('pageSize', pageSize.toString());

      const response = await ApiUtils.get<{images: HomeImage[], total: number}>(`/api/images?${searchParams.toString()}`);
      
      // 处理服务器返回的格式: {images: [...], total: number}
      const images = response.images || [];
      const totalCount = response.total || 0;
      
      // 计算分页信息
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasMore = currentPage < totalPages;
      
      return {
        images,
        totalCount,
        hasMore,
        currentPage,
        pageSize
      };
    } catch (error) {
      console.error('Failed to search images:', error);
      return {
        images: [],
        totalCount: 0,
        hasMore: false,
        currentPage: 1,
        pageSize: 20
      };
    }
  }

  /**
   * 获取所有首页图片
   */
  static async getAllImages(): Promise<HomeImage[]> {
    try {
      const result = await this.searchImages({ pageSize: 100 });
      return result.images;
    } catch (error) {
      console.error('Failed to fetch all images:', error);
      return [];
    }
  }

  /**
   * 根据ID获取单张图片
   */
  static async getImageById(id: string): Promise<HomeImage | null> {
    try {
      const result = await this.searchImages({ imageId: id });
      return result.images.length > 0 ? result.images[0] : null;
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
      const result = await this.searchImages({ 
        imageId, 
        isRelated: true, 
        pageSize: limit 
      });
      
      return result.images;
    } catch (error) {
      console.error(`Failed to get related images for ${imageId}:`, error);
      return [];
    }
  }

  /**
   * 删除图片
   * @param imageId 要删除的图片ID
   * @returns Promise<boolean> 删除是否成功
   */
  static async deleteImage(imageId: string): Promise<boolean> {
    try {
      await ApiUtils.delete<any>(`/api/images/${imageId}`, true);
      return true;
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * 举报图片
   * @param data 举报数据
   * @returns Promise<boolean> 举报是否成功
   */
  static async reportImage(data: ReportImageRequest): Promise<boolean> {
    try {
      await ApiUtils.post<any>('/api/images/report', data, true);
      return true;
    } catch (error) {
      console.error('Failed to report image:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * 按分类获取图片
   * @param categoryId 分类ID
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getImagesByCategoryId(
    categoryId: string, 
    params: { currentPage?: number; pageSize?: number; query?: string } = {}
  ): Promise<SearchResult> {
    return this.searchImages({
      categoryId,
      ...params
    });
  }

  /**
   * 按标签获取图片
   * @param tags 标签字符串（逗号分隔）
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getImagesByTags(
    tags: string, 
    params: { currentPage?: number; pageSize?: number } = {}
  ): Promise<SearchResult> {
    return this.searchImages({
      tags,
      ...params
    });
  }

  /**
   * 获取用户创建的图片
   * @param userId 用户ID
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getUserImages(
    userId: string, 
    params: { currentPage?: number; pageSize?: number; type?: 'text2image' | 'image2image' } = {}
  ): Promise<SearchResult> {
    return this.searchImages({
      userId,
      ...params
    });
  }

  /**
   * 获取公开图片
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getPublicImages(
    params: { currentPage?: number; pageSize?: number; query?: string; category?: string } = {}
  ): Promise<SearchResult> {
    return this.searchImages({
      isPublic: true,
      ...params
    });
  }

}