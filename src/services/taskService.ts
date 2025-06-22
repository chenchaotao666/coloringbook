import { ApiUtils, ApiError } from '../utils/apiUtils';
import { HomeImage } from './imageService';

// 任务状态接口
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
}

// 用户任务接口
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

// 用户任务响应接口
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

/**
 * 任务服务类
 */
export class TaskService {
  /**
   * 获取任务状态
   */
  static async getTaskStatus(taskId: string): Promise<TaskStatus> {
    try {
      const response = await ApiUtils.get<TaskStatus>('/api/images/tasks', { taskId }, true);
      return response;
    } catch (error) {
      console.error('Get task status error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2013', '获取任务状态失败');
    }
  }
  
}

// 导出默认实例
export const taskService = new TaskService(); 