import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserService, User } from '../services/userService';
import { tokenRefreshService } from '../services/tokenRefreshService';
import { redirectToHomeIfNeeded } from '../utils/navigationUtils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  googleLogin: (token: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 检查用户是否已登录
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // 监听token刷新事件
  useEffect(() => {
    const handleTokenRefreshed = (event: CustomEvent) => {
      console.log('🔄 Token已刷新:', event.detail);
      // Token刷新成功，可以在这里做一些处理，比如更新用户信息
    };

    const handleTokenExpired = (event: CustomEvent) => {
      console.log('❌ AuthContext: Token已过期事件触发:', event.detail);
      // Token过期，清除用户状态并可能需要重新登录
      setUser(null);
      tokenRefreshService.stop();
      
      // 跳转到首页
      const redirected = redirectToHomeIfNeeded();
      console.log('🔄 AuthContext: Token过期时尝试跳转:', redirected);
    };

    // 添加事件监听器
    window.addEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
    window.addEventListener('tokenExpired', handleTokenExpired as EventListener);

    // 清理事件监听器
    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
      window.removeEventListener('tokenExpired', handleTokenExpired as EventListener);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // 先检查是否有访问令牌，避免不必要的API请求
      const hasToken = UserService.isLoggedIn();
      
      if (!hasToken) {
        console.log('✅ AuthContext: 无token，用户未登录状态正常');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      // 有token，尝试获取用户信息
      const userData = await UserService.getCurrentUser();
      
      // 如果用户已登录，启动token自动刷新服务
      if (userData) {
        setUser(userData);
        tokenRefreshService.start();
      } else {
        // 有token但获取用户信息失败，说明token无效（可能已被getCurrentUser清除）
        console.log('❌ AuthContext: 有token但获取用户信息失败，token可能已过期');
        setUser(null);
        tokenRefreshService.stop();
        // 这种情况表示token过期，需要跳转
        const redirected = redirectToHomeIfNeeded();
        console.log('🔄 AuthContext: token过期，尝试跳转:', redirected);
      }
    } catch (error) {
      console.error('❌ AuthContext: 检查认证状态异常:', error);
      setUser(null);
      // 认证失败，停止token刷新服务
      tokenRefreshService.stop();
      
      // catch到异常说明有严重问题，也需要跳转
      const redirected = redirectToHomeIfNeeded();
      console.log('🔄 AuthContext: 异常时尝试跳转:', redirected);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = true) => {
    await UserService.login({ email, password }, rememberMe);
    // 登录成功后获取用户信息
    const userData = await UserService.getCurrentUser();
    setUser(userData);
    
    // 登录成功后启动token自动刷新服务
    if (userData) {
      tokenRefreshService.start();
    }
  };

  const googleLogin = async (token: string, rememberMe: boolean = true) => {
    await UserService.googleLogin(token, rememberMe);
    // 登录成功后获取用户信息，与普通登录保持一致
    const userData = await UserService.getCurrentUser();
    setUser(userData);
    
    // 登录成功后启动token自动刷新服务
    if (userData) {
      tokenRefreshService.start();
    }
  };

  const register = async (username: string, email: string, password: string) => {
    await UserService.register({ username, email, password });
    // 注册成功后不自动登录，让用户手动登录
  };

  const logout = async () => {
    await UserService.logout();
    setUser(null);
    
    // 登出时停止token自动刷新服务
    tokenRefreshService.stop();
    
    // 退出登录时总是跳转到首页
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const googleLogout = async () => {
    await UserService.googleLogout();
    setUser(null);
    
    // 登出时停止token自动刷新服务
    tokenRefreshService.stop();
    
    // 退出登录时总是跳转到首页
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      // 先检查是否有访问令牌，避免不必要的API请求
      const hasToken = UserService.isLoggedIn();
      
      if (!hasToken) {
        setUser(null);
        return;
      }
      
      const userData = await UserService.getCurrentUser();
      setUser(userData);
      
      // 如果有token但获取用户信息失败，说明token可能无效
      if (!userData) {
        console.log('❌ AuthContext: refreshUser - 有token但刷新用户信息失败');
        const redirected = redirectToHomeIfNeeded();
        console.log('🔄 AuthContext: refreshUser - 尝试跳转:', redirected);
      }
    } catch (error) {
      console.error('❌ AuthContext: refreshUser - 异常:', error);
      setUser(null);
      
      // 刷新用户信息失败，可能是token过期，跳转到首页
      const redirected = redirectToHomeIfNeeded();
      console.log('🔄 AuthContext: refreshUser - 异常时尝试跳转:', redirected);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    googleLogin,
    register,
    logout,
    googleLogout,
    updateUser,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 