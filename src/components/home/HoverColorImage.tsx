import React, { useState, useEffect } from 'react';
import { HomeImage, HomeImageService } from '../../services/imageService';

interface HoverColorImageProps {
  homeImage?: HomeImage; // 可选的传入图片数据
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}

const HoverColorImage: React.FC<HoverColorImageProps> = ({ 
  homeImage: propHomeImage,
  className = '', 
  style = {},
  alt = 'Coloring Page'
}) => {
  const [homeImage, setHomeImage] = useState<HomeImage | null>(propHomeImage || null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(!propHomeImage);

  useEffect(() => {
    // 如果没有传入图片数据，则从服务获取
    if (!propHomeImage) {
      const loadImage = async () => {
        try {
          setIsLoading(true);
          const image = await HomeImageService.fetchHomeImage();
          setHomeImage(image);
        } catch (error) {
          console.error('Failed to load home image:', error);
        } finally {
          setIsLoading(false);
        }
      };

      loadImage();
    }
  }, [propHomeImage]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center aspect-[4/5] ${className}`}
        style={style}
      >
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!homeImage) {
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center aspect-[4/5] ${className}`}
        style={style}
      >
        <div className="text-gray-500">图片加载失败</div>
      </div>
    );
  }

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
        src={homeImage.defaultUrl}
        alt={alt}
        className={`w-full h-auto object-cover transition-opacity duration-500 ease-in-out ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
        onError={handleImageError}
      />
      
      {/* 彩色图片 - 悬停时显示 */}
      <img
        src={homeImage.colorUrl}
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