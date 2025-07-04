/**
 * 导航工具函数
 */

/**
 * 检查当前路径是否为公开页面
 */
export const isPublicPath = (path: string): boolean => {
  const publicPaths = [
    '/', 
    '/categories', 
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/price',
    '/generate',
    '/text-coloring-page',
    '/image-coloring-page'
  ];
  
  return publicPaths.some(publicPath => path === publicPath) || 
         path.startsWith('/categories/') || 
         path.startsWith('/image/');
};

/**
 * 在认证失败时跳转到首页（只有在非公开页面时）
 */
export const redirectToHomeIfNeeded = (): boolean => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    const isPublic = isPublicPath(currentPath);
    
    console.log('🔍 检查是否需要跳转:', { currentPath, isPublic });
    
    if (!isPublic) {
      console.log('🔄 非公开页面，执行跳转到首页');
      window.location.href = '/';
      return true; // 表示进行了跳转
    } else {
      console.log('✅ 公开页面，不执行跳转');
    }
  }
  return false; // 表示没有跳转
}; 