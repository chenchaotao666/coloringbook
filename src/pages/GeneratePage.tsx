import React, { useEffect } from 'react';
import LayoutNoFooter from '../components/layout/LayoutNoFooter';
import useGeneratePage from '../hooks/useGeneratePage';
import CircularProgress from '../components/ui/CircularProgress';
import { 
  getCenterImageSize,
  getExampleImageSize,
  getGeneratingContainerSize,
  getImageContainerSize,
  EXAMPLE_IMAGE_DIMENSIONS
} from '../utils/imageUtils';
const aiGenerateIcon = '/images/AI-generate.svg';
const crownIcon = '/images/crown.svg';
const refreshIcon = '/images/refresh.svg';
const tipIcon = '/images/tip.svg';
const subtractColorIcon = '/images/subtract-color.svg';
const subtractIcon = '/images/subtract.svg';
const downloadIcon = '/images/download.svg';
const moreIcon = '/images/more.svg';
const deleteIcon = '/images/delete.svg';
const reportIcon = '/images/report.svg';

interface GeneratePageProps {
  initialTab?: 'text' | 'image';
}

const GeneratePage: React.FC<GeneratePageProps> = ({ initialTab = 'text' }) => {
  // 状态：存储动态获取的图片尺寸（用于Text to Image和Image to Image模式）
  const [dynamicImageDimensions, setDynamicImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});

  // 跟踪是否是初始加载
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // 控制更多选项菜单的显示
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);

  // 使用我们创建的 Hook 来管理状态和 API 调用
  const {
    // 状态
    prompt,
    selectedTab,
    selectedRatio,
    publicVisibility,
    selectedImage,
    uploadedFile,

    generatedImages,
    exampleImages,
    styleSuggestions,
    isGenerating,
    isLoadingExamples,
    error,
    generationProgress,

    // 操作
    setPrompt,
    setSelectedTab,
    setSelectedRatio,
    setPublicVisibility,
    setSelectedImage,
    setUploadedImageWithDimensions,
    generateImages,
    recreateExample,
    downloadImage,
    clearError,
    refreshExamples,
    refreshStyleSuggestions,
    deleteImage,
  } = useGeneratePage(initialTab);

  // 当initialTab变化时更新selectedTab
  useEffect(() => {
    setSelectedTab(initialTab);
  }, [initialTab, setSelectedTab]);

  // 标记初始加载完成
  useEffect(() => {
    if (generatedImages.length >= 0) { // 即使是空数组也表示已经加载完成
      setIsInitialLoad(false);
    }
  }, [generatedImages]);

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
    if (generatedImages.length > 0 && !isGenerating) {
      const latestImage = generatedImages[0]; // 假设数组已按时间排序
      // 如果当前没有选中图片，或者当前选中的图片不在列表中，则选择最新的
      if (!selectedImage || !generatedImages.find(img => img.id === selectedImage)) {
        setSelectedImage(latestImage.id);
      }
    }
  }, [generatedImages, isGenerating, selectedImage, setSelectedImage, isInitialLoad]);


  // 事件处理函数
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImage(imageId);
  };

  const handleGenerate = async () => {
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

  const handleStyleSuggestionClick = (styleName: string) => {
    setPrompt(prompt ? `${prompt}, ${styleName}` : styleName);
  };

  const handleRefreshStyleSuggestions = async () => {
    await refreshStyleSuggestions();
  };

  const handleMoreMenuToggle = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const handleDelete = async () => {
    if (selectedImage) {
      try {
        // 显示确认对话框
        const confirmed = window.confirm('确定要删除这张图片吗？此操作无法撤销。');
        if (!confirmed) {
          setShowMoreMenu(false);
          return;
        }

        // 调用删除方法
        const success = await deleteImage(selectedImage);
        
        if (success) {
          // 显示成功提示
          alert('图片删除成功！');
        } else {
          // 删除失败
          alert('删除图片失败，请稍后重试。');
        }
      } catch (error) {
        console.error('Delete image error:', error);
        alert('删除图片时发生错误，请稍后重试。');
      } finally {
        setShowMoreMenu(false);
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

  // 通用内容渲染方法
  const renderContent = (mode: 'text' | 'image') => {
    const config = {
      text: {
        title: 'Text to coloring page',
        description: 'Create high-quality coloring sheets for free with coloring page generator. Spark your kids\' creativity with AI-designed coloring pages.'
      },
      image: {
        title: 'Image to coloring page', 
        description: 'Upload your image and transform your photo into an amazing coloring page in just seconds, unleashing your imagination.'
      }
    };

    return (
      <div className="flex-1 px-10 flex flex-col pb-20">
        {/* 固定的文字部分 */}
        <div className="text-center pt-32 pb-8">
          <h1 className="text-3xl font-bold text-[#161616] capitalize">{config[mode].title}</h1>
          <p className="text-[#6B7280] text-sm mt-2 max-w-[600px] mx-auto">
            {config[mode].description}
          </p>
        </div>

        {/* 图片内容区域 - 固定高度 */}
        <div className="flex-1 flex flex-col items-center">
          {selectedImage || isGenerating ? (
            <div className="flex flex-col items-center">
              {(() => {
                const imageSize = getCenterImageSize(mode, isGenerating, selectedImage, generatedImages, dynamicImageDimensions, setDynamicImageDimensions);
                return (
                  <div 
                    className="bg-[#F2F3F5] rounded-2xl border border-[#EDEEF0] relative flex items-center justify-center transition-all duration-300"
                    style={imageSize.style}
                  >
                    {isGenerating ? (
                      <div className="flex flex-col items-center">
                        <CircularProgress
                          progress={generationProgress}
                          size="large"
                          showPercentage={false}
                        />
                        <div className="mt-6 text-center">
                          <div className="text-[#161616] text-2xl font-semibold">
                            {Math.round(generationProgress)}%
                          </div>
                          <div className="text-[#6B7280] text-base mt-1">
                            Generating...
                          </div>
                        </div>
                      </div>
                    ) : selectedImage ? (
                      (() => {
                        const currentImage = generatedImages.find(img => img.id === selectedImage);
                        return currentImage ? (
                          <img
                            src={currentImage.defaultUrl}
                            alt="Selected coloring page"
                            className="w-full h-full rounded-lg"
                          />
                        ) : null;
                      })()
                    ) : null}
                  </div>
                );
              })()}

              {!isGenerating && (
                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={() => handleDownload('png')}
                    className="h-12 px-4 bg-[#F2F3F5] rounded-lg flex items-center gap-2 hover:bg-[#E5E7EB] transition-colors"
                  >
                    <span className="w-6 h-6">
                      <img src={downloadIcon || aiGenerateIcon} alt="Download" className="w-6 h-6" />
                    </span>
                    <span className="text-[#161616] font-medium">Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleDownload('pdf')}
                    className="h-12 px-4 bg-[#F2F3F5] rounded-lg flex items-center gap-2 hover:bg-[#E5E7EB] transition-colors"
                  >
                    <span className="w-6 h-6">
                      <img src={downloadIcon || aiGenerateIcon} alt="Download" className="w-6 h-6" />
                    </span>
                    <span className="text-[#161616] font-medium">Download PDF</span>
                  </button>

                  <div className="relative more-menu-container">
                    <button 
                      onClick={handleMoreMenuToggle}
                      className="w-12 h-12 bg-[#F2F3F5] rounded-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors"
                    >
                      <span className="w-6 h-6">
                        <img src={moreIcon || refreshIcon} alt="More options" className="w-6 h-6" />
                      </span>
                    </button>

                    {/* 下拉菜单 */}
                    {showMoreMenu && (
                      <div className="absolute top-full mt-2 right-0 bg-white border border-[#E5E7EB] rounded-lg shadow-lg py-2 min-w-[120px] z-50">
                        <button
                          onClick={handleDelete}
                          className="w-full px-4 py-2 text-left text-[#161616] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <img src={deleteIcon} alt="Delete" className="w-4 h-4" />
                          <span className="text-sm">Delete</span>
                        </button>
                        <button
                          onClick={handleReport}
                          className="w-full px-4 py-2 text-left text-[#161616] hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <img src={reportIcon} alt="Report" className="w-4 h-4" />
                          <span className="text-sm">Report</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // 只有在没有历史照片时才显示Example
            generatedImages.length === 0 && (
              <div>
                <div className="w-full max-w-[795px] mx-auto flex justify-between items-center">
                  <div className="text-[#161616] font-medium text-sm">Example</div>
                  <div className="flex items-center text-[#6B7280] text-sm cursor-pointer" onClick={refreshExamples}>
                    {isLoadingExamples ? 'Loading...' : 'Change'}
                    <img src={refreshIcon} alt="Change" className="w-4 h-4 ml-1" />
                  </div>
                </div>

                {/* Example Images */}
                <div className="mt-2 flex justify-center gap-6">
                  {exampleImages.length > 0 ? exampleImages.map((example) => {
                    const exampleSize = getExampleImageSize(example.id, example.defaultUrl, EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH, dynamicImageDimensions, setDynamicImageDimensions);
                    return (
                      <div
                        key={example.id}
                        className="relative bg-white rounded-2xl border border-[#EDEEF0]"
                        style={exampleSize.style}
                      >
                        <img
                          src={example.defaultUrl}
                          alt={example.description || `Example ${example.id}`}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                        <button
                          onClick={() => handleRecreateExample(example.id)}
                          className="absolute top-3 left-3 bg-[#FF5C07] text-white text-xs py-1 px-2 rounded-full hover:bg-[#FF7A47] transition-all duration-300 cursor-pointer"
                        >
                          Recreate
                        </button>
                      </div>
                    );
                  }) : (
                    // 加载状态
                    [1, 2, 3].map((index) => {
                      const exampleSize = getExampleImageSize(undefined, undefined, EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH, dynamicImageDimensions, setDynamicImageDimensions);
                      return (
                        <div
                          key={index}
                          className="relative bg-white rounded-2xl border border-[#EDEEF0] animate-pulse"
                          style={exampleSize.style}
                        >
                          <div className="w-full h-full bg-gray-200 rounded-2xl"></div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  // Render left sidebar based on selected tab
  const renderLeftSidebar = () => {
    if (selectedTab === 'text') {
      return (
        <>
          {/* Prompt Section */}
          <div className="mx-5 mt-5">
            <div className="text-[14px] font-bold text-[#161616] mb-2">Prompt</div>
            <div className="relative">
              <textarea
                className="w-full h-[180px] bg-[#F2F3F5] rounded-lg border border-[#EDEEF0] p-3 text-sm resize-none focus:outline-none"
                placeholder="What do you want to create?"
                value={prompt}
                onChange={handlePromptChange}
                maxLength={1000}
              ></textarea>

              <div className="absolute bottom-2 right-4 text-xs text-[#A4A4A4]">
                {prompt.length}/1000
              </div>

              <div className="absolute bottom-2 left-3 bg-white rounded-full px-3 py-1 flex items-center">
                <span className="w-4 h-4 mr-2">
                  <img src={aiGenerateIcon} alt="AI Generate" className="w-4 h-4" />
                </span>
                <span className="text-[#6B7280] text-sm">Generate with AI</span>
              </div>
            </div>
          </div>

          {/* Ideas Section */}
          <div className="mx-5 mt-5">
            <div className="text-[#6B7280] text-xs">
              Ideas：
              {styleSuggestions.slice(0, 4).map((style, index) => (
                <span
                  key={style.id}
                  className={`${index === 0 ? "ml-2" : "ml-3"} cursor-pointer hover:text-[#FF5C07] transition-colors`}
                  onClick={() => handleStyleSuggestionClick(style.name)}
                >
                  {style.name}
                </span>
              ))}
              <span className="float-right cursor-pointer hover:opacity-70 transition-opacity" onClick={handleRefreshStyleSuggestions}>
                <img src={refreshIcon} alt="Refresh" className="w-4 h-4" />
              </span>
            </div>
            <div className="text-[#6B7280] text-xs mt-2">
              {styleSuggestions.slice(4, 6).map((style, index) => (
                <span
                  key={style.id}
                  className={`${index === 0 ? "" : "ml-3"} cursor-pointer hover:text-[#FF5C07] transition-colors`}
                  onClick={() => handleStyleSuggestionClick(style.name)}
                >
                  {style.name}
                </span>
              ))}
            </div>
          </div>

          {/* Ratio Selector */}
          <div className="mx-5 mt-10">
            <div className="text-[14px] font-bold text-[#161616] mb-2">Ratio</div>
            <div className="bg-[#F2F3F5] h-12 rounded-lg flex items-center relative">
              <div
                className={`h-10 rounded-lg absolute transition-all duration-200 ${selectedRatio === '3:4' ? 'w-[114px] bg-white left-1' :
                    selectedRatio === '4:3' ? 'w-[114px] bg-white left-[118px]' :
                      'w-[114px] bg-white left-[232px]'
                  }`}
              ></div>
              <button
                className={`w-[114px] h-10 z-10 flex items-center justify-center ${selectedRatio === '3:4' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedRatio('3:4')}
              >
                3:4
              </button>
              <button
                className={`w-[114px] h-10 z-10 flex items-center justify-center ${selectedRatio === '4:3' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedRatio('4:3')}
              >
                4:3
              </button>
              <button
                className={`w-[114px] h-10 z-10 flex items-center justify-center ${selectedRatio === '1:1' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
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
          <div className="mx-5 mt-[18px]">
            <div className="text-[14px] font-bold text-[#161616] mb-2">Image</div>
            <div
              className="w-full h-[202px] bg-[#F2F3F5] rounded-lg border border-[#EDEEF0] flex flex-col items-center justify-center cursor-pointer hover:bg-[#E5E7EB] transition-colors relative"
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
                  <div className="w-[46px] h-[46px] mb-4">
                    <img src={aiGenerateIcon} alt="Upload" className="w-full h-full" />
                  </div>
                  <div className="text-[#A4A4A4] text-xs">Click to upload</div>
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

        {/* 生成的图片历史 */}
        {generatedImages.length > 0 ? (
          generatedImages
            .map((image, index) => {
              // 使用图片的 id 进行选中状态判断
              const isSelected = selectedImage === image.id;
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
                    alt={image.description || `Generated ${index + 1}`}
                    className="w-full h-full rounded-lg object-cover"
                  />
                </div>
              );
            })
        ) : !isGenerating ? (
          // 空状态
          <div className="text-center text-[#A4A4A4] text-xs mt-8">
            No images yet
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <LayoutNoFooter>
      {/* 错误提示 */}
      {error && (
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
      )}

      <div className="flex h-full bg-[#F9FAFB] relative overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[400px] bg-white pb-[88px] overflow-y-auto h-full">
          {/* Tab Selector */}
          <div className="mx-5 mt-5">
            <div className="bg-[#F2F3F5] h-12 rounded-lg flex items-center relative">
              <div
                className={`h-10 rounded-lg absolute transition-all duration-200 ${selectedTab === 'text' ? 'w-[174px] bg-white left-1' :
                    selectedTab === 'image' ? 'w-[174px] bg-white left-[175px]' : ''
                  }`}
              ></div>
              <button
                className={`w-[174px] h-10 z-10 flex items-center justify-center ${selectedTab === 'text' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedTab('text')}
              >
                Text to Image
              </button>
              <button
                className={`w-[174px] h-10 z-10 flex items-center justify-center ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedTab('image')}
              >
                Image to Image
              </button>
            </div>
          </div>

          {/* Dynamic Left Sidebar Content */}
          {renderLeftSidebar()}

          {/* Public Visibility - Common for both tabs */}
          <div className="mx-5 mt-5 flex items-center justify-between">
            <div className="text-[14px] font-bold text-[#161616] flex items-center">
              Public Visibility
              <span className="ml-3 w-[18px] h-[18px]">
                <img src={tipIcon} alt="Info" className="w-[18px] h-[18px]" />
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2 w-[18px] h-[18px]">
                <img src={crownIcon} alt="Premium" className="w-[18px] h-[18px]" />
              </span>
              <button
                className={`w-[30px] h-4 rounded-lg relative ${publicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300'}`}
                onClick={() => setPublicVisibility(!publicVisibility)}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${publicVisibility ? 'right-[1px]' : 'left-[1px]'
                    }`}
                ></div>
              </button>
            </div>
          </div>
        </div>

        {/* Center Content Area - Dynamic based on selected tab */}
        {renderContent(selectedTab)}

        {/* Right Sidebar - Generated Images */}
        {renderRightSidebar()}

        {/* Generate Button - Fixed at the bottom */}
        <div className="fixed bottom-0 left-0 w-[400px] h-[88px] bg-white flex items-center justify-center">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (selectedTab === 'text' && !prompt.trim()) || (selectedTab === 'image' && !uploadedFile)}
            className={`w-[360px] h-12 rounded-lg flex items-center justify-center gap-2 transition-colors ${isGenerating || (selectedTab === 'text' && !prompt.trim()) || (selectedTab === 'image' && !uploadedFile)
                ? 'bg-[#F2F3F5] text-[#A4A4A4] cursor-not-allowed'
                : 'bg-[#FF5C07] text-white hover:bg-[#FF7A47]'
              }`}
          >
            <img
              src={isGenerating || (selectedTab === 'text' && !prompt.trim()) || (selectedTab === 'image' && !uploadedFile)
                ? subtractIcon
                : subtractColorIcon
              }
              alt="Subtract"
              className="w-5 h-5 mr-1"
            />
            <span className="font-bold text-lg">20</span>
            <span className="font-bold text-lg">
              {isGenerating ? 'Generating...' : 'Generate'}
            </span>
          </button>
        </div>
      </div>
    </LayoutNoFooter>
  );
};

export default GeneratePage; 