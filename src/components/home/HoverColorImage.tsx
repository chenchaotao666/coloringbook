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
        <div
           onClick={handleToggleClick}
           className="absolute bottom-1 right-1 max-w-16 max-h-16 rounded-lg shadow-md overflow-hidden transition-all duration-200 z-10 opacity-90 hover:opacity-100 border-2 border-white cursor-pointer"
           style={{ 
             WebkitTapHighlightColor: 'transparent',
             touchAction: 'manipulation'
           }}
           aria-label="切换彩色效果"
         >
          {/* 小的colorUrl图片 */}
          <img
            src={homeImage?.colorUrl}
            alt="Color preview"
            className="block max-w-16 max-h-16 w-auto h-auto object-contain"
            onError={handleImageError}
          />
        </div>
      )}
    </div>
  );
};

export default HoverColorImage; 