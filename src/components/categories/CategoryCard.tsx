import React from 'react';
import { Category, CategoriesService } from '../../services/categoriesService';
import { HomeImage } from '../../services/imageService';

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
  // 如果传入的是HomeImage，从中提取分类信息
  const displayCategory = category || (homeImage ? {
    id: homeImage.id,
    name: homeImage.name.toLowerCase(),
    displayName: homeImage.title,
    description: homeImage.description,
    tagCounts: [], // 空的标签统计数组
    thumbnailUrl: homeImage.defaultUrl
  } : null);

  if (!displayCategory) return null;

  // 从后台数据获取标签统计，并格式化为显示用的标签数组
  const getTagsFromBackend = (category: Category) => {
    // 将标签按数量排序，取前5个
    return category.tagCounts
      .sort((a, b) => b.count - a.count) // 按数量降序排序
      .slice(0, 5) // 只取前5个
      .map(tagCount => `${tagCount.tagDisplayName || tagCount.tagName} (${tagCount.count})`);
  };

  const subCategories = getTagsFromBackend(displayCategory);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (onCategoryClick && category) {
      onCategoryClick(category);
    }
  };

  return (
    <div 
      className="pt-[1px] pb-3 bg-white rounded-2xl border border-[#EDEEF0] w-full max-w-[278px] mx-auto"
    >
      <div className="w-full flex flex-col justify-start items-center gap-4">
        {/* 图片区域 */}
        <div className="w-full px-[1px] rounded-t-2xl overflow-hidden">
          <img 
            className="w-full h-auto object-cover rounded-t-2xl cursor-pointer hover:opacity-90 transition-opacity duration-200"
            src={displayCategory.thumbnailUrl}
            alt={displayCategory.displayName}
            onClick={handleClick}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://placehold.co/276x386?text=' + encodeURIComponent(displayCategory.displayName);
            }}
          />
        </div>
        
        {/* 内容区域 */}
        <div className="self-stretch px-3 flex flex-col justify-start items-start gap-2">
          {/* 标题 */}
          <div className="w-[254px] flex justify-start items-start">
            <div className="w-[254px] text-[#161616] text-base font-medium capitalize leading-5 break-words">
              {displayCategory.displayName}
            </div>
          </div>
          
          {/* 子分类标签 */}
          <div className="self-stretch flex justify-start items-center gap-2 flex-wrap">
            {subCategories.map((subCategory, index) => (
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