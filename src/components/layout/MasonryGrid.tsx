import React from 'react';
import { HomeImage } from '../../services/imageService';
import HoverImageCard from '../home/HoverImageCard';

interface MasonryGridProps {
  images: HomeImage[];
  isLoading?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
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
  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center items-center h-[400px]">
          <div className="text-xl text-gray-600">加载中...</div>
        </div>
      </div>
    );
  }

  if (images.length === 0 && emptyState) {
    return (
      <div className={`w-full flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">{emptyState.icon}</div>
          <h3 className="text-xl font-semibold text-[#161616] mb-2">{emptyState.title}</h3>
          <p className="text-[#6B7280] text-sm max-w-md">
            {emptyState.description}
          </p>
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
        title={image.title}
        tags={image.tags}
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

  // 调试信息（仅在6个元素时显示）
  if (images.length === 6) {
    console.log('MasonryGrid 6个元素分配:', {
      桌面端: `${desktopImageColumns.length}列`,
      分配: desktopImageColumns.map((col, i) => `列${i+1}: ${col.length}个`)
    });
  }

  // 计算固定列宽，确保图片按相同比例显示
  const getColumnWidth = (screenType: 'desktop' | 'tablet' | 'mobile') => {
    switch (screenType) {
      case 'desktop':
        return '273px'; // 桌面端固定宽度
      case 'tablet':
        return '240px'; // 平板端适中宽度
      case 'mobile':
        return '160px'; // 移动端较小宽度
      default:
        return '273px';
    }
  };

  const desktopColumnWidth = getColumnWidth('desktop');
  const mobileColumnWidth = getColumnWidth('mobile');
  const tabletColumnWidth = getColumnWidth('tablet');

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
        <div className={`flex gap-6 max-w-[1200px] mx-auto ${desktopJustifyClass}`}>
          {desktopImageColumns.map((columnImages, columnIndex) => (
            <div 
              key={`desktop-column-${columnIndex}`} 
              className="space-y-6"
              style={{ width: desktopColumnWidth }}
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
      
      {/* 瀑布流布局 - 移动端 */}
      <div className="lg:hidden">
        {/* 小屏幕 */}
        <div className={`md:hidden flex gap-4 ${mobileJustifyClass}`}>
          {mobileImageColumns.map((columnImages, columnIndex) => (
            <div 
              key={`mobile-column-${columnIndex}`} 
              className="space-y-4"
              style={{ width: mobileColumnWidth }}
            >
              {columnImages.map((image, imageIndex) => (
                <div key={`${image.id}-mobile-${columnIndex}-${imageIndex}`} className="w-full">
                  {cardRenderer(image, imageIndex)}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* 中等屏幕 */}
        <div className={`hidden md:flex gap-4 ${tabletJustifyClass}`}>
          {tabletImageColumns.map((columnImages, columnIndex) => (
            <div 
              key={`tablet-column-${columnIndex}`} 
              className="space-y-4"
              style={{ width: tabletColumnWidth }}
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
    </div>
  );
};

export default MasonryGrid; 