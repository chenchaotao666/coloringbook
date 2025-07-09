import { ApiUtils, AuthTokens, ApiError } from '../utils/apiUtils';
import { UrlUtils } from '../utils/urlUtils';

// 用户接口
export interface User {
  userId: string;
  username: string;
  email: string;
  avatar: string | null;
  credits: number;
  userType: 'free' | 'lite' | 'pro';
  membershipExpiry: string | null;
  createdAt: string;
  updatedAt?: string;
}

// 用户注册请求
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// 用户登录请求
export interface LoginRequest {
  email: string;
  password: string;
}

// 用户登录响应
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

// 用户信息更新请求
export interface UpdateUserRequest {
  username?: string;
  password?: string;
}

// 充值请求
export interface RechargeRequest {
  type: 'monthly' | 'yearly' | 'credits';
  level: 'lite' | 'pro';
  credits?: string;
  payType: 'master' | 'visa' | 'americanexpress' | 'applepay' | 'unionpay';
}

// 充值响应
export interface RechargeResponse {
  order: {
    orderId: string;
    amount: number;
    currency: string;
    type: string;
    level: string;
    payType: string;
    status: string;
    createdAt: string;
  };
  user: User;
}

// 头像上传响应
export interface AvatarUploadResponse {
  avatar: string;
  updatedAt: string;
}

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 处理用户对象，确保头像URL是绝对路径
   */
  private static processUserUrls(user: User): User {
    if (!user.avatar) return user;
    return UrlUtils.processObjectUrls(user, ['avatar']);
  }

  /**
   * 用户注册
   */
  static async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await ApiUtils.post<User>('/api/auth/register', data);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1001', '注册失败');
    }
  }

  /**
   * 用户登录
   */
  static async login(data: LoginRequest, rememberMe: boolean = true): Promise<LoginResponse> {
    try {
      const loginData = await ApiUtils.post<{user: User, accessToken: string, refreshToken: string, expiresIn: string}>('/api/auth/login', data);

      console.log('loginData: ', loginData);
      
      // 保存令牌，根据rememberMe决定存储方式
      ApiUtils.setTokens({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn,
      }, rememberMe);
      
      return {
        user: loginData.user,
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1008', '登录失败');
    }
  }

  /**
   * Google 登录
   */
  static async googleLogin(token: string, rememberMe: boolean = true): Promise<LoginResponse> {
    try {
      const loginData = await ApiUtils.post<{user: User, accessToken: string, refreshToken: string, expiresIn: string}>('/api/auth/google-login', { token });

      console.log('Google loginData: ', loginData);
      
      // 保存令牌，根据rememberMe决定存储方式
      ApiUtils.setTokens({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn,
      }, rememberMe);
      
      return {
        user: loginData.user,
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1009', 'Google登录失败');
    }
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    try {
      // 可以调用服务器端登出接口（如果有的话）
      await ApiUtils.post('/api/auth/logout', {}, true);

      // 清除本地令牌
      ApiUtils.clearTokens();
    } catch (error) {
      console.error('Logout error:', error);
      // 即使服务器端登出失败，也要清除本地令牌
      ApiUtils.clearTokens();
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const token = ApiUtils.getAccessToken();
      if (!token) return null;
      
      const rawUser = await ApiUtils.get<User>('/api/users/profile', {}, true);
      
      // 处理头像URL，确保是绝对路径
      const user = this.processUserUrls(rawUser);
      
      return user;
    } catch (error) {
      if (error instanceof ApiError && error.errorCode === '1010') {
        // Token过期，清除本地令牌
        ApiUtils.clearTokens();
      }
      return null;
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(data: UpdateUserRequest): Promise<User> {
    try {
      const user = await ApiUtils.put<User>('/api/users/update', data, true);
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1001', '更新用户信息失败');
    }
  }

  /**
   * 上传用户头像
   */
  static async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const avatarData = await ApiUtils.uploadFile<AvatarUploadResponse>('/api/users/avatar', formData, true);
      return avatarData;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1012', '头像上传失败');
    }
  }

  /**
   * 用户充值
   */
  static async recharge(data: RechargeRequest): Promise<RechargeResponse> {
    try {
      return await ApiUtils.post<RechargeResponse>('/api/recharge/recharge', data, true);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1017', '充值失败');
    }
  }

  /**
   * 刷新访问令牌
   */
  static async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = ApiUtils.getRefreshToken();
      if (!refreshToken) {
        throw new ApiError('1010', '刷新令牌不存在');
      }

      const tokens = await ApiUtils.post<AuthTokens>('/api/users/auth/refresh-token', {
        refreshToken,
      });

      // 更新令牌
      ApiUtils.setTokens(tokens);
      
      return tokens;
    } catch (error) {
      // 刷新失败，清除所有令牌
      ApiUtils.clearTokens();
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1010', '令牌刷新失败');
    }
  }

  /**
   * 检查用户是否已登录
   */
  static isLoggedIn(): boolean {
    return !!ApiUtils.getAccessToken();
  }

  /**
   * 检查用户是否为会员
   */
  static async isPremiumUser(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      if (!user) return false;
      
      return user.userType === 'lite' || user.userType === 'pro';
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取用户积分余额
   */
  static async getUserCredits(): Promise<number> {
    try {
      const user = await this.getCurrentUser();
      return user?.credits || 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 检查用户是否有足够积分
   */
  static async hasEnoughCredits(requiredCredits: number): Promise<boolean> {
    try {
      const credits = await this.getUserCredits();
      return credits >= requiredCredits;
    } catch (error) {
      return false;
    }
  }

  /**
   * 忘记密码 - 发送重置邮件
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      await ApiUtils.post('/api/users/forgot-password', { email });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1018', '发送重置邮件失败');
    }
  }

  /**
   * 验证重置密码token
   */
  static async validateResetToken(token: string): Promise<void> {
    try {
      await ApiUtils.post('/api/users/validate-reset-token', { token });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1020', '重置链接无效');
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await ApiUtils.post('/api/users/reset-password', { token, newPassword });
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('1019', '重置密码失败');
    }
  }
}

// 导出默认实例
export const userService = new UserService(); 