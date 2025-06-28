import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category } from '../services/categoriesService';
import CategoryGrid from '../components/layout/CategoryGrid';
import { useLanguage } from '../contexts/LanguageContext';
const noResultIcon = '/images/no-result.svg';



const CategoriesPage: React.FC = () => {
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

  // 处理分类点击 - 导航到详情页面
  const handleCategoryClick = (category: Category) => {
    navigate(`/categories/${category.id}`);
  };

  // 执行搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      // 手动执行搜索过滤
      const filtered = categories.filter(category => 
        category.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
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
      <div className="w-full bg-[#F9FAFB] pb-12 md:pb-[120px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6 lg:py-10 max-w-[1200px]">
          <Breadcrumb 
            items={[
              { label: 'Home', path: '/' },
              { label: 'Coloring Pages Free', current: true }
            ]}
          />
        </div>
        
        {/* Page Title */}
        <div className="container mx-auto text-center mb-4 lg:mb-8">
          <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1.6]">
            {isLoadingCategories ? 'Loading...' : `${categories.length} categories to explore`}
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto flex justify-center mb-8 lg:mb-16">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[630px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter the category to search"
              className="w-full h-[60px] px-4 py-2 bg-white border border-[#EDEEF0] rounded-lg text-base focus:outline-none focus:border-gray-300 transition-colors"
            />
            <Button 
              type="submit"
              variant="gradient"
              className="absolute right-0 top-0 h-[60px] w-[122px] font-bold text-xl rounded-r-lg"
            >
              Search
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
                      title: "No results found",
                      description: "No categories found matching your search."
                    }
                  : {
                      icon: "📂",
                      title: "No categories found",
                      description: "Categories are being loaded. Please wait a moment."
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