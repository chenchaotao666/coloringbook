import React from 'react';
import { Category } from '../../services/categoriesService';
import CategoryCard from '../categories/CategoryCard';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

interface CategoryGridProps {
  categories: Category[];
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
  onCategoryClick?: (category: Category) => void;
  className?: string;
  maxColumns?: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
}

const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  isLoading = false,
  emptyState,
  onCategoryClick,
  className = '',
  maxColumns = { desktop: 4, tablet: 3, mobile: 2 }
}) => {
  const { t } = useAsyncTranslation('categories');

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex justify-center items-center h-[300px] sm:h-[400px]">
          {/* 加载时不显示任何文本 */}
        </div>
      </div>
    );
  }

  if (categories.length === 0 && emptyState) {
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
          <h3 className="text-xl font-semibold text-[#161616] mb-2">{emptyState.title}</h3>
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

  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category);
    }
  };

  // 动态计算列数，避免空列
  const getColumnCount = (categoryCount: number, maxCols: number) => {
    if (categoryCount === 0) return 1;
    return Math.min(categoryCount, maxCols);
  };

  const desktopColumns = getColumnCount(categories.length, maxColumns.desktop);
  const tabletColumns = getColumnCount(categories.length, maxColumns.tablet);
  const mobileColumns = getColumnCount(categories.length, maxColumns.mobile);

  // 智能分配分类到各列，确保均匀分布
  const distributeToColumns = (categories: Category[], columnCount: number) => {
    if (categories.length === 0) return [];
    
    // 智能决定实际列数
    let actualColumnCount;
    if (categories.length <= 2) {
      actualColumnCount = categories.length;
    } else if (categories.length <= 4) {
      actualColumnCount = Math.min(categories.length, columnCount);
    } else {
      actualColumnCount = columnCount;
    }
    
    const actualColumns: Category[][] = Array.from({ length: actualColumnCount }, () => []);
    
    // 计算每列应该有多少个分类
    const baseItemsPerColumn = Math.floor(categories.length / actualColumnCount);
    const extraItems = categories.length % actualColumnCount;
    
    let categoryIndex = 0;
    
    // 为每列分配分类
    for (let colIndex = 0; colIndex < actualColumnCount; colIndex++) {
      const itemsInThisColumn = baseItemsPerColumn + (colIndex < extraItems ? 1 : 0);
      
      for (let i = 0; i < itemsInThisColumn; i++) {
        if (categoryIndex < categories.length) {
          actualColumns[colIndex].push(categories[categoryIndex]);
          categoryIndex++;
        }
      }
    }
    
    return actualColumns;
  };

  const desktopCategoryColumns = distributeToColumns(categories, desktopColumns);
  const tabletCategoryColumns = distributeToColumns(categories, tabletColumns);
  const mobileCategoryColumns = distributeToColumns(categories, mobileColumns);

  // 根据分类数量决定对齐方式：少于4个时左对齐，4个及以上时居中对齐
  const getJustifyClass = (categoryCount: number) => {
    return categoryCount < 4 ? 'justify-start' : 'justify-center';
  };

  const desktopJustifyClass = getJustifyClass(categories.length);
  const tabletJustifyClass = getJustifyClass(categories.length);
  const mobileJustifyClass = getJustifyClass(categories.length);

  return (
    <div className={`w-full ${className}`} data-category-grid-version="v1.0">
      {/* 瀑布流布局 - 桌面端 */}
      <div className="hidden lg:block">
        <div className={`flex gap-4 xl:gap-6 max-w-[1200px] mx-auto ${desktopJustifyClass}`}>
          {desktopCategoryColumns.map((columnCategories, columnIndex) => (
            <div 
              key={`desktop-column-${columnIndex}`} 
              className="space-y-4 xl:space-y-6 flex-1 max-w-[273px]"
            >
              {columnCategories.map((category, categoryIndex) => (
                <div key={`${category.categoryId}-desktop-${columnIndex}-${categoryIndex}`} className="w-full">
                  <CategoryCard
                    category={category}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* 瀑布流布局 - 平板端 */}
      <div className="hidden md:block lg:hidden">
        <div className={`flex gap-3 ${tabletJustifyClass} px-2`}>
          {tabletCategoryColumns.map((columnCategories, columnIndex) => (
            <div 
              key={`tablet-column-${columnIndex}`} 
              className="space-y-3 flex-1 max-w-[240px]"
            >
              {columnCategories.map((category, categoryIndex) => (
                <div key={`${category.categoryId}-tablet-${columnIndex}-${categoryIndex}`} className="w-full">
                  <CategoryCard
                    category={category}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* 瀑布流布局 - 移动端 */}
      <div className="md:hidden">
        <div className={`flex gap-2 sm:gap-3 ${mobileJustifyClass} px-1 sm:px-2`}>
          {mobileCategoryColumns.map((columnCategories, columnIndex) => (
            <div 
              key={`mobile-column-${columnIndex}`} 
              className="space-y-2 sm:space-y-3 flex-1"
              style={{ maxWidth: '180px' }}
            >
              {columnCategories.map((category, categoryIndex) => (
                <div key={`${category.categoryId}-mobile-${columnIndex}-${categoryIndex}`} className="w-full">
                  <CategoryCard
                    category={category}
                    onCategoryClick={handleCategoryClick}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid; 