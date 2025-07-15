import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// 将 DescriptionSection 定义在组件外部，使用 React.memo 避免不必要的重新渲染
const DescriptionSection = React.memo<{ element: any; expandedSections: Set<number>; toggleSectionExpansion: (index: number) => void; t: any }>(({ element, expandedSections, toggleSectionExpansion, t }) => {
  const isExpanded = expandedSections.has(element.section.index);
  const contentRef = useRef<HTMLDivElement>(null);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  
  // 检查内容是否需要展开（是否超过一行）
  useEffect(() => {
    if (contentRef.current) {
      const contentElement = contentRef.current;
      const lineHeight = parseFloat(getComputedStyle(contentElement).lineHeight);
      const height = contentElement.scrollHeight;
      const lines = Math.round(height / lineHeight);
      
      console.log('Content measurement:', {
        sectionIndex: element.section.index,
        lineHeight,
        height,
        lines,
        needsExpansion: lines > 1
      });
      
      setNeedsExpansion(lines > 1);
    }
  }, [element.section.content]);
  
  return (
    <div className="mb-8 lg:mb-12">
      <div className="mx-auto text-left">
        {element.section.title && (
          <h2 className="text-[#161616] text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">
            {element.section.title}
          </h2>
        )}
        {element.section.content && (
          <div className="relative">
            <div
              ref={contentRef}
              className={`text-base lg:text-lg leading-relaxed ${
                !isExpanded && needsExpansion 
                  ? 'overflow-hidden' 
                  : ''
              }`}
              style={{
                display: !isExpanded && needsExpansion ? '-webkit-box' : 'block',
                WebkitLineClamp: !isExpanded && needsExpansion ? 1 : 'none',
                WebkitBoxOrient: 'vertical' as const,
                paddingRight: !isExpanded && needsExpansion ? '80px' : '0px'
              }}
            >
              {element.section.content}
            </div>
            
            {/* 查看更多按钮 */}
            {needsExpansion && !isExpanded && (
              <button
                onClick={() => toggleSectionExpansion(element.section.index)}
                className="absolute top-0 right-0 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200 inline-flex items-center gap-1"
              >
                <span className="text-sm mt-[5px]">{t('detail.viewMore', '查看更多')}</span>
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
            
            {/* 收起按钮 */}
            {needsExpansion && isExpanded && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => toggleSectionExpansion(element.section.index)}
                  className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200"
                >
                  <span className="text-sm">{t('detail.collapse', '收起')}</span>
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
        )}
      </div>
    </div>
  );
});

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
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
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

  const toggleSectionExpansion = useCallback((sectionIndex: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionIndex)) {
      newExpanded.delete(sectionIndex);
    } else {
      newExpanded.add(sectionIndex);
    }
    setExpandedSections(newExpanded);
  }, [expandedSections]);

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

              {/* Generate Section - 移动到标题下面 */}
              <div className="max-w-[920px] mx-auto mb-12">
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

              {/* 交替显示描述和图片 */}
              {(() => {
                if (!category.description) {
                  // 如果没有描述，直接显示标签和图片
                  return (
                    <>
                      {/* Subcategories Tags */}
                      {subcategories.length > 0 && (
                        <div className="flex justify-center items-center gap-2 flex-wrap mb-8 lg:mb-8">
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

                      {/* All Images */}
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
                          <MasonryGrid
                            images={filteredImages}
                            isLoading={false}
                            onImageClick={(image) => {
                              const imagePath = getImageNameById(image.id);
                              const categoryPath = getCategoryNameById(category.categoryId);
                              navigateWithLanguage(navigate, `/categories/${categoryPath}/${imagePath}`);
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                }

                const descriptionText = getLocalizedText(category.description, language);
                console.log('Original description:', descriptionText);
                
                // 按 <h2> 标签分段
                const sections = descriptionText.split(/<h2[^>]*>/).filter(section => section.trim());
                console.log('Split sections:', sections);
                
                // 解析每个段落
                const descriptionSections = sections.map((section, index) => {
                  const titleMatch = section.match(/^([^<]*)<\/h2>/);
                  const title = titleMatch ? titleMatch[1].trim() : '';
                  const content = section.replace(/^[^<]*<\/h2>/, '').trim();
                  
                  console.log(`Section ${index}:`, { title, content: content.substring(0, 100) + '...' });
                  
                  return {
                    index,
                    title,
                    content
                  };
                }).filter(section => section.title || section.content);
                
                console.log('Final description sections:', descriptionSections.length);

                // 生成交替显示的内容
                const contentElements: Array<{
                  type: 'description' | 'images' | 'tags';
                  key: string;
                  images?: HomeImage[];
                  section?: { index: number; title: string; content: string };
                }> = [];
                let imageIndex = 0;

                // 先显示4张图片
                if (filteredImages.length > 0) {
                  const firstImages = filteredImages.slice(0, 4);
                  contentElements.push({
                    type: 'images',
                    images: firstImages,
                    key: 'first-images'
                  });
                  imageIndex = 4;
                }

                // 然后交替显示描述和图片
                descriptionSections.forEach((section, sectionIndex) => {
                  // 添加描述段落
                  contentElements.push({
                    type: 'description',
                    section: section,
                    key: `desc-${sectionIndex}`
                  });

                  // 如果是最后一个段落，显示所有剩余图片
                  if (sectionIndex === descriptionSections.length - 1) {
                    const remainingImages = filteredImages.slice(imageIndex);
                    if (remainingImages.length > 0) {
                      contentElements.push({
                        type: 'images',
                        images: remainingImages,
                        key: 'remaining-images'
                      });
                    }
                  } else {
                    // 不是最后一个段落，显示4张图片
                    const nextImages = filteredImages.slice(imageIndex, imageIndex + 4);
                    if (nextImages.length > 0) {
                      contentElements.push({
                        type: 'images',
                        images: nextImages,
                        key: `images-${sectionIndex}`
                      });
                      imageIndex += 4;
                    }
                  }
                });

                // Generate Section 已经移动到页面标题下面，不需要在这里添加了

                // 添加标签选择器
                contentElements.push({
                  type: 'tags',
                  key: 'tags-section'
                });

                // 将 DescriptionSection 移到组件外部以避免重新创建

                return contentElements.map((element) => {
                  if (element.type === 'description' && element.section) {
                    return <DescriptionSection 
                      key={element.key} 
                      element={element} 
                      expandedSections={expandedSections}
                      toggleSectionExpansion={toggleSectionExpansion}
                      t={t}
                    />;
                  } else if (element.type === 'images' && element.images) {
                    return (
                      <div key={element.key} className="mb-8 lg:mb-12">
                        <MasonryGrid
                          images={element.images}
                          isLoading={false}
                          onImageClick={(image) => {
                            const imagePath = getImageNameById(image.id);
                            const categoryPath = getCategoryNameById(category.categoryId);
                            navigateWithLanguage(navigate, `/categories/${categoryPath}/${imagePath}`);
                          }}
                        />
                      </div>
                    );
                  } else if (element.type === 'tags') {
                    return (
                      <div key={element.key}>
                        {subcategories.length > 0 && (
                          <div className="flex justify-center items-center gap-2 flex-wrap mb-8 lg:mb-8">
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
                      </div>
                    );
                  }
                  return null;
                });
              })()}

            </>
          ) : null}


        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 