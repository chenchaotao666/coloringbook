import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import RatioSelector from '../components/ui/RatioSelector';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category } from '../services/categoriesService';
import { HomeImage } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { getCategoryIdByName, getCategoryNameById, isCategoryName, updateCategoryMappings } from '../utils/categoryUtils';
import { getImageNameById, updateImageMappings } from '../utils/imageUtils';
// const imageIcon = '/images/image.svg';

const CategoriesDetailPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [category, setCategory] = useState<Category | null>(null);
  const [actualCategoryId, setActualCategoryId] = useState<string | null>(null); // 保存实际的categoryId
  const [categoryImages, setCategoryImages] = useState<HomeImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<HomeImage[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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
      const filtered = categoryImages.filter(img => img.tags && img.tags.includes(tag));
      setFilteredImages(filtered);
    }
  };

  // 加载分类图片数据
  const loadCategoryImages = async (page: number = 1, search?: string) => {
    if (!actualCategoryId) return;

    try {
      // 使用新的 getImagesByCategory 方法，传递语言参数（使用实际的categoryId）
      const result = await CategoriesService.getImagesByCategoryId(actualCategoryId, {
        currentPage: page,
        pageSize: 20,
        query: search
      });

      if (page === 1) {
        // 第一页，替换现有数据
        setCategoryImages(result.images);
        setFilteredImages(result.images);
        
        // 更新图片映射表
        updateImageMappings(result.images);

        // 生成子分类列表（从图片标签中提取）
        const allTags = result.images.flatMap((img: HomeImage) => img.tags || []);
        const uniqueTags = Array.from(new Set(allTags)) as string[];
        setSubcategories(uniqueTags);
      } else {
        // 后续页面，追加数据
        const newImages = [...categoryImages, ...result.images];
        setCategoryImages(newImages);
        setFilteredImages(newImages);
        
        // 更新图片映射表（包含新加载的图片）
        updateImageMappings(result.images);
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

      try {
        // 先加载分类信息
        setIsCategoryLoading(true);
        
        // 确定实际的分类ID
        let actualCategoryId: string;
        if (isCategoryName(categoryId)) {
          // 如果是SEO友好名称，转换为实际ID
          actualCategoryId = getCategoryIdByName(categoryId);
        } else {
          // 如果是ID，直接使用
          actualCategoryId = categoryId;
        }
        
        // 获取所有分类数据并更新映射表
        const allCategories = await CategoriesService.getCategories(language);
        updateCategoryMappings(allCategories);
        
        // 通过实际ID查找分类
        const foundCategory = await CategoriesService.getCategoryById(actualCategoryId, language);

        if (foundCategory) {
          setCategory(foundCategory);
          setActualCategoryId(foundCategory.categoryId); // 保存实际的categoryId
          setIsCategoryLoading(false); // 分类信息加载完成，立即显示

          // 异步加载分类图片，不阻塞分类信息显示（使用实际的categoryId）
          setIsImagesLoading(true);
          const result = await CategoriesService.getImagesByCategoryId(foundCategory.categoryId, {
            currentPage: 1,
            pageSize: 20
          });
          
          setCategoryImages(result.images);
          setFilteredImages(result.images);
          
          // 更新图片映射表
          updateImageMappings(result.images);
          
          const allTags = result.images.flatMap((img: HomeImage) => img.tags || []);
          const uniqueTags = Array.from(new Set(allTags)) as string[];
          setSubcategories(uniqueTags);
          setHasMore(result.hasMore);
          setCurrentPage(1);
          
          setIsImagesLoading(false);
        } else {
          setIsCategoryLoading(false);
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
        setIsCategoryLoading(false);
        setIsImagesLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId, language]);

  // 加载更多图片
  const handleLoadMore = async () => {
    if (hasMore && !isLoadingMore) {
      setIsLoadingMore(true);
      await loadCategoryImages(currentPage + 1);
      setIsLoadingMore(false);
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



  // 获取基础面包屑（即使分类还在加载也可以显示）
  const getBreadcrumbPathEarly = () => {
    return [
      { label: t('breadcrumb.home', 'Home'), path: '/' },
      { label: t('breadcrumb.categories', 'Coloring Pages Free'), path: '/categories' },
      { label: category ? getLocalizedText(category.displayName, language) : '', current: true }
    ];
  };

  // 如果分类加载失败且没有找到分类
  if (!isCategoryLoading && !category) {
    return (
      <Layout>
        <div className="w-full bg-[#F9FAFB] pb-16 md:pb-[120px]">
          {/* Breadcrumb - 即使出错也显示 */}
          <div className="container mx-auto px-4 py-6 lg:py-10 max-w-[1200px]">
            <Breadcrumb
              items={[
                { label: t('breadcrumb.home', 'Home'), path: '/' },
                { label: t('breadcrumb.categories', 'Coloring Pages Free'), path: '/categories' },
                { label: t('detail.notFound.title', 'Category not found'), current: true }
              ]}
            />
          </div>

          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-[#161616] mb-2">{t('detail.notFound.title', 'Category not found')}</h3>
                <p className="text-[#6B7280] text-sm max-w-md mb-6">
                  {t('detail.notFound.description', "The category you're looking for doesn't exist or has been removed.")}
                </p>
                <Button onClick={handleBackToCategories} variant="gradient">
                  {t('detail.notFound.backButton', 'Back to Categories')}
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
        {/* Breadcrumb - 始终显示 */}
        <div className="container mx-auto px-4 py-6 lg:py-10 max-w-[1200px]">
          <Breadcrumb items={getBreadcrumbPathEarly()} />
        </div>

        <div className="container mx-auto px-4 max-w-[1200px]">
          {isCategoryLoading || isImagesLoading ? (
            /* 加载中 - 不显示任何文本 */
            <div className="flex justify-center items-center py-20">
              {/* 加载时不显示任何内容 */}
            </div>
          ) : category ? (
            /* 分类内容 */
            <>
              {/* Category Title */}
              <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1.6]">
                {getLocalizedText(category.displayName, language)}
              </h1>

              {/* Subcategories Tags */}
              {subcategories.length > 0 && (
                <div className="flex justify-center items-center gap-2 flex-wrap mb-8 lg:mb-16">
                  {/* All标签 */}
                  <button
                    onClick={() => handleTagClick('All')}
                    className={`px-3 py-2 rounded-2xl border transition-colors duration-200 cursor-pointer hover:border-[#FF5C07] hover:bg-gray-50 ${selectedTag === null
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
                      className={`px-3 py-2 rounded-2xl border transition-colors duration-200 cursor-pointer hover:border-[#FF5C07] hover:bg-gray-50 ${selectedTag === tag
                          ? 'bg-[#FFE4D6] border-[#FF5C07] text-[#FF5C07]'
                          : 'bg-white border-[#EDEEF0] text-[#161616] hover:text-[#FF5C07]'
                        }`}
                    >
                      <span className="text-sm font-normal leading-4">
                        {tag} ({categoryImages.filter(img => img.tags && img.tags.includes(tag)).length})
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Images Grid */}
              <div className="mb-8 lg:mb-20 min-h-[500px]">
                {filteredImages.length === 0 ? (
                  /* 无图片状态 */
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="text-center">
                      <img src="/images/no-result.svg" alt="No results" className="mb-4 mx-auto" />
                      <p className="text-[#6B7280] text-sm max-w-md">
                        This category doesn't have any images yet. Please try another category.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 图片网格 */
                  <>
                    <MasonryGrid
                      images={filteredImages}
                      isLoading={false}
                      onImageClick={(image) => {
                        // 导航到图片详情页，使用SEO友好的图片路径
                        const imagePath = getImageNameById(image.id);
                        navigate(`/image/${imagePath}`, {
                          state: {
                            from: 'category',
                            categoryId: category.categoryId, // 使用实际的categoryId
                            categoryName: getLocalizedText(category.displayName, language),
                            categoryPath: getCategoryNameById(category.categoryId) // 使用SEO友好的路径
                          }
                        });
                      }}
                    />

                    {/* Load More Button */}
                    {hasMore && selectedTag === null && (
                      <div className="flex justify-center mt-12">
                        <Button
                          onClick={handleLoadMore}
                          variant="outline"
                          disabled={isLoadingMore}
                          className="px-8 py-3"
                        >
                          Load More Images
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

            </>
          ) : null}

          {/* Generate Section - 等待加载完成后显示 */}
          {!isCategoryLoading && !isImagesLoading && (
            <div className="max-w-[920px] mx-auto">
            <h2 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-8 leading-relaxed lg:leading-[1.6]">
              {t('detail.generateSection.title', 'Create your personalized AI {category} coloring page', {
                category: category ? getLocalizedText(category.displayName, language) : t('detail.generateSection.customCategory', '自定义')
              })}
            </h2>
            
            <div className="relative bg-white border border-[#EDEEF0] rounded-lg p-4 mb-8">
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                placeholder={t('detail.generatePrompt.placeholder', 'Enter the coloring book you want to search')}
                className="w-full h-32 resize-none border-none outline-none text-base text-[#161616] placeholder-[#A4A4A4]"
              />
              
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  {/* Ratio 选择器组件 */}
                  <RatioSelector
                    value={selectedRatio}
                    onChange={handleRatioChange}
                  />
                </div>
                
                <Button 
                  onClick={handleGenerateClick}
                  variant="gradient"
                  disabled={!generatePrompt.trim()}
                  className="px-6 py-2 text-base font-bold"
                >
                  {t('detail.generatePrompt.button', 'Create')}
                </Button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 