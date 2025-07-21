import { ApiUtils } from './apiUtils';
import { isPublicPath, getCurrentLanguagePrefix } from './navigationUtils';
import { UserService } from '../services/userService';

// 调试工具函数
const debugUtils = {
  checkTokenStatus: () => {
    const accessToken = ApiUtils.getAccessToken();
    const refreshToken = ApiUtils.getRefreshToken();
    
    console.log('🔍 Token状态检查:');
    console.log('- 访问令牌:', accessToken ? '存在' : '不存在');
    console.log('- 刷新令牌:', refreshToken ? '存在' : '不存在');
    
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        const timeLeft = exp - now;
        
        console.log('- Token过期时间:', new Date(exp).toLocaleString());
        console.log('- 当前时间:', new Date(now).toLocaleString());
        console.log('- 剩余时间:', timeLeft > 0 ? `${Math.floor(timeLeft / 60000)}分钟` : '已过期');
        console.log('- 存储位置:', localStorage.getItem('accessToken') ? 'localStorage' : 'sessionStorage');
      } catch (e) {
        console.log('- Token解析失败:', e);
      }
    }
    
    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessToken,
      refreshToken
    };
  },
  
  checkCurrentPath: () => {
    const currentPath = window.location.pathname;
    const isPublic = isPublicPath(currentPath);
    const languagePrefix = getCurrentLanguagePrefix();
    
    console.log('🔍 当前路径检查:');
    console.log('- 当前路径:', currentPath);
    console.log('- 是否公开页面:', isPublic);
    console.log('- 语言前缀:', languagePrefix || '无');
    
    return {
      currentPath,
      isPublic,
      languagePrefix
    };
  },
  
  // 详细的认证流程调试
  async debugAuthFlow() {
    console.log('🔍 开始认证流程调试...');
    
    // 1. 检查token状态
    this.checkTokenStatus();
    
    // 2. 检查UserService.isLoggedIn()
    const isLoggedIn = UserService.isLoggedIn();
    console.log('- UserService.isLoggedIn():', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('❌ 用户未登录，认证流程结束');
      return { success: false, reason: '未登录' };
    }
    
    // 3. 尝试获取用户信息
    console.log('- 尝试获取用户信息...');
    try {
      const user = await UserService.getCurrentUser();
      console.log('- 获取用户信息结果:', user ? '成功' : '失败');
      
      if (user) {
        console.log('- 用户信息:', {
          userId: user.userId,
          username: user.username,
          email: user.email,
          credits: user.credits,
          userType: user.membershipLevel
        });
        return { success: true, user };
      } else {
        console.log('❌ 获取用户信息失败，但没有抛出异常');
        return { success: false, reason: '获取用户信息失败' };
      }
    } catch (error) {
      console.log('❌ 获取用户信息异常:', error);
      return { success: false, reason: '获取用户信息异常', error };
    }
  },
  
  // 模拟token刷新
  async testTokenRefresh() {
    console.log('🔄 测试token刷新...');
    
    const refreshToken = ApiUtils.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ 没有刷新令牌，无法测试');
      return false;
    }
    
    try {
      const success = await ApiUtils.refreshToken();
      console.log('- Token刷新结果:', success ? '成功' : '失败');
      
      if (success) {
        const newAccessToken = ApiUtils.getAccessToken();
        console.log('- 新的访问令牌:', newAccessToken ? '已获取' : '未获取');
      }
      
      return success;
    } catch (error) {
      console.log('❌ Token刷新异常:', error);
      return false;
    }
  },
  
  // 直接测试API请求
  async testApiRequest() {
    console.log('🌐 测试API请求...');
    
    try {
      const response = await fetch('/api/users/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ApiUtils.getAccessToken()}`
        }
      });
      
      console.log('- HTTP状态码:', response.status);
      console.log('- 响应头:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('- 响应数据:', data);
      
      return { status: response.status, data };
    } catch (error) {
      console.log('❌ API请求异常:', error);
      return { error };
    }
  },
  
  simulateTokenExpiry: () => {
    console.log('🧪 模拟Token过期...');
    ApiUtils.clearTokens();
    
    // 触发token过期事件
    const event = new CustomEvent('tokenExpired', {
      detail: { reason: 'manual_simulation' }
    });
    window.dispatchEvent(event);
    
    console.log('✅ Token已清除，过期事件已触发');
  },
  
  // 完整的页面刷新调试
  async debugPageRefresh() {
    console.log('🔄 开始页面刷新调试...');
    
    // 1. 检查路径
    const pathInfo = this.checkCurrentPath();
    
    // 2. 检查token
    const tokenInfo = this.checkTokenStatus();
    
    // 3. 测试认证流程
    const authResult = await this.debugAuthFlow();
    
    // 4. 如果认证失败，测试token刷新
    if (!authResult.success && tokenInfo.hasRefreshToken) {
      console.log('- 认证失败，尝试刷新token...');
      const refreshResult = await this.testTokenRefresh();
      
      if (refreshResult) {
        console.log('- Token刷新成功，重新测试认证...');
        const retryAuthResult = await this.debugAuthFlow();
        return {
          pathInfo,
          tokenInfo,
          authResult: retryAuthResult,
          refreshResult
        };
      }
    }
    
    return {
      pathInfo,
      tokenInfo,
      authResult
    };
  }
};

// 将调试工具添加到全局对象
declare global {
  interface Window {
    debugUtils: typeof debugUtils;
  }
}

window.debugUtils = debugUtils;

export default debugUtils; 