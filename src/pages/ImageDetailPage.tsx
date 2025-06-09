import { useState, useEffect, useRef, Fragment } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/button';
import MasonryGrid from '../components/layout/MasonryGrid';
import { HomeImageService } from '../services/imageService';
import { CategoriesService } from '../services/categoriesService';
import { downloadImageById } from '../utils/downloadUtils';
import { HomeImage } from '../services/imageService';
import { CategoryImage } from '../services/categoriesService';
import homeIcon from '../images/home.svg';
import chevronRightIcon from '../images/chevron-right.svg';
import downloadIcon from '../images/download-white.svg';

const ImageDetailPage: React.FC = () => {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();
  
  const [image, setImage] = useState<HomeImage | CategoryImage | null>(null);
  const [relatedImages, setRelatedImages] = useState<HomeImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<{ png: boolean; pdf: boolean }>({
    png: false,
    pdf: false
  });
  const [categoryInfo, setCategoryInfo] = useState<{ id: string; displayName: string } | null>(null);
  
  const leftImagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadImageData = async () => {
      if (!imageId) return;

      try {
        setIsLoading(true);
        
        // 尝试从HomeImage中查找
        let foundImage: HomeImage | CategoryImage | null = HomeImageService.getImageById(imageId) || null;
        
        // 如果没找到，尝试从CategoryImage中查找
        if (!foundImage) {
          foundImage = await CategoriesService.getImageById(imageId);
        }

        if (foundImage) {
          setImage(foundImage);
          
          // 如果是CategoryImage，加载分类信息
          if (!('defaultUrl' in foundImage)) {
            try {
              const category = await CategoriesService.getCategoryById(foundImage.category);
              if (category) {
                setCategoryInfo({
                  id: category.id,
                  displayName: category.displayName
                });
              }
            } catch (error) {
              console.error('Failed to load category info:', error);
            }
          }
          
          // 加载相关图片
          let relatedImages: HomeImage[] = [];
          
          if ('defaultUrl' in foundImage) {
            // HomeImage类型：调用HomeImageService.getRelatedImages方法
            relatedImages = HomeImageService.getRelatedImages(foundImage.id, 5);
          } else {
            // CategoryImage类型：使用CategoriesService的getRelatedImages方法
            const related = await CategoriesService.getRelatedImages(foundImage.id, 5);
            
            // 转换CategoryImage为HomeImage格式以兼容HoverImageCard
            relatedImages = related.map(img => ({
              id: img.id,
              name: img.title,
              defaultUrl: img.url,
              colorUrl: img.colorUrl || img.url,
              title: img.title,
              description: img.description || img.title,
              tags: img.tags,
              dimensions: { width: 400, height: 500 },
              additionalInfo: {
                features: [],
                suitableFor: [],
                coloringSuggestions: [],
                creativeUses: []
              }
            }));
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
    if (!imageId) return;

    try {
      setIsDownloading(prev => ({ ...prev, [format]: true }));
      await downloadImageById(imageId, format);
    } catch (error) {
      console.error(`Download ${format} failed:`, error);
    } finally {
      setIsDownloading(prev => ({ ...prev, [format]: false }));
    }
  };

  const getBreadcrumbPath = () => {
    if (!image) return [];
    
    // 根据图片类型确定面包屑路径
    const isHomeImage = 'defaultUrl' in image;
    if (isHomeImage) {
      // HomeImage：只显示 Home -> 图片名字
      return [
        { label: 'Home', path: '/' },
        { label: image.title, path: '', current: true }
      ];
    } else {
      // CategoryImage的面包屑路径
      const categoryLabel = categoryInfo?.displayName || 'Category';
      const categoryPath = categoryInfo?.id ? `/categories/${categoryInfo.id}` : '/categories';
      
      return [
        { label: 'Home', path: '/' },
        { label: 'Coloring Pages Free', path: '/categories' },
        { label: categoryLabel, path: categoryPath },
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
  const isHomeImage = 'defaultUrl' in image;

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
          <div ref={leftImagesRef} className="flex">
            {/* Black & White Image */}
            <div className="w-[300px] flex items-start justify-center">
              <img
                src={isHomeImage ? image.defaultUrl : image.url}
                alt={image.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
            
            {/* Color Image */}
            <div className="w-[300px] flex items-start justify-center">
              <img
                src={isHomeImage ? image.colorUrl : (image.colorUrl || image.url)}
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
              {image.tags && image.tags.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-black">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag: string, index: number) => (
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
        <div className="space-y-12 mb-20">
          {/* Section 1 - 图片特色 */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-6">🎁 图片特色</h2>
            <div className="text-sm text-[#6B7280] leading-5 space-y-2">
              {isHomeImage && image.additionalInfo && image.additionalInfo.features ? (
                image.additionalInfo.features.map((feature, index) => (
                  <p key={index}>• {feature}</p>
                ))
              ) : (
                <>
                  <p>• 清晰的线条设计，适合各种涂色工具</p>
                  <p>• 丰富的细节元素，提供充足的创作空间</p>
                  <p>• 经典的构图设计，既简单又富有趣味性</p>
                  <p>• 适合打印在标准A4纸张上</p>
                </>
              )}
            </div>
          </section>

          {/* Section 2 - 适合人群 */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-6">💖 适合人群</h2>
            <div className="text-sm text-[#6B7280] leading-5 space-y-2">
              {isHomeImage && image.additionalInfo && image.additionalInfo.suitableFor ? (
                image.additionalInfo.suitableFor.map((suitable, index) => (
                  <p key={index}>• {suitable}</p>
                ))
              ) : (
                <>
                  <p>• 儿童用户：培养创造力和想象力，提高专注力和手眼协调能力</p>
                  <p>• 成人用户：放松身心，缓解压力，享受宁静的创作时光</p>
                  <p>• 初学者：简单易懂的图案设计</p>
                  <p>• 家庭活动：适合全家一起参与的涂色时光</p>
                </>
              )}
            </div>
          </section>

          {/* Section 3 - 涂色建议 */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-6">🎨 涂色建议</h2>
            <div className="text-sm text-[#6B7280] leading-5 space-y-2">
              {isHomeImage && image.additionalInfo && image.additionalInfo.coloringSuggestions ? (
                image.additionalInfo.coloringSuggestions.map((suggestion, index) => (
                  <p key={index}>• {suggestion}</p>
                ))
              ) : (
                <>
                  <p>• 经典搭配：选择对比鲜明的颜色组合，如红配绿、蓝配橙</p>
                  <p>• 温馨风格：使用暖色调如粉色、黄色、橙色营造温馨感</p>
                  <p>• 清新风格：选择冷色调如蓝色、绿色、紫色打造清新感</p>
                  <p>• 个性创作：根据个人喜好自由搭配，创造独特的色彩风格</p>
                </>
              )}
            </div>
          </section>

          {/* Section 4 - 创意用途 */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-6">💡 创意用途</h2>
            <div className="text-sm text-[#6B7280] leading-5 space-y-2">
              {isHomeImage && image.additionalInfo && image.additionalInfo.creativeUses ? (
                image.additionalInfo.creativeUses.map((use, index) => (
                  <p key={index}>• {use}</p>
                ))
              ) : (
                <>
                  <p>• 制作个性化贺卡：将完成的作品制作成节日或生日贺卡</p>
                  <p>• 装饰房间：裱框后可作为儿童房或学习区的装饰画</p>
                  <p>• 亲子活动：家长和孩子一起涂色，增进亲子关系</p>
                  <p>• 教学工具：老师可用作美术课或课外活动的教学材料</p>
                  <p>• 放松减压：工作学习之余的放松活动，缓解压力</p>
                  <p>• 分享交流：完成后可在社交媒体分享，与朋友交流创作心得</p>
                </>
              )}
            </div>
          </section>
        </div>

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