import React, { useState, useEffect } from 'react';

interface BackToTopProps {
  scrollContainer?: HTMLElement | null;
}

const BackToTop: React.FC<BackToTopProps> = ({ scrollContainer }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const toggleVisibility = () => {
      let scrollTop = 0;
      
      if (scrollContainer) {
        // 使用自定义滚动容器
        scrollTop = scrollContainer.scrollTop;
      } else {
        // 使用window滚动
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      }
      
      // 当滚动超过300px时显示按钮
      if (scrollTop > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    const targetElement = scrollContainer || window;
    targetElement.addEventListener('scroll', toggleVisibility);

    return () => {
      targetElement.removeEventListener('scroll', toggleVisibility);
    };
  }, [scrollContainer]);

  // 滚动到顶部
  const scrollToTop = () => {
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      className={`fixed right-10 bottom-40 lg:bottom-25 z-50 cursor-pointer transition-all duration-500 ease-in-out ${
        isVisible 
          ? 'opacity-80 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-4 scale-90 pointer-events-none'
      }`}
      onClick={scrollToTop}
    >
      <div className="w-12 h-12 bg-white bg-opacity-90 backdrop-blur-sm shadow-lg rounded-full flex items-center justify-center border border-gray-200 hover:bg-opacity-100 hover:shadow-xl transition-all duration-300">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1024 1024"
          className="w-6 h-6 text-neutral-950 opacity-80"
          fill="currentColor"
        >
          <path d="M512 320 192 704h639.936z" />
        </svg>
      </div>
    </div>
  );
};

export default BackToTop; 