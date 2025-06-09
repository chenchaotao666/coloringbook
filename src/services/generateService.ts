import { HomeImage } from './imageService';
import { ImageConverter } from '../utils/imageConverter';

// ==================== 类型定义 ====================
// API服务配置
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3001' 
  : '';

// 接口类型定义
export interface GeneratedImage {
  id: string;
  url: string;
  fullSizeUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  prompt?: string;
  ratio: '3:4' | '4:3' | '1:1' | '';
  isPublic: boolean;
}

export interface GenerateTextToImageRequest {
  prompt: string;
  ratio: '3:4' | '4:3' | '1:1';
  isPublic: boolean;
  style?: string;
}

export interface GenerateImageToImageRequest {
  imageFile: File;
  ratio?: '3:4' | '4:3' | '1:1';
  isPublic: boolean;
}

export interface GenerateResponse {
  success: boolean;
  data: {
    images: GeneratedImage[];
    taskId: string;
  };
  message?: string;
}

export interface ExampleImage {
  id: string;
  url: string;
  fullSizeUrl: string;
  category: 'text' | 'image';
  prompt?: string;
}

export interface StyleSuggestion {
  id: string;
  name: string;
  category: string;
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

// 通用API请求方法
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
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
};

// 样式建议数据
const styleSuggestions: StyleSuggestion[] = [
  { id: 'cute', name: '可爱风格', category: 'style' },
  { id: 'cartoon', name: '卡通风格', category: 'style' },
  { id: 'realistic', name: '写实风格', category: 'style' },
  { id: 'fantasy', name: '奇幻风格', category: 'style' },
  { id: 'tech', name: '科技风格', category: 'style' },
  { id: 'nature', name: '自然风格', category: 'style' }
];

