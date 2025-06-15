import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserService, User } from '../services/userService';
import { tokenRefreshService } from '../services/tokenRefreshService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
      console.log('❌ Token已过期:', event.detail);
      // Token过期，清除用户状态并可能需要重新登录
      setUser(null);
      tokenRefreshService.stop();
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
      const userData = await UserService.getCurrentUser();
      setUser(userData);
      
      // 如果用户已登录，启动token自动刷新服务
      if (userData) {
        tokenRefreshService.start();
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setUser(null);
      // 认证失败，停止token刷新服务
      tokenRefreshService.stop();
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

  const register = async (username: string, email: string, password: string) => {
    await UserService.register({ username, email, password });
    // 注册成功后不自动登录，让用户手动登录
  };

  const logout = async () => {
    await UserService.logout();
    setUser(null);
    
    // 登出时停止token自动刷新服务
    tokenRefreshService.stop();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await UserService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
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