import React, { useState } from 'react';
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://placehold.co/276x276/F2F3F5/6B7280?text=${encodeURIComponent(alt)}`;
  };

  return (
    <div 
      className={`relative w-full ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 黑白图片 - 默认显示 */}
      <img
        src={homeImage?.defaultUrl}
        alt={alt}
        className={`w-full h-auto object-cover transition-opacity duration-500 ease-in-out ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
      />
      
      {/* 彩色图片 - 悬停时显示 */}
      <img
        src={homeImage?.colorUrl}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        onError={handleImageError}
      />
    </div>
  );
};

export default HoverColorImage; 