// ==================== 工具函数 ====================
// 随机获取风格建议的函数
const getRandomStyleSuggestions = (count: number = 6): StyleSuggestion[] => {
  const shuffled = [...styleSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 模拟生成延迟
const simulateGenerationDelay = (ms: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 生成随机任务ID
const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 获取示例图片
const getExampleImages = async (category: 'text' | 'image'): Promise<ExampleImage[]> => {
  try {
    const response = await apiRequest<ApiResponse<HomeImage[]>>('/api/images?limit=10');
    const images = response.data;
    
    // 根据类别筛选图片
    const filteredImages = images.filter(img => {
      if (category === 'text') {
        // 文本生成类型的示例
        return img.tags && img.tags.some(tag => 
          tag.toLowerCase().includes('text') || 
          tag.toLowerCase().includes('prompt') ||
          tag.toLowerCase().includes('generate')
        );
      } else {
        // 图片转换类型的示例
        return img.tags && img.tags.some(tag => 
          tag.toLowerCase().includes('image') || 
          tag.toLowerCase().includes('convert') ||
          tag.toLowerCase().includes('transform')
        );
      }
    });

    // 如果没有找到特定类别的图片，返回前几张图片
    const selectedImages = filteredImages.length > 0 ? filteredImages : images;
    
    return selectedImages.slice(0, 3).map(img => ({
      id: img.id,
      url: img.defaultUrl,
      fullSizeUrl: img.colorUrl,
      category,
      prompt: img.description
    }));
  } catch (error) {
    console.error('Failed to get example images:', error);
    return [];
  }
};

// 模拟批量生成图片
const generateMockImages = async (
  prompt: string, 
  ratio: '3:4' | '4:3' | '1:1' | '', 
  count: number = 1
): Promise<GeneratedImage[]> => {
  try {
    // 从API获取随机图片
    const response = await apiRequest<ApiResponse<HomeImage[]>>('/api/images?limit=20');
    const images = response.data;
    
    if (images.length === 0) {
      return [];
    }

    const results: GeneratedImage[] = [];
    const baseTimestamp = Date.now();
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * images.length);
      const selectedImage = images[randomIndex];
      const randomId = Math.floor(Math.random() * 10000) + i;
      const uniqueId = `${baseTimestamp + i}_${randomId}_${Math.random().toString(36).substr(2, 9)}`;
      
      results.push({
        id: `generated_${uniqueId}`,
        url: `${selectedImage.defaultUrl}?id=${uniqueId}`,
        fullSizeUrl: `${selectedImage.colorUrl}?id=${uniqueId}`,
        thumbnailUrl: `${selectedImage.defaultUrl}?id=${uniqueId}`,
        createdAt: new Date().toISOString(),
        prompt: prompt || selectedImage.description,
        ratio: ratio || '3:4',
        isPublic: true,
      });
    }
    
    return results;
  } catch (error) {
    console.error('Failed to generate mock images:', error);
    return [];
  }
};

// ==================== Mock API服务类 ====================
class MockApiService {
  private generatedImagesStore: GeneratedImage[] = [];
  private taskStore: Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    images?: GeneratedImage[];
    error?: string;
  }> = new Map();

  constructor() {
    // 初始化一些示例图片
    this.initializeExampleImages();
  }

  private async initializeExampleImages() {
    try {
      const mockImages = await generateMockImages('示例图片', '3:4', 5);
      this.generatedImagesStore = mockImages;
    } catch (error) {
      console.error('Failed to initialize example images:', error);
    }
  }

  // 模拟文本转图片生成
  async generateTextToImage(data: GenerateTextToImageRequest): Promise<GenerateResponse> {
    console.log('Mock API: Starting text to image generation', data);
    
    const taskId = generateTaskId();
    
    // 设置初始任务状态
    this.taskStore.set(taskId, {
      status: 'processing',
      progress: 0,
    });

    // 启动后台生成过程
    this.simulateProgressiveGeneration(taskId, data);

    return {
      success: true,
      data: {
        images: [],
        taskId
      },
      message: '图片生成已开始，请稍候...'
    };
  }

  private async simulateProgressiveGeneration(taskId: string, data: GenerateTextToImageRequest) {
    const steps = [10, 30, 50, 70, 90, 100];
    
    for (const progress of steps) {
      await simulateGenerationDelay(500);
      
      const taskStatus = this.taskStore.get(taskId);
      if (taskStatus) {
        taskStatus.progress = progress;
        
        if (progress === 100) {
          try {
            const generatedImages = await generateMockImages(data.prompt, data.ratio, 1);
            taskStatus.status = 'completed';
            taskStatus.images = generatedImages;
            
            // 添加到存储中
            this.generatedImagesStore.push(...generatedImages);
          } catch (error) {
            taskStatus.status = 'failed';
            taskStatus.error = '生成失败，请重试';
          }
        }
      }
    }
  }

  // 模拟图片转图片生成
  async generateImageToImage(data: GenerateImageToImageRequest): Promise<GenerateResponse> {
    console.log('Mock API: Starting image to image generation', data);
    
    const taskId = generateTaskId();
    
    // 设置初始任务状态
    this.taskStore.set(taskId, {
      status: 'processing',
      progress: 0,
    });

    // 启动后台生成过程
    this.simulateImageToImageGeneration(taskId, data);

    return {
      success: true,
      data: {
        images: [],
        taskId
      },
      message: '图片转换已开始，请稍候...'
    };
  }

  private async simulateImageToImageGeneration(taskId: string, data: GenerateImageToImageRequest) {
    const steps = [20, 40, 60, 80, 100];
    
    for (const progress of steps) {
      await simulateGenerationDelay(400);
      
      const taskStatus = this.taskStore.get(taskId);
      if (taskStatus) {
        taskStatus.progress = progress;
        
        if (progress === 100) {
          try {
            const generatedImages = await generateMockImages(
              `基于上传图片的转换`, 
              data.ratio || '3:4', 
              1
            );
            taskStatus.status = 'completed';
            taskStatus.images = generatedImages;
            
            // 添加到存储中
            this.generatedImagesStore.push(...generatedImages);
          } catch (error) {
            taskStatus.status = 'failed';
            taskStatus.error = '转换失败，请重试';
          }
        }
      }
    }
  }

  // 获取示例图片
  async getExampleImages(category: 'text' | 'image'): Promise<ExampleImage[]> {
    try {
      return await getExampleImages(category);
    } catch (error) {
      console.error('Failed to get example images:', error);
      return [];
    }
  }

  // 获取风格建议
  async getStyleSuggestions(): Promise<StyleSuggestion[]> {
    await simulateGenerationDelay(100);
    return getRandomStyleSuggestions();
  }

  // 下载图片
  async downloadImage(imageId: string, format: 'png' | 'pdf'): Promise<Blob> {
    await simulateGenerationDelay(500);
    
    const image = this.generatedImagesStore.find(img => img.id === imageId);
    if (!image) {
      throw new Error('图片不存在');
    }

    if (format === 'pdf') {
      return ImageConverter.convertImageToPdf(image.fullSizeUrl);
    } else {
      // 模拟PNG下载
      const response = await fetch(image.fullSizeUrl);
      return response.blob();
    }
  }

  // 获取生成任务状态
  async getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    images?: GeneratedImage[];
    error?: string;
  }> {
    const taskStatus = this.taskStore.get(taskId);
    if (!taskStatus) {
      return {
        status: 'failed',
        progress: 0,
        error: '任务不存在'
      };
    }

    return taskStatus;
  }

  // 重新创建示例图片
  async recreateExample(exampleId: string): Promise<GenerateResponse> {
    try {
      const exampleImages = await getExampleImages('text');
      const example = exampleImages.find(img => img.id === exampleId);
      
      if (!example) {
        throw new Error('示例图片不存在');
      }

      return this.generateTextToImage({
        prompt: example.prompt || '重新生成示例图片',
        ratio: '3:4',
        isPublic: true
      });
    } catch (error) {
      return {
        success: false,
        data: {
          images: [],
          taskId: ''
        },
        message: '重新生成失败'
      };
    }
  }

  // 获取所有生成的图片
  async getAllGeneratedImages(_userId?: string): Promise<GeneratedImage[]> {
    await simulateGenerationDelay(200);
    return [...this.generatedImagesStore];
  }

  // 根据用户ID获取图片
  async getImagesByUserId(_userId: string): Promise<GeneratedImage[]> {
    await simulateGenerationDelay(200);
    return this.generatedImagesStore.filter(img => img.isPublic);
  }

  // 删除生成的图片
  async deleteGeneratedImage(imageId: string): Promise<{ success: boolean; message: string }> {
    await simulateGenerationDelay(100);
    
    const index = this.generatedImagesStore.findIndex(img => img.id === imageId);
    if (index === -1) {
      return { success: false, message: '图片不存在' };
    }

    this.generatedImagesStore.splice(index, 1);
    return { success: true, message: '图片删除成功' };
  }
}

// ==================== 导出服务实例 ====================
export const generateService = new MockApiService();

// 导出类型和工具函数
export { MockApiService, generateTaskId, simulateGenerationDelay };
export default generateService; 