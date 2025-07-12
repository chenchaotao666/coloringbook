import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category } from '../services/categoriesService';
import CategoryGrid from '../components/layout/CategoryGrid';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import SEOHead from '../components/common/SEOHead';
import { getCategoryNameById, updateCategoryMappings } from '../utils/categoryUtils';
const noResultIcon = '/images/no-result.svg';



const CategoriesPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // 状态管理
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await CategoriesService.getCategories(language);
        
        // 更新分类映射表
        updateCategoryMappings(categoriesData);
        
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [language]);

  // 当分类数据加载完成时，重置过滤结果
  useEffect(() => {
    if (!isSearchActive) {
      setFilteredCategories(categories);
    }
  }, [categories, isSearchActive]);

  // 处理分类点击 - 导航到详情页面（使用英文名称）
  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryNameById(category.categoryId);
    console.log('分类ID:', category.categoryId, '→ SEO路径:', categoryPath);
    navigate(`/categories/${categoryPath}`);
  };



  // 执行搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      // 手动执行搜索过滤
      const filtered = categories.filter(category => {
        const displayName = getLocalizedText(category.displayName, language);
        const name = category.name || '';
        return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredCategories(filtered);
    } else {
      setIsSearchActive(false);
      setFilteredCategories(categories);
    }
  };

  // 搜索输入处理
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // 主分类列表页面
  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.categories.title', 'Free Coloring Page Categories - Disney, Animals, Characters & More')}
        description={tCommon('seo.categories.description', 'Browse our collection of free printable coloring pages by category. Disney characters, animals, superheroes, and more. Download PDF and PNG formats instantly.')}
        keywords={tCommon('seo.categories.keywords', 'coloring page categories, Disney coloring pages, animal coloring pages, character coloring pages, free printable coloring pages')}
        ogTitle={tCommon('seo.categories.title', 'Free Coloring Page Categories - Disney, Animals, Characters & More')}
        ogDescription={tCommon('seo.categories.description', 'Browse our collection of free printable coloring pages by category. Disney characters, animals, superheroes, and more. Download PDF and PNG formats instantly.')}
        noIndex={true}
      />
      <div className="w-full bg-[#F9FAFB] pb-12 md:pb-[120px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-6 max-w-[1200px]">
          <Breadcrumb 
            items={[
              { label: t('breadcrumb.home', 'Home'), path: '/' },
              { label: t('breadcrumb.categories', 'Coloring Pages Free'), current: true }
            ]}
          />
        </div>
        
        {/* Page Title */}
        <div className="container mx-auto text-center mb-4 lg:mb-8">
          <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1]">
{isLoadingCategories ? <div>&nbsp;</div> : t('title', `${categories.length} categories to explore`, { count: categories.length })}
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto flex justify-center mb-8 lg:mb-16">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[630px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder', 'Enter the category to search')}
              className="w-full h-[60px] px-4 py-2 bg-white border border-[#EDEEF0] rounded-lg text-base focus:outline-none focus:border-gray-300 transition-colors"
            />
            <Button 
              type="submit"
              variant="gradient"
              className="absolute right-0 top-0 h-[60px] w-[122px] font-bold text-xl rounded-r-lg"
            >
{t('search.button', 'Search')}
            </Button>
          </form>
        </div>
        
        {/* Category Grid */}
        <div className="container mx-auto px-4 max-w-[1200px]">
          <CategoryGrid
            categories={filteredCategories}
            isLoading={isLoadingCategories}
            emptyState={
              filteredCategories.length === 0
                ? isSearchActive
                  ? {
                      icon: noResultIcon,
                      title: t('emptyState.noResults.title', 'No results found'),
                      description: t('emptyState.noResults.description', 'No categories found matching your search.')
                    }
                  : {
                      icon: "📂",
                      title: t('emptyState.noCategories.title', 'No categories found'),
                      description: t('emptyState.noCategories.description', 'Categories are being loaded. Please wait a moment.')
                    }
                : undefined
            }
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage; 