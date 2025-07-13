import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { CategoriesService, Category } from '../../services/categoriesService';
import CategoryGrid from '../layout/CategoryGrid';
import { useLanguage, useAsyncTranslation } from '../../contexts/LanguageContext';
import { getCategoryNameById, updateCategoryMappings } from '../../utils/categoryUtils';
import { navigateWithLanguage } from '../../utils/navigationUtils';

interface GalleryProps {
  title: string;
}

const Gallery: React.FC<GalleryProps> = ({ title }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useLanguage();
  const { t } = useAsyncTranslation('home');
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await CategoriesService.getCategories(language);
        
        // 更新分类映射表
        updateCategoryMappings(categoriesData);
        
        // 按热度排序，热度高的在前
        const sortedCategories = categoriesData.sort((a, b) => b.hotness - a.hotness);
        setCategories(sortedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [language]);

  const displayCategories = categories.slice(0, 8); // 显示前8个分类

  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryNameById(category.categoryId);
    console.log('分类ID:', category.categoryId, '→ SEO路径:', categoryPath);
    navigateWithLanguage(navigate, `/categories/${categoryPath}`);
  };

  return (
    <div className="w-full bg-[#F9FAFB] pb-12 sm:pb-16 md:pb-20 lg:pb-[120px] pt-12 sm:pt-16 md:pt-20 lg:pt-[120px]">
      <div className="container mx-auto px-4 sm:px-6 max-w-[1200px]">
        <h2 className="text-center text-[#161616] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[46px] font-bold capitalize mb-8 sm:mb-10 md:mb-12 lg:mb-[48px] leading-relaxed lg:leading-[1.6] px-4 sm:px-0">
          {title}
        </h2>
        
        <CategoryGrid 
          categories={displayCategories}
          isLoading={isLoading}
          onCategoryClick={handleCategoryClick}
          maxColumns={{ desktop: 4, tablet: 3, mobile: 2 }}
        />
        
        <div className="flex justify-center mt-12 sm:mt-16 md:mt-20 px-4 sm:px-0">
          <Link to="/categories">
            <Button 
              variant="gradient"
              className="h-[50px] sm:h-[60px] px-4 sm:px-5 py-3 rounded-lg overflow-hidden text-lg sm:text-xl font-bold capitalize w-full sm:w-auto min-w-[280px] sm:min-w-0"
            >
              {t('gallery.viewAll', 'View all categories')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Gallery; 