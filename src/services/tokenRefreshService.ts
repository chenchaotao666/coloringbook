import { ApiUtils } from '../utils/apiUtils';
import { UserService } from './userService';

/**
 * Token自动刷新服务
 * 负责定期刷新访问令牌，确保用户会话不会过期
 */
export class TokenRefreshService {
  private static instance: TokenRefreshService;
  private refreshInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private readonly REFRESH_INTERVAL = 10 * 60 * 1000; // 10分钟
  private readonly TOKEN_EXPIRY_BUFFER = 2 * 60 * 1000; // 2分钟缓冲时间

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): TokenRefreshService {
    if (!TokenRefreshService.instance) {
      TokenRefreshService.instance = new TokenRefreshService();
    }
    return TokenRefreshService.instance;
  }

  /**
   * 启动自动刷新服务
   */
  start(): void {
    // 如果已经在运行，先停止
    if (this.refreshInterval) {
      this.stop();
    }

    console.log('🔄 Token自动刷新服务已启动，每10分钟刷新一次');

    // 立即检查一次token状态
    this.checkAndRefreshToken();

    // 设置定时器，每10分钟执行一次
    this.refreshInterval = setInterval(() => {
      this.checkAndRefreshToken();
    }, this.REFRESH_INTERVAL);
  }

  /**
   * 停止自动刷新服务
   */
  stop(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('⏹️ Token自动刷新服务已停止');
    }
  }

  /**
   * 检查并刷新token
   */
  private async checkAndRefreshToken(): Promise<void> {
    // 如果正在刷新中，跳过
    if (this.isRefreshing) {
      console.log('🔄 Token刷新正在进行中，跳过本次检查');
      return;
    }

    const accessToken = ApiUtils.getAccessToken();
    const refreshToken = ApiUtils.getRefreshToken();

    // 如果没有token，不需要刷新
    if (!accessToken || !refreshToken) {
      console.log('📝 未找到访问令牌或刷新令牌，跳过刷新');
      return;
    }

    try {
      // 检查token是否即将过期
      if (this.shouldRefreshToken(accessToken)) {
        console.log('🔄 开始刷新访问令牌...');
        this.isRefreshing = true;

        // 执行刷新
        const success = await ApiUtils.refreshAccessToken();
        
        if (success) {
          console.log('✅ 访问令牌刷新成功');
          
          // 触发自定义事件，通知其他组件token已刷新
          this.dispatchTokenRefreshEvent();
        } else {
          console.warn('❌ 访问令牌刷新失败');
          
          // 刷新失败，可能需要重新登录
          this.dispatchTokenExpiredEvent();
        }
      } else {
        console.log('✅ 访问令牌仍然有效，无需刷新');
      }
    } catch (error) {
      console.error('❌ Token刷新过程中发生错误:', error);
      
      // 发生错误时，触发token过期事件
      this.dispatchTokenExpiredEvent();
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 判断是否应该刷新token
   * @param token 访问令牌
   * @returns 是否需要刷新
   */
  private shouldRefreshToken(token: string): boolean {
    try {
      // 解析JWT token（不验证签名，只获取payload）
      const payload = this.parseJwtPayload(token);
      
      if (!payload || !payload.exp) {
        console.warn('⚠️ 无法解析token过期时间，执行刷新');
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const expiryTime = payload.exp;
      const timeUntilExpiry = (expiryTime - currentTime) * 1000; // 转换为毫秒

      console.log(`⏰ Token剩余有效时间: ${Math.floor(timeUntilExpiry / 1000 / 60)}分钟`);

      // 如果剩余时间少于缓冲时间，则需要刷新
      return timeUntilExpiry <= this.TOKEN_EXPIRY_BUFFER;
    } catch (error) {
      console.error('❌ 解析token时发生错误:', error);
      return true; // 解析失败时，执行刷新
    }
  }

  /**
   * 解析JWT token的payload部分
   * @param token JWT token
   * @returns payload对象
   */
  private parseJwtPayload(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('解析JWT payload失败:', error);
      return null;
    }
  }

  /**
   * 触发token刷新成功事件
   */
  private dispatchTokenRefreshEvent(): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tokenRefreshed', {
        detail: {
          timestamp: new Date().toISOString(),
          accessToken: ApiUtils.getAccessToken()
        }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 触发token过期事件
   */
  private dispatchTokenExpiredEvent(): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('tokenExpired', {
        detail: {
          timestamp: new Date().toISOString(),
          reason: 'refresh_failed'
        }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * 手动触发token刷新
   */
  async manualRefresh(): Promise<boolean> {
    console.log('🔄 手动触发token刷新...');
    
    if (this.isRefreshing) {
      console.log('🔄 Token刷新正在进行中，请稍候');
      return false;
    }

    try {
      this.isRefreshing = true;
      const success = await ApiUtils.refreshAccessToken();
      
      if (success) {
        console.log('✅ 手动token刷新成功');
        this.dispatchTokenRefreshEvent();
      } else {
        console.warn('❌ 手动token刷新失败');
        this.dispatchTokenExpiredEvent();
      }
      
      return success;
    } catch (error) {
      console.error('❌ 手动token刷新过程中发生错误:', error);
      this.dispatchTokenExpiredEvent();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * 获取刷新状态
   */
  getRefreshStatus(): {
    isRunning: boolean;
    isRefreshing: boolean;
    nextRefreshTime: Date | null;
  } {
    const nextRefreshTime = this.refreshInterval 
      ? new Date(Date.now() + this.REFRESH_INTERVAL)
      : null;

    return {
      isRunning: this.refreshInterval !== null,
      isRefreshing: this.isRefreshing,
      nextRefreshTime
    };
  }
}

// 导出单例实例
export const tokenRefreshService = TokenRefreshService.getInstance(); 