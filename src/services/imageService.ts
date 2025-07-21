import { ApiUtils, ApiError } from '../utils/apiUtils';
import { UrlUtils } from '../utils/urlUtils';
import { LocalizedText } from '../utils/textUtils';

export type AspectRatio = '21:9' | '16:9' | '4:3' | '1:1' | '3:4' | '9:16' | '16:21';

// 定义 Tag 接口
export interface Tag {
  tag_id: string;
  description: {
    en: string;
    zh: string;
  };
  display_name: {
    en: string;
    zh: string;
  };
}

export interface HomeImage {
  id: string;
  name: string;
  defaultUrl: string;
  colorUrl: string;
  coloringUrl?: string;
  title: LocalizedText | string;
  description: LocalizedText | string;
  tags?: Tag[];  // 更新为新的 Tag 类型
  type: 'text2image' | 'image2image' | 'image2coloring';
  ratio: AspectRatio | '';
  isPublic: boolean;
  hotness: number; // 热度值
  createdAt: string;
  prompt: LocalizedText | string;
  userId: string;
  category: string;
  categoryId: string;
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
  ratio?: AspectRatio;
  type?: 'text2image' | 'image2image' | 'image2coloring';
  userId?: string;
  isPublic?: boolean;
  currentPage?: number;
  pageSize?: number;
  isRelated?: boolean;
  sortBy?: 'createdAt' | 'hotness' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// 用户图片查询参数接口
export interface UserImageParams {
  query?: string;
  categoryId?: string;
  tags?: string;
  ratio?: AspectRatio;
  type?: 'text2image' | 'image2image' | 'image2coloring';
  isPublic?: boolean;
  currentPage?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'hotness' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// 举报请求接口
export interface ReportImageRequest {
  content: string;
  imageId: string;
}

export class ImageService {
  /**
   * 处理图片对象，确保所有URL都是绝对路径
   */
  private static processImageUrls(image: HomeImage): HomeImage {
    return UrlUtils.processObjectUrls(image, ['defaultUrl', 'colorUrl', 'coloringUrl']);
  }

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
      currentPage,
      pageSize,
      isRelated = false,
      sortBy = 'hotness',
      sortOrder = 'desc'
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
      
      if (currentPage) searchParams.append('currentPage', currentPage.toString());
      if (pageSize) searchParams.append('pageSize', pageSize.toString());
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);

      const response = await ApiUtils.get<{images: HomeImage[], total: number}>(`/api/images?${searchParams.toString()}`);
      
      // 处理服务器返回的格式: {images: [...], total: number}
      const rawImages = response.images || [];
      const totalCount = response.total || 0;
      
      // 处理图片URL，确保都是绝对路径
      const images = rawImages.map(image => this.processImageUrls(image));
      
      // 计算分页信息
      const safePageSize = pageSize || 20;
      const safeCurrentPage = currentPage || 1;
      const totalPages = Math.ceil(totalCount / safePageSize);
      const hasMore = safeCurrentPage < totalPages;
      
      return {
        images,
        totalCount,
        hasMore,
        currentPage: safeCurrentPage,
        pageSize: safePageSize
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
   * 获取相关图片（基于分类ID）
   * @param categoryId 分类ID
   * @param currentImageId 当前图片ID，用于过滤掉自己
   * @param limit 返回图片数量限制，默认4张
   * @returns 相关图片数组
   */
  static async getRelatedImages(categoryId: string, currentImageId: string, limit: number = 4): Promise<HomeImage[]> {
    try {
      // 查询比需要的数量多一些，以防过滤掉自己后数量不够
      const result = await this.searchImages({ 
        categoryId, 
        isPublic: true, // 只返回公开的图片
        pageSize: limit + 1 // 多查询1张，以防过滤后不够
      });
      
      // 过滤掉当前图片，然后取前limit张
      const filteredImages = result.images
        .filter(image => image.id !== currentImageId)
        .slice(0, limit);
      
      return filteredImages;
    } catch (error) {
      console.error(`Failed to get related images for category ${categoryId}:`, error);
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
    params: { currentPage?: number; pageSize?: number; type?: 'text2image' | 'image2image' | 'image2coloring' } = {}
  ): Promise<SearchResult> {
    return this.searchImages({
      userId,
      ...params
    });
  }

  /**
   * 📦 获取用户自己创建的图片（专用接口）
   * 接口地址：GET /api/images/userImg
   * 用户获取自己创建的图片时，调用这个接口
   * @param params 查询参数
   * @returns Promise<SearchResult>
   */
  static async getUserOwnImages(params: UserImageParams = {}): Promise<SearchResult> {
    const {
      query,
      categoryId,
      tags,
      ratio,
      type,
      isPublic,
      currentPage = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = params;

    try {
      // 构建查询参数
      const searchParams = new URLSearchParams();
      
      if (query) searchParams.append('query', query);
      if (categoryId) searchParams.append('categoryId', categoryId);
      if (tags) searchParams.append('tags', tags);
      if (ratio) searchParams.append('ratio', ratio);
      if (type) searchParams.append('type', type);
      if (isPublic !== undefined) searchParams.append('isPublic', isPublic.toString());
      if (sortBy) searchParams.append('sortBy', sortBy);
      if (sortOrder) searchParams.append('sortOrder', sortOrder);
      
      searchParams.append('currentPage', currentPage.toString());
      searchParams.append('pageSize', pageSize.toString());

      // 调用专用的用户图片接口，需要认证
      const response = await ApiUtils.get<{images: HomeImage[], total: number}>(
        `/api/images/userImg?${searchParams.toString()}`, 
        {}, 
        true // 需要认证
      );
      
      // 处理服务器返回的格式
      const rawImages = response.images || [];
      const totalCount = response.total || 0;
      
      // 处理图片URL，确保都是绝对路径
      const images = rawImages.map(image => this.processImageUrls(image));
      
      // 计算分页信息
      const safePageSize = pageSize || 20;
      const safeCurrentPage = currentPage || 1;
      const totalPages = Math.ceil(totalCount / safePageSize);
      const hasMore = safeCurrentPage < totalPages;
      
      return {
        images,
        totalCount,
        hasMore,
        currentPage: safeCurrentPage,
        pageSize: safePageSize
      };
    } catch (error) {
      console.error('Failed to fetch user own images:', error);
      if (error instanceof ApiError) {
        throw error;
      }
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

  /**
   * 获取图片总数
   * @returns Promise<number> 返回图片总数
   */
  static async getImageCount(): Promise<number> {
    try {
      const response = await ApiUtils.get<number>('/api/images/count');
      return response;
    } catch (error) {
      console.error('Failed to fetch image count:', error);
      return 0;
    }
  }

}