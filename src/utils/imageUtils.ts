/**
 * 图片工具函数
 */

// ===== 尺寸常量定义 =====

/**
 * 中间显示区域的最大尺寸
 */
export const CENTER_IMAGE_DIMENSIONS = {
  // Text to Image 模式的最大尺寸
  TEXT_MAX_WIDTH: 600,
  TEXT_MAX_HEIGHT: 600,
  // Image to Image 模式的最大尺寸
  IMAGE_MAX_WIDTH: 600,
  IMAGE_MAX_HEIGHT: 600,
  // 生成中的默认尺寸
  GENERATING_WIDTH: 460,
  GENERATING_HEIGHT: 460,
  // 移动端尺寸限制
  MOBILE_MAX_WIDTH: 320,
  MOBILE_MAX_HEIGHT: 320,
  MOBILE_GENERATING_WIDTH: 280,
  MOBILE_GENERATING_HEIGHT: 280
};

/**
 * 示例图片的尺寸
 */
export const EXAMPLE_IMAGE_DIMENSIONS = {
  // 示例图片的固定宽度
  FIXED_WIDTH: 250
} as const;

/**
 * 右侧边栏图片的尺寸
 */
export const SIDEBAR_IMAGE_DIMENSIONS = {
  // 最大尺寸
  MAX_WIDTH: 110,
  MAX_HEIGHT: 110,
  // 最小尺寸
  MIN_WIDTH: 90,
  MIN_HEIGHT: 90
} as const;

/**
 * 根据图片URL获取图片的实际尺寸
 * @param imageUrl 图片URL
 * @returns Promise<{width: number, height: number}> 图片尺寸
 */
export const getImageDimensionsFromUrl = (imageUrl: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // 处理跨域问题
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
};

/**
 * 计算图片在指定最大尺寸内的缩放尺寸（保持宽高比）
 * @param originalWidth 原始宽度
 * @param originalHeight 原始高度
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @returns {width: number, height: number} 缩放后的尺寸
 */
export const calculateScaledDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  // 计算缩放比例，确保图片不超出最大尺寸限制
  const scaleByWidth = maxWidth / originalWidth;
  const scaleByHeight = maxHeight / originalHeight;
  const scale = Math.min(scaleByWidth, scaleByHeight, 1); // 不放大，只缩小

  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale)
  };
};

// ===== 图片大小计算相关函数 =====

/**
 * 图片尺寸缓存类型
 */
export type ImageDimensionsCache = { [key: string]: { width: number; height: number } };

/**
 * 图片尺寸更新函数类型
 */
export type SetImageDimensionsFunction = (updater: (prev: ImageDimensionsCache) => ImageDimensionsCache) => void;

/**
 * 通用的图片大小计算函数
 * @param imageId 图片ID（用作缓存键）
 * @param imageUrl 图片URL（用于获取尺寸）
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param minWidth 最小宽度（可选）
 * @param minHeight 最小高度（可选）
 * @param dimensionsCache 图片尺寸缓存
 * @param setDimensionsCache 更新图片尺寸缓存的函数
 * @returns 计算后的图片尺寸样式
 */
export const getImageSize = (
  imageId: string,
  imageUrl: string,
  maxWidth: number,
  maxHeight: number,
  minWidth?: number,
  minHeight?: number,
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction
) => {
  // 创建缓存键，包含所有尺寸参数，确保不同尺寸约束下的图片有独立的缓存
  const cacheKey = `${imageId}_${maxWidth}_${maxHeight}_${minWidth || 0}_${minHeight || 0}`;
  
  // 如果已经获取到了处理后的图片尺寸，直接使用
  if (imageId && dimensionsCache && dimensionsCache[cacheKey]) {
    const { width, height } = dimensionsCache[cacheKey];
    return {
      width: `${width}px`,
      height: `${height}px`
    };
  }
  
  // 如果还没有获取到图片尺寸，异步获取
  // 检查是否已经失败过，避免重复尝试失败的图片
  if (imageId && imageUrl && dimensionsCache && setDimensionsCache && 
      !dimensionsCache[cacheKey] && 
      !dimensionsCache[`loading_${cacheKey}`] && 
      !dimensionsCache[`failed_${cacheKey}`]) {
    
    setDimensionsCache(prev => ({
      ...prev,
      [`loading_${cacheKey}`]: { width: 0, height: 0 }
    }));

    getImageDimensionsFromUrl(imageUrl)
      .then((originalDimensions) => {
        // 应用尺寸约束，计算最终显示尺寸
        const scaledDimensions = calculateScaledDimensions(
          originalDimensions.width, 
          originalDimensions.height, 
          maxWidth, 
          maxHeight
        );
        
        // 应用最小尺寸约束
        const finalDimensions = {
          width: minWidth ? Math.max(minWidth, scaledDimensions.width) : scaledDimensions.width,
          height: minHeight ? Math.max(minHeight, scaledDimensions.height) : scaledDimensions.height
        };
        
        setDimensionsCache(prev => {
          const newState = { ...prev };
          delete newState[`loading_${cacheKey}`];
          // 存储处理后的尺寸，而不是原始尺寸
          newState[cacheKey] = finalDimensions;
          return newState;
        });
      })
      .catch((error) => {
        console.error('Failed to get image dimensions:', error);
        setDimensionsCache(prev => {
          const newState = { ...prev };
          delete newState[`loading_${cacheKey}`];
          // 设置失败标记，防止重复尝试
          newState[`failed_${cacheKey}`] = { width: 0, height: 0 };
          return newState;
        });
      });
  }

  // 默认情况下使用最大尺寸
  return {
    width: `${maxWidth}px`,
    height: `${maxHeight}px`
  };
};

