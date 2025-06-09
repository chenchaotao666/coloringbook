import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';

import MasonryGrid from '../components/layout/MasonryGrid';
import RatioSelector from '../components/ui/RatioSelector';
import { CategoriesService, Category, CategoryImage } from '../services/categoriesService';
import { HomeImage } from '../services/imageService';
import homeIcon from '../images/home.svg';
import chevronRightIcon from '../images/chevron-right.svg';
import imageIcon from '../images/image.svg';

// 数据转换函数
const convertCategoryImageToHomeImage = (categoryImage: CategoryImage): HomeImage => {
  return {
    id: categoryImage.id,
    name: categoryImage.title,
    defaultUrl: categoryImage.url,
    colorUrl: categoryImage.colorUrl || categoryImage.url, // 如果没有彩色版本，使用默认图片
    title: categoryImage.title,
    description: categoryImage.title,
    tags: categoryImage.tags,
    dimensions: { width: 400, height: 500 },
    additionalInfo: {
      features: [],
      suitableFor: [],
      coloringSuggestions: [],
      creativeUses: []
    }
  };
};

const CategoriesDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryImages, setCategoryImages] = useState<CategoryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<CategoryImage[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<'3:4' | '4:3' | '1:1'>('3:4');



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
          
          // 加载分类图片 - 使用搜索功能获取该分类的图片
          const searchResult = await CategoriesService.searchImages({ category: categoryId });
          setCategoryImages(searchResult.images);
          setFilteredImages(searchResult.images);
          
          // 生成子分类列表（从图片标签中提取）
          const allTags = searchResult.images.flatMap((img: CategoryImage) => img.tags);
          const uniqueTags = Array.from(new Set(allTags)) as string[];
          setSubcategories(uniqueTags);
          

        }
      } catch (error) {
        console.error('Failed to load category data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId]);

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


  if (isLoading) {
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
      <div className="w-full bg-[#F9FAFB] pb-16 md:pb-20 relative">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-10 max-w-[1200px]">
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
          <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-10 md:mb-[24px] leading-relaxed lg:leading-[1.6]">
            {category.displayName}
          </h1>

          {/* Subcategories Tags */}
          {subcategories.length > 0 && (
            <div className="flex justify-center items-center gap-2 flex-wrap mb-16">
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
          <div className="mb-20">
            {filteredImages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-[#161616] mb-2">No images found</h3>
                  <p className="text-[#6B7280] text-sm max-w-md">
                    This category doesn't have any images yet. Please try another category.
                  </p>
                </div>
              </div>
            ) : (
              <MasonryGrid 
                images={filteredImages.map(convertCategoryImageToHomeImage)}
                isLoading={false}
              />
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
                  
                  <div className="flex items-center gap-1 px-3 py-2 bg-[#F9FAFB] rounded-lg">
                    <img src={imageIcon} alt="Outputs" className="w-5 h-5" />
                    <span className="text-[#6B7280] text-base font-normal leading-5">1 Outputs</span>
                  </div>
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