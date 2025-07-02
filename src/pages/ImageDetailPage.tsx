import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import Breadcrumb, { BreadcrumbItem } from '../components/common/Breadcrumb';
import { ImageService } from '../services/imageService';
import { HomeImage } from '../services/imageService';
import { downloadImageByUrl, downloadImageAsPdf } from '../utils/downloadUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
const downloadIcon = '/images/download-white.svg';

const ImageDetailPage: React.FC = () => {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const [image, setImage] = useState<HomeImage | null>(null);
  const [relatedImages, setRelatedImages] = useState<HomeImage[]>([]);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isRelatedImagesLoading, setIsRelatedImagesLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<{ png: boolean; pdf: boolean }>({
    png: false,
    pdf: false
  });
  
  const leftImagesRef = useRef<HTMLDivElement>(null);

  // 解析 tags 为数组（支持 string 或 string[] 类型）
  const parseTags = (tags: string | string[]): string[] => {
    try {
      if (Array.isArray(tags)) return tags;
      return typeof tags === 'string' ? JSON.parse(tags) : [];
    } catch {
      return typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : [];
    }
  };

  // 解析 additionalInfo 字符串为对象
  const parseAdditionalInfo = (additionalInfo: string) => {
    try {
      // 如果已经是对象，直接返回
      if (typeof additionalInfo === 'object' && additionalInfo !== null) {
        return additionalInfo;
      }
      // 如果是字符串，尝试解析 JSON
      if (typeof additionalInfo === 'string' && additionalInfo.trim()) {
        return JSON.parse(additionalInfo);
      }
      return null;
    } catch (error) {
      console.error('Failed to parse additionalInfo:', error, additionalInfo);
      return null;
    }
  };

  useEffect(() => {
    const loadImageData = async () => {
      if (!imageId) return;

      try {
        setIsImageLoading(true);
        
        // 尝试从ImageService中查找主图片
        let foundImage: HomeImage | null = await ImageService.getImageById(imageId);

        if (foundImage) {
          setImage(foundImage);
          setIsImageLoading(false); // 主图片加载完成，立即显示
          
          // 异步加载相关图片，不阻塞主内容显示
          setIsRelatedImagesLoading(true);
          try {
            const relatedImages = await ImageService.getRelatedImages(foundImage.id, 5);
            setRelatedImages(relatedImages);
          } catch (error) {
            console.error('Failed to load related images from ImageService:', error);
          } finally {
            setIsRelatedImagesLoading(false);
          }
        } else {
          setIsImageLoading(false);
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        setIsImageLoading(false);
      }
    };

    loadImageData();
  }, [imageId]);

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
    // 检查是否从分类页面跳转过来
    const urlParams = new URLSearchParams(window.location.search);
    const fromCategory = urlParams.get('from') === 'category';
    const categoryId = urlParams.get('categoryId');
    const categoryName = urlParams.get('categoryName');
    
    if (fromCategory && categoryId && categoryName) {
      // 4层面包屑：Home > Coloring Pages Free > xxx category > 图片名字
      return [
        { label: 'Home', path: '/' },
        { label: 'Coloring Pages Free', path: '/categories' },
        { label: decodeURIComponent(categoryName), path: `/categories/${categoryId}` },
        { label: image ? getLocalizedText(image.title, language) || 'Loading...' : 'Loading...', current: true }
      ];
    } else {
      // 默认2层面包屑：Home > 图片名字
      return [
        { label: 'Home', path: '/' },
        { label: image ? getLocalizedText(image.title, language) || 'Loading...' : 'Loading...', current: true }
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
          <div className="container mx-auto px-4 py-6 lg:py-10 max-w-[1200px]">
            <Breadcrumb items={[
              { label: 'Home', path: '/' },
              { label: 'Image not found', current: true }
            ]} />
          </div>
          
          <div className="container mx-auto px-4 max-w-[1200px]">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <div className="text-lg lg:text-xl text-[#161616] mb-4">Image not found</div>
                <Button onClick={() => navigate('/')} variant="gradient">
                  Go Home
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
          <Breadcrumb items={breadcrumbPath} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 max-w-[1200px]">
          {isImageLoading ? (
            /* 加载状态 */
            <div className="flex justify-center items-center py-20">
              <div className="text-lg text-[#6B7280]">Loading image details...</div>
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
                    src={image.colorUrl}
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
                    <h1 className="text-xl lg:text-2xl font-bold text-[#161616] capitalize leading-6 lg:leading-5">
                      {getLocalizedText(image.title, language)}
                    </h1>
                    <p className="text-sm text-[#6B7280] leading-5">
                      {getLocalizedText(image.description, language) || `This picture depicts ${getLocalizedText(image.title, language)}, a beautiful coloring page perfect for all ages. The design features intricate details and patterns that will provide hours of creative enjoyment.`}
                    </p>
                  </div>

                  {/* Tags */}
                  {image.tags && (
                    <div className="space-y-3 lg:space-y-4">
                      <h3 className="text-base font-medium text-black">Tags</h3>
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
                <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-auto">
                  <Button
                    onClick={() => handleDownload('png')}
                    disabled={isDownloading.png}
                    variant="gradient"
                    className="flex-1 h-12 lg:h-[60px] text-base lg:text-xl font-bold"
                  >
                    <img src={downloadIcon} alt="Download" className="w-5 h-5 lg:w-7 lg:h-7 mr-2" />
                    <span className="hidden sm:inline">{isDownloading.png ? 'Downloading...' : 'Download PNG'}</span>
                    <span className="sm:hidden">{isDownloading.png ? 'PNG...' : 'PNG'}</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleDownload('pdf')}
                    disabled={isDownloading.pdf}
                    variant="gradient"
                    className="flex-1 h-12 lg:h-[60px] text-base lg:text-xl font-bold"
                  >
                    <img src={downloadIcon} alt="Download" className="w-5 h-5 lg:w-7 lg:h-7 mr-2" />
                    <span className="hidden sm:inline">{isDownloading.pdf ? 'Downloading...' : 'Download PDF'}</span>
                    <span className="sm:hidden">{isDownloading.pdf ? 'PDF...' : 'PDF'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Detailed Description Sections - 只在图片加载完成后显示 */}
          {!isImageLoading && image && (() => {
            const additionalInfo = parseAdditionalInfo(image.additionalInfo);
            
            if (!additionalInfo) {
              return null;
            }

            return (
              <div className="space-y-8 lg:space-y-12 mb-8 lg:mb-20">
                {/* Section 1 - 图片特色 */}
                {additionalInfo.features && additionalInfo.features.length > 0 && (
                  <section>
                    <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-6">🎁 图片特色</h2>
                    <div className="text-sm text-[#6B7280] leading-5 space-y-2">
                      {additionalInfo.features.map((feature: string, index: number) => (
                        <p key={index}>• {feature}</p>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 2 - 适合人群 */}
                {additionalInfo.suitableFor && additionalInfo.suitableFor.length > 0 && (
                  <section>
                    <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-6">💖 适合人群</h2>
                    <div className="text-sm text-[#6B7280] leading-5 space-y-2">
                      {additionalInfo.suitableFor.map((suitable: string, index: number) => (
                        <p key={index}>• {suitable}</p>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 3 - 涂色建议 */}
                {additionalInfo.coloringSuggestions && additionalInfo.coloringSuggestions.length > 0 && (
                  <section>
                    <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-6">🎨 涂色建议</h2>
                    <div className="text-sm text-[#6B7280] leading-5 space-y-2">
                      {additionalInfo.coloringSuggestions.map((suggestion: string, index: number) => (
                        <p key={index}>• {suggestion}</p>
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 4 - 创意用途 */}
                {additionalInfo.creativeUses && additionalInfo.creativeUses.length > 0 && (
                  <section>
                    <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-6">💡 创意用途</h2>
                    <div className="text-sm text-[#6B7280] leading-5 space-y-2">
                      {additionalInfo.creativeUses.map((use: string, index: number) => (
                        <p key={index}>• {use}</p>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            );
          })()}

          {/* You Might Also Like - 独立显示相关图片加载状态 */}
          <section>
            <h2 className="text-center text-[#161616] text-2xl lg:text-3xl xl:text-[46px] font-bold capitalize mb-8 lg:mb-12 leading-relaxed lg:leading-[1.6] px-4">
              You Might Also Like
            </h2>
            
            {/* Related Images Grid */}
            <div className="mb-8 lg:mb-20">
              {isRelatedImagesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-lg text-[#6B7280]">Loading related images...</div>
                </div>
              ) : relatedImages.length > 0 ? (
                <MasonryGrid 
                  images={relatedImages}
                  isLoading={false}
                />
              ) : (
                <div className="flex justify-center items-center py-12">
                  <div className="text-sm text-[#6B7280]">No related images found</div>
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