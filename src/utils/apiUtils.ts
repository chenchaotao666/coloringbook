// API 响应接口 - 适配新的API格式
export interface ApiResponse<T> {
  status: 'success' | 'fail';
  data?: T;
  errorCode?: string;
  message?: string;
}

// 分页响应接口
export interface PaginatedResponse<T> {
  status: 'success' | 'fail';
  data: T[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
  errorCode?: string;
  message?: string;
}

// 认证令牌接口
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// API 配置 - 连接到外部后端服务
const API_BASE_URL = process.env.NODE_ENV === 'development' 
  ? '' // 开发环境使用相对路径，通过 Vite 代理
  : import.meta.env.VITE_API_BASE_URL || ''; // 生产环境使用环境变量指向外部后端

/**
 * 通用 API 请求工具类
 */
export class ApiUtils {
  private static accessToken: string | null = null;
  private static refreshToken: string | null = null;

  /**
   * 设置认证令牌
   */
  static setTokens(tokens: AuthTokens, rememberMe: boolean = true) {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    
    // 根据rememberMe决定存储方式
    if (typeof window !== 'undefined') {
      if (rememberMe) {
        // 记住我：使用localStorage持久化存储
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        // 清除sessionStorage中可能存在的token
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
      } else {
        // 不记住我：使用sessionStorage会话存储
        sessionStorage.setItem('accessToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);
        // 清除localStorage中可能存在的token
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }

  /**
   * 获取访问令牌
   */
  static getAccessToken(): string | null {
    if (this.accessToken) return this.accessToken;
    
    if (typeof window !== 'undefined') {
      // 先检查localStorage，再检查sessionStorage
      return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    }
    return null;
  }

  /**
   * 获取刷新令牌
   */
  static getRefreshToken(): string | null {
    if (this.refreshToken) return this.refreshToken;
    
    if (typeof window !== 'undefined') {
      // 先检查localStorage，再检查sessionStorage
      return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    }
    return null;
  }

  /**
   * 清除令牌
   */
  static clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    if (typeof window !== 'undefined') {
      // 同时清除localStorage和sessionStorage中的token
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
    }
  }

  /**
   * 刷新访问令牌
   */
  static async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data: ApiResponse<AuthTokens> = await response.json();
      
      if (data.status === 'success' && data.data) {
        this.setTokens(data.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }

  /**
   * 通用API请求方法
   * @param endpoint API 端点
   * @param options 请求选项
   * @param requireAuth 是否需要认证
   * @returns Promise<T> 返回指定类型的数据
   */
  static async apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      // 添加认证头
      if (requireAuth) {
        const token = this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      // 处理认证失败的情况
      if (response.status === 401 && requireAuth) {
        // 尝试刷新令牌
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // 重新发送请求
          const newToken = this.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
            const retryData: ApiResponse<T> = await retryResponse.json();
            
            if (retryData.status === 'success') {
              return retryData.data as T;
            } else {
              throw new ApiError(retryData.errorCode || '9001', retryData.message || 'API request failed');
            }
          }
        }
        
        // 刷新失败，清除令牌并抛出错误
        this.clearTokens();
        throw new ApiError('1010', '登录已过期，请重新登录');
      }

      if (data.status === 'success') {
        return data.data as T;
      } else {
        throw new ApiError(data.errorCode || '9001', data.message || 'API request failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('API request error:', error);
      throw new ApiError('9001', '网络请求失败');
    }
  }

  /**
   * GET 请求的便捷方法
   */
  static async get<T>(endpoint: string, params?: Record<string, string>, requireAuth: boolean = false): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return this.apiRequest<T>(url, { method: 'GET' }, requireAuth);
  }

  /**
   * POST 请求的便捷方法
   */
  static async post<T>(endpoint: string, data?: any, requireAuth: boolean = false): Promise<T> {
    return this.apiRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  /**
   * PUT 请求的便捷方法
   */
  static async put<T>(endpoint: string, data?: any, requireAuth: boolean = true): Promise<T> {
    return this.apiRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, requireAuth);
  }

  /**
   * DELETE 请求的便捷方法
   */
  static async delete<T>(endpoint: string, requireAuth: boolean = true): Promise<T> {
    return this.apiRequest<T>(endpoint, { method: 'DELETE' }, requireAuth);
  }

  /**
   * 文件上传请求
   */
  static async uploadFile<T>(
    endpoint: string, 
    formData: FormData, 
    requireAuth: boolean = true
  ): Promise<T> {
    try {
      const headers: Record<string, string> = {};

      // 添加认证头
      if (requireAuth) {
        const token = this.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data: ApiResponse<T> = await response.json();

      // 处理认证失败的情况
      if (response.status === 401 && requireAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          const newToken = this.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              method: 'POST',
              headers,
              body: formData,
            });
            const retryData: ApiResponse<T> = await retryResponse.json();
            
            if (retryData.status === 'success') {
              return retryData.data as T;
            } else {
              throw new ApiError(retryData.errorCode || '9001', retryData.message || 'Upload failed');
            }
          }
        }
        
        this.clearTokens();
        throw new ApiError('1010', '登录已过期，请重新登录');
      }

      if (data.status === 'success') {
        return data.data as T;
      } else {
        throw new ApiError(data.errorCode || '9001', data.message || 'Upload failed');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      console.error('File upload error:', error);
      throw new ApiError('9001', '文件上传失败');
    }
  }
}

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(public errorCode: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
} 