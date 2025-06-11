import React, { useEffect } from 'react';
import LayoutNoFooter from '../components/layout/LayoutNoFooter';
import useGeneratePage from '../hooks/useGeneratePage';
import { downloadSelectedImage } from '../utils/downloadUtils';
import CircularProgress from '../components/ui/CircularProgress';
const aiGenerateIcon = '/images/AI-generate.svg';
const crownIcon = '/images/crown.svg';
const refreshIcon = '/images/refresh.svg';
const tipIcon = '/images/tip.svg';
const subtractColorIcon = '/images/subtract-color.svg';
const subtractIcon = '/images/subtract.svg';
const downloadIcon = '/images/download.svg';
const moreIcon = '/images/more.svg';

interface GeneratePageProps {
  initialTab?: 'text' | 'image';
}

const GeneratePage: React.FC<GeneratePageProps> = ({ initialTab = 'text' }) => {
  // 右侧边栏图片尺寸状态
  const [sidebarImageDimensions, setSidebarImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});

  // 状态：存储动态获取的图片尺寸（用于Text to Image和Image to Image模式）
  const [dynamicImageDimensions, setDynamicImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});
  const [exampleImageDimensions, setExampleImageDimensions] = React.useState<{ [key: string]: { width: number; height: number } }>({});

  // 跟踪是否是初始加载
  const [isInitialLoad, setIsInitialLoad] = React.useState(true);

  // 使用我们创建的 Hook 来管理状态和 API 调用
  const {
    // 状态
    prompt,
    selectedTab,
    selectedRatio,
    publicVisibility,
    selectedImage,
    uploadedFile,
    uploadedImageDimensions,
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

  // 根据比例计算缩略图容器尺寸 - 移到组件顶层
  const getContainerSize = (ratio: string) => {
    switch (ratio) {
      case '3:4':
        return { width: '90px', height: '120px' }; // 3:4 竖向比例
      case '4:3':
        return { width: '110px', height: '82px' }; // 4:3 横向比例，调整为适合边栏宽度
      case '1:1':
        return { width: '100px', height: '100px' }; // 1:1 正方形
      default:
        return { width: '100px', height: '100px' };
    }
  };

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

  // Text to Image Content
  const renderTextToImageContent = () => {
    // 根据比例计算中间图片容器宽度（固定高度460px）
    const getCenterImageWidth = (ratio: string) => {
      switch (ratio) {
        case '3:4':
          return 'w-[345px]';
        case '4:3':
          return 'w-[613px]';
        case '1:1':
          return 'w-[460px]';
        default:
          return 'w-[460px]';
      }
    };

    // 根据图片本身的比例计算 Example Images 的容器尺寸
    const getExampleImageSize = (imageUrl?: string) => {
      // 固定宽度，高度根据图片实际比例自适应
      const fixedWidth = 250;

      if (imageUrl && dynamicImageDimensions[imageUrl]) {
        const { width, height } = dynamicImageDimensions[imageUrl];
        const aspectRatio = width / height;

        // 根据固定宽度和实际比例计算高度
        const calculatedHeight = Math.round(fixedWidth / aspectRatio);

        return {
          width: fixedWidth,
          height: calculatedHeight,
          style: { width: `${fixedWidth}px`, height: `${calculatedHeight}px` }
        };
      }

      // 如果还没有获取到图片尺寸，异步获取 - 添加检查避免重复加载
      if (imageUrl && !dynamicImageDimensions[imageUrl] && !dynamicImageDimensions[`loading_${imageUrl}`]) {
        // 标记为正在加载
        setDynamicImageDimensions(prev => ({
          ...prev,
          [`loading_${imageUrl}`]: { width: 0, height: 0 }
        }));

        const img = new Image();
        img.onload = () => {
          setDynamicImageDimensions(prev => {
            const newState = { ...prev };
            delete newState[`loading_${imageUrl}`];
            newState[imageUrl] = { width: img.width, height: img.height };
            return newState;
          });
        };
        img.onerror = () => {
          setDynamicImageDimensions(prev => {
            const newState = { ...prev };
            delete newState[`loading_${imageUrl}`];
            return newState;
          });
        };
        img.src = imageUrl;
      }

      // 默认尺寸（正方形）
      return {
        width: fixedWidth,
        height: fixedWidth,
        style: { width: `${fixedWidth}px`, height: `${fixedWidth}px` }
      };
    };

    // 获取当前应该使用的容器尺寸
    const getCurrentImageSize = () => {
      if (isGenerating) {
        // 在 Image to Image 模式下，生成过程中返回1:1尺寸
        if (selectedTab === 'image') {
          return { width: 'w-[460px]', height: 'h-[460px]' };
        }
        return { width: getCenterImageWidth(selectedRatio), height: 'h-[460px]' };
      }

      // 在 Text to Image 模式下，如果有选中的图片，使用图片自身的 ratio
      if (selectedImage && selectedTab === 'text') {
        const currentImage = generatedImages.find(img => img.id === selectedImage);
        if (currentImage && (currentImage as any).ratio) {
          // 使用图片自身的 ratio 来显示
          return { width: getCenterImageWidth((currentImage as any).ratio), height: 'h-[460px]' };
        }
      }

      // 默认情况下，使用用户选择的 ratio
      return { width: getCenterImageWidth(selectedRatio), height: 'h-[460px]' };
    };

    return (
      <div className="flex-1 px-10 flex flex-col pb-20">
        {/* 固定的文字部分 */}
        <div className="text-center pt-32 pb-8">
          <h1 className="text-3xl font-bold text-[#161616] capitalize">Text to coloring page</h1>
          <p className="text-[#6B7280] text-sm mt-2 max-w-[600px] mx-auto">
            Create high-quality coloring sheets for free with coloring page generator.
            Spark your kids' creativity with AI-designed coloring pages.
          </p>
        </div>

        {/* 图片内容区域 - 固定高度 */}
        <div className="flex-1 flex flex-col items-center">
          {selectedImage || isGenerating ? (
            <div className="flex flex-col items-center">
              <div className={`${getCurrentImageSize().width} ${getCurrentImageSize().height} bg-[#F2F3F5] rounded-2xl border border-[#EDEEF0] relative flex items-center justify-center transition-all duration-300`}>
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

                  <button className="w-12 h-12 bg-[#F2F3F5] rounded-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                    <span className="w-6 h-6">
                      <img src={moreIcon || refreshIcon} alt="More options" className="w-6 h-6" />
                    </span>
                  </button>
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
                    const exampleSize = getExampleImageSize(example.defaultUrl);
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
                      const exampleSize = getExampleImageSize();
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

  // Image to Image Content
  const renderImageToImageContent = () => {
    // 根据图片本身的比例计算 Example Images 的容器尺寸
    const getExampleImageSize = (imageUrl?: string) => {
      // 固定宽度，高度根据图片实际比例自适应
      const fixedWidth = 250;

      if (imageUrl && exampleImageDimensions[imageUrl]) {
        const { width, height } = exampleImageDimensions[imageUrl];
        const aspectRatio = width / height;

        // 根据固定宽度和实际比例计算高度
        const calculatedHeight = Math.round(fixedWidth / aspectRatio);

        return {
          width: fixedWidth,
          height: calculatedHeight,
          style: { width: `${fixedWidth}px`, height: `${calculatedHeight}px` }
        };
      }

      // 如果还没有获取到图片尺寸，异步获取
      if (imageUrl && !exampleImageDimensions[imageUrl]) {
        const img = new Image();
        img.onload = () => {
          setExampleImageDimensions(prev => ({
            ...prev,
            [imageUrl]: { width: img.width, height: img.height }
          }));
        };
        img.src = imageUrl;
      }

      // 默认尺寸（正方形）
      return {
        width: fixedWidth,
        height: fixedWidth,
        style: { width: `${fixedWidth}px`, height: `${fixedWidth}px` }
      };
    };

    // 根据比例计算中间图片容器宽度和高度
    const getCenterImageSize = () => {
      // 在 Image to Image 模式下，如果正在生成，返回1:1尺寸
      if (selectedTab === 'image' && isGenerating) {
        return { width: 'w-[460px]', height: 'h-[460px]' };
      }

      // 在 Image to Image 模式下，如果有上传图片和尺寸信息，使用实际比例
      if (selectedTab === 'image' && uploadedFile && uploadedImageDimensions) {
        const { width, height } = uploadedImageDimensions;
        const aspectRatio = width / height;

        // 根据宽高比智能选择基准尺寸
        let finalWidth, finalHeight;

        if (aspectRatio >= 1) {
          // 横向图片或正方形：以宽度为基准，最大宽度600px
          const maxWidth = 600;
          finalWidth = Math.min(maxWidth, Math.max(400, maxWidth));
          finalHeight = Math.round(finalWidth / aspectRatio);

          // 如果计算出的高度太大，以高度为基准重新计算
          if (finalHeight > 460) {
            finalHeight = 460;
            finalWidth = Math.round(finalHeight * aspectRatio);
          }
        } else {
          // 竖向图片：以高度为基准，最大高度460px
          const maxHeight = 460;
          finalHeight = Math.min(maxHeight, Math.max(300, maxHeight));
          finalWidth = Math.round(finalHeight * aspectRatio);

          // 确保最小宽度
          if (finalWidth < 300) {
            finalWidth = 300;
            finalHeight = Math.round(finalWidth / aspectRatio);
          }
        }

        return {
          width: `w-[${finalWidth}px]`,
          height: `h-[${finalHeight}px]`
        };
      }

      // 如果有选中的图片，使用默认比例（因为HomeImage没有ratio属性）
      if (selectedImage && !isGenerating) {
        const currentImage = generatedImages.find(img => img.id === selectedImage);
        // 使用默认的selectedRatio

        // 如果是 Image to Image 生成的图片，使用图片的实际尺寸
        if (!selectedRatio) {
          // 使用1:1作为默认比例
          return { width: '90px', height: '90px' };
        }

        // 使用选中的比例
        return getContainerSize(selectedRatio);
      }

      // 默认情况下，使用选中的比例
      return getContainerSize(selectedRatio);

      // 回退到固定比例
      switch (selectedRatio) {
        case '3:4':
          return { width: 'w-[345px]', height: 'h-[460px]' };
        case '4:3':
          return { width: 'w-[613px]', height: 'h-[460px]' };
        case '1:1':
          return { width: 'w-[460px]', height: 'h-[460px]' };
        default:
          return { width: 'w-[460px]', height: 'h-[460px]' };
      }
    };

    return (
      <div className="flex-1 px-10 flex flex-col pb-20">
        {/* 固定的文字部分 */}
        <div className="text-center pt-32 pb-8">
          <h1 className="text-3xl font-bold text-[#161616] capitalize">Image to coloring page</h1>
          <p className="text-[#6B7280] text-sm mt-2 max-w-[600px] mx-auto">
            Upload your image and transform your photo into an amazing coloring page in just seconds, unleashing your imagination.
          </p>
        </div>

        {/* 图片内容区域 - 固定高度 */}
        <div className="flex-1 flex flex-col items-center">
          {selectedImage || isGenerating ? (
            <div className="flex flex-col items-center">
              {(() => {
                const imageSize = getCenterImageSize();
                return (
                  <div className={`${imageSize.width} ${imageSize.height} bg-[#F2F3F5] rounded-2xl border border-[#EDEEF0] relative flex items-center justify-center transition-all duration-300`}>
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

                  <button className="w-12 h-12 bg-[#F2F3F5] rounded-lg flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
                    <span className="w-6 h-6">
                      <img src={moreIcon || refreshIcon} alt="More options" className="w-6 h-6" />
                    </span>
                  </button>
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
                    const exampleSize = getExampleImageSize(example.defaultUrl);

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
                      const exampleSize = getExampleImageSize();
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
    // 获取生成过程中应该使用的容器尺寸
    const getGeneratingContainerSize = () => {
      // 在 Text to Image 模式下，根据选中的比例计算
      if (selectedTab === 'text') {
        switch (selectedRatio) {
          case '3:4':
            return { width: '68px', height: '90px' };
          case '4:3':
            return { width: '90px', height: '68px' };
          case '1:1':
            return { width: '90px', height: '90px' };
          default:
            return { width: '90px', height: '90px' };
        }
      }
      
      // 在 Image to Image 模式下，如果有上传图片的尺寸信息，使用实际比例
      if (selectedTab === 'image' && uploadedImageDimensions) {
        const { width, height } = uploadedImageDimensions;
        const aspectRatio = width / height;
        
        const maxSize = 90;
        
        if (aspectRatio >= 1) {
          const calculatedHeight = Math.round(maxSize / aspectRatio);
          return { 
            width: `${maxSize}px`, 
            height: `${Math.max(60, calculatedHeight)}px`
          };
        } else {
          const calculatedWidth = Math.round(maxSize * aspectRatio);
          return { 
            width: `${Math.max(60, calculatedWidth)}px`, 
            height: `${maxSize}px` 
          };
        }
      }
      
      // 默认使用正方形
      return { width: '90px', height: '90px' };
    };

    // 获取图片容器尺寸的辅助函数 - 根据图片的 ratio 或实际尺寸计算比例
    const getImageContainerSize = (image: any) => {
      // 在 Text to Image 模式下，优先使用图片的 ratio 属性
      if (selectedTab === 'text' && image.ratio) {
        switch (image.ratio) {
          case '3:4':
            return { width: '68px', height: '90px' };
          case '4:3':
            return { width: '90px', height: '68px' };
          case '1:1':
            return { width: '90px', height: '90px' };
          default:
            return { width: '90px', height: '90px' };
        }
      }
      
      // 在 Image to Image 模式下，或者没有 ratio 属性时，使用实际尺寸计算
      // 如果图片有尺寸信息，根据实际比例计算容器尺寸
      if (image.dimensions && image.dimensions.width && image.dimensions.height) {
        const { width, height } = image.dimensions;
        const aspectRatio = width / height;
        
        // 设置最大尺寸为90px，根据比例计算另一边
        const maxSize = 90;
        
        if (aspectRatio >= 1) {
          // 横向图片：宽度为90px，高度按比例缩放
          const calculatedHeight = Math.round(maxSize / aspectRatio);
          return { 
            width: `${maxSize}px`, 
            height: `${Math.max(60, calculatedHeight)}px` // 最小高度60px
          };
        } else {
          // 竖向图片：高度为90px，宽度按比例缩放
          const calculatedWidth = Math.round(maxSize * aspectRatio);
          return { 
            width: `${Math.max(60, calculatedWidth)}px`, // 最小宽度60px
            height: `${maxSize}px` 
          };
        }
      }
      
      // 如果没有尺寸信息，尝试从图片URL异步获取尺寸
      if (image.defaultUrl && !sidebarImageDimensions[image.defaultUrl]) {
        // 异步获取图片尺寸
        const img = new Image();
        img.onload = () => {
          setSidebarImageDimensions(prev => ({
            ...prev,
            [image.defaultUrl]: { width: img.width, height: img.height }
          }));
        };
        img.src = image.defaultUrl;
      }
      
      // 如果已经异步获取到了尺寸，使用获取到的尺寸
      if (sidebarImageDimensions[image.defaultUrl]) {
        const { width, height } = sidebarImageDimensions[image.defaultUrl];
        const aspectRatio = width / height;
        
        const maxSize = 90;
        
        if (aspectRatio >= 1) {
          const calculatedHeight = Math.round(maxSize / aspectRatio);
          return { 
            width: `${maxSize}px`, 
            height: `${Math.max(60, calculatedHeight)}px`
          };
        } else {
          const calculatedWidth = Math.round(maxSize * aspectRatio);
          return { 
            width: `${Math.max(60, calculatedWidth)}px`, 
            height: `${maxSize}px` 
          };
        }
      }
      
      // 默认情况下使用正方形
      return { width: '90px', height: '90px' };
    };

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
                  style={getImageContainerSize(image)}
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
        {selectedTab === 'text' ? renderTextToImageContent() : renderImageToImageContent()}

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