import categoriesData from '../data/categories.json';
import categoryImagesData from '../data/categoryImages.json';

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

// 从JSON文件加载数据
const mockCategories: Category[] = categoriesData;
const mockCategoryImages: CategoryImage[] = categoryImagesData as CategoryImage[];

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

// 分类服务类
export class CategoriesService {
  // 获取所有分类
  static async getCategories(): Promise<Category[]> {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
  }

  // 根据ID获取分类
  static async getCategoryById(categoryId: string): Promise<Category | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCategories.find(cat => cat.id === categoryId) || null;
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

    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 800));

    let filteredImages = [...mockCategoryImages];

    // 按分类过滤
    if (category) {
      filteredImages = filteredImages.filter(img => img.category === category);
    }

    // 按查询词过滤
    if (query) {
      const queryLower = query.toLowerCase();
      filteredImages = filteredImages.filter(img => 
        img.title.toLowerCase().includes(queryLower) ||
        img.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
        img.description?.toLowerCase().includes(queryLower)
      );
    }

    // 按标签过滤
    if (tags.length > 0) {
      filteredImages = filteredImages.filter(img =>
        tags.some(tag => img.tags.includes(tag))
      );
    }

    // 按比例过滤
    if (ratio) {
      filteredImages = filteredImages.filter(img => img.ratio === ratio);
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    return {
      images: paginatedImages,
      totalCount: filteredImages.length,
      hasMore: endIndex < filteredImages.length
    };
  }

  // 获取热门搜索词
  static async getPopularSearchTerms(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      'cat', 'dog', 'flower', 'car', 'princess', 'dragon',
      'robot', 'butterfly', 'tree', 'castle', 'superhero', 'cartoon'
    ];
  }

  // 获取推荐标签
  static async getRecommendedTags(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [
      'cute', 'fun', 'colorful', 'simple', 'detailed', 'fantasy',
      'realistic', 'cartoon', 'nature', 'adventure'
    ];
  }

  // 根据ID获取图片
  static async getImageById(imageId: string): Promise<CategoryImage | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockCategoryImages.find(img => img.id === imageId) || null;
  }

  // 获取相关图片
  static async getRelatedImages(imageId: string, limit: number = 8): Promise<CategoryImage[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const targetImage = mockCategoryImages.find(img => img.id === imageId);
    if (!targetImage) return [];

    // 优先获取同分类的其他图片
    let relatedImages = mockCategoryImages
      .filter(img => img.id !== imageId && img.category === targetImage.category);

    // 如果同分类图片不够，从其他分类中获取相似标签的图片
    if (relatedImages.length < limit) {
      const otherCategoryImages = mockCategoryImages
        .filter(img => 
          img.id !== imageId && 
          img.category !== targetImage.category &&
          img.tags.some(tag => targetImage.tags.includes(tag))
        );
      
      relatedImages = [...relatedImages, ...otherCategoryImages];
    }

    // 如果还是不够，随机添加其他图片
    if (relatedImages.length < limit) {
      const remainingImages = mockCategoryImages
        .filter(img => 
          img.id !== imageId && 
          !relatedImages.some(related => related.id === img.id)
        );
      
      relatedImages = [...relatedImages, ...remainingImages];
    }

    // 随机排序并限制数量
    return relatedImages
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  }
}

// 导出默认实例
export const categoriesService = new CategoriesService();
