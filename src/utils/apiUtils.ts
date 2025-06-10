// API 响应接口
export interface ApiResponse<T> {
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

/**
 * 通用 API 请求工具类
 */
export class ApiUtils {
  /**
   * 通用API请求方法
   * @param endpoint API 端点
   * @param options 请求选项
   * @returns Promise<T> 返回指定类型的数据
   */
  static async apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
   * GET 请求的便捷方法
   * @param endpoint API 端点
   * @param params 查询参数
   * @returns Promise<T>
   */
  static async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return this.apiRequest<T>(url, { method: 'GET' });
  }

  /**
   * POST 请求的便捷方法
   * @param endpoint API 端点
   * @param data 请求体数据
   * @returns Promise<T>
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT 请求的便捷方法
   * @param endpoint API 端点
   * @param data 请求体数据
   * @returns Promise<T>
   */
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE 请求的便捷方法
   * @param endpoint API 端点
   * @returns Promise<T>
   */
  static async delete<T>(endpoint: string): Promise<T> {
    return this.apiRequest<T>(endpoint, { method: 'DELETE' });
  }
} 