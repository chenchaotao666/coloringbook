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

/**
 * 获取当前语言前缀
 */
export const getCurrentLanguagePrefix = (): string => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/zh')) {
      return '/zh';
    } else if (currentPath.startsWith('/ja')) {
      return '/ja';
    }
  }
  return '';
};

/**
 * 创建带语言前缀的导航路径
 * @param path 目标路径（不包含语言前缀）
 * @returns 包含当前语言前缀的完整路径
 */
export const createLanguageAwarePath = (path: string): string => {
  const languagePrefix = getCurrentLanguagePrefix();
  
  // 确保路径以/开头
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // 如果有语言前缀，添加到路径前
  return languagePrefix ? `${languagePrefix}${cleanPath}` : cleanPath;
};

/**
 * 语言感知的导航函数
 * @param navigate React Router的navigate函数
 * @param path 目标路径（不包含语言前缀）
 * @param options 导航选项
 */
export const navigateWithLanguage = (
  navigate: (path: string, options?: any) => void,
  path: string,
  options?: any
): void => {
  const fullPath = createLanguageAwarePath(path);
  navigate(fullPath, options);
}; 