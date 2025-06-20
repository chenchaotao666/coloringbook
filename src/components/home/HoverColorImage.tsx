import React, { useState, useEffect } from 'react';
import { HomeImage } from '../../services/imageService';

interface HoverColorImageProps {
  homeImage?: HomeImage; // 可选的传入图片数据
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const HoverColorImage: React.FC<HoverColorImageProps> = ({ 
  homeImage,
  className = '', 
  style = {},
  alt = 'Coloring Page'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowColor, setMobileShowColor] = useState(false);

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg断点
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://placehold.co/276x276/F2F3F5/6B7280?text=${encodeURIComponent(alt)}`;
  };

  // 移动端点击切换
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发父元素的点击事件
    setMobileShowColor(prev => !prev);
  };

  // 根据设备类型决定显示状态
  const shouldShowColor = isMobile ? mobileShowColor : isHovered;

  return (
    <div 
      className={`relative w-full ${className}`}
      style={{
        ...style,
        WebkitTapHighlightColor: 'transparent'
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* 黑白图片 - 默认显示 */}
      <img
        src={homeImage?.defaultUrl}
        alt={alt}
        className={`w-full h-auto object-cover transition-opacity duration-500 ease-in-out ${
          shouldShowColor ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
      />
      
      {/* 彩色图片 - 悬停或点击时显示 */}
      <img
        src={homeImage?.colorUrl}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
          shouldShowColor ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
      />
      
                   {/* 移动端切换按钮 - 只对 image2image 类型显示 */}
      {isMobile && homeImage?.type === 'image2image' && (
        <button
           onClick={handleToggleClick}
           className="absolute top-1 right-1 w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white/70 transition-all duration-200 z-10 opacity-80 hover:opacity-90"
           style={{ 
             WebkitTapHighlightColor: 'transparent',
             touchAction: 'manipulation'
           }}
           aria-label="切换彩色效果"
         >
          {/* 调色板图标 */}
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-colors duration-200 ${
              mobileShowColor ? 'text-orange-500' : 'text-gray-600'
            }`}
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.93 0 1.69-.76 1.69-1.69 0-.46-.19-.86-.49-1.16-.3-.3-.49-.7-.49-1.16C12.71 17.24 13.24 16.71 14 16.71h1.46C17.1 16.71 18.5 15.31 18.5 13.57 18.5 7.29 15.71 2 12 2zM6.5 9C5.67 9 5 8.33 5 7.5S5.67 6 6.5 6 8 6.67 8 7.5 7.33 9 6.5 9zM9.5 6C8.67 6 8 5.33 8 4.5S8.67 3 9.5 3s1.5.67 1.5 1.5S10.33 6 9.5 6zM14.5 6c-.83 0-1.5-.67-1.5-1.5S13.67 3 14.5 3 16 3.67 16 4.5 15.33 6 14.5 6zM17.5 9c-.83 0-1.5-.67-1.5-1.5S16.67 6 17.5 6s1.5.67 1.5 1.5S18.33 9 17.5 9z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HoverColorImage; 