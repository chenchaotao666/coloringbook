import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import RatioSelector from '../components/ui/RatioSelector';

import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category, TagCount } from '../services/categoriesService';
import { HomeImage, AspectRatio } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { getCategoryIdByName, getCategoryNameById, isCategoryName, updateCategoryMappings, isCategoryId, convertDisplayNameToPath } from '../utils/categoryUtils';
import { getImageNameById, updateImageMappings } from '../utils/imageUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';

const CategoriesDetailPage: React.FC = () => {
  console.log('🎯 CategoriesDetailPage component mounted/re-rendered');
  const { t } = useAsyncTranslation('categories');
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  // 添加组件实例ID来跟踪
  const componentIdRef = useRef(Math.random().toString(36).substring(2, 11));
  console.log('🆔 Component ID:', componentIdRef.current);

  const [category, setCategory] = useState<Category | null>(null);
  const [, setActualCategoryId] = useState<string | null>(null); // 保存实际的categoryId
  const [categoryImages, setCategoryImages] = useState<HomeImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<HomeImage[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [tagCounts, setTagCounts] = useState<Map<string, number>>(new Map());
  const [tagMapping, setTagMapping] = useState<Map<string, string>>(new Map()); // 显示名称 -> 原始tagId的映射
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isCategoryLoading, setIsCategoryLoading] = useState(true);
  const [isImagesLoading, setIsImagesLoading] = useState(true);
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const loadingRef = useRef<string>(''); // 用于跟踪当前正在加载的key

    // 处理标签过滤
  const handleTagClick = (tag: string) => {
    console.log('🎯 handleTagClick called with tag:', tag);
    console.log('🎯 Current selectedTag:', selectedTag);
    console.log('🎯 Total categoryImages:', categoryImages.length);
    
    if (tag === 'All' || selectedTag === tag) {
      // 如果点击的是All标签或已选中的标签，则显示所有图片
      console.log('🎯 Showing all images');
      setSelectedTag(null);
      setFilteredImages(categoryImages);
    } else {
      // 过滤包含该标签的图片
      setSelectedTag(tag);
      console.log('🎯 Filtering with tag:', tag);
      
      // 获取原始标签ID用于过滤
      const originalTagId = tagMapping.get(tag) || tag;
      console.log('🎯 Original tag ID:', originalTagId);
      console.log('🎯 Tag mapping:', Object.fromEntries(tagMapping));
      
      const filtered = categoryImages.filter(img => {
        if (!img.tags || !Array.isArray(img.tags)) {
          console.log('🎯 Image has no tags:', img.id);
          return false;
        }
        
        // 简化后的匹配逻辑，只需要匹配标签ID
        const matches = img.tags.some(imgTag => {
          if (typeof imgTag !== 'object') return false;
          return imgTag.tag_id === originalTagId;
        });
        
        if (matches) {
          console.log('🎯 ✅ Image matches:', img.id, 'tags:', img.tags);
        } else {
          console.log('🎯 ❌ Image does not match:', img.id, 'tags:', img.tags);
        }
        
        return matches;
      });
      
      console.log('🎯 Filtered result:', filtered.length, 'images from', categoryImages.length, 'total');
      setFilteredImages(filtered);
    }
  };

  useEffect(() => {
    console.log('into loadCategoryData, categoryId:', categoryId, 'language:', language);
    const loadCategoryData = async () => {
      if (!categoryId) return;

      // 防止重复加载：如果已经为当前categoryId和language组合正在加载，则跳过
      const currentKey = `${categoryId}-${language}`;
      if (loadingRef.current === currentKey) {
        console.log('Already loading for', currentKey, 'skipping...');
        return;
      }

      console.log('Loading data for', currentKey, 'previous loading:', loadingRef.current);

      // 设置当前加载的key
      loadingRef.current = currentKey;

      try {
        setIsCategoryLoading(true);

        // 🔧 优化：先获取所有分类数据并更新映射表，确保F5刷新时能正确工作
        const allCategories = await CategoriesService.getCategories(language);
        updateCategoryMappings(allCategories);

        // 确定实际的分类ID
        let actualCategoryId: string;
        let foundCategory: any = null;

        if (isCategoryName(categoryId)) {
          // 如果是SEO友好名称，转换为实际ID
          actualCategoryId = getCategoryIdByName(categoryId);
          foundCategory = await CategoriesService.getCategoryById(actualCategoryId, language);
        } else if (isCategoryId(categoryId)) {
          // 如果是实际的分类ID，直接使用
          actualCategoryId = categoryId;
          foundCategory = await CategoriesService.getCategoryById(actualCategoryId, language);
        } else {
          // 🔧 新增：如果映射表中没有找到，尝试在全量数据中按名称模糊匹配
          const categoryName = categoryId.toLowerCase();
          foundCategory = allCategories.find(cat => {
            const displayName = typeof cat.displayName === 'string'
              ? cat.displayName
              : (cat.displayName.en || cat.displayName.zh || '');

            // 检查英文名称、中文名称或转换后的SEO名称是否匹配
            const zhName = typeof cat.displayName === 'object' && cat.displayName.zh ? cat.displayName.zh : '';
            return displayName.toLowerCase().includes(categoryName) ||
              convertDisplayNameToPath(displayName) === categoryName ||
              (zhName && zhName.toLowerCase().includes(categoryName));
          });

          if (foundCategory) {
            actualCategoryId = foundCategory.categoryId;
            // 更新映射表以包含找到的分类
            updateCategoryMappings([foundCategory, ...allCategories]);
          }
        }

        if (foundCategory) {
          setCategory(foundCategory);
          setActualCategoryId(foundCategory.categoryId); // 保存实际的categoryId
          setIsCategoryLoading(false); // 分类信息加载完成，立即显示

          // 异步加载分类图片，不阻塞分类信息显示（使用实际的categoryId）
          setIsImagesLoading(true);
          const result = await CategoriesService.getImagesByCategoryId(foundCategory.categoryId);

          setCategoryImages(result.images);
          setFilteredImages(result.images);

          // 调试：查看实际的图片数据结构
          console.log('🔍 Category images loaded:', result.images.length);
          if (result.images.length > 0) {
            console.log('🔍 First image tags:', result.images[0].tags);
            console.log('🔍 First image data:', result.images[0]);
          }

          // 更新图片映射表
          updateImageMappings(result.images);

          // 生成子分类列表（从分类的tagCounts获取标签信息）
          if (foundCategory && foundCategory.tagCounts && foundCategory.tagCounts.length > 0) {
            // 使用分类的tagCounts获取标签信息
            console.log('🔍 Category tagCounts:', foundCategory.tagCounts);
            const tagNames = foundCategory.tagCounts.map((tagCount: TagCount) => {
              const displayName = typeof tagCount.displayName === 'string' 
                ? tagCount.displayName 
                : getLocalizedText(tagCount.displayName, language);
              console.log('🔍 Tag mapping:', tagCount.tagId, '->', displayName);
              return displayName;
            });
            setSubcategories(tagNames);
            console.log('🔍 Final subcategories:', tagNames);
            
            // 设置标签计数映射和标签ID映射
            const countMap = new Map<string, number>();
            const mappingMap = new Map<string, string>();
            foundCategory.tagCounts.forEach((tagCount: TagCount) => {
              const tagName = typeof tagCount.displayName === 'string' 
                ? tagCount.displayName 
                : getLocalizedText(tagCount.displayName, language);
              countMap.set(tagName, tagCount.count);
              mappingMap.set(tagName, tagCount.tagId); // 建立显示名称到tagId的映射
            });
            setTagCounts(countMap);
            setTagMapping(mappingMap);
          }

          setIsImagesLoading(false);
        } else {
          // 没有找到分类，标记加载完成以显示错误页面
          setIsCategoryLoading(false);
          setIsImagesLoading(false);
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
        setIsCategoryLoading(false);
        setIsImagesLoading(false);
      }
    };

    loadCategoryData();
  }, [categoryId, language]);

  // 监听标签选择变化，重新应用过滤
  useEffect(() => {
    if (categoryImages.length > 0) {
      console.log('🎯 useEffect: Reapplying filter for selectedTag:', selectedTag);
      if (selectedTag === null) {
        setFilteredImages(categoryImages);
      } else {
        // 重新应用过滤逻辑
        const originalTagId = tagMapping.get(selectedTag) || selectedTag;
        const filtered = categoryImages.filter(img => {
          if (!img.tags || !Array.isArray(img.tags)) return false;
          
          return img.tags.some(imgTag => {
            if (typeof imgTag !== 'object') return false;
            return imgTag.tag_id === originalTagId;
          });
        });
        setFilteredImages(filtered);
      }
    }
  }, [categoryImages, selectedTag, tagMapping]);

  const handleBackToCategories = () => {
    navigateWithLanguage(navigate, '/categories');
  };

  const handleGenerateClick = () => {
    // 构建包含 prompt 和 ratio 的 URL 参数
    const params = new URLSearchParams();
    params.set('prompt', generatePrompt);
    params.set('ratio', selectedRatio);
    navigateWithLanguage(navigate, `/generate?${params.toString()}`);
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
          <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-8 max-w-[1380px]">
            <Breadcrumb
              items={[
                { label: t('breadcrumb.home', 'Home'), path: '/' },
                { label: t('breadcrumb.categories', 'Coloring Pages Free'), path: '/categories' },
                { label: t('detail.notFound.title', 'Category not found'), current: true }
              ]}
            />
          </div>

          <div className="container mx-auto px-4">
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
      <SEOHead
        title={category ? `${getLocalizedText(category.displayName, language)} - Free Coloring Pages` : 'Category - Free Coloring Pages'}
        description={category ? `Download free printable ${getLocalizedText(category.displayName, language).toLowerCase()} coloring pages. High-quality PDF and PNG formats available instantly.` : 'Browse free printable coloring pages by category.'}
        keywords={category ? `${getLocalizedText(category.displayName, language).toLowerCase()} coloring pages, free printable coloring pages, ${getLocalizedText(category.displayName, language).toLowerCase()} coloring sheets` : 'coloring pages, printable coloring pages'}
        ogTitle={category ? `${getLocalizedText(category.displayName, language)} - Free Coloring Pages` : 'Category - Free Coloring Pages'}
        ogDescription={category ? `Download free printable ${getLocalizedText(category.displayName, language).toLowerCase()} coloring pages. High-quality PDF and PNG formats available instantly.` : 'Browse free printable coloring pages by category.'}
        noIndex={true}
      />
      <div className="w-full bg-[#F9FAFB] pb-4 md:pb-20 relative">
        {/* Breadcrumb - 始终显示 */}
        <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-8 max-w-[1380px]">
          <Breadcrumb items={getBreadcrumbPathEarly()} />
        </div>

        <div className="container mx-auto px-4 max-w-[1380px]">
          {isCategoryLoading || isImagesLoading ? (
            /* 加载中 - 不显示任何文本 */
            <div className="flex justify-center items-center py-20 h-[1380px]">
              {/* 加载时不显示任何内容 */}
            </div>
          ) : category ? (
            /* 分类内容 */
            <>
              {/* Category Title */}
              <h1 className="text-center text-[#161616] text-3xl lg:text-[2.5rem] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1]">
                {getLocalizedText(category.displayName, language)}
              </h1>

              {/* Category Description */}
              {category.description && (
                <div className="mb-8 lg:mb-12">
                  <div className="mx-auto text-left">
                    {(() => {
                      const descriptionText = getLocalizedText(category.description, language);

                      // 按 <h2> 标签分段
                      const sections = descriptionText.split(/<h2[^>]*>/).filter(section => section.trim());

                      if (sections.length <= 1) {
                        // 如果没有 h2 标签，直接显示原文本
                        const lines = descriptionText.split('\n').filter(line => line.trim());
                        const shouldShowToggle = lines.length > 2;
                        const displayLines = isDescriptionExpanded ? lines : lines.slice(0, 2);

                        return (
                          <div className="relative">
                            <div className="text-base lg:text-lg leading-relaxed">
                              {displayLines.map((line, index) => {
                                const isSecondLine = index === 1;
                                const showToggleButton = shouldShowToggle && !isDescriptionExpanded && isSecondLine;

                                return (
                                  <p key={index} className="mb-3 last:mb-0">
                                    {line.trim()}
                                    {showToggleButton && (
                                      <button
                                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                        className="ml-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200 inline-flex items-center gap-1"
                                      >
                                        <span className="text-sm">查看更多</span>
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </button>
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                            {shouldShowToggle && isDescriptionExpanded && (
                              <div className="flex justify-center mt-4">
                                <button
                                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                  className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200"
                                >
                                  <span className="text-sm">收起</span>
                                  <svg
                                    className="w-4 h-4 transition-transform duration-200 rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      }

                      // 处理有 h2 标签的情况
                      const allElements: Array<{ type: 'title' | 'content'; text: string; sectionIndex: number }> = [];

                      sections.forEach((section, sectionIndex) => {
                        const titleMatch = section.match(/^([^<]*)<\/h2>/);
                        const title = titleMatch ? titleMatch[1].trim() : '';
                        const content = section.replace(/^[^<]*<\/h2>/, '').trim();

                        if (title) {
                          allElements.push({ type: 'title', text: title, sectionIndex });
                        }

                        if (content) {
                          const contentLines = content.split('\n').filter(p => p.trim());
                          contentLines.forEach(line => {
                            allElements.push({ type: 'content', text: line.trim(), sectionIndex });
                          });
                        }
                      });

                      const shouldShowToggle = allElements.length > 2;
                      const displayElements = isDescriptionExpanded ? allElements : allElements.slice(0, 2);

                      return (
                        <div className="relative">
                          {displayElements.map((element, index) => {
                            const isSecondLine = index === 1;
                            const showToggleButton = shouldShowToggle && !isDescriptionExpanded && isSecondLine;

                            return (
                              <div key={`${element.sectionIndex}-${index}`} className="mb-3 lg:mb-4 last:mb-0">
                                {element.type === 'title' ? (
                                  <h2 className="text-[#161616] text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">
                                    {element.text}
                                  </h2>
                                ) : (
                                  <div className="relative">
                                    <p className="text-base lg:text-lg leading-relaxed">
                                      {element.text}
                                      {showToggleButton && (
                                        <button
                                          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                          className="ml-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200 inline-flex items-center gap-1"
                                        >
                                          <span className="text-sm">查看更多</span>
                                          <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {shouldShowToggle && isDescriptionExpanded && (
                            <div className="flex justify-center mt-4">
                              <button
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200"
                              >
                                <span className="text-sm">收起</span>
                                <svg
                                  className="w-4 h-4 transition-transform duration-200 rotate-180"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Generate Section - 等待加载完成后显示 */}
              <div className="max-w-[920px] mx-auto">
                <h2 className="text-center text-[#161616] text-3xl lg:text-[2.5rem] font-bold capitalize mb-8 leading-relaxed lg:leading-[1.6]">
                  {t('detail.generateSection.title', 'Create your personalized AI {category} coloring page', {
                    category: category ? getLocalizedText(category.displayName, language) : t('detail.generateSection.customCategory', '自定义')
                  })}
                </h2>

                <div className="relative bg-white border border-[#EDEEF0] rounded-lg p-4 mb-12">
                  <textarea
                    value={generatePrompt}
                    onChange={(e) => setGeneratePrompt(e.target.value)}
                    placeholder={t('detail.generatePrompt.placeholder', 'Enter the coloring book you want to search')}
                    className="w-full h-32 resize-none border-none outline-none text-base text-[#161616] placeholder-[#A4A4A4]"
                  />

                  <div className="flex justify-between items-center mt-4">
                    <div className="w-32">
                      <RatioSelector
                        value={selectedRatio}
                        onChange={setSelectedRatio}
                      />
                    </div>

                    <Button
                      onClick={handleGenerateClick}
                      variant="gradient"
                      className="px-6 py-2 text-base font-bold"
                    >
                      {t('detail.generatePrompt.button', 'Create')}
                    </Button>
                  </div>
                </div>
              </div>
              {/* Subcategories Tags */}
              {subcategories.length > 0 && (
                <div className="flex justify-center items-center gap-2 flex-wrap mb-8 lg:mb-8">
                  {/* All标签 */}
                  <button
                    onClick={() => handleTagClick('All')}
                    className={`px-3 py-2 rounded-lg border transition-colors duration-200 cursor-pointer hover:border-[#FF5C07] hover:bg-gray-50 ${selectedTag === null
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
                      className={`px-3 py-2 rounded-lg border transition-colors duration-200 cursor-pointer hover:border-[#FF5C07] hover:bg-gray-50 ${selectedTag === tag
                        ? 'bg-[#FFE4D6] border-[#FF5C07] text-[#FF5C07]'
                        : 'bg-white border-[#EDEEF0] text-[#161616] hover:text-[#FF5C07]'
                        }`}
                    >
                      <span className="text-sm font-normal leading-4">
                        {tag} ({tagCounts.get(tag) || 0})
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
                        // 导航到图片详情页，使用新的URL结构 /categories/:categoryId/:imageId
                        const imagePath = getImageNameById(image.id);
                        const categoryPath = getCategoryNameById(category.categoryId);
                        navigateWithLanguage(navigate, `/categories/${categoryPath}/${imagePath}`);
                      }}
                    />
                  </>
                )}
              </div>

            </>
          ) : null}


        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 