import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 滚动重置组件
 * 在路由变化时自动将页面滚动到顶部
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 当路由路径变化时，滚动到页面顶部
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // 平滑滚动效果
    });
  }, [pathname]);

  return null; // 这个组件不渲染任何内容
};

export default ScrollToTop; 