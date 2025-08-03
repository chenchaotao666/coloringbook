import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import RatioSelector from '../components/ui/RatioSelector';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category, TagCount } from '../services/categoriesService';
import { HomeImage, AspectRatio } from '../services/imageService';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { getCategoryIdByName, getCategoryNameById, isCategoryName, updateCategoryMappings, isCategoryId, convertDisplayNameToPath } from '../utils/categoryUtils';
import { getImageNameById, updateImageMappings } from '../utils/imageUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';
import { useUploadImage } from '../contexts/UploadImageContext';
import AIGenerateGuide from '../components/common/AIGenerateGuide';

// 添加 ExpandableContent 组件
interface ExpandableContentProps {
  content: React.ReactNode;
  maxLines?: number;
  viewMoreText?: string;
  collapseText?: string;
  className?: string;
}

// 添加 GenerateSection 组件
interface GenerateSectionProps {
  category: Category;
  language: Language;
  t: any;
}

type TabType = 'text' | 'image';

const GenerateSection: React.FC<GenerateSectionProps> = ({ category, language, t }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [generatePrompt, setGeneratePrompt] = useState('');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('1:1');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isTextLoaded, setIsTextLoaded] = useState(false);
  const { setUploadedImage: setGlobalUploadedImage } = useUploadImage();

  // 检查文本是否已加载
  const titleText = t('detail.generateSection.title', '', {
    category: category ? getLocalizedText(category.displayName, language) : t('detail.generateSection.customCategory', '')
  });
  
  // 当文本加载完成时设置状态
  React.useEffect(() => {
    if (titleText && titleText.trim() !== '') {
      setIsTextLoaded(true);
    }
  }, [titleText]);

  const handleGenerateClick = () => {
    if (activeTab === 'text') {
      const params = new URLSearchParams();
      params.set('prompt', generatePrompt);
      params.set('ratio', selectedRatio);
      navigateWithLanguage(navigate, `/text-coloring-page?${params.toString()}`);
    } else if (uploadedImage) {
      // 设置全局上传图片状态
      setGlobalUploadedImage(uploadedImage);
      // 直接跳转到图生图页面
      navigateWithLanguage(navigate, '/image-coloring-page');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const clearUploadedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedImage(null);
    setPreviewUrl('');
  };

  return (
    <div className="max-w-[1020px] mx-auto mb-12">
      <h2 
        className="text-center text-[#161616] text-3xl lg:text-[2.5rem] font-bold capitalize mb-8 leading-relaxed lg:leading-[1.6] transition-opacity duration-300"
        style={{
          opacity: isTextLoaded ? 1 : 0,
          visibility: isTextLoaded ? 'visible' : 'hidden',
          minHeight: '3rem' // 预留空间避免布局跳动
        }}
      >
        {titleText}
      </h2>

      {/* Tabs */}
      <div className="flex justify-center mb-6" style={{ opacity: isTextLoaded ? 1 : 0, visibility: isTextLoaded ? 'visible' : 'hidden' }}>
        <div className="w-[400px] bg-[#F2F3F5] h-12 rounded-lg flex items-center relative">
          <div
            className={`h-10 rounded-lg absolute transition-all duration-200 ${
              activeTab === 'text' ? 'w-[calc(50%-4px)] bg-white left-1' :
              activeTab === 'image' ? 'w-[calc(50%-4px)] bg-white right-1' : ''
            }`}
          ></div>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex-1 h-10 z-10 flex items-center justify-center ${
              activeTab === 'text' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
            }`}
          >
            {t('detail.generateSection.textTab', '文字转图片')}
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 h-10 z-10 flex items-center justify-center ${
              activeTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
            }`}
          >
            {t('detail.generateSection.imageTab', '图片转图片')}
          </button>
        </div>
      </div>

      <div className="relative bg-white border border-[#EDEEF0] rounded-lg p-4 mb-20" style={{ opacity: isTextLoaded ? 1 : 0, visibility: isTextLoaded ? 'visible' : 'hidden' }}>
        {activeTab === 'text' ? (
          <textarea
            value={generatePrompt}
            onChange={(e) => setGeneratePrompt(e.target.value)}
            placeholder={t('detail.generatePrompt.placeholder', '')}
            className="w-full h-32 resize-none border-none outline-none text-base text-[#161616] placeholder-[#A4A4A4]"
          />
        ) : (
          <div
            className="w-full h-[150px] sm:h-[180px] lg:h-[192px] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors relative"
            onClick={() => document.getElementById('categoryImageUpload')?.click()}
          >
            {uploadedImage ? (
              <div className="w-full h-full relative flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Uploaded"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearUploadedImage();
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[46px] lg:h-[46px] mb-3 sm:mb-4">
                  <img src="/images/add-image.svg" alt="Upload" className="w-full h-full" />
                </div>
                <div className="text-[#A4A4A4] text-xs sm:text-sm">{t('detail.generatePrompt.uploadImage', '点击上传')}</div>
              </>
            )}
            <input
              id="categoryImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        )}

        <div className={`${activeTab === 'text' ? 'flex justify-between items-center mt-4' : 'absolute bottom-[17px] right-4'}`}>
          {activeTab === 'text' && (
            <div className="w-32">
              <RatioSelector
                value={selectedRatio}
                onChange={setSelectedRatio}
              />
            </div>
          )}

          <Button
            onClick={handleGenerateClick}
            variant="gradient"
            className="px-6 py-2 text-base font-bold"
            disabled={activeTab === 'image' && !uploadedImage}
          >
            {t('detail.generatePrompt.button', '')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ExpandableContent: React.FC<ExpandableContentProps> = ({
  content,
  maxLines = 2,
  viewMoreText = '查看更多',
  collapseText = '收起',
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hiddenRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // 延迟计算确保DOM完全渲染
    const timer = setTimeout(() => {
      if (hiddenRef.current && contentRef.current) {
        const hiddenElement = hiddenRef.current;
        const contentElement = contentRef.current;
        
        // 确保隐藏元素和显示元素有相同的宽度
        const containerWidth = contentElement.offsetWidth;
        hiddenElement.style.width = `${containerWidth}px`;
        
        // 计算行数
        const lineHeight = parseFloat(getComputedStyle(hiddenElement).lineHeight);
        const height = hiddenElement.scrollHeight;
        const lines = Math.round(height / lineHeight);
        
        setNeedsExpansion(lines > maxLines);
        setIsInitialized(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [maxLines, content]);

  return (
    <div className={`relative ${className}`}>
      {/* 隐藏元素用于计算高度 */}
      <div
        ref={hiddenRef}
        className="text-lg leading-relaxed"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: -1,
          fontSize: '18px',
          whiteSpace: 'pre-line'
        }}
      >
        {content}
      </div>

      {/* 实际显示的内容 */}
      <div
        ref={contentRef}
        className="text-lg leading-relaxed"
        style={{
          opacity: isInitialized ? 1 : 0,
          visibility: isInitialized ? 'visible' : 'hidden',
          transition: 'opacity 0.2s ease-in-out',
          fontSize: '18px'
        }}
      >
        {/* 根据需要显示省略或完整内容 */}
        {isInitialized && (
          <div
            style={{
              whiteSpace: isExpanded || !needsExpansion ? 'pre-line' : 'normal',
              display: !isExpanded && needsExpansion ? '-webkit-box' : 'block',
              WebkitLineClamp: !isExpanded && needsExpansion ? maxLines : 'none',
              WebkitBoxOrient: 'vertical' as const,
              overflow: !isExpanded && needsExpansion ? 'hidden' : 'visible',
              paddingRight: !isExpanded && needsExpansion ? '110px' : '0px'
            }}
          >
            {content}
          </div>
        )}
      </div>

      {needsExpansion && !isExpanded && isInitialized && (
        <button
          onClick={() => setIsExpanded(true)}
          className="absolute top-0 right-0 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200 inline-flex items-center gap-1"
        >
          <span className='text-lg mt-[1px]'>{viewMoreText}</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {needsExpansion && isExpanded && isInitialized && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded(false)}
            className="flex items-center gap-2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors duration-200"
          >
            <span className='text-lg'>{collapseText}</span>
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
};

// 将 DescriptionSection 定义在组件外部，使用 React.memo 避免不必要的重新渲染
const DescriptionSection = React.memo<{ element: any; t: any }>(({ element, t }) => {
  return (
    <div className={`mb-8 ${element.className || ''}`}>
      <div className={`mx-auto ${element.textAlign === 'center' ? 'text-center' : 'text-left'}`}>
        {element.section.title && (
          <h2 className={`text-[#161616] ${element.titleSize || 'text-xl lg:text-2xl'} font-semibold mb-3 lg:mb-6`}>
            {element.section.title}
          </h2>
        )}
        {element.section.content && (
          <ExpandableContent
            content={element.section.content}
            maxLines={element.maxLines || 1}
            viewMoreText={t('detail.viewMore', '')}
            collapseText={t('detail.collapse', '')}
            className={element.contentClassName || ''}
          />
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
  const loadingRef = useRef<string>(''); // 用于跟踪当前正在加载的key

    // 处理标签过滤
  const handleTagClick = (tag: string) => {
    
    if (tag === 'All' || selectedTag === tag) {
      // 如果点击的是All标签或已选中的标签，则显示所有图片
      setSelectedTag(null);
      setFilteredImages(categoryImages);
    } else {
      // 过滤包含该标签的图片
      setSelectedTag(tag);
      
      // 获取原始标签ID用于过滤
      const originalTagId = tagMapping.get(tag) || tag;
      
      const filtered = categoryImages.filter(img => {
        if (!img.tags || !Array.isArray(img.tags)) {
          return false;
        }
        
        // 简化后的匹配逻辑，只需要匹配标签ID
        const matches = img.tags.some(imgTag => {
          if (typeof imgTag !== 'object') return false;
          return imgTag.tag_id === originalTagId;
        });
        
        return matches;
      });
      
      setFilteredImages(filtered);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered for loadCategoryData', { categoryId, language });
    
    const loadCategoryData = async () => {
      console.log('🚀 loadCategoryData called', { categoryId, language });
      if (!categoryId) return;

      // 防止重复加载：如果已经为当前categoryId和language组合正在加载，则跳过
      const currentKey = `${categoryId}-${language}`;
      if (loadingRef.current === currentKey) {
        console.log('⚠️ Skipping - already loading for this key');
        return;
      }

      // 设置当前加载的key
      loadingRef.current = currentKey;

      try {
        setIsCategoryLoading(true);

        // 🔧 优化：先获取所有分类数据并更新映射表，确保F5刷新时能正确工作
        const allCategories = await CategoriesService.getCategories(language);
        updateCategoryMappings(allCategories);

        // 确定实际的分类ID并从全量数据中查找分类
        let actualCategoryId: string;
        let foundCategory: any = null;

        if (isCategoryName(categoryId)) {
          // 如果是SEO友好名称，转换为实际ID
          actualCategoryId = getCategoryIdByName(categoryId);
          foundCategory = allCategories.find(cat => cat.categoryId === actualCategoryId);
        } else if (isCategoryId(categoryId)) {
          // 如果是实际的分类ID，直接使用
          actualCategoryId = categoryId;
          foundCategory = allCategories.find(cat => cat.categoryId === actualCategoryId);
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

          // 更新图片映射表
          updateImageMappings(result.images);

          // 生成子分类列表（从分类的tagCounts获取标签信息）
          if (foundCategory && foundCategory.tagCounts && foundCategory.tagCounts.length > 0) {
            // 使用分类的tagCounts获取标签信息
            const tagNames = foundCategory.tagCounts.map((tagCount: TagCount) => {
              const displayName = typeof tagCount.displayName === 'string' 
                ? tagCount.displayName 
                : getLocalizedText(tagCount.displayName, language);
              return displayName;
            });
            setSubcategories(tagNames);
            
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
      } finally {
        console.log('🏁 Finished loading for key:', currentKey);
      }
    };

    loadCategoryData();
  }, [categoryId, language]);

  // 监听标签选择变化，重新应用过滤
  useEffect(() => {
    if (categoryImages.length > 0) {
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
        title={category ? `${categoryImages.length} ${getLocalizedText(category.seoTitle || category.displayName, language)}` : 'Category - Free Coloring Pages'}
        description={category ? getLocalizedText(category.seoDesc || `Download free printable ${getLocalizedText(category.displayName, language).toLowerCase()} coloring pages. High-quality PDF and PNG formats available instantly.`, language) : 'Browse free printable coloring pages by category.'}
        keywords={category ? `${getLocalizedText(category.displayName, language).toLowerCase()} coloring pages, free printable coloring pages, ${getLocalizedText(category.displayName, language).toLowerCase()} coloring sheets` : 'coloring pages, printable coloring pages'}
        ogTitle={category ? `${categoryImages.length} ${getLocalizedText(category.seoTitle || category.displayName, language)}` : 'Category - Free Coloring Pages'}
        ogDescription={category ? getLocalizedText(category.seoDesc || `Download free printable ${getLocalizedText(category.displayName, language).toLowerCase()} coloring pages. High-quality PDF and PNG formats available instantly.`, language) : 'Browse free printable coloring pages by category.'}
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
                {t('detail.pageTitle', '', { 
                  count: categoryImages.length, 
                  category: getLocalizedText(category.displayName, language) 
                })}
              </h1>

              {/* Category Intro Section */}
              <div className="mx-auto mb-12">
                <div className="mb-4">
                  <p className="text-[#161616] text-lg font-medium">
                    {t('detail.categoryIntro.imageCount', '', { count: categoryImages.length, category: getLocalizedText(category.displayName, language) })}
                  </p>
                </div>

                <ExpandableContent
                  content={
                    <div className="text-left">
                      <p className="mb-4">
                        {t('detail.categoryIntro.description', '')}
                      </p>
                      <p>
                        {t('detail.categoryIntro.downloadInfo', '', { category: getLocalizedText(category.displayName, language) })}
                      </p>
                    </div>
                  }
                  maxLines={1}
                  viewMoreText={t('detail.viewMore', '')}
                  collapseText={t('detail.collapse', '')}
                  className="text-base lg:text-lg leading-relaxed"
                />
              </div>

              {/* Generate Section */}
              <GenerateSection
                category={category}
                language={language}
                t={t}
              />

              {/* Subcategories Tags */}
              {subcategories.length > 0 && (
                <div className="flex justify-center items-center gap-2 flex-wrap mb-8 lg:mb-12">
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

              {/* 交替显示描述和图片 */}
              {(() => {
                if (!category.description) {
                  // 如果没有描述，直接显示标签和图片
                  return (
                    <>
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
                              const targetPath = `/categories/${categoryPath}/${imagePath}`;
                              console.log('🔗 Navigating to:', targetPath);
                              navigateWithLanguage(navigate, targetPath);
                            }}
                          />
                        )}
                      </div>
                    </>
                  );
                }

                const descriptionText = getLocalizedText(category.description, language);
                
                // 按 <h2> 标签分段
                const sections = descriptionText.split(/<h2[^>]*>/).filter(section => section.length > 0);
                
                // 解析每个段落
                const descriptionSections = sections.map((section, index) => {
                  const titleMatch = section.match(/^([^<]*)<\/h2>/);
                  const title = titleMatch ? titleMatch[1].trim() : '';
                  const content = section.replace(/^[^<]*<\/h2>/, '').replace(/^\s+/, '').replace(/\s+$/, '');
                  
                  return {
                    index,
                    title,
                    content
                  };
                }).filter(section => section.title || section.content);
                
                // 生成交替显示的内容
                const contentElements: Array<{
                  type: 'description' | 'images';
                  key: string;
                  images?: HomeImage[];
                  section?: { index: number; title: string; content: string };
                }> = [];

                // 先显示第一段描述
                if (descriptionSections.length > 0) {
                  contentElements.push({
                    type: 'description',
                    section: descriptionSections[0],
                    key: `desc-0`
                  });
                }

                // 然后显示前4张图片
                if (filteredImages.length > 0) {
                  const firstImages = filteredImages.slice(0, 4);
                  contentElements.push({
                    type: 'images',
                    images: firstImages,
                    key: 'first-images'
                  });
                }

                // 计算已经显示的图片数量
                let displayedImagesCount = 4;

                // 然后显示剩余的描述和图片
                for (let i = 1; i < descriptionSections.length; i++) {
                  // 添加描述段落
                  contentElements.push({
                    type: 'description',
                    section: descriptionSections[i],
                    key: `desc-${i}`
                  });

                  // 如果是最后一个段落，显示所有剩余图片
                  if (i === descriptionSections.length - 1) {
                    const remainingImages = filteredImages.slice(displayedImagesCount);
                    if (remainingImages.length > 0) {
                      contentElements.push({
                        type: 'images',
                        images: remainingImages,
                        key: 'remaining-images'
                      });
                    }
                  } else {
                    // 不是最后一个段落，显示4张图片
                    const nextImages = filteredImages.slice(displayedImagesCount, displayedImagesCount + 4);
                    if (nextImages.length > 0) {
                      contentElements.push({
                        type: 'images',
                        images: nextImages,
                        key: `images-${i}`
                      });
                      displayedImagesCount += nextImages.length;
                    }
                  }
                }

                // 不再需要添加标签选择器到 contentElements
                return contentElements.map((element) => {
                  if (element.type === 'description' && element.section) {
                    return <DescriptionSection 
                      key={element.key} 
                      element={element} 
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
                            const targetPath = `/categories/${categoryPath}/${imagePath}`;
                            console.log('🔗 Navigating to:', targetPath);
                            navigateWithLanguage(navigate, targetPath);
                          }}
                        />
                      </div>
                    );
                  }
                  return null;
                });
              })()}

              {/* AI Generate Guide - 页面末尾引导 */}
              <AIGenerateGuide />
            </>
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default CategoriesDetailPage; 