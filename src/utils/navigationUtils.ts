/**
 * 导航工具函数
 */

/**
 * 检查当前路径是否为公开页面
 */
export const isPublicPath = (path: string): boolean => {
  const publicPaths = ['/', '/categories', '/login', '/register', '/forgot-password', '/reset-password'];
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith('/categories/') || 
    path.startsWith('/image/')
  );
};

/**
 * 在认证失败时跳转到首页（只有在非公开页面时）
 */
export const redirectToHomeIfNeeded = (): boolean => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    
    if (!isPublicPath(currentPath)) {
      window.location.href = '/';
      return true; // 表示进行了跳转
    }
  }
  return false; // 表示没有跳转
}; 