import React from 'react';
import { Category } from '../../services/categoriesService';
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
    imageCount: 0,
    thumbnailUrl: homeImage.defaultUrl
  } : null);

  if (!displayCategory) return null;

  // 模拟子分类标签数据
  const getSubCategoryTags = (categoryName: string) => {
    switch (categoryName) {
      case 'animals':
        return ['Cat (12)', 'Dog (8)', 'Bird (6)', 'Fish (4)', 'Horse (3)'];
      case 'disney':
        return ['Princess (15)', 'Mickey (10)', 'Cars (8)', 'Frozen (6)', 'Toy Story (5)'];
      case 'flowers':
        return ['Peony (2)', 'Rose (4)', 'Lily (4)', 'Sunflower (4)', 'Carnation (4)'];
      case 'vehicles':
        return ['Car (12)', 'Truck (8)', 'Plane (6)', 'Train (4)', 'Boat (3)'];
      case 'fantasy':
        return ['Dragon (10)', 'Unicorn (8)', 'Fairy (6)', 'Castle (4)', 'Magic (3)'];
      case 'nature':
        return ['Tree (8)', 'Mountain (6)', 'Ocean (5)', 'Forest (4)', 'Garden (3)'];
      default:
        return ['Various (10)', 'Popular (8)', 'New (6)', 'Classic (4)'];
    }
  };

  const subCategories = getSubCategoryTags(displayCategory.name);

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
            className="w-full h-auto object-cover rounded-t-2xl"
            src={displayCategory.thumbnailUrl}
            alt={displayCategory.displayName}
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