/**
 * 计算中间显示图片的大小
 * @param mode 模式：'text' 或 'image'
 * @param isGenerating 是否正在生成
 * @param selectedImage 选中的图片ID
 * @param generatedImages 生成的图片列表
 * @param dimensionsCache 图片尺寸缓存
 * @param setDimensionsCache 更新图片尺寸缓存的函数
 * @returns 计算后的图片尺寸样式（内联样式对象）
 */
export const getCenterImageSize = (
  mode: 'text' | 'image',
  isGenerating: boolean,
  selectedImage: string | null,
  generatedImages: any[],
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction
) => {
  // 检测是否为移动端
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  if (isGenerating) {
    const width = isMobile ? CENTER_IMAGE_DIMENSIONS.MOBILE_GENERATING_WIDTH : CENTER_IMAGE_DIMENSIONS.GENERATING_WIDTH;
    const height = isMobile ? CENTER_IMAGE_DIMENSIONS.MOBILE_GENERATING_HEIGHT : CENTER_IMAGE_DIMENSIONS.GENERATING_HEIGHT;
    return { 
      style: {
        width: `${width}px`,
        height: `${height}px`
      }
    };
  }

  // 如果有选中的图片，使用通用函数计算实际尺寸
  if (selectedImage) {
    const currentImage = generatedImages.find(img => img.id === selectedImage);
    if (currentImage && currentImage.defaultUrl) {
      let maxWidth: number, maxHeight: number, minWidth: number, minHeight: number;
      
      if (isMobile) {
        // 移动端尺寸限制
        maxWidth = CENTER_IMAGE_DIMENSIONS.MOBILE_MAX_WIDTH;
        maxHeight = CENTER_IMAGE_DIMENSIONS.MOBILE_MAX_HEIGHT;
        // 设置合理的移动端最小尺寸
        minWidth = Math.min(200, maxWidth);
        minHeight = Math.min(200, maxHeight);
      } else {
        // 桌面端根据模式使用不同的最大尺寸
        maxWidth = mode === 'text' ? CENTER_IMAGE_DIMENSIONS.TEXT_MAX_WIDTH : CENTER_IMAGE_DIMENSIONS.IMAGE_MAX_WIDTH;
        maxHeight = mode === 'text' ? CENTER_IMAGE_DIMENSIONS.TEXT_MAX_HEIGHT : CENTER_IMAGE_DIMENSIONS.IMAGE_MAX_HEIGHT;
        // 设置合理的桌面端最小尺寸
        minWidth = Math.min(300, maxWidth);
        minHeight = Math.min(300, maxHeight);
      }
      
      const size = getImageSize(currentImage.id, currentImage.defaultUrl, maxWidth, maxHeight, minWidth, minHeight, dimensionsCache, setDimensionsCache);
      return {
        style: {
          width: size.width,
          height: size.height
        }
      };
    }
  }

  // 默认情况下，使用固定尺寸
  const width = isMobile ? CENTER_IMAGE_DIMENSIONS.MOBILE_GENERATING_WIDTH : CENTER_IMAGE_DIMENSIONS.GENERATING_WIDTH;
  const height = isMobile ? CENTER_IMAGE_DIMENSIONS.MOBILE_GENERATING_HEIGHT : CENTER_IMAGE_DIMENSIONS.GENERATING_HEIGHT;
  return { 
    style: {
      width: `${width}px`,
      height: `${height}px`
    }
  };
};

/**
 * 计算生成中容器的大小（右侧边栏）
 * @param selectedTab 当前选中的标签页
 * @returns 计算后的容器尺寸
 */
export const getGeneratingContainerSize = () => {
  // 默认使用正方形
  return { 
    width: `${SIDEBAR_IMAGE_DIMENSIONS.MAX_WIDTH}px`, 
    height: `${SIDEBAR_IMAGE_DIMENSIONS.MAX_HEIGHT}px` 
  };
};

/**
 * 计算图片容器的大小（右侧边栏）
 * @param image 图片对象
 * @param dimensionsCache 图片尺寸缓存
 * @param setDimensionsCache 更新图片尺寸缓存的函数
 * @param customDimensions 自定义尺寸参数（可选）
 * @returns 计算后的容器尺寸
 */
export const getImageContainerSize = (
  image: any,
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction,
  customDimensions?: {
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
  }
) => {
  // 使用自定义尺寸或默认尺寸
  const maxWidth = customDimensions?.maxWidth ?? SIDEBAR_IMAGE_DIMENSIONS.MAX_WIDTH;
  const maxHeight = customDimensions?.maxHeight ?? SIDEBAR_IMAGE_DIMENSIONS.MAX_HEIGHT;
  const minWidth = customDimensions?.minWidth ?? SIDEBAR_IMAGE_DIMENSIONS.MIN_WIDTH;
  const minHeight = customDimensions?.minHeight ?? SIDEBAR_IMAGE_DIMENSIONS.MIN_HEIGHT;

  // 如果图片有dimensions属性，使用它（优先级最高）
  if (image.dimensions && image.dimensions.width && image.dimensions.height) {
    const { width, height } = image.dimensions;
    const scaledDimensions = calculateScaledDimensions(width, height, maxWidth, maxHeight);
    return { 
      width: `${Math.max(minWidth, scaledDimensions.width)}px`, 
      height: `${Math.max(minHeight, scaledDimensions.height)}px`
    };
  }
  
  // 使用通用函数计算尺寸（会处理异步获取逻辑）
  if (image.id && image.defaultUrl) {
    return getImageSize(
      image.id, 
      image.defaultUrl, 
      maxWidth, 
      maxHeight, 
      minWidth, 
      minHeight, 
      dimensionsCache, 
      setDimensionsCache
    );
  }
  
  // 默认情况下使用正方形
  return { 
    width: `${maxWidth}px`, 
    height: `${maxHeight}px` 
  };
};
