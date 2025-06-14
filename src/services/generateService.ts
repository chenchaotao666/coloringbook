import { ApiUtils, ApiError } from '../utils/apiUtils';
import { HomeImage } from './imageService';

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
  status: 'success' | 'fail';
  data: {
    taskId: string;
  };
  message?: string;
}

export interface TaskStatus {
  taskId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  createdAt: string;
  completedAt?: string;
  failedAt?: string;
  message?: string;
  errorCode?: string;
  errorMessage?: string;
  result?: HomeImage;
  image?: HomeImage; // 兼容字段
}

export interface StyleSuggestion {
  id: string;
  name: string;
  category: string;
}

export interface UserTask {
  taskId: string;
  status: string;
  progress: number;
  type: string;
  prompt?: string;
  createdAt: string;
  estimatedTime?: number;
  completedAt?: string;
  originalFileName?: string;
  result?: HomeImage;
}

export interface UserTasksResponse {
  tasks: UserTask[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
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

// ==================== 主要服务类 ====================
class GenerateService {

  /**
   * 文本生成图片
   */
  async generateTextToImage(data: GenerateTextToImageRequest): Promise<GenerateResponse> {
    try {
      const responseData = await ApiUtils.post<{ taskId: string }>('/api/images/txt2imggenerate', {
        prompt: data.prompt,
        ratio: data.ratio,
        isPublic: data.isPublic,
        style: data.style
      }, true);
      
      return {
        status: 'success',
        data: responseData,
        message: 'Generation started successfully'
      };
    } catch (error) {
      console.error('Generate text to image error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2007', '文本生成图片失败');
    }
  }

  /**
   * 图片转图片生成
   */
  async generateImageToImage(data: GenerateImageToImageRequest): Promise<GenerateResponse> {
    try {
      const formData = new FormData();
      formData.append('file', data.imageFile);
      if (data.ratio) formData.append('ratio', data.ratio);
      formData.append('isPublic', data.isPublic.toString());

      const responseData = await ApiUtils.uploadFile<{ taskId: string }>('/api/images/img2imggenerate', formData, true);
      
      return {
        status: 'success',
        data: responseData,
        message: 'Generation started successfully'
      };
    } catch (error) {
      console.error('Generate image to image error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2008', '图片转换失败');
    }
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<TaskStatus> {
    const { TaskService } = await import('./taskService');
    return TaskService.getTaskStatus(taskId);
  }

  /**
   * 获取用户任务列表
   */
  async getUserTasks(userId: string, options?: {
    status?: string;
    type?: string;
    currentPage?: number;
    pageSize?: number;
  }): Promise<UserTasksResponse> {
    const { TaskService } = await import('./taskService');
    return TaskService.getUserTasks(options);
  }

  /**
   * 取消任务
   */
  async cancelTask(taskId: string): Promise<boolean> {
    const { TaskService } = await import('./taskService');
    return TaskService.cancelTask(taskId);
  }

  /**
   * 获取示例图片
   */
  async getExampleImages(category: 'text' | 'image', pageSize: number = 3): Promise<HomeImage[]> {
    try {
      // 根据类别确定搜索类型
      const searchType = category === 'text' ? 'text2image' : 'image2image';
      
      // 使用图片服务获取示例图片
      const { ImageService } = await import('./imageService');
      const result = await ImageService.searchImages({
        type: searchType,
        isPublic: true,
        pageSize: pageSize
      });
      
      return result.images;
    } catch (error) {
      console.error('Failed to get example images:', error);
      return [];
    }
  }

  /**
   * 获取所有生成的图片（已废弃，请使用 getUserGeneratedImages）
   * @deprecated 使用 getUserGeneratedImages 替代
   */
  async getAllGeneratedImages(): Promise<HomeImage[]> {
    console.warn('getAllGeneratedImages is deprecated, use getUserGeneratedImages instead');
    try {
      const { ImageService } = await import('./imageService');
      const result = await ImageService.searchImages({
        pageSize: 100
      });
      
      return result.images;
    } catch (error) {
      console.error('Failed to get all generated images:', error);
      return [];
    }
  }

  /**
   * 获取用户生成的图片
   */
  async getUserGeneratedImages(userId: string): Promise<HomeImage[]> {
    try {
      const { ImageService } = await import('./imageService');
      const result = await ImageService.getUserImages(userId, { pageSize: 100 });
      
      return result.images;
    } catch (error) {
      console.error('Failed to get user generated images:', error);
      return [];
    }
  }

  /**
   * 获取风格建议
   */
  async getStyleSuggestions(): Promise<StyleSuggestion[]> {
    return styleSuggestions;
  }

  /**
   * 下载图片
   */
  async downloadImage(imageId: string, format: 'png' | 'pdf'): Promise<Blob> {
    try {
      const response = await fetch(`/api/images/${imageId}/download?format=${format}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ApiUtils.getAccessToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return await response.blob();
    } catch (error) {
      console.error('Download image error:', error);
      throw new ApiError('2001', '图片下载失败');
    }
  }

  /**
   * 重新创建示例图片
   */
  async recreateExample(exampleId: string): Promise<GenerateResponse> {
    try {
      // 首先获取示例图片信息
      const { ImageService } = await import('./imageService');
      const image = await ImageService.getImageById(exampleId);
      
      if (!image) {
        throw new ApiError('2001', '示例图片不存在');
      }

      // 根据图片类型重新生成
      if (image.type === 'text2image') {
        return await this.generateTextToImage({
          prompt: image.prompt,
          ratio: image.ratio as any,
          isPublic: true
        });
      } else {
        throw new ApiError('2012', '图片转换需要上传原始图片');
      }
    } catch (error) {
      console.error('Recreate example error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2007', '重新生成失败');
    }
  }

  /**
   * 轮询任务直到完成
   */
  async pollTaskUntilComplete(taskId: string, onProgress?: (status: TaskStatus) => void): Promise<TaskStatus> {
    const { TaskService } = await import('./taskService');
    return TaskService.pollTaskUntilComplete(taskId, onProgress);
  }

  /**
   * 检查用户是否可以生成图片（积分检查）
   */
  async canUserGenerate(): Promise<{ canGenerate: boolean; reason?: string }> {
    try {
      const { UserService } = await import('./userService');
      const user = await UserService.getCurrentUser();
      
      if (!user) {
        return { canGenerate: false, reason: '请先登录' };
      }

      // 检查积分（文本生成和图片转换都需要20积分）
      if (user.credits < 20) {
        return { canGenerate: false, reason: '积分不足，需要20积分' };
      }

      return { canGenerate: true };
    } catch (error) {
      return { canGenerate: false, reason: '检查用户状态失败' };
    }
  }

  /**
   * 获取生成统计信息
   */
  async getGenerationStats(): Promise<{
    totalGenerated: number;
    todayGenerated: number;
    remainingCredits: number;
    userType: string;
  }> {
    try {
      const { UserService } = await import('./userService');
      const user = await UserService.getCurrentUser();
      
      if (!user) {
        return {
          totalGenerated: 0,
          todayGenerated: 0,
          remainingCredits: 0,
          userType: 'guest'
        };
      }

      // 获取用户任务统计
      const tasks = await this.getUserTasks(user.id);
      
      // 计算今日生成数量
      const today = new Date().toDateString();
      const todayTasks = tasks.tasks.filter(task => 
        new Date(task.createdAt).toDateString() === today
      );

      return {
        totalGenerated: tasks.stats.completed,
        todayGenerated: todayTasks.length,
        remainingCredits: user.credits,
        userType: user.userType
      };
    } catch (error) {
      console.error('Get generation stats error:', error);
      return {
        totalGenerated: 0,
        todayGenerated: 0,
        remainingCredits: 0,
        userType: 'guest'
      };
    }
  }
}

// 导出单例实例
export const generateService = new GenerateService();
export default generateService; 