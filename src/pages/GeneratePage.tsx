import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutNoFooter from '../components/layout/LayoutNoFooter';
import useGeneratePage from '../hooks/useGeneratePage';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/textUtils';
import CircularProgress from '../components/ui/CircularProgress';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BackToTop from '../components/common/BackToTop';
import Tooltip from '../components/ui/Tooltip';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import {
  getCenterImageSize,
  getImageSize,
  getImageContainerSize,
  getGeneratingContainerSize,
  EXAMPLE_IMAGE_DIMENSIONS,
} from '../utils/imageUtils';
const aiGenerateIcon = '/images/AI-generate.svg';
const addImageIcon = '/images/add-image.svg';
const crownIcon = '/images/crown.svg';
const refreshIcon = '/images/refresh.svg';
const tipIcon = '/images/tip.svg';
const subtractColorIcon = '/images/subtract-color.svg';
const subtractIcon = '/images/subtract.svg';
const downloadIcon = '/images/download.svg';
const moreIcon = '/images/more.svg';
const deleteIcon = '/images/delete.svg';
const reportIcon = '/images/report.svg';
const textCountIcon = '/images/text-count.svg';
const generateFailIcon = '/images/generate-fail.svg';

interface GeneratePageProps {
  initialTab?: 'text' | 'image';
}

