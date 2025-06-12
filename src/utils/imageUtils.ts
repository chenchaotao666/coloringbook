/**
 * 图片工具函数
 */

// ===== 尺寸常量定义 =====

/**
 * 中间显示区域的最大尺寸
 */
export const CENTER_IMAGE_DIMENSIONS = {
  // Text to Image 模式的最大尺寸
  TEXT_MAX_WIDTH: 800,
  TEXT_MAX_HEIGHT: 600,
  // Image to Image 模式的最大尺寸
  IMAGE_MAX_WIDTH: 800,
  IMAGE_MAX_HEIGHT: 800,
  // 生成中的默认尺寸
  GENERATING_WIDTH: 460,
  GENERATING_HEIGHT: 460
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
  // 如果已经获取到了图片尺寸，使用实际尺寸计算
  if (imageId && dimensionsCache && dimensionsCache[imageId]) {
    const { width, height } = dimensionsCache[imageId];
    const scaledDimensions = calculateScaledDimensions(width, height, maxWidth, maxHeight);
    return {
      width: minWidth ? `${Math.max(minWidth, scaledDimensions.width)}px` : `${scaledDimensions.width}px`,
      height: minHeight ? `${Math.max(minHeight, scaledDimensions.height)}px` : `${scaledDimensions.height}px`
    };
  }
  
  // 如果还没有获取到图片尺寸，异步获取
  if (imageId && imageUrl && dimensionsCache && setDimensionsCache && !dimensionsCache[imageId] && !dimensionsCache[`loading_${imageId}`]) {
    setDimensionsCache(prev => ({
      ...prev,
      [`loading_${imageId}`]: { width: 0, height: 0 }
    }));

    getImageDimensionsFromUrl(imageUrl)
      .then((dimensions) => {
        setDimensionsCache(prev => {
          const newState = { ...prev };
          delete newState[`loading_${imageId}`];
          newState[imageId] = dimensions;
          return newState;
        });
      })
      .catch((error) => {
        console.error('Failed to get image dimensions:', error);
        setDimensionsCache(prev => {
          const newState = { ...prev };
          delete newState[`loading_${imageId}`];
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
  if (isGenerating) {
    return { 
      style: {
        width: `${CENTER_IMAGE_DIMENSIONS.GENERATING_WIDTH}px`,
        height: `${CENTER_IMAGE_DIMENSIONS.GENERATING_HEIGHT}px`
      }
    };
  }

  // 如果有选中的图片，使用通用函数计算实际尺寸
  if (selectedImage) {
    const currentImage = generatedImages.find(img => img.id === selectedImage);
    if (currentImage && currentImage.defaultUrl) {
      // Text to Image 使用不同的最大尺寸
      const maxWidth = mode === 'text' ? CENTER_IMAGE_DIMENSIONS.TEXT_MAX_WIDTH : CENTER_IMAGE_DIMENSIONS.IMAGE_MAX_WIDTH;
      const maxHeight = mode === 'text' ? CENTER_IMAGE_DIMENSIONS.TEXT_MAX_HEIGHT : CENTER_IMAGE_DIMENSIONS.IMAGE_MAX_HEIGHT;
      const size = getImageSize(currentImage.id, currentImage.defaultUrl, maxWidth, maxHeight, undefined, undefined, dimensionsCache, setDimensionsCache);
      return {
        style: {
          width: size.width,
          height: size.height
        }
      };
    }
  }

  // 默认情况下，使用固定尺寸
  return { 
    style: {
      width: `${CENTER_IMAGE_DIMENSIONS.GENERATING_WIDTH}px`,
      height: `${CENTER_IMAGE_DIMENSIONS.GENERATING_HEIGHT}px`
    }
  };
};

/**
 * 计算Example图片的大小
 * @param imageId 图片ID（用作缓存键，可选）
 * @param imageUrl 图片URL（可选）
 * @param fixedWidth 固定宽度
 * @param dimensionsCache 图片尺寸缓存
 * @param setDimensionsCache 更新图片尺寸缓存的函数
 * @returns 计算后的图片尺寸信息
 */
export const getExampleImageSize = (
  imageId?: string,
  imageUrl?: string,
  fixedWidth: number = EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH,
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction
) => {
  if (imageId && dimensionsCache && dimensionsCache[imageId]) {
    const { width, height } = dimensionsCache[imageId];
    const aspectRatio = width / height;

    // 根据固定宽度和实际比例计算高度
    const calculatedHeight = Math.round(fixedWidth / aspectRatio);

    return {
      width: fixedWidth,
      height: calculatedHeight,
      style: { width: `${fixedWidth}px`, height: `${calculatedHeight}px` }
    };
  }

  // 使用 getImageSize 处理异步获取逻辑，但我们只需要触发异步获取，不使用其返回值
  if (imageId && imageUrl && dimensionsCache && setDimensionsCache) {
    getImageSize(imageId, imageUrl, fixedWidth, fixedWidth, undefined, undefined, dimensionsCache, setDimensionsCache);
  }

  // 默认尺寸（正方形）
  return {
    width: fixedWidth,
    height: fixedWidth,
    style: { width: `${fixedWidth}px`, height: `${fixedWidth}px` }
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
 * @returns 计算后的容器尺寸
 */
export const getImageContainerSize = (
  image: any,
  dimensionsCache?: ImageDimensionsCache,
  setDimensionsCache?: SetImageDimensionsFunction
) => {
  // 如果图片有dimensions属性，使用它（优先级最高）
  if (image.dimensions && image.dimensions.width && image.dimensions.height) {
    const { width, height } = image.dimensions;
    const scaledDimensions = calculateScaledDimensions(
      width, 
      height, 
      SIDEBAR_IMAGE_DIMENSIONS.MAX_WIDTH, 
      SIDEBAR_IMAGE_DIMENSIONS.MAX_HEIGHT
    );
    return { 
      width: `${Math.max(SIDEBAR_IMAGE_DIMENSIONS.MIN_WIDTH, scaledDimensions.width)}px`, 
      height: `${Math.max(SIDEBAR_IMAGE_DIMENSIONS.MIN_HEIGHT, scaledDimensions.height)}px`
    };
  }
  
  // 使用通用函数计算尺寸（会处理异步获取逻辑）
  if (image.id && image.defaultUrl) {
    return getImageSize(
      image.id, 
      image.defaultUrl, 
      SIDEBAR_IMAGE_DIMENSIONS.MAX_WIDTH, 
      SIDEBAR_IMAGE_DIMENSIONS.MAX_HEIGHT, 
      SIDEBAR_IMAGE_DIMENSIONS.MIN_WIDTH, 
      SIDEBAR_IMAGE_DIMENSIONS.MIN_HEIGHT, 
      dimensionsCache, 
      setDimensionsCache
    );
  }
  
  // 默认情况下使用正方形
  return { 
    width: `${SIDEBAR_IMAGE_DIMENSIONS.MAX_WIDTH}px`, 
    height: `${SIDEBAR_IMAGE_DIMENSIONS.MAX_HEIGHT}px` 
  };
};
