import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';

import MasonryGrid from '../components/layout/MasonryGrid';
import RatioSelector from '../components/ui/RatioSelector';
import { CategoriesService, Category } from '../services/categoriesService';
import { HomeImage } from '../services/imageService';
const homeIcon = '/images/home.svg';
const chevronRightIcon = '/images/chevron-right.svg';
const imageIcon = '/images/image.svg';

const CategoriesDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryImages, setCategoryImages] = useState<HomeImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<HomeImage[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<'3:4' | '4:3' | '1:1'>('3:4');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // 处理标签过滤
  const handleTagClick = (tag: string) => {
    if (tag === 'All' || selectedTag === tag) {
      // 如果点击的是All标签或已选中的标签，则显示所有图片
      setSelectedTag(null);
      setFilteredImages(categoryImages);
    } else {
      // 过滤包含该标签的图片
      setSelectedTag(tag);
      const filtered = categoryImages.filter(img => img.tags.includes(tag));
      setFilteredImages(filtered);
    }
  };

  // 加载分类图片数据
  const loadCategoryImages = async (page: number = 1, search?: string) => {
    if (!categoryId) return;
    
    try {
      // 使用新的 getImagesByCategory 方法
      const result = await CategoriesService.getImagesByCategoryId(categoryId, {
        currentPage: page,
        pageSize: 20,
        query: search
      });
      
      if (page === 1) {
        // 第一页，替换现有数据
        setCategoryImages(result.images);
        setFilteredImages(result.images);
        
        // 生成子分类列表（从图片标签中提取）
        const allTags = result.images.flatMap((img: HomeImage) => img.tags);
        const uniqueTags = Array.from(new Set(allTags)) as string[];
        setSubcategories(uniqueTags);
      } else {
        // 后续页面，追加数据
        setCategoryImages(prev => [...prev, ...result.images]);
        setFilteredImages(prev => [...prev, ...result.images]);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to load category images:', error);
    }
  };

  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      try {
        // 加载分类信息
        const categories = await CategoriesService.getCategories();
        const foundCategory = categories.find((cat: Category) => cat.id === categoryId);
        
        if (foundCategory) {
          setCategory(foundCategory);
          
          // 加载分类图片 - 使用新的 getImagesByCategory 方法
          await loadCategoryImages(1);
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

  // 加载更多图片
  const handleLoadMore = async () => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      await loadCategoryImages(currentPage + 1);
      setIsLoading(false);
    }
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  const handleGenerateClick = () => {
    if (generatePrompt.trim()) {
      // 构建包含 prompt 和 ratio 的 URL 参数
      const params = new URLSearchParams();
      params.set('prompt', generatePrompt);
      params.set('ratio', selectedRatio);
      navigate(`/generate?${params.toString()}`);
    }
  };

  const handleRatioChange = (ratio: '3:4' | '4:3' | '1:1') => {
    setSelectedRatio(ratio);
  };

  if (isLoading && categoryImages.length === 0) {
    return (
      <Layout>
        <div className="w-full bg-[#F9FAFB] pb-16 md:pb-[120px]">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="flex justify-center items-center py-20">
              <div className="text-lg text-[#6B7280]">Loading category details...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!category) {
    return (
      <Layout>
        <div className="w-full bg-[#F9FAFB] pb-16 md:pb-[120px]">
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-[#161616] mb-2">Category not found</h3>
                <p className="text-[#6B7280] text-sm max-w-md mb-6">
                  The category you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={handleBackToCategories} variant="gradient">
                  Back to Categories
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full bg-[#F9FAFB] pb-4 md:pb-20 relative">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6 lg:py-10 max-w-[1200px]">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#161616] text-sm font-medium hover:text-[#FF5C07] transition-colors"
            >
              <img src={homeIcon} alt="Home" className="w-3 h-3" />
              <span>Home</span>
            </button>
            <img src={chevronRightIcon} alt=">" className="w-1.5 h-3" />
            <button 
              onClick={handleBackToCategories}
              className="text-[#161616] text-sm font-medium hover:text-[#FF5C07] transition-colors"
            >
              Coloring Pages Free
            </button>
            <img src={chevronRightIcon} alt=">" className="w-1.5 h-3" />
            <span className="text-[#6B7280] text-sm font-medium">{category.displayName}</span>
          </div>
        </div>

        <div className="container mx-auto px-4 max-w-[1200px]">
          {/* Category Title */}
          <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1.6]">
            {category.displayName}
          </h1>

          {/* Subcategories Tags */}
          {subcategories.length > 0 && (
            <div className="flex justify-center items-center gap-2 flex-wrap mb-8 lg:mb-16">
              {/* All标签 */}
              <button 
                onClick={() => handleTagClick('All')}
                className={`px-3 py-2 rounded-2xl border transition-colors duration-200 cursor-pointer hover:border-[#FF5C07] hover:bg-gray-50 ${
                  selectedTag === null 
                    ? 'bg-[#FFE4D6] border-[#FF5C07] text-[#FF5C07]' 
                    : 'bg-white border-[#EDEEF0] text-[#161616] hover:text-[#FF5C07]'
                }`}
              >
                <span className="text-sm font-normal leading-4">
                  All ({categoryImages.length})
                </span>
              </button>
              
              {subcategories.map((tag, index) => (
                <button 
                  key={index}
                  onClick={() => handleTagClick(tag)}
                  className={`px-3 py-2 rounded-2xl border transition-colors duration-200 cursor-pointer hover:border-[#FF5C07] hover:bg-gray-50 ${
                    selectedTag === tag 
                      ? 'bg-[#FFE4D6] border-[#FF5C07] text-[#FF5C07]' 
                      : 'bg-white border-[#EDEEF0] text-[#161616] hover:text-[#FF5C07]'
                  }`}
                >
                  <span className="text-sm font-normal leading-4">
                    {tag} ({categoryImages.filter(img => img.tags.includes(tag)).length})
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Images Grid */}
          <div className="mb-8 lg:mb-20">
            {filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <img src="/images/no-result.svg" alt="No results" className="mb-4 mx-auto" />
                  <p className="text-[#6B7280] text-sm max-w-md">
                    This category doesn't have any images yet. Please try another category.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <MasonryGrid 
                  images={filteredImages}
                  isLoading={false}
                  onImageClick={(image) => {
                    // 导航到图片详情页，传递分类信息用于面包屑
                    navigate(`/image/${image.id}?from=category&categoryId=${categoryId}&categoryName=${encodeURIComponent(category?.displayName || '')}`);
                  }}
                />
                
                {/* Load More Button */}
                {hasMore && selectedTag === null && (
                  <div className="flex justify-center mt-12">
                    <Button 
                      onClick={handleLoadMore}
                      variant="outline"
                      disabled={isLoading}
                      className="px-8 py-3"
                    >
                      {isLoading ? 'Loading...' : 'Load More Images'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Generate Section */}
          <div className="max-w-[920px] mx-auto">
            <h2 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-8 leading-relaxed lg:leading-[1.6]">
              Create your personalized AI {category.displayName} coloring page
            </h2>
            
            <div className="relative bg-white border border-[#EDEEF0] rounded-lg p-4 mb-8">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder="Enter the coloring book you want to search"
                className="w-full h-32 resize-none border-none outline-none text-base text-[#161616] placeholder-[#A4A4A4]"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  {/* Ratio 选择器组件 */}
                  <RatioSelector
                    value={selectedRatio}
                    onChange={handleRatioChange}
                  />
                  
                  {/* <div className="flex items-center gap-1 px-3 py-2 bg-[#F9FAFB] rounded-lg">
                    <img src={imageIcon} alt="Outputs" className="w-5 h-5" />
                    <span className="text-[#6B7280] text-base font-normal leading-5">1 Outputs</span>
                  </div> */}
                </div>
                
                <Button 
                  onClick={handleGenerateClick}
                  variant="gradient"
                  disabled={!generatePrompt.trim()}
                  className="px-6 py-2 text-base font-bold"
                >
                  Create
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 