const GeneratePage: React.FC<GeneratePageProps> = ({ initialTab = 'text' }) => {
  // 获取翻译函数
  const { t } = useAsyncTranslation('generate');
  const { t: tCommon } = useAsyncTranslation('common');
  
  // 获取导航函数
  const navigate = useNavigate();
  
  // 获取用户认证状态和刷新函数
  const { user, isAuthenticated, refreshUser } = useAuth();
  
  // 状态：存储动态获取的图片尺寸（用于Text to Image和Image to Image模式）
  const [dynamicImageDimensions, setDynamicImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});

  // 控制更多选项菜单的显示
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  // 控制删除确认对话框的显示
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // 移动端内容滚动容器的引用
  const mobileContentRef = React.useRef<HTMLDivElement>(null);

  // 使用我们创建的 Hook 来管理状态和 API 调用
  const {
    // 状态
    prompt,
    selectedTab,
    selectedRatio,
    textPublicVisibility,
    imagePublicVisibility,
    selectedImage,
    uploadedFile,

    textGeneratedImages,    // Text to Image 生成的图片
    imageGeneratedImages,   // Image to Image 生成的图片
    textExampleImages,      // 直接使用分离的变量
    imageExampleImages,     // 直接使用分离的变量
    styleSuggestions,
    isGenerating,
    isLoadingTextExamples,  // 直接使用分离的加载状态
    isLoadingImageExamples, // 直接使用分离的加载状态
    isInitialDataLoaded,    // 初始数据是否已加载完成
    error,
    generationProgress,

    // 用户生成历史状态
    hasTextToImageHistory,
    hasImageToImageHistory,

    // 操作
    setPrompt,
    setSelectedTab,
    setSelectedRatio,
    setTextPublicVisibility,
    setImagePublicVisibility,
    setSelectedImage,
    setUploadedImageWithDimensions,
    generateImages,
    recreateExample,
    downloadImage,
    clearError,
    refreshExamples,
    refreshStyleSuggestions,
    deleteImage,
  } = useGeneratePage(initialTab, refreshUser);

  // 当initialTab变化时更新selectedTab
  useEffect(() => {
    // 只有当当前标签页与初始标签页不同时才更新
    if (selectedTab !== initialTab) {
      setSelectedTab(initialTab);
    }
  }, [initialTab]);

  // 点击外部关闭更多选项菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu) {
        const target = event.target as Element;
        if (!target.closest('.more-menu-container')) {
          setShowMoreMenu(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // 自动选择最新生成的图片
  useEffect(() => {
    // 只有在初始数据加载完成后才自动选择图片
    if (!isInitialDataLoaded) return;
    
    const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
    
    if (currentImages.length > 0 && !isGenerating) {
      const latestImage = currentImages[0]; // 假设数组已按时间排序
      // 如果当前没有选中图片，或者当前选中的图片不在当前类型的列表中，则选择最新的
      if (!selectedImage || !currentImages.find(img => img.id === selectedImage)) {
        setSelectedImage(latestImage.id);
      }
    }
  }, [textGeneratedImages, imageGeneratedImages, selectedTab, isGenerating, selectedImage, setSelectedImage, isInitialDataLoaded]);

  // 回填图片属性的辅助函数
  const fillImageAttributes = (imageId: string) => {
    const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
    const selectedImageData = currentImages.find(img => img.id === imageId);
    

    
    if (selectedImageData) {
      // 回填 prompt（仅对 text to image 有效）
      if (selectedTab === 'text') {
        const promptValue = getLocalizedText(selectedImageData.prompt, 'zh');
        setPrompt(promptValue);
      }
      
              // 回填 ratio
        if (selectedImageData.ratio && ['3:4', '4:3', '1:1'].includes(selectedImageData.ratio)) {
          setSelectedRatio(selectedImageData.ratio as '3:4' | '4:3' | '1:1');
        }
      
              // 回填 isPublic
        if (selectedTab === 'text') {
          setTextPublicVisibility(selectedImageData.isPublic);
        } else {
          setImagePublicVisibility(selectedImageData.isPublic);
        }
      
      // 对于 Image to Image 模式，清空当前上传的文件
      // 但如果URL参数中有sourceImageUrl，说明是recreate操作，不要清空
      const sourceImageUrl = new URLSearchParams(window.location.search).get('sourceImageUrl');
      if (selectedTab === 'image' && uploadedFile && !sourceImageUrl) {
        setUploadedImageWithDimensions(null, null);
      }
          }
  };

  // 标签页切换时的图片选择逻辑
  useEffect(() => {
    if (selectedImage) {
      // 检查当前选中的图片是否属于当前标签页类型
      const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
      const currentImage = currentImages.find(img => img.id === selectedImage);
      
      if (!currentImage) {
        // 当前选中的图片不属于当前标签页类型，需要重新选择
        if (currentImages.length > 0) {
          // 选择该类型的第一张图片
          const firstImageId = currentImages[0].id;
          setSelectedImage(firstImageId);
          fillImageAttributes(firstImageId);
        } else {
          // 该类型没有图片，清空选择
          setSelectedImage(null);
        }
      } else {
        // 当前选中的图片属于当前标签页，回填其属性
        fillImageAttributes(selectedImage);
      }
    }
  }, [selectedTab, textGeneratedImages, imageGeneratedImages, selectedImage, setSelectedImage]);

  // 事件处理函数
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleClearPrompt = () => {
    setPrompt('');
  };

  const handleImageSelect = (imageId: string) => {
    // 如果有错误，先清除错误状态
    if (error) {
      clearError();
    }
    
    // 设置选中的图片
    setSelectedImage(imageId);
    
    // 回填图片属性到表单
    fillImageAttributes(imageId);
  };

  const handleGenerate = async () => {
    // 1. 检查用户是否已登录
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 2. 检查用户是否有足够积分
    if (user && user.credits < 20) {
      navigate('/price');
      return;
    }

    // 3. 执行生成逻辑
    // 清除之前的错误状态
    if (error) {
      clearError();
    }
    await generateImages();
  };

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (selectedImage) {
      // selectedImage 现在存储的就是图片的 id
      await downloadImage(selectedImage, format);
    }
  };

  const handleRecreateExample = async (exampleId: string) => {
    await recreateExample(exampleId);
  };

  const handleStyleSuggestionClick = (styleContent: string) => {
    setPrompt(styleContent);
  };

  const handleRefreshStyleSuggestions = async () => {
    await refreshStyleSuggestions();
  };

  const handleMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleDelete = () => {
    if (selectedImage) {
      setShowMoreMenu(false);
      setShowDeleteConfirm(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedImage) {
      try {
        // 调用删除方法
        const success = await deleteImage(selectedImage);
        
        if (success) {
          // 显示成功提示
          console.log('图片删除成功！');
        } else {
          // 删除失败
          console.error('删除图片失败，请稍后重试。');
        }
      } catch (error) {
        console.error('Delete image error:', error);
      }
    }
  };

  const handleReport = () => {
    if (selectedImage) {
      // TODO: 实现举报功能
      console.log('Report image:', selectedImage);
      setShowMoreMenu(false);
    }
  };

  // 移动端标签切换处理函数 - 添加滚动到顶部功能
  const handleMobileTabChange = (tab: 'text' | 'image') => {
    // 检查是否是移动端
    const isMobile = window.innerWidth < 1024; // lg断点
    
    // 如果是移动端且标签发生变化，则滚动到顶部
    if (isMobile && tab !== selectedTab) {
      // 使用ref直接访问移动端内容容器
      if (mobileContentRef.current) {
        mobileContentRef.current.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } else {
        // 备用方案：滚动整个窗口
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    }
    
    // 设置选中的标签
    setSelectedTab(tab);
  };

  // 通用内容渲染方法
  const renderContent = (mode: 'text' | 'image') => {
        const config = {
      text: {
        title: t('textToImage.title', 'Text to coloring page'),
        description: t('textToImage.description', 'Create high-quality coloring sheets for free with coloring page generator. Spark your kids\' creativity with AI-designed coloring pages.')
      },
      image: {
        title: t('imageToImage.title', 'Image to coloring page'),
        description: t('imageToImage.description', 'Upload your image and transform your photo into an amazing coloring page in just seconds, unleashing your imagination.')
      }
    };

    // 根据模式选择对应的示例图片和加载状态
    const currentExampleImages = mode === 'text' ? textExampleImages : imageExampleImages;

    return (
      <div className="flex-1 px-4 sm:px-6 lg:px-10 flex flex-col pt-4 lg:pb-56 relative bg-[#F9FAFB]">
        {/* 图片内容区域 - 移动端固定高度，桌面端flex-1 */}
        <div className="h-[390px] lg:flex-1 lg:h-auto flex flex-col justify-center">
          {/* 移动端为历史图片预留右侧空间 */}
          <div className="w-full">
            {error ? (
              // 生成失败状态 - 独立显示，居中，不在图片框中
              <div className="flex flex-col items-center text-center pt-8 pb-16">
                <div className="w-20 h-20 mb-6">
                  <img src={generateFailIcon} alt="Generation failed" className="w-full h-full" />
                </div>
                <div className="text-[#6B7280] text-sm leading-relaxed max-w-md">
                  {t('error.generationFailed', 'The generation failed. Please regenerate it.')}<br />
                  {t('error.tryAgain', 'If you encounter any problems, please provide feedback to us.')}
                </div>
              </div>
            ) : selectedImage || isGenerating ? (
              <div className="flex flex-col items-center">
                {(() => {
                  // 根据当前标签页选择对应的图片数组
                  const currentImages = mode === 'text' ? textGeneratedImages : imageGeneratedImages;
                  const imageSize = getCenterImageSize(mode, isGenerating, selectedImage, currentImages, dynamicImageDimensions, setDynamicImageDimensions);
                  return (
                    <div 
                      className="bg-[#F2F3F5] rounded-2xl border border-[#EDEEF0] relative flex items-center justify-center transition-all duration-300"
                      style={imageSize.style}
                    >
                      {isGenerating ? (
                        <div className="flex flex-col items-center relative">
                          <div className="relative">
                            <CircularProgress
                              progress={generationProgress}
                              size="large"
                              showPercentage={false}
                            />
                          </div>
                          <div className="mt-6 text-center">
                            {/* 进度数值显示 */}
                            <div className="text-[#161616] text-2xl font-semibold">
                              {Math.round(generationProgress)}%
                            </div>
                            <div className="text-[#6B7280] text-sm">{t('generating.description', 'Generating...')}</div>
                          </div>
                        </div>
                      ) : selectedImage ? (
                        <>
                          <img
                            src={(() => {
                              // 根据当前标签页选择对应的图片数组
                              const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
                              return currentImages.find(img => img.id === selectedImage)?.defaultUrl;
                            })()}
                            alt="Generated coloring page"
                            className="w-full h-full object-contain rounded-2xl"
                          />
                        </>
                      ) : null}
                    </div>
                  );
                })()}
                
                {/* Download and More Options - 只在有选中图片时显示 */}
                {selectedImage && (
                  <div className="flex flex-row gap-3 mt-6 px-4 sm:px-0">
                    {/* Download PNG Button */}
                    <button 
                      onClick={() => handleDownload('png')}
                      className="bg-[#F2F3F5] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none"
                    >
                      <img src={downloadIcon} alt="Download" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[#161616] text-sm font-medium">{t('formats.png', 'PNG')}</span>
                    </button>

                    {/* Download PDF Button */}
                    <button 
                      onClick={() => handleDownload('pdf')}
                      className="bg-[#F2F3F5] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none"
                    >
                      <img src={downloadIcon} alt="Download" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[#161616] text-sm font-medium">{t('formats.pdf', 'PDF')}</span>
                    </button>

                    {/* More Options Button */}
                    <div className="relative more-menu-container flex-1 sm:flex-none">
                      <button 
                        onClick={handleMoreMenuToggle}
                        className="bg-[#F2F3F5] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg p-2 sm:p-3 transition-all duration-200 w-full sm:w-auto flex items-center justify-center"
                      >
                        <img src={moreIcon || refreshIcon} alt="More options" className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>

                      {/* 下拉菜单 */}
                      {showMoreMenu && (
                        <div className="absolute top-full mt-2 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 min-w-[120px] z-50">
                          <button
                            onClick={handleDelete}
                            className="w-full px-4 py-2 text-left text-[#161616] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                            <span className="text-sm">{t('actions.delete', 'Delete')}</span>
                          </button>
                          <button
                            onClick={handleReport}
                            className="w-full px-4 py-2 text-left text-[#161616] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                          >
                            <img src={reportIcon} alt="Report" className="w-4 h-4" />
                            <span className="text-sm">{t('actions.report', 'Report')}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ) : (mode === 'text' ? isLoadingTextExamples : isLoadingImageExamples) ? null : (
              // 根据当前模式判断是否显示Example
              // 只有在初始数据加载完成后才决定是否显示 example 图片
              // Text to Image 模式：用户没有 text to image 历史时显示 example
              // Image to Image 模式：用户没有 image to image 历史时显示 example
              isInitialDataLoaded && ((mode === 'text' && !hasTextToImageHistory) || (mode === 'image' && !hasImageToImageHistory)) && (
                <div>
                  {/* 固定的文字部分 - 只在显示Example时显示 */}
                  <div className="text-center lg:pb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#161616] capitalize px-4">{config[mode].title}</h1>
                    <p className="text-[#6B7280] text-sm mt-2 max-w-[600px] mx-auto">
                      {config[mode].description}
                    </p>
                  </div>

                  {/* Example 标题栏 */}
                  <div className="w-full max-w-[795px] mx-auto flex justify-between items-center mb-3">
                    <div className="text-[#161616] font-medium text-sm">{t('examples.title', 'Example')}</div>
                    <div className="flex items-center text-[#6B7280] text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200 px-2 py-1 rounded-md" onClick={refreshExamples}>
                      {t('examples.change', 'Change')}
                      <img src={refreshIcon} alt="Change" className="w-4 h-4 ml-1" />
                    </div>
                  </div>

                  {/* Example Images */}
                  <div className="flex flex-row justify-center gap-2 sm:gap-6">
                    {currentExampleImages.length > 0 ? currentExampleImages.slice(0, window.innerWidth < 640 ? 2 : currentExampleImages.length).map((example) => {
                      // 使用 getImageSize 替代 getExampleImageSize
                      // 移动端和桌面端使用不同的尺寸限制
                      const imageUrl = mode === 'image' ? example.colorUrl : example.defaultUrl;
                      const isMobile = window.innerWidth < 640;
                      const maxWidth = isMobile ? 215 : EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH;
                      const maxHeight = isMobile ? 240 : EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH;
                      
                      // 设置合理的最小尺寸
                      const minWidth = isMobile ? 100 : 150;
                      const minHeight = isMobile ? 120 : 150;
                      
                      const imageSize = getImageSize(
                        example.id, 
                        imageUrl, 
                        maxWidth, 
                        maxHeight,
                        minWidth, 
                        minHeight, 
                        dynamicImageDimensions, 
                        setDynamicImageDimensions
                      );
                      
                      return (
                        <div
                          key={example.id}
                          className={`relative bg-white rounded-2xl border border-[#EDEEF0]`}
                          style={{ width: imageSize.width, height: imageSize.height }}
                        >
                          <img
                            src={mode === 'image' ? example.colorUrl : example.defaultUrl}
                            alt={getLocalizedText(example.description, 'zh') || `Example ${example.id}`}
                            className={`w-full h-full object-cover rounded-2xl`}
                          />
                          <button
                            onClick={() => handleRecreateExample(example.id)}
                            className="absolute top-3 left-3 bg-[#FF5C07] text-white text-xs py-1 px-2 rounded-full hover:bg-[#FF7A47] transition-all duration-300 cursor-pointer"
                          >
{t('examples.recreate', 'Recreate')}
                          </button>
                        </div>
                      );
                    }) : (
                      // 空状态 - 没有示例图片
                      <div className="w-full flex flex-col items-center justify-center lg:py-16">
                        <div className="text-center">
                          <div className="mb-6">
                            <img 
                              src="/images/no-result.svg" 
                              alt="No example images" 
                              className="w-[305px] h-[200px] mx-auto"
                            />
                          </div>
                          <p className="text-[#6B7280] text-base font-normal leading-6">
                            {t('examples.noExamples', 'No example images.')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
          

        </div>
        
        {/* 移动端横向历史图片 - 浮动在外层容器下方 */}
        {(() => {
          const currentImages = mode === 'text' ? textGeneratedImages : imageGeneratedImages;
          return currentImages.length > 0 && (
            <div className="lg:hidden mt-4 px-4 sm:px-6">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {currentImages.slice(0, 10).map((image, index) => {
                  // 如果有错误则不选中任何图片
                  const isSelected = !error && selectedImage === image.id;
                  
                  return (
                    <div
                      key={image.id}
                      className={`rounded-lg cursor-pointer relative transition-all border-2 bg-white shadow-sm flex-shrink-0 ${
                        isSelected ? 'border-[#FF5C07] shadow-lg' : 'border-transparent hover:border-gray-200'
                      }`}
                      style={{
                        ...getImageContainerSize(image, dynamicImageDimensions, setDynamicImageDimensions, {
                          maxWidth: 80,   // 移动端横向最大宽度80px
                          maxHeight: 80,  // 移动端横向最大高度80px  
                          minWidth: 60,   // 移动端横向最小宽度60px
                          minHeight: 60   // 移动端横向最小高度60px
                        })
                      }}
                      onClick={() => handleImageSelect(image.id)}
                    >
                      <img
                        src={image.defaultUrl}
                        alt={getLocalizedText(image.description, 'zh') || `Generated ${index + 1}`}
                        className="w-full h-full rounded-md object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    );
  };

  // Render left sidebar based on selected tab
  const renderLeftSidebar = () => {
    if (selectedTab === 'text') {
      return (
        <>
          {/* Prompt Section */}
          <div className="lg:mx-5 lg:mt-7">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('prompt.title', 'Prompt')}</div>
            <div className="relative">
              <textarea
                className="w-full h-[120px] sm:h-[150px] lg:h-[180px] bg-[#F2F3F5] rounded-lg border border-[#EDEEF0] p-3 pr-10 text-sm resize-none focus:outline-none"
                placeholder={t('prompt.placeholder', 'What do you want to create?')}
                value={prompt}
                onChange={handlePromptChange}
                maxLength={1000}
              ></textarea>

              {/* Clear button - 只在有内容时显示 */}
              {prompt && (
                <button
                  onClick={handleClearPrompt}
                  className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  title={t('prompt.clear', 'Clear prompt')}
                >
                  <img src="/images/close-x.svg" alt="Clear" className="w-3 h-3" />
                </button>
              )}

              <div className="absolute bottom-2 right-3 text-xs sm:text-sm text-[#A4A4A4] flex mb-2 sm:mb-3 items-center gap-1">
                {prompt.length}/1000
                <img src={textCountIcon} alt="Text count" className="w-3 h-3" />
              </div>

              <div className="absolute bottom-2 left-3 bg-white rounded-full px-2 sm:px-3 py-1 mb-2 sm:mb-3 flex items-center">
                <span className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2">
                  <img src={aiGenerateIcon} alt="AI Generate" className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
                <span className="text-[#6B7280] text-xs sm:text-sm">{t('prompt.generateWithAI', 'Generate with AI')}</span>
              </div>
            </div>
          </div>

          {/* Ideas Section */}
          <div className="lg:mx-5 mt-5">
            <div className="flex justify-between items-start gap-2">
              <div className="text-[#6B7280] text-xs flex flex-wrap items-center gap-2 flex-1">
                <span className="shrink-0">{t('prompt.ideas', 'Ideas')}：</span>
                {styleSuggestions.map((style) => (
                  <span
                    key={style.id}
                    className="cursor-pointer hover:text-[#FF5C07] transition-colors bg-gray-100 px-2 py-1 rounded text-xs"
                    onClick={() => handleStyleSuggestionClick(style.content)}
                  >
                    {style.name}
                  </span>
                ))}
              </div>
              <span className="cursor-pointer hover:opacity-70 transition-opacity shrink-0 mt-0.5" onClick={handleRefreshStyleSuggestions}>
                <img src={refreshIcon} alt="Refresh" className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Ratio Selector */}
          <div className="lg:mx-5 mt-6 lg:mt-10">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('settings.ratio', 'Ratio')}</div>
            <div className="bg-[#F2F3F5] h-10 sm:h-12 rounded-lg flex items-center relative">
              <div
                className={`h-8 sm:h-10 rounded-lg absolute transition-all duration-200 ${
                  selectedRatio === '3:4' ? 'w-[calc(33.33%-4px)] bg-white left-1' :
                  selectedRatio === '4:3' ? 'w-[calc(33.33%-4px)] bg-white left-[calc(33.33%+2px)]' :
                  'w-[calc(33.33%-4px)] bg-white right-1'
                }`}
              ></div>
              <button
                className={`flex-1 h-8 sm:h-10 z-10 flex items-center justify-center text-sm ${selectedRatio === '3:4' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => setSelectedRatio('3:4')}
              >
                3:4
              </button>
              <button
                className={`flex-1 h-8 sm:h-10 z-10 flex items-center justify-center text-sm ${selectedRatio === '4:3' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => setSelectedRatio('4:3')}
              >
                4:3
              </button>
              <button
                className={`flex-1 h-8 sm:h-10 z-10 flex items-center justify-center text-sm ${selectedRatio === '1:1' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => setSelectedRatio('1:1')}
              >
                1:1
              </button>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          {/* Image Upload Section */}
          <div className="lg:mx-5 mt-1">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('upload.title', 'Image')}</div>
            <div
              className="w-full h-[150px] sm:h-[180px] lg:h-[202px] bg-[#F2F3F5] rounded-lg border border-[#EDEEF0] flex flex-col items-center justify-center cursor-pointer hover:bg-[#E5E7EB] transition-colors relative"
              onClick={() => document.getElementById('imageUpload')?.click()}
            >
              {uploadedFile ? (
                <div className="w-full h-full relative flex items-center justify-center">
                  <img
                    src={URL.createObjectURL(uploadedFile)}
                    alt="Uploaded"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedImageWithDimensions(null, null);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[46px] lg:h-[46px] mb-3 sm:mb-4">
                    <img src={addImageIcon} alt="Upload" className="w-full h-full" />
                  </div>
                  <div className="text-[#A4A4A4] text-xs sm:text-sm">{t('upload.clickToUpload', 'Click to upload')}</div>
                </>
              )}
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // 创建图片对象来获取尺寸
                    const img = new Image();
                    img.onload = () => {
                      // 设置文件和尺寸
                      setUploadedImageWithDimensions(file, {
                        width: img.width,
                        height: img.height
                      });
                    };
                    img.onerror = () => {
                      // 如果无法获取尺寸，仍然设置文件但不设置尺寸
                      setUploadedImageWithDimensions(file, null);
                    };
                    img.src = URL.createObjectURL(file);
                  }
                }}
              />
            </div>
          </div>
        </>
      );
    }
  };

  // Render right sidebar with generated images
  const renderRightSidebar = () => {
    // 根据当前选中的标签页选择对应的图片数组
    const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;

    return (
      <div className="w-[140px] border-l border-[#E3E4E5] py-5 px-2 overflow-y-auto overflow-x-hidden h-full flex flex-col items-center max-w-[140px]">
        {/* 生成中的 loading 圆圈 - 使用智能计算的尺寸 */}
        {isGenerating && (
          <div
            className="mb-4 rounded-lg border border-[#FF5C07] bg-[#F2F3F5]"
            style={{
              width: getGeneratingContainerSize().width,
              height: getGeneratingContainerSize().height,
              minHeight: getGeneratingContainerSize().height,
              maxHeight: getGeneratingContainerSize().height,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <CircularProgress
              progress={generationProgress}
              size="small"
              showPercentage={false}
            />
          </div>
        )}

        {/* 生成的图片历史 - 使用分离的图片状态 */}
        {currentImages.length > 0 ? (
          currentImages
            .map((image, index) => {
              // 使用图片的 id 进行选中状态判断，但如果有错误则不选中任何图片
              const isSelected = !error && selectedImage === image.id;
              return (
                <div
                  key={image.id}
                  className={`mb-4 rounded-lg cursor-pointer relative transition-all border-2 ${isSelected ? 'border-[#FF5C07] shadow-lg' : 'border-transparent hover:border-gray-200'
                    }`}
                  style={getImageContainerSize(image, dynamicImageDimensions, setDynamicImageDimensions)}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img
                    src={image.defaultUrl}
                    alt={getLocalizedText(image.description, 'zh') || `Generated ${index + 1}`}
                    className="w-full h-full rounded-lg object-cover"
                  />
                </div>
              );
            })
        ) : !isGenerating ? (
          // 空状态 - 根据当前标签页显示不同的提示
          <div className="text-center text-[#A4A4A4] text-xs mt-8">
            {selectedTab === 'text' ? t('states.noTextToImageYet', 'No text to image yet') : t('states.noImageToImageYet', 'No image to image yet')}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <LayoutNoFooter>
      <SEOHead
        title={tCommon('seo.generate.title', 'AI Coloring Page Generator - Create Custom Coloring Pages from Text & Images')}
        description={tCommon('seo.generate.description', 'Generate unique coloring pages with AI! Transform text prompts or upload images to create personalized coloring pages. Fast, free, and printable in high quality.')}
        keywords={tCommon('seo.generate.keywords', 'AI coloring generator, text to coloring page, image to coloring page, custom coloring pages, AI art generator, printable coloring pages')}
        ogTitle={tCommon('seo.generate.title', 'AI Coloring Page Generator - Create Custom Coloring Pages from Text & Images')}
        ogDescription={tCommon('seo.generate.description', 'Generate unique coloring pages with AI! Transform text prompts or upload images to create personalized coloring pages. Fast, free, and printable in high quality.')}
      />
      {/* 错误提示 */}
      {/* {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )} */}

      <div className="flex flex-col lg:flex-row h-screen bg-[#F9FAFB] relative">
        {/* Left Sidebar - 移动端隐藏，桌面端显示 */}
        <div className="hidden lg:block w-[500px] bg-white pb-[88px] overflow-y-auto h-full">
          {/* Tab Selector */}
          <div className="mx-5">
            <div className="bg-[#F2F3F5] h-12 rounded-lg flex items-center relative">
              <div
                className={`h-10 rounded-lg absolute transition-all duration-200 ${selectedTab === 'text' ? 'w-[calc(50%-4px)] bg-white left-1' :
                    selectedTab === 'image' ? 'w-[calc(50%-4px)] bg-white right-1' : ''
                  }`}
              ></div>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center ${selectedTab === 'text' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedTab('text')}
              >
                {t('tabs.textToImage', 'Text to Image')}
              </button>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedTab('image')}
              >
                {t('tabs.imageToImage', 'Image to Image')}
              </button>
            </div>
          </div>

          {/* Dynamic Left Sidebar Content */}
          {renderLeftSidebar()}

          {/* Public Visibility - Common for both tabs */}
          <div className="mx-5 mt-5 lg:mt-8 flex items-center justify-between">
            <div className="text-[14px] font-bold text-[#161616] flex items-center">
              {t('settings.visibility', 'Public Visibility')}
              <Tooltip 
                content="When enabled, your generated images will be visible to other users in the public gallery. When disabled, only you can see your generated images."
                side="top"
                className="ml-3"
              >
                <span className="w-[18px] h-[18px] cursor-help inline-block">
                  <img src={tipIcon} alt="Info" className="w-[18px] h-[18px]" />
                </span>
              </Tooltip>
            </div>
            <div className="flex items-center">
              <span className="mr-2 w-[18px] h-[18px]">
                <img src={crownIcon} alt="Premium" className="w-[18px] h-[18px]" />
              </span>
              <button
                className={`w-[30px] h-4 rounded-lg relative ${selectedTab === 'text' ? (textPublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300') : (imagePublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300')}`}
                onClick={() => selectedTab === 'text' ? setTextPublicVisibility(!textPublicVisibility) : setImagePublicVisibility(!imagePublicVisibility)}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${selectedTab === 'text' ? (textPublicVisibility ? 'right-[1px]' : 'left-[1px]') : (imagePublicVisibility ? 'right-[1px]' : 'left-[1px]')}`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* 移动端主要内容区域 */}
        <div className="flex flex-col lg:hidden h-full bg-white">          
          {/* 移动端标签选择器 */}
          <div className="bg-white px-4 pb-4 border-b border-gray-200 flex-shrink-0">
            <div className="bg-[#F2F3F5] h-12 rounded-lg flex items-center relative max-w-md mx-auto">
              <div
                className={`h-10 rounded-lg absolute transition-all duration-200 ${selectedTab === 'text' ? 'w-[calc(50%-4px)] bg-white left-1' : 'w-[calc(50%-4px)] bg-white right-1'}`}
              ></div>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center text-sm ${selectedTab === 'text' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => handleMobileTabChange('text')}
              >
{t('tabs.textToImage', 'Text to Image')}
              </button>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center text-sm ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => handleMobileTabChange('image')}
              >
{t('tabs.imageToImage', 'Image to Image')}
              </button>
            </div>
          </div>

          {/* 移动端内容 - 可滚动区域 */}
          <div ref={mobileContentRef} className="flex-1 overflow-y-auto pb-48">
            {renderContent(selectedTab)}
            
            {/* 移动端控制面板 */}
            <div className="bg-white border-t border-gray-200 p-4">
              {renderLeftSidebar()}
              
              {/* Public Visibility */}
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-bold text-[#161616] flex items-center">
                  {t('settings.visibility', 'Public Visibility')}
                  <Tooltip 
                    content="When enabled, your generated images will be visible to other users in the public gallery. When disabled, only you can see your generated images."
                    side="top"
                    className="ml-2"
                  >
                    <span className="w-4 h-4 cursor-help inline-block">
                      <img src={tipIcon} alt="Info" className="w-4 h-4" />
                    </span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <span className="mr-2 w-4 h-4">
                    <img src={crownIcon} alt="Premium" className="w-4 h-4" />
                  </span>
                  <button
                    className={`w-[30px] h-4 rounded-lg relative ${selectedTab === 'text' ? (textPublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300') : (imagePublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300')}`}
                    onClick={() => selectedTab === 'text' ? setTextPublicVisibility(!textPublicVisibility) : setImagePublicVisibility(!imagePublicVisibility)}
                  >
                    <div
                      className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${selectedTab === 'text' ? (textPublicVisibility ? 'right-[1px]' : 'left-[1px]') : (imagePublicVisibility ? 'right-[1px]' : 'left-[1px]')}`}
                    ></div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 移动端生成按钮 - 固定在底部 */}
          <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 p-4 z-50">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || (selectedTab === 'text' && !(typeof prompt === 'string' ? prompt.trim() : '')) || (selectedTab === 'image' && !uploadedFile)}
              className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                (isGenerating || (selectedTab === 'text' && !(typeof prompt === 'string' ? prompt.trim() : '')) || (selectedTab === 'image' && !uploadedFile))
                  ? 'bg-[#F2F3F5] text-[#A4A4A4] cursor-not-allowed'
                  : 'bg-[#FF5C07] text-white hover:bg-[#FF7A47]'
                }`}
            >
              <img
                src={(isGenerating || (selectedTab === 'text' && !(typeof prompt === 'string' ? prompt.trim() : '')) || (selectedTab === 'image' && !uploadedFile))
                  ? subtractIcon
                  : subtractColorIcon
                }
                alt="Subtract"
                className="w-5 h-5 mr-1"
              />
              <span className="font-bold text-lg">20</span>
              <span className="font-bold text-lg">
                {isGenerating ? t('generating.title', 'Generating...') : 
                 error ? t('actions.regenerate', 'Regenerate') :
                 t('actions.generate', 'Generate')}
              </span>
            </button>
          </div>
        </div>

        {/* 桌面端中间内容区域 */}
        <div className="hidden lg:flex lg:flex-1">
          {renderContent(selectedTab)}
        </div>

        {/* Right Sidebar - Generated Images - 桌面端显示 */}
        <div className="hidden lg:block">
          {renderRightSidebar()}
        </div>

        {/* 桌面端生成按钮 */}
        <div className="hidden lg:flex fixed bottom-0 left-0 w-[500px] h-[88px] bg-white items-center justify-center px-5">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (selectedTab === 'text' && !(typeof prompt === 'string' ? prompt.trim() : '')) || (selectedTab === 'image' && !uploadedFile)}
            className={`w-full h-12 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              (isGenerating || (selectedTab === 'text' && !(typeof prompt === 'string' ? prompt.trim() : '')) || (selectedTab === 'image' && !uploadedFile))
                ? 'bg-[#F2F3F5] text-[#A4A4A4] cursor-not-allowed'
                : 'bg-[#FF5C07] text-white hover:bg-[#FF7A47]'
              }`}
          >
            <img
              src={(isGenerating || (selectedTab === 'text' && !(typeof prompt === 'string' ? prompt.trim() : '')) || (selectedTab === 'image' && !uploadedFile))
                ? subtractIcon
                : subtractColorIcon
              }
              alt="Subtract"
              className="w-5 h-5 mr-1"
            />
            <span className="font-bold text-lg">20</span>
            <span className="font-bold text-lg">
              {isGenerating ? t('generating.title', 'Generating...') : 
               error ? t('actions.regenerate', 'Regenerate') :
               t('actions.generate', 'Generate')}
            </span>
          </button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        message={t('dialogs.deleteConfirm.message', 'Are you sure you want to delete this item?')}
        confirmText={t('dialogs.deleteConfirm.confirm', 'Delete')}
        cancelText={t('dialogs.deleteConfirm.cancel', 'Cancel')}
        confirmButtonVariant="danger"
      />

      {/* 回到顶部按钮 - 移动端使用专用滚动容器 */}
      <div className="lg:hidden">
        <BackToTop scrollContainer={mobileContentRef.current} />
      </div>
      {/* 桌面端使用默认的window滚动 */}
      <div className="hidden lg:block">
        <BackToTop />
      </div>
    </LayoutNoFooter>
  );
};

export default GeneratePage;