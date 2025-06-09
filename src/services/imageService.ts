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

export class HomeImageService {
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

  /**
   * 获取默认显示的图片（mario作为默认）
   */
  static async getDefaultImage(): Promise<HomeImage | null> {
    try {
      // 尝试获取mario图片
      const response = await this.apiRequest<ApiResponse<HomeImage>>('/api/images/mario');
      return response.data;
    } catch (error) {
      // 如果mario不存在，获取第一张图片
      try {
        const allImages = await this.getAllImages();
        return allImages.length > 0 ? allImages[0] : null;
      } catch (fallbackError) {
        console.error('Failed to get default image:', fallbackError);
        return null;
      }
    }
  }

  /**
   * 获取所有首页图片
   */
  static async getAllImages(): Promise<HomeImage[]> {
    try {
      const response = await this.apiRequest<ApiResponse<HomeImage[]>>('/api/images?limit=100');
      return response.data;
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
      const response = await this.apiRequest<ApiResponse<HomeImage>>(`/api/images/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch image ${id}:`, error);
      return null;
    }
  }

  /**
   * 模拟API请求获取首页图片
   */
  static async fetchHomeImage(): Promise<HomeImage | null> {
    return this.getDefaultImage();
  }

  /**
   * 模拟API请求获取所有首页图片
   */
  static async fetchAllHomeImages(): Promise<HomeImage[]> {
    return this.getAllImages();
  }

  /**
   * 根据标签过滤图片
   */
  static async getImagesByTag(tag: string): Promise<HomeImage[]> {
    try {
      const response = await this.apiRequest<ApiResponse<HomeImage[]>>(`/api/images?search=${encodeURIComponent(tag)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get images by tag ${tag}:`, error);
      return [];
    }
  }

  /**
   * 根据多个标签过滤图片
   */
  static async getImagesByTags(tags: string[]): Promise<HomeImage[]> {
    if (tags.length === 0) return this.getAllImages();
    
    try {
      const searchQuery = tags.join(' ');
      const response = await this.apiRequest<ApiResponse<HomeImage[]>>(`/api/images?search=${encodeURIComponent(searchQuery)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get images by tags:`, error);
      return [];
    }
  }

  /**
   * 搜索图片（根据标题、描述、标签）
   */
  static async searchImages(query: string): Promise<HomeImage[]> {
    try {
      const response = await this.apiRequest<ApiResponse<HomeImage[]>>(`/api/images?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to search images with query "${query}":`, error);
      return [];
    }
  }

  /**
   * 获取所有唯一标签
   */
  static async getAllTags(): Promise<string[]> {
    try {
      const allImages = await this.getAllImages();
      const allTags = allImages.flatMap(img => img.tags || []);
      return [...new Set(allTags)].sort();
    } catch (error) {
      console.error('Failed to get all tags:', error);
      return [];
    }
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

      // 获取所有图片
      const allImages = await this.getAllImages();
      
      // 过滤掉当前图片
      const otherImages = allImages.filter(img => img.id !== imageId);
      
      // 如果有标签，优先返回有相同标签的图片
      if (targetImage.tags && targetImage.tags.length > 0) {
        const relatedByTags = otherImages.filter(img => 
          img.tags && img.tags.some(tag => targetImage.tags.includes(tag))
        );
        
        if (relatedByTags.length >= limit) {
          return relatedByTags.slice(0, limit);
        }
        
        // 如果相关图片不够，补充其他图片
        const remaining = otherImages.filter(img => 
          !relatedByTags.some(related => related.id === img.id)
        );
        
        return [...relatedByTags, ...remaining].slice(0, limit);
      }
      
      // 如果没有标签，随机返回其他图片
      return otherImages.slice(0, limit);
    } catch (error) {
      console.error(`Failed to get related images for ${imageId}:`, error);
      return [];
    }
  }

  /**
   * 获取图片统计信息
   */
  static async getImageStats() {
    try {
      const allImages = await this.getAllImages();
      const allTags = await this.getAllTags();
      
      const tagCounts = allTags.map(tag => ({
        tag,
        count: allImages.filter(img => img.tags && img.tags.includes(tag)).length
      }));

      return {
        totalImages: allImages.length,
        totalTags: allTags.length,
        tagCounts: tagCounts.sort((a, b) => b.count - a.count),
        averageTagsPerImage: allImages.reduce((sum, img) => sum + (img.tags?.length || 0), 0) / allImages.length
      };
    } catch (error) {
      console.error('Failed to get image stats:', error);
      return {
        totalImages: 0,
        totalTags: 0,
        tagCounts: [],
        averageTagsPerImage: 0
      };
    }
  }

  /**
   * 验证图片数据完整性
   */
  static async validateImageData(): Promise<{ isValid: boolean; errors: string[] }> {
    try {
      const allImages = await this.getAllImages();
      const errors: string[] = [];
      
      allImages.forEach((img, index) => {
        if (!img.id) errors.push(`Image at index ${index} missing id`);
        if (!img.title) errors.push(`Image ${img.id || index} missing title`);
        if (!img.defaultUrl) errors.push(`Image ${img.id || index} missing defaultUrl`);
        if (!img.colorUrl) errors.push(`Image ${img.id || index} missing colorUrl`);
        if (!Array.isArray(img.tags)) errors.push(`Image ${img.id || index} tags is not an array`);
        if (!img.additionalInfo) errors.push(`Image ${img.id || index} missing additionalInfo`);
        
        if (img.additionalInfo) {
          if (!Array.isArray(img.additionalInfo.features)) {
            errors.push(`Image ${img.id || index} additionalInfo.features is not an array`);
          }
          if (!Array.isArray(img.additionalInfo.suitableFor)) {
            errors.push(`Image ${img.id || index} additionalInfo.suitableFor is not an array`);
          }
          if (!Array.isArray(img.additionalInfo.coloringSuggestions)) {
            errors.push(`Image ${img.id || index} additionalInfo.coloringSuggestions is not an array`);
          }
          if (!Array.isArray(img.additionalInfo.creativeUses)) {
            errors.push(`Image ${img.id || index} additionalInfo.creativeUses is not an array`);
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Failed to validate image data:', error);
      return {
        isValid: false,
        errors: ['Failed to fetch image data for validation']
      };
    }
  }
}