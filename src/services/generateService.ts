// 动态导入相关服务，避免循环依赖
import { ApiUtils } from '../utils/apiUtils';
import { HomeImage } from './imageService';
import { ImageService } from './imageService';

// ==================== 类型定义 ====================
// 接口类型定义
export interface GenerateTextToImageRequest {
  prompt: string;
  ratio: '3:4' | '4:3' | '1:1';
  isPublic: boolean;
  style?: string;
  userId?: string;
}

export interface GenerateImageToImageRequest {
  imageFile: File;
  ratio?: '3:4' | '4:3' | '1:1';
  isPublic: boolean;
  userId?: string;
}

export interface GenerateResponse {
  success: boolean;
  data: {
    taskId: string;
    imageId: string;
    status: string;
    progress: number;
    estimatedTime: number;
  };
  message?: string;
}

export interface TaskStatus {
  taskId: string;
  imageId: string;
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  type: 'text2image' | 'image2image';
  prompt: string;
  userId: string;
  createdAt: string;
  estimatedTime: number;
  completedAt?: string;
  image?: HomeImage;
  originalFileName?: string;
}

export interface StyleSuggestion {
  id: string;
  name: string;
  category: string;
}

export interface UserTask {
  taskId: string;
  imageId: string;
  status: string;
  progress: number;
  type: string;
  prompt: string;
  createdAt: string;
  estimatedTime: number;
  completedAt?: string;
  originalFileName?: string;
}

export interface UserTasksResponse {
  success: boolean;
  data: UserTask[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  stats: {
    total: number;
    processing: number;
    completed: number;
    failed: number;
    text2image: number;
    image2image: number;
  };
}

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

// 获取示例图片
const getExampleImages = async (category: 'text' | 'image'): Promise<HomeImage[]> => {
  try {
    // 根据类别确定搜索类型
    const searchType = category === 'text' ? 'text2image' : 'image2image';
    
    // 使用 searchImages API 获取对应类型的图片
    const result = await ImageService.searchImages({
      type: searchType,
      limit: 3
    });
    
    return result.images;
  } catch (error) {
    console.error('Failed to get example images:', error);
    return [];
  }
};

// ==================== 主要服务类 ====================
class GenerateService {
  private baseUrl = '/api/generate';

  constructor() {
    this.initializeExampleImages();
  }

  private async initializeExampleImages() {
    try {
      await getExampleImages('text');
      await getExampleImages('image');
    } catch (error) {
      console.error('Failed to initialize example images:', error);
    }
  }

  // 文本生成图片
  async generateTextToImage(data: GenerateTextToImageRequest): Promise<GenerateResponse> {
    try {
      const response = await ApiUtils.post<GenerateResponse>(`${this.baseUrl}/text-to-image`, {
        prompt: data.prompt,
        ratio: data.ratio,
        isPublic: data.isPublic,
        style: data.style,
        userId: data.userId
      });
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generate text to image error:', error);
      throw new Error('文本生成图片失败');
    }
  }

