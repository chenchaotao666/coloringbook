import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import { ImageService } from '../services/imageService';
import { HomeImage } from '../services/imageService';
import { downloadImageByUrl, downloadImageAsPdf } from '../utils/downloadUtils';
const homeIcon = '/images/home.svg';
const chevronRightIcon = '/images/chevron-right.svg';
const downloadIcon = '/images/download-white.svg';

const ImageDetailPage: React.FC = () => {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  
  const [image, setImage] = useState<HomeImage | null>(null);
  const [relatedImages, setRelatedImages] = useState<HomeImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<{ png: boolean; pdf: boolean }>({
    png: false,
    pdf: false
  });
  
  const leftImagesRef = useRef<HTMLDivElement>(null);

  // 解析 tags 字符串为数组
  const parseTags = (tags: string): string[] => {
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
        setIsLoading(true);
        
        // 尝试从ImageService中查找
        let foundImage: HomeImage | null = await ImageService.getImageById(imageId);

        if (foundImage) {
          setImage(foundImage);
          
          // 加载相关图片 - 优先使用ImageService
          let relatedImages: HomeImage[] = [];
          
          try {
            relatedImages = await ImageService.getRelatedImages(foundImage.id, 5);
          } catch (error) {
            console.error('Failed to load related images from ImageService:', error);
          }
          
          setRelatedImages(relatedImages);
        }
      } catch (error) {
        console.error('Failed to load image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImageData();
  }, [imageId]);

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!image) return;

    try {
      setIsDownloading(prev => ({ ...prev, [format]: true }));
      
      // 生成文件名
      const fileName = `coloring-page-${image.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${image.id.slice(-8)}.${format}`;
      
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

  const getBreadcrumbPath = () => {
    if (!image) return [];
    
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
        { label: image.title, path: '', current: true }
      ];
    } else {
      // 默认2层面包屑：Home > 图片名字
      return [
        { label: 'Home', path: '/' },
        { label: image.title, path: '', current: true }
      ];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header backgroundColor="white" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-xl text-[#6B7280]">Loading...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header backgroundColor="white" />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-xl text-[#161616] mb-4">Image not found</div>
            <Button onClick={() => navigate('/')} variant="gradient">
              Go Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const breadcrumbPath = getBreadcrumbPath();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header backgroundColor="white" />
      
      <main className="max-w-[1170px] mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-12">
          {breadcrumbPath.map((item, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <img src={chevronRightIcon} alt=">" className="w-3 h-3" />
              )}
              {index === 0 && (
                <img src={homeIcon} alt="Home" className="w-3 h-3" />
              )}
              {item.current ? (
                <span className="text-[#6B7280] text-sm font-medium">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => item.path && navigate(item.path)}
                  className="text-[#161616] text-sm font-medium hover:text-[#FF5C07] transition-colors"
                >
                  {item.label}
                </button>
              )}
            </Fragment>
          ))}
        </nav>

        {/* Main Content */}
        <div className="flex gap-8 mb-20">
          {/* Left Side - Images */}
          <div ref={leftImagesRef} className="flex gap-4">
            {/* Black & White Image */}
            <div className="max-w-[300px] flex items-start justify-center">
              <img
                src={image.defaultUrl}
                alt={image.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            
            {/* Color Image */}
            <div className="max-w-[300px] flex items-start justify-center">
              <img
                src={image.colorUrl}
                alt={`${image.title} - Colored`}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex-1 max-w-[524px] flex flex-col">
            <div className="flex-1 space-y-9">
              {/* Title and Description */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[#161616] capitalize leading-5">
                  {image.title}
                </h1>
                <p className="text-sm text-[#6B7280] leading-5">
                  {image.description || `This picture depicts ${image.title}, a beautiful coloring page perfect for all ages. The design features intricate details and patterns that will provide hours of creative enjoyment.`}
                </p>
              </div>

              {/* Tags */}
              {image.tags && (
                <div className="space-y-4">
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

            {/* Download Buttons - 智能对齐 */}
            <div 
              className="flex gap-3 mt-auto"
              style={{
                minHeight: '60px',
                alignSelf: 'stretch'
              }}
            >
              <Button
                onClick={() => handleDownload('png')}
                disabled={isDownloading.png}
                variant="gradient"
                className="flex-1 h-[60px] text-xl font-bold"
              >
                <img src={downloadIcon} alt="Download" className="w-7 h-7 mr-2" />
                {isDownloading.png ? 'Downloading...' : 'Download PNG'}
              </Button>
              
              <Button
                onClick={() => handleDownload('pdf')}
                disabled={isDownloading.pdf}
                variant="gradient"
                className="flex-1 h-[60px] text-xl font-bold"
              >
                <img src={downloadIcon} alt="Download" className="w-7 h-7 mr-2" />
                {isDownloading.pdf ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Description Sections */}
        {(() => {
          const additionalInfo = parseAdditionalInfo(image.additionalInfo);
          
          if (!additionalInfo) {
            return null;
          }

          return (
            <div className="space-y-12 mb-20">
              {/* Section 1 - 图片特色 */}
              {additionalInfo.features && additionalInfo.features.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-black mb-6">🎁 图片特色</h2>
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
                  <h2 className="text-2xl font-bold text-black mb-6">💖 适合人群</h2>
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
                  <h2 className="text-2xl font-bold text-black mb-6">🎨 涂色建议</h2>
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
                  <h2 className="text-2xl font-bold text-black mb-6">💡 创意用途</h2>
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

        {/* You Might Also Like */}
        {relatedImages.length > 0 && (
          <section>
            <h2 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-12 leading-relaxed lg:leading-[1.6]">
              You Might Also Like
            </h2>
            
            {/* Related Images Grid */}
            <div className="mb-20">
              <MasonryGrid 
                images={relatedImages}
                isLoading={false}
              />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ImageDetailPage; 