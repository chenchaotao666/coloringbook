/**
 * URL处理工具类
 * 用于统一处理前端访问后端资源时的URL转换
 */
export class UrlUtils {
  /**
   * 确保URL是完整的绝对路径
   * @param url 原始URL（可能是相对路径）
   * @returns 处理后的绝对URL
   */
  static ensureAbsoluteUrl(url: string): string {
    if (!url) return url;
    
    // 如果已经是完整URL，直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 获取后端基础URL
    const baseUrl = import.meta.env.MODE === 'development' 
      ? '' // 开发环境使用相对路径（通过Vite代理）
      : import.meta.env.VITE_API_BASE_URL || '';
    
    if (baseUrl) {
      // 确保baseUrl不以/结尾，url以/开头
      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const cleanUrl = url.startsWith('/') ? url : `/${url}`;
      return `${cleanBaseUrl}${cleanUrl}`;
    }
    
    return url;
  }

  /**
   * 批量处理URL数组，确保都是绝对路径
   * @param urls URL字符串数组
   * @returns 处理后的绝对URL数组
   */
  static ensureAbsoluteUrls(urls: string[]): string[] {
    return urls.map(url => this.ensureAbsoluteUrl(url));
  }

  /**
   * 处理对象中的URL字段，确保都是绝对路径
   * @param obj 包含URL字段的对象
   * @param urlFields 需要处理的URL字段名数组
   * @returns 处理后的对象
   */
  static processObjectUrls<T extends Record<string, any>>(
    obj: T, 
    urlFields: (keyof T)[]
  ): T {
    const processed = { ...obj };
    
    urlFields.forEach(field => {
      if (typeof processed[field] === 'string') {
        processed[field] = this.ensureAbsoluteUrl(processed[field] as string) as T[keyof T];
      }
    });
    
    return processed;
  }

  /**
   * 获取后端基础URL
   * @returns 后端基础URL字符串
   */
  static getBaseUrl(): string {
    return import.meta.env.MODE === 'development' 
      ? '' // 开发环境使用相对路径
      : import.meta.env.VITE_API_BASE_URL || '';
  }

  /**
   * 检查URL是否为绝对路径
   * @param url 要检查的URL
   * @returns 是否为绝对路径
   */
  static isAbsoluteUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }
} 