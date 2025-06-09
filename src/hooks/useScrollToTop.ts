import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface UseScrollToTopOptions {
  /** 是否启用平滑滚动 */
  smooth?: boolean;
  /** 滚动延迟（毫秒） */
  delay?: number;
  /** 是否启用滚动重置 */
  enabled?: boolean;
}

/**
 * 滚动重置Hook
 * 在路由变化时自动滚动到页面顶部
 */
export const useScrollToTop = (options: UseScrollToTopOptions = {}) => {
  const { smooth = true, delay = 0, enabled = true } = options;
  const { pathname } = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };

    if (delay > 0) {
      const timer = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timer);
    } else {
      scrollToTop();
    }
  }, [pathname, smooth, delay, enabled]);

  // 返回手动滚动到顶部的函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  return { scrollToTop };
};

/**
 * 滚动到指定位置的Hook
 */
export const useScrollTo = () => {
  const scrollTo = (top: number = 0, left: number = 0, smooth: boolean = true) => {
    window.scrollTo({
      top,
      left,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  const scrollToElement = (elementId: string, smooth: boolean = true) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start'
      });
    }
  };

  return { scrollTo, scrollToElement };
}; 