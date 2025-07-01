import React, { useState, useEffect } from 'react';
import { Category } from '../../services/categoriesService';
import { HomeImage } from '../../services/imageService';
import { useLanguage } from '../../contexts/LanguageContext';

interface CategoryCardProps {
  category?: Category;
  homeImage?: HomeImage;
  onCategoryClick?: (category: Category) => void;
  onClick?: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  homeImage, 
  onCategoryClick, 
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileShowColor, setMobileShowColor] = useState(false);
  const { language } = useLanguage();

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg断点
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // 如果传入的是HomeImage，从中提取分类信息
  const displayCategory = category || (homeImage ? {
    id: homeImage.id,
    name: homeImage.name.toLowerCase(),
    displayName: homeImage.title,
    display_name: homeImage.title,
    description: homeImage.description,
    hotness: homeImage.hotness || 0,
    tagCounts: [], // 空的标签统计数组
    thumbnailUrl: homeImage.defaultUrl,
    defaultUrl: homeImage.defaultUrl,
    colorUrl: homeImage.colorUrl || '',
    coloringUrl: homeImage.coloringUrl || ''
  } : null);

  if (!displayCategory) return null;

  // 获取国际化文本的辅助函数
  const getLocalizedText = (textObj: any): string => {
    if (typeof textObj === 'string') {
      return textObj;
    } else if (typeof textObj === 'object' && textObj) {
      return textObj[language] || textObj['en'] || textObj['zh'] || '';
    }
    return '';
  };

  // 从后台数据获取标签统计，并格式化为显示用的标签数组
  const getTagsFromBackend = (category: any) => {
    // 将标签按数量排序，取前5个
    return category.tagCounts
      .sort((a: any, b: any) => b.count - a.count) // 按数量降序排序
      .slice(0, 5) // 只取前5个
      .map((tagCount: any) => {
        // 处理多语言displayName对象
        const displayName = getLocalizedText(tagCount.displayName);
        // 如果需要也可以处理description
        // const description = getLocalizedText(tagCount.description);
        return `${displayName} (${tagCount.count})`;
      });
  };

  const subCategories = getTagsFromBackend(displayCategory);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onCategoryClick && category) {
      onCategoryClick(category);
    }
  };

  // 移动端点击切换颜色效果
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发父元素的点击事件
    setMobileShowColor(prev => !prev);
  };

  // 根据设备类型决定显示状态，只有当存在coloringUrl时才显示彩色效果
  const shouldShowColor = displayCategory.coloringUrl ? (isMobile ? mobileShowColor : isHovered) : false;

  // 图片错误处理
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // 处理displayName和display_name的多语言对象
    const nameToUse = displayCategory.displayName || displayCategory.display_name;
    const fallbackText = getLocalizedText(nameToUse) || 'Image';
    
    target.src = 'https://placehold.co/276x386?text=' + encodeURIComponent(fallbackText);
  };

  return (
    <div 
      className="pt-[1px] pb-3 bg-white rounded-2xl border border-[#EDEEF0] w-full max-w-[278px] mx-auto"
    >
      <div className="w-full flex flex-col justify-start items-center gap-4">
        {/* 图片区域 */}
        <div 
          className="w-full px-[1px] rounded-t-2xl overflow-hidden relative cursor-pointer"
          style={{
            WebkitTapHighlightColor: 'transparent'
          }}
          {...(displayCategory.coloringUrl ? {
            onMouseEnter: () => !isMobile && setIsHovered(true),
            onMouseLeave: () => !isMobile && setIsHovered(false)
          } : {})}
          onClick={handleClick}
        >
          {/* 黑白图片 - defaultUrl (默认显示) */}
          <img 
            className={`w-full h-auto object-cover rounded-t-2xl ${
              displayCategory.coloringUrl 
                ? `transition-opacity duration-500 ease-in-out ${shouldShowColor ? 'opacity-0' : 'opacity-100'}` 
                : ''
            }`}
            src={displayCategory.defaultUrl}
            alt={displayCategory.displayName}
            onError={handleImageError}
          />
          
          {/* 彩色图片 - coloringUrl (悬停或点击时显示) */}
          {displayCategory.coloringUrl && (
            <img 
              className={`absolute inset-0 w-full h-full object-cover rounded-t-2xl transition-opacity duration-500 ease-in-out ${
                shouldShowColor ? 'opacity-100' : 'opacity-0'
              }`}
              src={displayCategory.coloringUrl}
              alt={`${displayCategory.displayName} colored`}
              onError={handleImageError}
            />
          )}
          
          {/* 移动端切换按钮 - 显示小图片效果 */}
          {isMobile && displayCategory.coloringUrl && (
            <div
              onClick={handleToggleClick}
              className="absolute bottom-2 right-2 max-w-12 max-h-12 rounded-lg shadow-md overflow-hidden transition-all duration-200 z-10 opacity-90 hover:opacity-100 border-2 border-white cursor-pointer"
              style={{ 
                WebkitTapHighlightColor: 'transparent',
                touchAction: 'manipulation'
              }}
              aria-label="切换彩色效果"
            >
              {/* 小的coloringUrl图片 */}
              <img
                src={displayCategory.coloringUrl}
                alt="Color preview"
                className="block max-w-12 max-h-12 w-auto h-auto object-contain"
                onError={handleImageError}
              />
            </div>
          )}
        </div>
        
        {/* 内容区域 */}
        <div className="self-stretch px-3 flex flex-col justify-start items-start gap-2">
          {/* 标题 */}
          <div className="w-[254px] flex justify-start items-start">
            <div className="w-[254px] text-[#161616] text-base font-medium capitalize leading-5 break-words">
              {getLocalizedText(displayCategory.displayName || displayCategory.display_name)}
            </div>
          </div>
          
          {/* 子分类标签 */}
          <div className="self-stretch flex justify-start items-center gap-2 flex-wrap">
            {subCategories.map((subCategory: string, index: number) => (
              <div 
                key={index}
                className="px-2 py-1 bg-[#F9FAFB] rounded-xl flex justify-center items-center gap-2.5"
              >
                <div className="text-[#6B7280] text-xs font-normal leading-4 break-words">
                  {subCategory}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="self-stretch px-3 flex justify-start items-center gap-2">
          <button 
            className="w-[254px] py-1.5 rounded border border-[#EDEEF0] hover:border-[#FF5C07] hover:bg-gray-50 flex justify-center items-center gap-1 transition-colors duration-200 cursor-pointer group"
            onClick={handleClick}
          >
            <div className="text-[#6B7280] group-hover:text-[#FF5C07] text-sm font-normal leading-4 break-words transition-colors duration-200">
              View all categories
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard; 