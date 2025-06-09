import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { CategoriesService, Category, CategoryImage, SearchResult } from '../services/categoriesService';
import MasonryGrid from '../components/layout/MasonryGrid';
import CategoryCard from '../components/categories/CategoryCard';
import { HomeImage } from '../services/homeImageService';
import homeIcon from '../images/home.svg';
import chevronRightIcon from '../images/chevron-right.svg';
import noResultIcon from '../images/no-result.svg';

// 将CategoryImage转换为MasonryGrid所需的HomeImage格式
const convertCategoryImageToHomeImage = (categoryImage: CategoryImage): HomeImage => {
  return {
    id: categoryImage.id,
    name: categoryImage.title,
    defaultUrl: categoryImage.url,
    colorUrl: categoryImage.colorUrl || categoryImage.url, // 如果没有彩色版本，使用原图
    title: categoryImage.title,
    description: categoryImage.description || '',
    tags: categoryImage.tags,
    dimensions: {
      width: 400,
      height: 500
    }
  };
};

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  
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
        const categoriesData = await CategoriesService.getCategories();
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

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

  // 清空搜索
  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  // 主分类列表页面
  return (
    <Layout>
      <div className="w-full bg-[#F9FAFB] pb-16 md:pb-[120px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-10 max-w-[1200px]">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#161616] text-sm font-medium hover:text-[#FF5907] transition-colors"
            >
              <img src={homeIcon} alt="Home" className="w-3 h-3" />
              <span>Home</span>
            </button>
            <img src={chevronRightIcon} alt=">" className="w-1.5 h-3" />
            <span className="text-[#6B7280] text-sm font-medium">Coloring Pages Free</span>
          </div>
        </div>
        
        {/* Page Title */}
        <div className="container mx-auto text-center mb-8">
          <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-10 md:mb-[24px] leading-relaxed lg:leading-[1.6]">
            {isLoadingCategories ? 'Loading...' : `${categories.length} categories to explore`}
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto flex justify-center mb-20">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[630px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter the category name you want to search"
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
        
        {/* Category Grid - 4 columns layout */}
        <div className="container mx-auto px-4 max-w-[1200px]">
          {isLoadingCategories ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-lg text-[#6B7280]">Loading categories...</div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                {isSearchActive ? (
                  <>
                    {/* No Search Results */}
                    <div className="mb-6">
                      <img 
                        src={noResultIcon} 
                        alt="No results found" 
                        className="w-[305px] h-[200px] mx-auto"
                      />
                    </div>
                    <p className="text-[#6B7280] text-base font-normal leading-6">
                      No categories found matching your search.
                    </p>
                  </>
                ) : (
                  <>
                    {/* No Categories Loaded */}
                    <div className="text-6xl mb-4">📂</div>
                    <h3 className="text-xl font-semibold text-[#161616] mb-2">No categories found</h3>
                    <p className="text-[#6B7280] text-sm max-w-md">
                      Categories are being loaded. Please wait a moment.
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 瀑布流布局 - 桌面端 */}
              <div className="hidden lg:block">
                <div className="columns-4 gap-6 max-w-[1200px] mx-auto">
                  {filteredCategories.map((category, index) => (
                    <div 
                      key={`${category.id}-desktop-${index}`}
                      className="break-inside-avoid mb-6 w-full"
                    >
                      <CategoryCard
                        category={category}
                        onCategoryClick={handleCategoryClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 瀑布流布局 - 移动端 */}
              <div className="lg:hidden">
                <div className="columns-2 md:columns-3 gap-4">
                  {filteredCategories.map((category, index) => (
                    <div 
                      key={`${category.id}-mobile-${index}`}
                      className="break-inside-avoid mb-4 w-full"
                    >
                      <CategoryCard
                        category={category}
                        onCategoryClick={handleCategoryClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesPage; 