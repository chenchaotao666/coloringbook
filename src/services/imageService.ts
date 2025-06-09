import homeImagesData from '../data/images.json';
import relatedImagesData from '../data/relatedImages.json';

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

// 从JSON文件加载首页图片数据
const homeImages: HomeImage[] = homeImagesData as HomeImage[];
// 从JSON文件加载相关图片数据
const relatedImages: HomeImage[] = relatedImagesData as HomeImage[];

export class HomeImageService {
  /**
   * 获取默认显示的图片（mario作为默认）
   */
  static getDefaultImage(): HomeImage {
    return homeImages.find(img => img.id === 'mario') || homeImages[0];
  }

  /**
   * 获取所有首页图片
   */
  static getAllImages(): HomeImage[] {
    return homeImages;
  }

  /**
   * 根据ID获取图片
   */
  static getImageById(id: string): HomeImage | undefined {
    return homeImages.find(img => img.id === id);
  }

  /**
   * 获取随机图片
   */
  static getRandomImage(): HomeImage {
    const randomIndex = Math.floor(Math.random() * homeImages.length);
    return homeImages[randomIndex];
  }

  /**
   * 模拟API请求获取首页图片
   */
  static async fetchHomeImage(): Promise<HomeImage> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.getDefaultImage();
  }

  /**
   * 模拟API请求获取所有首页图片
   */
  static async fetchAllHomeImages(): Promise<HomeImage[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.getAllImages();
  }

  /**
   * 根据标签过滤图片
   */
  static getImagesByTag(tag: string): HomeImage[] {
    return homeImages.filter(img => 
      img.tags.some(imgTag => imgTag.toLowerCase().includes(tag.toLowerCase()))
    );
  }

  /**
   * 根据多个标签过滤图片
   */
  static getImagesByTags(tags: string[]): HomeImage[] {
    if (tags.length === 0) return homeImages;
    
    return homeImages.filter(img => 
      tags.some(tag => 
        img.tags.some(imgTag => imgTag.toLowerCase().includes(tag.toLowerCase()))
      )
    );
  }

  /**
   * 搜索图片（根据标题、描述、标签）
   */
  static searchImages(query: string): HomeImage[] {
    const lowerQuery = query.toLowerCase();
    return homeImages.filter(img => 
      img.title.toLowerCase().includes(lowerQuery) ||
      img.description.toLowerCase().includes(lowerQuery) ||
      img.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * 获取所有唯一标签
   */
  static getAllTags(): string[] {
    const allTags = homeImages.flatMap(img => img.tags);
    return [...new Set(allTags)].sort();
  }

  /**
   * 获取相关图片（基于当前图片信息从relatedImages.json获取）
   * @param imageId 当前图片ID
   * @param limit 返回图片数量限制，默认4张
   * @returns 相关图片数组
   */
  static getRelatedImages(imageId: string, limit: number = 4): HomeImage[] {
    return relatedImages.filter(img => img.id !== imageId).slice(0, limit);
  }

  /**
   * 获取图片统计信息
   */
  static getImageStats() {
    const totalImages = homeImages.length;
    const allTags = this.getAllTags();
    const tagCounts = allTags.map(tag => ({
      tag,
      count: homeImages.filter(img => img.tags.includes(tag)).length
    }));

    return {
      totalImages,
      totalTags: allTags.length,
      tagCounts: tagCounts.sort((a, b) => b.count - a.count),
      averageTagsPerImage: homeImages.reduce((sum, img) => sum + img.tags.length, 0) / totalImages
    };
  }

  /**
   * 验证图片数据完整性
   */
  static validateImageData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    homeImages.forEach((img, index) => {
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
  }
}