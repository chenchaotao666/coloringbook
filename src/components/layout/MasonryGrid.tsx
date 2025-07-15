import React from 'react';
import { HomeImage } from '../../services/imageService';
import HoverImageCard from '../home/HoverImageCard';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedText } from '../../utils/textUtils';

interface MasonryGridProps {
  images: HomeImage[];
  isLoading?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
    actionButton?: {
      text: string;
      onClick: () => void;
    };
  };
  onImageClick?: (image: HomeImage) => void;
  className?: string;
  renderCard?: (image: HomeImage, index: number) => React.ReactNode;
}

const MasonryGrid: React.FC<MasonryGridProps> = ({
  images,
  isLoading = false,
  emptyState,
  onImageClick,
  className = '',
  renderCard
}) => {
  const { language } = useLanguage();
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
          {/* 加载时不显示任何文本 */}
        </div>
      </div>
    );
  }

  if (images.length === 0 && emptyState) {
    return (
      <div className={`w-full flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          {/* 检查icon是否是图片路径（包含.svg, .png, .jpg等）还是emoji */}
          {emptyState.icon.includes('.') ? (
            <div className="mb-6">
              <img 
                src={emptyState.icon} 
                alt={emptyState.title} 
                className="w-[305px] h-[200px] mx-auto"
              />
            </div>
          ) : (
            <div className="text-6xl mb-4">{emptyState.icon}</div>
          )}
          <p className="text-[#6B7280] text-base font-normal leading-6 mb-6">
            {emptyState.description}
          </p>
          {emptyState.actionButton && (
            <button
              onClick={emptyState.actionButton.onClick}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {emptyState.actionButton.text}
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleImageClick = (image: HomeImage) => {
    if (onImageClick) {
      onImageClick(image);
    }
  };

  const defaultRenderCard = (image: HomeImage, _index: number) => (
    <div 
      onClick={() => handleImageClick(image)}
      className={onImageClick ? "cursor-pointer" : ""}
    >
      <HoverImageCard
        image={image}
        title={getLocalizedText(image.title, language)}
        tags={image.tags ? image.tags.map(tag => getLocalizedText(tag.display_name, language)) : []}
        className="w-full"
      />
    </div>
  );

  const cardRenderer = renderCard || defaultRenderCard;

  // 动态计算列数，避免空列
  const getColumnCount = (imageCount: number, maxColumns: number = 4) => {
    if (imageCount === 0) return 1;
    return Math.min(imageCount, maxColumns);
  };

  const desktopColumns = getColumnCount(images.length, 4);
  const mobileColumns = getColumnCount(images.length, 2);
  const tabletColumns = getColumnCount(images.length, 3);

  // 智能分配图片到各列，确保均匀分布
  const distributeToColumns = (images: HomeImage[], columnCount: number) => {
    if (images.length === 0) return [];
    
    // 智能决定实际列数
    let actualColumnCount;
    if (images.length <= 2) {
      actualColumnCount = images.length;
    } else if (images.length <= 4) {
      actualColumnCount = Math.min(images.length, columnCount);
    } else {
      // 对于5个以上的图片，尽量使用更多列以获得更好的布局
      actualColumnCount = columnCount;
    }
    
    const actualColumns: HomeImage[][] = Array.from({ length: actualColumnCount }, () => []);
    
    // 计算每列应该有多少张图片
    const baseItemsPerColumn = Math.floor(images.length / actualColumnCount);
    const extraItems = images.length % actualColumnCount;
    
    let imageIndex = 0;
    
    // 为每列分配图片
    for (let colIndex = 0; colIndex < actualColumnCount; colIndex++) {
      const itemsInThisColumn = baseItemsPerColumn + (colIndex < extraItems ? 1 : 0);
      
      for (let i = 0; i < itemsInThisColumn; i++) {
        if (imageIndex < images.length) {
          actualColumns[colIndex].push(images[imageIndex]);
          imageIndex++;
        }
      }
    }
    
    return actualColumns;
  };

  const desktopImageColumns = distributeToColumns(images, desktopColumns);
  const mobileImageColumns = distributeToColumns(images, mobileColumns);
  const tabletImageColumns = distributeToColumns(images, tabletColumns);

  // 根据图片数量决定对齐方式：少于4个时左对齐，4个及以上时居中对齐
  const getJustifyClass = (imageCount: number) => {
    return imageCount < 4 ? 'justify-start' : 'justify-center';
  };

  const desktopJustifyClass = getJustifyClass(images.length);
  const mobileJustifyClass = getJustifyClass(images.length);
  const tabletJustifyClass = getJustifyClass(images.length);

  return (
    <div className={`w-full ${className}`} data-masonry-version="v2.0">
      {/* 瀑布流布局 - 桌面端 */}
      <div className="hidden lg:block">
        <div className={`flex gap-4 xl:gap-6 mx-auto ${desktopJustifyClass}`}>
          {desktopImageColumns.map((columnImages, columnIndex) => (
            <div 
              key={`desktop-column-${columnIndex}`} 
              className="space-y-4 xl:space-y-6 flex-1 max-w-[320px]"
            >
              {columnImages.map((image, imageIndex) => (
                <div key={`${image.id}-desktop-${columnIndex}-${imageIndex}`} className="w-full">
                  {cardRenderer(image, imageIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* 瀑布流布局 - 平板端 */}
      <div className="hidden md:block lg:hidden">
        <div className={`flex gap-3 ${tabletJustifyClass} px-2`}>
          {tabletImageColumns.map((columnImages, columnIndex) => (
            <div 
              key={`tablet-column-${columnIndex}`} 
              className="space-y-3 flex-1 max-w-[240px]"
            >
              {columnImages.map((image, imageIndex) => (
                <div key={`${image.id}-tablet-${columnIndex}-${imageIndex}`} className="w-full">
                  {cardRenderer(image, imageIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* 瀑布流布局 - 移动端 */}
      <div className="md:hidden">
        <div className={`flex gap-2 sm:gap-3 ${mobileJustifyClass} px-1 sm:px-2`}>
          {mobileImageColumns.map((columnImages, columnIndex) => (
            <div 
              key={`mobile-column-${columnIndex}`} 
              className="space-y-2 sm:space-y-3 flex-1"
              style={{ maxWidth: '180px' }}
            >
              {columnImages.map((image, imageIndex) => (
                <div key={`${image.id}-mobile-${columnIndex}-${imageIndex}`} className="w-full">
                  {cardRenderer(image, imageIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasonryGrid; 