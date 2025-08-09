import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface TopLoadingBarProps {
  height?: number;
  minDuration?: number;
}

const TopLoadingBar: React.FC<TopLoadingBarProps> = ({
  height = 3,
  minDuration = 200
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const location = useLocation();

  const completeLoading = useCallback(() => {
    setProgress(100);
    
    // 开始渐变消失
    setTimeout(() => {
      setIsFadingOut(true);
      
      // 渐变完成后隐藏
      setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
        setIsFadingOut(false);
      }, 400);
    }, 150);
  }, []);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    let minDurationTimer: NodeJS.Timeout;
    let isComplete = false;
    
    // 开始加载
    setIsLoading(true);
    setProgress(0);
    setIsFadingOut(false);

    // 初始快速进度到30%
    setProgress(30);

    // 模拟渐进式加载进度
    const updateProgress = () => {
      setProgress(prev => {
        if (prev >= 85) {
          return prev; // 停在85%等待真实完成信号
        }
        return Math.min(85, prev + Math.random() * 10 + 2);
      });
    };

    progressTimer = setInterval(updateProgress, 150);

    // 监听页面加载完成事件
    const handleLoad = () => {
      if (!isComplete) {
        isComplete = true;
        clearInterval(progressTimer);
        completeLoading();
      }
    };

    // 监听DOM内容加载完成
    const handleDOMContentLoaded = () => {
      if (!isComplete) {
        isComplete = true;
        clearInterval(progressTimer);
        completeLoading();
      }
    };

    // 监听所有资源加载完成
    window.addEventListener('load', handleLoad);
    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);

    // 最小持续时间后，如果还没完成就强制完成
    minDurationTimer = setTimeout(() => {
      if (!isComplete) {
        isComplete = true;
        clearInterval(progressTimer);
        completeLoading();
      }
    }, minDuration);

    // 如果页面已经加载完成，立即触发完成
    if (document.readyState === 'complete') {
      setTimeout(handleLoad, 100);
    }

    return () => {
      clearInterval(progressTimer);
      clearTimeout(minDurationTimer);
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, [location.pathname, minDuration, completeLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999]">
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          height: `${height}px`,
          background: 'linear-gradient(90deg, #fed7aa, #fdba74, #fb923c)',
          width: `${progress}%`,
          boxShadow: '0 0 8px rgba(251, 146, 60, 0.3)',
          opacity: isFadingOut ? 0 : 1,
          transition: isFadingOut 
            ? 'opacity 400ms ease-out, width 300ms ease-out' 
            : 'width 300ms ease-out',
        }}
      />
    </div>
  );
};

export default TopLoadingBar;