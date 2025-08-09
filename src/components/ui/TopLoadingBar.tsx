import React, { useState, useEffect } from 'react';
import { useLoading } from '../../contexts/LoadingContext';

interface TopLoadingBarProps {
  height?: number;
}

const TopLoadingBar: React.FC<TopLoadingBarProps> = ({
  height = 3
}) => {
  const { isLoading: globalLoading, progress: globalProgress } = useLoading();
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 监听全局Loading状态变化
  useEffect(() => {
    if (globalLoading) {
      setIsFadingOut(false);
    } else {
      // 全局loading完成时，触发淡出
      setTimeout(() => {
        setIsFadingOut(true);
      }, 150);
    }
  }, [globalLoading]);

  // TopLoadingBar只负责显示，不自动启动loading

  if (!globalLoading && !isFadingOut) {
    return null;
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ease-out"
      style={{
        height: `${height}px`,
        background: 'linear-gradient(180deg, #fef3e2, #fed7aa, #fdba74), linear-gradient(90deg, #fef3e2, #fed7aa, #fdba74)',
        backgroundBlendMode: 'multiply',
        width: `${globalProgress}%`,
        boxShadow: '0 0 6px rgba(253, 186, 116, 0.2)',
        opacity: isFadingOut ? 0 : 1,
        transition: isFadingOut 
          ? 'opacity 400ms ease-out, width 300ms ease-out' 
          : 'width 300ms ease-out',
      }}
    />
  );
};

export default TopLoadingBar;