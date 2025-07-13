import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import Breadcrumb, { BreadcrumbItem } from '../components/common/Breadcrumb';
import { ImageService } from '../services/imageService';
import { HomeImage } from '../services/imageService';
import { CategoriesService, Category } from '../services/categoriesService';
import { downloadImageByUrl, downloadImageAsPdf } from '../utils/downloadUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { getImageIdByName, isImageName, updateImageMappings, getImageNameById, getEnglishTitleFromImage } from '../utils/imageUtils';
import { getCategoryIdByName, getCategoryNameById, isCategoryName, getEnglishNameFromCategory, updateCategoryMappings } from '../utils/categoryUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import SEOHead from '../components/common/SEOHead';
const downloadIcon = '/images/download-white.svg';

const ImageDetailPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { imageId, categoryId } = useParams<{ imageId: string; categoryId?: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [image, setImage] = useState<HomeImage | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedImages, setRelatedImages] = useState<HomeImage[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isRelatedImagesLoading, setIsRelatedImagesLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<{ png: boolean; pdf: boolean }>({
    png: false,
    pdf: false
  });
  
  const leftImagesRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<string>(''); // 防止重复加载

  // 解析 tags 为数组（支持 string 或 string[] 类型）
  const parseTags = (tags: string | string[]): string[] => {
    try {
      if (Array.isArray(tags)) return tags;
      return typeof tags === 'string' ? JSON.parse(tags) : [];
    } catch {
      return typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : [];
    }
  };

  // 解析 additionalInfo，直接从多语言对象中获取本地化文本
  const parseAdditionalInfo = (additionalInfo: any) => {
    try {
      let infoObj = additionalInfo;
      
      // 如果是字符串，尝试解析 JSON
      if (typeof additionalInfo === 'string' && additionalInfo.trim()) {
        infoObj = JSON.parse(additionalInfo);
      }
      
      // 如果不是对象，返回 null
      if (typeof infoObj !== 'object' || infoObj === null) {
        return null;
      }
      
      // 直接从多语言对象中获取本地化文本并返回
      return getLocalizedText(infoObj, language);
    } catch (error) {
      console.error('Failed to parse additionalInfo:', error, additionalInfo);
      return null;
    }
  };

  useEffect(() => {
    const loadImageData = async () => {
      if (!imageId) return;

      // 防止重复加载：如果已经为当前imageId和categoryId组合正在加载，则跳过
      const currentKey = `${imageId}-${categoryId || 'no-category'}`;
      if (loadingRef.current === currentKey) {
        console.log('Already loading for', currentKey, 'skipping...');
        return;
      }

      // 设置当前加载的key
      loadingRef.current = currentKey;

      try {
        setIsImageLoading(true);
        
        // 如果URL中有categoryId，使用优化的加载逻辑
        if (categoryId) {
          // 步骤1：获取全量分类数据
          const allCategories = await CategoriesService.getCategories();
          
          // 步骤2：根据URL中的分类名称找到分类ID
          let foundCategory: Category | null = null;
          
          // 先尝试映射表
          if (isCategoryName(categoryId)) {
            const actualCategoryId = getCategoryIdByName(categoryId);
            foundCategory = allCategories.find(cat => cat.categoryId === actualCategoryId) || null;
          }
          
          // 如果映射表没找到，通过SEO名称搜索
          if (!foundCategory) {
            foundCategory = allCategories.find((cat: Category) => {
              const seoName = getEnglishNameFromCategory(cat.displayName);
              return seoName === categoryId;
            }) || null;
            
            if (foundCategory) {
              // 更新映射表
              updateCategoryMappings([foundCategory]);
            }
          }
          
          if (foundCategory) {
            setCategory(foundCategory);
            
            // 步骤3：根据分类ID从后台获取该分类的所有图片
            console.log('🖼️ Loading images for category:', foundCategory.categoryId);
            const categoryImagesResult = await CategoriesService.getImagesByCategoryId(foundCategory.categoryId, {
              currentPage: 1,
              pageSize: 100 // 获取更多图片以确保能找到目标图片
            });
            
            console.log('📸 Loaded category images:', categoryImagesResult.images.length);
            
            // 更新图片映射表
            updateImageMappings(categoryImagesResult.images);
            
            // 步骤4：根据URL中的图片名称过滤出需要的图片
            let foundImage: HomeImage | null = null;
            
            // 先尝试映射表
            if (isImageName(imageId)) {
              const actualImageId = getImageIdByName(imageId);
              foundImage = categoryImagesResult.images.find(img => img.id === actualImageId) || null;
            }
            
            // 如果映射表没找到，通过SEO名称搜索
            if (!foundImage) {
              foundImage = categoryImagesResult.images.find(img => {
                const seoName = getEnglishTitleFromImage(img.title);
                return seoName === imageId;
              }) || null;
              
              if (foundImage) {
                console.log('✅ Found image by SEO name:', foundImage.id);
                // 更新映射表
                updateImageMappings([foundImage]);
              }
            }
            
            if (foundImage) {
              setImage(foundImage);
              setIsImageLoading(false);
              
              // 异步加载相关图片，不阻塞主内容显示
              setIsRelatedImagesLoading(true);
              try {
                const relatedImages = await ImageService.getRelatedImages(foundImage.categoryId, foundImage.id);
                setRelatedImages(relatedImages);
                
                // 更新相关图片的映射表
                updateImageMappings(relatedImages);
              } catch (error) {
                console.error('Failed to load related images:', error);
              } finally {
                setIsRelatedImagesLoading(false);
              }
            } else {
              console.error('❌ Image not found in category:', imageId);
              setIsImageLoading(false);
            }
          } else {
            console.error('❌ Category not found:', categoryId);
            setIsImageLoading(false);
          }
        } else {
          // 如果没有categoryId，使用原来的逻辑（向后兼容）
          console.log('🔍 Loading image without category context:', imageId);
          
          // 尝试使用映射表转换SEO友好名称
          let actualImageId: string;
          if (isImageName(imageId)) {
            actualImageId = getImageIdByName(imageId);
          } else {
            actualImageId = imageId;
          }
          
          // 通过API搜索图片
          let foundImage: HomeImage | null = await ImageService.getImageById(actualImageId);
          
          if (!foundImage && imageId !== actualImageId) {
            // 如果通过映射表转换的ID没找到图片，尝试通过SEO名称搜索
            console.log('Image not found by ID, trying to search by SEO name:', imageId);
            try {
              const searchResult = await ImageService.searchImages({ query: imageId, pageSize: 50 });
              
              foundImage = searchResult.images.find(img => {
                const seoName = getEnglishTitleFromImage(img.title);
                return seoName === imageId;
              }) || null;
              
              if (foundImage) {
                console.log('Found image by SEO name search:', foundImage.id);
                updateImageMappings([foundImage]);
              }
            } catch (searchError) {
              console.error('Failed to search image by SEO name:', searchError);
            }
          }

          if (foundImage) {
            setImage(foundImage);
            setIsImageLoading(false);
            
            // 异步加载相关图片
            setIsRelatedImagesLoading(true);
            try {
              const relatedImages = await ImageService.getRelatedImages(foundImage.categoryId, foundImage.id);
              setRelatedImages(relatedImages);
              updateImageMappings(relatedImages);
            } catch (error) {
              console.error('Failed to load related images:', error);
            } finally {
              setIsRelatedImagesLoading(false);
            }
          } else {
            setIsImageLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to load image data:', error);
        setIsImageLoading(false);
      } finally {
        // 重置加载状态，允许下次加载
        loadingRef.current = '';
      }
    };

    loadImageData();
  }, [imageId, categoryId]);

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!image) return;

    try {
      setIsDownloading(prev => ({ ...prev, [format]: true }));
      
      // 生成文件名
      const titleText = getLocalizedText(image.title, language) || 'image';
      const fileName = `coloring-page-${titleText.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${image.id.slice(-8)}.${format}`;
      
      // 根据格式选择不同的下载方式
      if (format === 'png') {
        await downloadImageByUrl(image.defaultUrl, fileName);
      } else {
        await downloadImageAsPdf(image.defaultUrl, fileName);
      }
    } catch (error) {
      console.error(`Download ${format} failed:`, error);
    } finally {
      setIsDownloading(prev => ({ ...prev, [format]: false }));
    }
  };

  // 获取面包屑路径（即使图片还在加载也可以显示基础面包屑）
  const getBreadcrumbPathEarly = (): BreadcrumbItem[] => {
    // 只有当category被设置时，才显示分类面包屑
    if (category) {
      // 4层面包屑：Home > Coloring Pages Free > xxx category > 图片名字
      const categoryName = getLocalizedText(category.displayName, language);
      const categoryPath = getCategoryNameById(category.categoryId);
      
      return [
        { label: t('breadcrumb.home', 'Home'), path: '/' },
        { label: t('breadcrumb.categories', 'Coloring Pages Free'), path: '/categories' },
        { label: categoryName, path: `/categories/${categoryPath}` },
        { label: image ? getLocalizedText(image.title, language) || '' : '', current: true }
      ];
    } else {
      // 默认2层面包屑：Home > 图片名字
      return [
        { label: t('breadcrumb.home', 'Home'), path: '/' },
        { label: t('breadcrumb.categories', 'Coloring Pages Free'), path: '/categories' }
      ];
    }
  };

  const breadcrumbPath = getBreadcrumbPathEarly();

  // 如果图片加载失败且没有找到图片
  if (!isImageLoading && !image) {
    return (
      <Layout>
        <div className="w-full bg-[#F9FAFB] pb-16 md:pb-[120px]">
          {/* Breadcrumb - 即使出错也显示 */}
          <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-8 max-w-[1200px]">
            <Breadcrumb items={[
              { label: t('breadcrumb.home', 'Home'), path: '/' },
              { label: t('imageDetail.notFound.breadcrumb', 'Image not found'), current: true }
            ]} />
          </div>
          
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="text-lg lg:text-xl text-[#161616] mb-4">{t('imageDetail.notFound.title', 'Image not found')}</div>
                <Button onClick={() => navigate('/')} variant="gradient">
                  {t('imageDetail.notFound.goHome', 'Go Home')}
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
        title={image ? `${getLocalizedText(image.title, language)} - Free Coloring Page` : 'Coloring Page'}
        description={image ? `Download free printable ${getLocalizedText(image.title, language).toLowerCase()} coloring page. High-quality PDF and PNG formats available instantly.` : 'Download free printable coloring pages.'}
        keywords={image ? `${getLocalizedText(image.title, language).toLowerCase()} coloring page, free printable coloring page, ${getLocalizedText(image.title, language).toLowerCase()} coloring sheet` : 'coloring page, printable coloring page'}
        ogTitle={image ? `${getLocalizedText(image.title, language)} - Free Coloring Page` : 'Coloring Page'}
        ogDescription={image ? `Download free printable ${getLocalizedText(image.title, language).toLowerCase()} coloring page. High-quality PDF and PNG formats available instantly.` : 'Download free printable coloring pages.'}
        noIndex={true}
      />
      <div className="w-full bg-[#F9FAFB] pb-4 md:pb-20 relative">
        {/* Breadcrumb - 始终显示 */}
        <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-8 max-w-[1200px]">
          <Breadcrumb items={breadcrumbPath} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-[1200px]">
          {isImageLoading ? (
            /* 加载状态 - 不显示任何文本 */
            <div className="flex justify-center items-center py-20 h-[1200px]">
              {/* 加载时不显示任何内容 */}
            </div>
          ) : image ? (
            /* 图片内容 */
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-12 lg:mb-20">
              {/* Left Side - Images */}
              <div ref={leftImagesRef} className="flex gap-2 sm:gap-4 lg:gap-4 w-full lg:w-auto">
                {/* Black & White Image */}
                <div className="w-1/2 lg:max-w-[300px] flex items-start justify-center">
                  <img
                    src={image.defaultUrl}
                    alt={getLocalizedText(image.title, language)}
                    className="w-full max-w-full h-auto object-contain rounded-lg"
                  />
                </div>
                
                {/* Color Image */}
                <div className="w-1/2 lg:max-w-[300px] flex items-start justify-center">
                  <img
                    src={image.coloringUrl}
                    alt={`${getLocalizedText(image.title, language)} - Colored`}
                    className="w-full max-w-full h-auto object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Right Side - Details */}
              <div className="flex-1 lg:max-w-[524px] flex flex-col">
                <div className="flex-1 space-y-6 lg:space-y-9">
                  {/* Title and Description */}
                  <div className="space-y-3 lg:space-y-4">
                    <h1 className="text-xl lg:text-2xl font-bold text-[#161616] capitalize leading-6 lg:leading-8">
                      {getLocalizedText(image.title, language)}
                    </h1>
                    <p className="text-sm text-[#6B7280] leading-5">
                      {getLocalizedText(image.description, language) || `This picture depicts ${getLocalizedText(image.title, language)}, a beautiful coloring page perfect for all ages. The design features intricate details and patterns that will provide hours of creative enjoyment.`}
                    </p>
                  </div>

                  {/* Tags */}
                  {image.tags && (
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="text-base font-medium text-black">{t('imageDetail.tags', 'Tags')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {parseTags(image.tags).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-white border border-[#EDEEF0] rounded-2xl text-sm text-[#161616]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Download Buttons - 响应式布局 */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Button
                    onClick={() => handleDownload('png')}
                    disabled={isDownloading.png}
                    variant="gradient"
                    className="flex-1 h-12 lg:h-[60px] text-base lg:text-xl font-bold"
                  >
                    <img src={downloadIcon} alt="Download" className="w-5 h-5 lg:w-7 lg:h-7 mr-2" />
                                      <span className="hidden sm:inline">{t('imageDetail.downloadPng', 'Download PNG')}</span>
                  <span className="sm:hidden">{t('imageDetail.png', 'PNG')}</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleDownload('pdf')}
                    disabled={isDownloading.pdf}
                    variant="gradient"
                    className="flex-1 h-12 lg:h-[60px] text-base lg:text-xl font-bold"
                  >
                    <img src={downloadIcon} alt="Download" className="w-5 h-5 lg:w-7 lg:h-7 mr-2" />
                                      <span className="hidden sm:inline">{t('imageDetail.downloadPdf', 'Download PDF')}</span>
                  <span className="sm:hidden">{t('imageDetail.pdf', 'PDF')}</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Detailed Description Sections - 只在图片加载完成后显示 */}
          {!isImageLoading && image && (() => {
            const additionalInfo = parseAdditionalInfo(image.additionalInfo);
            
            if (!additionalInfo || !additionalInfo.trim()) {
              return null;
            }

            return (
              <div className="space-y-8 lg:space-y-12 mb-8 lg:mb-20">
                <section>
                  <div className="mx-auto text-left">
                    {(() => {
                      const descriptionText = additionalInfo;

                      // 按 <h2> 标签分段
                      const sections = descriptionText.split(/<h2[^>]*>/).filter(section => section.trim());

                      if (sections.length <= 1) {
                        // 如果没有 h2 标签，直接显示原文本
                        const lines = descriptionText.split('\n').filter(line => line.trim());

                        return (
                          <div className="text-sm text-[#6B7280] leading-7">
                            {lines.map((line, index) => (
                              <p key={index} className="mb-3 last:mb-0">
                                {line.trim()}
                              </p>
                            ))}
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

                      return (
                        <div>
                          {allElements.map((element, index) => (
                            <div key={`${element.sectionIndex}-${index}`} className="mb-3 lg:mb-4 last:mb-0">
                              {element.type === 'title' ? (
                                <h3 className="text-[#161616] text-lg lg:text-xl font-semibold mb-3 lg:mb-4">
                                  {element.text}
                                </h3>
                              ) : (
                                <p className="text-sm text-[#6B7280] leading-7">
                                  {element.text}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </section>
              </div>
            );
          })()}

          {/* You Might Also Like - 独立显示相关图片加载状态 */}
          <section>
            <h2 className="text-center text-[#161616] text-2xl lg:text-3xl xl:text-[46px] font-bold capitalize mb-8 lg:mb-12 leading-relaxed lg:leading-[1.6] px-4">
              {t('imageDetail.relatedImages', 'You Might Also Like')}
            </h2>
            
            {/* Related Images Grid */}
            <div className="mb-8 lg:mb-20">
              {isRelatedImagesLoading ? (
                <div className="flex justify-center items-center py-12">
                  {/* 加载时不显示任何内容 */}
                </div>
              ) : relatedImages.length > 0 ? (
                <MasonryGrid 
                  images={relatedImages}
                  isLoading={false}
                  onImageClick={(image) => {
                    // 导航到图片详情页，使用SEO友好的图片路径
                    const imagePath = getImageNameById(image.id);
                    
                    // 如果当前在分类页面结构中，保持在同一分类内跳转
                    if (categoryId) {
                      navigateWithLanguage(navigate, `/categories/${categoryId}/${imagePath}`);
                    } else {
                      // 否则使用传统的图片详情页路径
                      navigateWithLanguage(navigate, `/image/${imagePath}`);
                    }
                  }}
                />
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="text-sm text-[#6B7280]">{t('imageDetail.noRelatedImages', 'No related images found')}</div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ImageDetailPage; 