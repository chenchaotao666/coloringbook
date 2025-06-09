import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopAdvancedProps {
  /** 是否启用平滑滚动 */
  smooth?: boolean;
  /** 滚动延迟（毫秒） */
  delay?: number;
  /** 需要排除的路径（这些路径不会触发滚动重置） */
  excludePaths?: string[];
  /** 是否只在特定路径触发滚动重置 */
  includePaths?: string[];
}

/**
 * 增强版滚动重置组件
 * 提供更多配置选项的路由滚动重置功能
 */
const ScrollToTopAdvanced: React.FC<ScrollToTopAdvancedProps> = ({
  smooth = true,
  delay = 0,
  excludePaths = [],
  includePaths = []
}) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 检查是否应该跳过滚动重置
    if (excludePaths.length > 0 && excludePaths.includes(pathname)) {
      return;
    }

    // 检查是否只在特定路径触发
    if (includePaths.length > 0 && !includePaths.includes(pathname)) {
      return;
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'auto'
      });
    };

    if (delay > 0) {
      // 延迟滚动
      const timer = setTimeout(scrollToTop, delay);
      return () => clearTimeout(timer);
    } else {
      // 立即滚动
      scrollToTop();
    }
  }, [pathname, smooth, delay, excludePaths, includePaths]);

  return null;
};

export default ScrollToTopAdvanced; 