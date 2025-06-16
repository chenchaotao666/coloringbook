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
      const response = await ApiUtils.get<TaskStatus>(`/api/tasks/${taskId}`, {}, true);
      return response;
    } catch (error) {
      console.error('Get task status error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2013', '获取任务状态失败');
    }
  }

  /**
   * 取消任务
   */
  static async cancelTask(taskId: string): Promise<boolean> {
    try {
      await ApiUtils.delete<any>(`/api/tasks/${taskId}`, true);
      return true;
    } catch (error) {
      console.error('Cancel task error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * 获取用户任务列表
   */
  static async getUserTasks(options?: {
    status?: string;
    type?: string;
    currentPage?: number;
    pageSize?: number;
  }): Promise<UserTasksResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.type) params.append('type', options.type);
      if (options?.currentPage) params.append('currentPage', options.currentPage.toString());
      if (options?.pageSize) params.append('pageSize', options.pageSize.toString());

      const response = await ApiUtils.get<UserTasksResponse>(`/api/tasks?${params.toString()}`, {}, true);
      return response;
    } catch (error) {
      console.error('Get user tasks error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('2014', '获取用户任务列表失败');
    }
  }

  /**
   * 轮询任务直到完成
   */
  static async pollTaskUntilComplete(
    taskId: string, 
    onProgress?: (status: TaskStatus) => void
  ): Promise<TaskStatus> {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.getTaskStatus(taskId);
          
          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed' || status.status === 'failed') {
            resolve(status);
          } else {
            setTimeout(poll, 2000); // 每2秒轮询一次
          }
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
  
}

// 导出默认实例
export const taskService = new TaskService(); 