  // 图片转图片生成
  async generateImageToImage(data: GenerateImageToImageRequest): Promise<GenerateResponse> {
    try {
      const formData = new FormData();
      formData.append('image', data.imageFile);
      if (data.ratio) formData.append('ratio', data.ratio);
      formData.append('isPublic', data.isPublic.toString());
      if (data.userId) formData.append('userId', data.userId);

      const response = await fetch(`${this.baseUrl}/image-to-image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('Generate image to image error:', error);
      throw new Error('图片转换失败');
    }
  }

  // 获取任务状态
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const response = await ApiUtils.get<{ success: boolean; data: TaskStatus }>(`${this.baseUrl}/status/${taskId}`);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error('Failed to get task status');
      }
    } catch (error) {
      console.error('Get task status error:', error);
      throw new Error('获取任务状态失败');
    }
  }

  // 获取用户的所有生成任务
  async getUserTasks(userId: string, options?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<UserTasksResponse> {
    try {
      const params = new URLSearchParams();
      params.append('userId', userId);
      if (options?.status) params.append('status', options.status);
      if (options?.type) params.append('type', options.type);
      if (options?.page) params.append('page', options.page.toString());
      if (options?.limit) params.append('limit', options.limit.toString());

      const response = await ApiUtils.get<UserTasksResponse>(`${this.baseUrl}/tasks?${params.toString()}`);
      
      if (response.success) {
        return response;
      } else {
        throw new Error('Failed to get user tasks');
      }
    } catch (error) {
      console.error('Get user tasks error:', error);
      throw new Error('获取用户任务失败');
    }
  }

  // 获取示例图片
  async getExampleImages(category: 'text' | 'image'): Promise<HomeImage[]> {
    try {
      return await getExampleImages(category);
    } catch (error) {
      console.error('Get example images error:', error);
      return [];
    }
  }

  // 获取所有生成的图片
  async getAllGeneratedImages(): Promise<HomeImage[]> {
    try {
      // 由于这是模拟环境，我们返回一些示例图片作为"生成的"图片
      const { ImageService } = await import('./imageService');
      const result = await ImageService.searchImages({
        limit: 6 // 获取6张图片作为示例
      });

      // 为这些图片添加一些模拟的生成信息
      const generatedImages = result.images.map((img, index) => ({
        ...img,
        // 更新创建时间为模拟的生成时间
        createdAt: new Date(Date.now() - (index * 60000)).toISOString(),
        // 模拟用户ID
        userId: 'demo-user'
      }));

      return generatedImages;
    } catch (error) {
      console.error('Get all generated images error:', error);
      return [];
    }
  }

  // 获取用户生成的图片
  async getUserGeneratedImages(userId: string): Promise<HomeImage[]> {
    try {
      // 通过用户任务API获取用户生成的图片
      const userTasks = await this.getUserTasks(userId, { status: 'completed' });
      
      const generatedImages: HomeImage[] = [];
      
      // 遍历已完成的任务，获取对应的图片
      for (const task of userTasks.data) {
        if (task.status === 'completed') {
          // 通过任务状态获取完整的图片信息
          try {
            const taskStatus = await this.getTaskStatus(task.taskId);
            if (taskStatus.image) {
              generatedImages.push(taskStatus.image);
            }
          } catch (error) {
            console.warn(`Failed to get image for task ${task.taskId}:`, error);
          }
        }
      }
      
      return generatedImages;
    } catch (error) {
      console.error('Get user generated images error:', error);
      return [];
    }
  }

  // 获取风格建议
  async getStyleSuggestions(): Promise<StyleSuggestion[]> {
    try {
      return getRandomStyleSuggestions();
    } catch (error) {
      console.error('Get style suggestions error:', error);
      return styleSuggestions;
    }
  }

  // 下载图片
  async downloadImage(imageId: string, format: 'png' | 'pdf'): Promise<Blob> {
    try {
      // 首先获取图片信息
      const { ImageService } = await import('./imageService');
      const image = await ImageService.getImageById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }

      // 下载涂色页（黑白线稿）- 无论PNG还是PDF都使用defaultUrl
      // format参数用于调用方生成不同的文件名
      const imageUrl = image.defaultUrl;
      console.log(`Downloading ${format} format for image ${imageId}`);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to download image');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download image error:', error);
      throw new Error('下载图片失败');
    }
  }

  // 重新创建示例图片
  async recreateExample(exampleId: string): Promise<GenerateResponse> {
    try {
      // 获取示例图片信息
      const textExamples = await getExampleImages('text');
      const imageExamples = await getExampleImages('image');
      const allExamples = [...textExamples, ...imageExamples];
      
      const example = allExamples.find(ex => ex.id === exampleId);
      if (!example) {
        throw new Error('Example not found');
      }

      // 根据示例重新生成（使用示例的描述作为prompt）
      return await this.generateTextToImage({
        prompt: example.description || example.title || '重新创建示例图片',
        ratio: '1:1',
        isPublic: true,
        style: 'default'
      });
    } catch (error) {
      console.error('Recreate example error:', error);
      throw new Error('重新创建示例失败');
    }
  }

  // 轮询任务状态直到完成
  async pollTaskUntilComplete(taskId: string, onProgress?: (status: TaskStatus) => void): Promise<TaskStatus> {
    const maxAttempts = 60; // 最多轮询60次（约5分钟）
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const status = await this.getTaskStatus(taskId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed') {
            resolve(status);
          } else if (status.status === 'failed') {
            reject(new Error('Task failed'));
          } else if (attempts >= maxAttempts) {
            reject(new Error('Task timeout'));
          } else {
            // 继续轮询，间隔5秒
            setTimeout(poll, 5000);
          }
        } catch (error) {
          if (attempts >= maxAttempts) {
            reject(error);
          } else {
            // 出错时也继续轮询，可能是网络问题
            setTimeout(poll, 5000);
          }
        }
      };

      poll();
    });
  }
}

// 导出单例实例
export const GenerateServiceInstance = new GenerateService();
export default GenerateServiceInstance; 