import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Category } from '../../services/categoriesService';
import CategoryGrid from '../layout/CategoryGrid';
import { useAsyncTranslation } from '../../contexts/LanguageContext';
import { useCategories } from '../../contexts/CategoriesContext';
import { getCategoryNameById } from '../../utils/categoryUtils';
import { navigateWithLanguage } from '../../utils/navigationUtils';

interface GalleryProps {
  imageCount: number;
}

const Gallery: React.FC<GalleryProps> = ({ imageCount }) => {
  const { categories, loading: isLoading } = useCategories(imageCount);
  const { t } = useAsyncTranslation('home');
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryNameById(category.categoryId);
    navigateWithLanguage(navigate, `/categories/${categoryPath}`);
  };

  return (
    <div className="w-full bg-[#F9FAFB] pb-12 sm:pb-16 md:pb-20 lg:pb-[6rem] pt-12 sm:pt-16 md:pt-20 lg:pt-[6rem]">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-center text-[#161616] text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[46px] font-bold capitalize mb-8 sm:mb-10 md:mb-12 lg:mb-[48px] leading-relaxed lg:leading-[1.6] px-4 sm:px-0 max-w-[1200px] mx-auto">
          {t('gallery.title')} 
        </h2>
        
        <CategoryGrid 
          categories={categories}
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
              {t('gallery.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Gallery; 