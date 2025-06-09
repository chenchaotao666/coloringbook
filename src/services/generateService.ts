import { HomeImageService, HomeImage } from './imageService';
import { ImageConverter } from '../utils/imageConverter';
import imagesData from '../data/images.json';

// ==================== 类型定义 ====================
// API服务配置
const API_BASE_URL = 'http://localhost:3001/api';

// 接口类型定义
export interface GeneratedImage {
  id: string;
  url: string;
  fullSizeUrl: string;
  thumbnailUrl: string;
  createdAt: string;
  prompt?: string;
  ratio: '3:4' | '4:3' | '1:1' | '';
  isPublic: boolean;
}

export interface GenerateTextToImageRequest {
  prompt: string;
  ratio: '3:4' | '4:3' | '1:1';
  isPublic: boolean;
  style?: string;
}

export interface GenerateImageToImageRequest {
  imageFile: File;
  ratio?: '3:4' | '4:3' | '1:1';
  isPublic: boolean;
}

export interface GenerateResponse {
  success: boolean;
  data: {
    images: GeneratedImage[];
    taskId: string;
  };
  message?: string;
}

export interface ExampleImage {
  id: string;
  url: string;
  fullSizeUrl: string;
  category: 'text' | 'image';
  prompt?: string;
}

export interface StyleSuggestion {
  id: string;
  name: string;
  category: string;
}

// ==================== 从JSON文件加载数据 ====================
// 从images.json中获取图片数据
interface ImageData {
  id: string;
  name: string;
  defaultUrl: string;
  colorUrl: string;
  title: string;
  description: string;
  tags: string[];
  type: 'text2image' | 'image2image';
  ratio: '3:4' | '4:3' | '1:1' | '';
  isPublic: boolean;
  createdAt: string;
  prompt: string;
  userId: string;
  additionalInfo?: any;
}

// 根据type和ratio筛选图片
const getImagesByType = (type: 'text2image' | 'image2image', ratio?: '3:4' | '4:3' | '1:1'): ImageData[] => {
  const filteredImages = (imagesData as ImageData[]).filter(img => img.type === type);
  if (ratio) {
    // 对于text2image，必须匹配ratio；对于image2image，如果ratio为空则忽略ratio筛选
    if (type === 'text2image') {
      return filteredImages.filter(img => img.ratio === ratio);
    } else {
      // image2image类型，如果图片ratio为空，则可以用于任何ratio
      return filteredImages.filter(img => img.ratio === ratio || img.ratio === '');
    }
  }
  return filteredImages;
};

// 根据userId获取图片
const getImagesByUserId = (userId: string): ImageData[] => {
  return (imagesData as ImageData[]).filter(img => img.userId === userId);
};

// 随机获取一张图片
const getRandomImageByType = (type: 'text2image' | 'image2image', ratio?: '3:4' | '4:3' | '1:1', uploadedFileName?: string): ImageData | null => {
  // 如果是 image2image 类型且提供了上传的文件名，尝试查找匹配的图片
  if (type === 'image2image' && uploadedFileName) {
    // 从文件名中提取基础名称（去掉扩展名）
    const baseFileName = uploadedFileName.replace(/\.[^/.]+$/, '').toLowerCase();
    
    // 在所有图片中查找名称匹配的图片
    const allImages = imagesData as ImageData[];
    const matchedImage = allImages.find(img => {
      // 检查图片的 name 字段是否匹配
      if (img.name.toLowerCase() === baseFileName) {
        return true;
      }
      
      // 检查图片的 id 是否匹配
      if (img.id.toLowerCase() === baseFileName) {
        return true;
      }
      
      // 检查图片的 defaultUrl 中是否包含匹配的名称
      const urlBaseName = img.defaultUrl.split('/').pop()?.replace(/\.[^/.]+$/, '').toLowerCase();
      if (urlBaseName && urlBaseName.includes(baseFileName)) {
        return true;
      }
      
      // 智能匹配：提取核心名称（去掉常见后缀）
      const extractCoreName = (name: string) => {
        return name.replace(/-(default|color|colored|outline|line|black|white|bw)$/i, '');
      };
      
      const uploadedCoreName = extractCoreName(baseFileName);
      const imageCoreName = extractCoreName(img.name.toLowerCase());
      const urlCoreName = urlBaseName ? extractCoreName(urlBaseName) : '';
      
      // 如果核心名称匹配，则认为是同一张图片
      if (uploadedCoreName && imageCoreName && uploadedCoreName === imageCoreName) {
        return true;
      }
      
      if (uploadedCoreName && urlCoreName && uploadedCoreName === urlCoreName) {
        return true;
      }
      
      return false;
    });
    
    if (matchedImage) {
      console.log(`Found matching image for uploaded file "${uploadedFileName}":`, matchedImage.name);
      return matchedImage;
    } else {
      console.log(`No matching image found for uploaded file "${uploadedFileName}", using random selection`);
    }
  }
  
  // 如果没有找到匹配的图片，或者不是 image2image 类型，使用原来的随机选择逻辑
  const images = getImagesByType(type, ratio);
  if (images.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
};

// Mock 示例图片数据 - 从images.json中获取
const mockExampleImages: {
  text: ExampleImage[];
  image: ExampleImage[];
} = {
  text: getImagesByType('text2image').slice(0, 3).map(img => ({
    id: img.id,
    url: img.defaultUrl,
    fullSizeUrl: img.colorUrl,
    category: 'text' as const,
    prompt: img.description
  })),
  image: getImagesByType('image2image').slice(0, 3).map(img => ({
    id: img.id,
    url: img.defaultUrl,
    fullSizeUrl: img.colorUrl,
    category: 'image' as const,
    prompt: img.description
  }))
};

// 样式建议数据 - 基于images.json中的tags生成
const styleSuggestions: StyleSuggestion[] = [
  { id: 'cute', name: '可爱风格', category: 'style' },
  { id: 'cartoon', name: '卡通风格', category: 'style' },
  { id: 'realistic', name: '写实风格', category: 'style' },
  { id: 'fantasy', name: '奇幻风格', category: 'style' },
  { id: 'tech', name: '科技风格', category: 'style' },
  { id: 'nature', name: '自然风格', category: 'style' }
];

// ==================== 模拟数据 ====================
// Mock 生成的图片数据 - 直接从images.json获取所有图片
const createInitialMockImages = (userId?: string): GeneratedImage[] => {
  // 如果指定了userId，则根据userId筛选；否则返回所有图片
  const sourceImages = userId ? getImagesByUserId(userId) : (imagesData as ImageData[]);
  
  return sourceImages.map(img => ({
    id: img.id,
    url: img.defaultUrl,
    fullSizeUrl: img.colorUrl,
    thumbnailUrl: img.defaultUrl,
    createdAt: img.createdAt,
    prompt: img.prompt,
    ratio: img.ratio as '3:4' | '4:3' | '1:1',
    isPublic: img.isPublic,
  }));
};

const mockGeneratedImages: GeneratedImage[] = createInitialMockImages();

// ==================== 工具函数 ====================
// 随机获取风格建议的函数
const getRandomStyleSuggestions = (count: number = 6): StyleSuggestion[] => {
  const shuffled = [...styleSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 模拟生成延迟
const simulateGenerationDelay = (ms: number = 2000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 生成随机任务ID
const generateTaskId = (): string => {
  return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};


// 模拟批量生成图片
const generateMockImages = (
  prompt: string, 
  ratio: '3:4' | '4:3' | '1:1' | '', 
  count: number = 1,
  type: 'text2image' | 'image2image' = 'text2image',
  uploadedFileName?: string
): GeneratedImage[] => {
  const results: GeneratedImage[] = [];
  const baseTimestamp = Date.now();
  
  for (let i = 0; i < count; i++) {
    // 如果是 image2image 且 ratio 为空，则不传递 ratio 参数给 getRandomImageByType
    const searchRatio = (type === 'image2image' && ratio === '') ? undefined : (ratio as '3:4' | '4:3' | '1:1');
    const selectedImage = getRandomImageByType(type, searchRatio, uploadedFileName);
    const randomId = Math.floor(Math.random() * 10000) + i;
    
    const uniqueId = `${baseTimestamp + i}_${randomId}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (selectedImage) {
      // 如果是 image2image 且原始 ratio 为空，使用选中图片的 ratio
      const finalRatio = (type === 'image2image') ? '' : (ratio as '3:4' | '4:3' | '1:1');
        
      results.push({
        id: `generated_${uniqueId}`,
        url: `${selectedImage.defaultUrl}?id=${uniqueId}`,
        fullSizeUrl: `${selectedImage.defaultUrl}?id=${uniqueId}`,
        thumbnailUrl: `${selectedImage.defaultUrl}?id=${uniqueId}`,
        createdAt: new Date().toISOString(),
        prompt: prompt || selectedImage.description,
        ratio: finalRatio,
        isPublic: true,
      });
    } else {
      // 如果没有找到对应比例的图片，使用任意比例的图片
      const fallbackImage = getRandomImageByType(type, undefined, uploadedFileName);
      if (fallbackImage) {
        // 如果是 image2image，使用空字符串作为 ratio；否则使用回退图片的 ratio 或指定的 ratio
        const finalRatio = (type === 'image2image') 
          ? '' 
          : (fallbackImage.ratio as '3:4' | '4:3' | '1:1' || ratio as '3:4' | '4:3' | '1:1');
          
        results.push({
          id: `generated_${uniqueId}`,
          url: `${fallbackImage.defaultUrl}?id=${uniqueId}`,
          fullSizeUrl: `${fallbackImage.defaultUrl}?id=${uniqueId}`,
          thumbnailUrl: `${fallbackImage.defaultUrl}?id=${uniqueId}`,
          createdAt: new Date().toISOString(),
          prompt: prompt || fallbackImage.description,
          ratio: finalRatio,
          isPublic: true,
        });
      }
    }
  }
  
  return results;
};

// ==================== 真实API服务类 ====================
class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // 文本转图片生成
  async generateTextToImage(data: GenerateTextToImageRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate/text-to-image', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 图片转图片生成
  async generateImageToImage(data: GenerateImageToImageRequest): Promise<GenerateResponse> {
    const formData = new FormData();
    formData.append('image', data.imageFile);
    formData.append('ratio', data.ratio || '3:4');
    formData.append('isPublic', data.isPublic.toString());

    return this.request<GenerateResponse>('/generate/image-to-image', {
      method: 'POST',
      headers: {}, // 让浏览器自动设置Content-Type for FormData
      body: formData,
    });
  }

  // 获取示例图片
  async getExampleImages(category: 'text' | 'image'): Promise<ExampleImage[]> {
    return this.request<ExampleImage[]>(`/examples/${category}`);
  }

  // 获取风格建议
  async getStyleSuggestions(): Promise<StyleSuggestion[]> {
    return this.request<StyleSuggestion[]>('/styles/suggestions');
  }

  // 下载图片
  async downloadImage(imageId: string, format: 'png' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/download/${imageId}?format=${format}`);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }
    return response.blob();
  }

  // 获取生成任务状态
  async getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    images?: GeneratedImage[];
    error?: string;
  }> {
    return this.request(`/tasks/${taskId}/status`);
  }

  // 重新创建示例图片
  async recreateExample(exampleId: string): Promise<GenerateResponse> {
    return this.request<GenerateResponse>(`/examples/${exampleId}/recreate`, {
      method: 'POST',
    });
  }
}

// ==================== Mock API服务类 ====================
class MockApiService {
  private generatedImagesStore: GeneratedImage[] = [...mockGeneratedImages];
  private taskStore: Map<string, {
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    images?: GeneratedImage[];
    error?: string;
  }> = new Map();

  // 模拟文本转图片生成 - 立即返回任务ID，后台处理
  async generateTextToImage(data: GenerateTextToImageRequest): Promise<GenerateResponse> {
    console.log('Mock API: Starting text to image generation', data);
    
    const taskId = generateTaskId();
    
    // 设置初始任务状态
    this.taskStore.set(taskId, {
      status: 'processing',
      progress: 0,
    });
    
    // 后台模拟进度更新
    this.simulateProgressiveGeneration(taskId, data);
    
    return {
      success: true,
      data: {
        images: [],
        taskId,
      },
      message: 'Generation started',
    };
  }

  // 模拟渐进式生成过程
  private simulateProgressiveGeneration(taskId: string, data: GenerateTextToImageRequest) {
    const progressSteps = [
      { progress: 10, delay: 500 },
      { progress: 25, delay: 1000 },
      { progress: 45, delay: 1500 },
      { progress: 65, delay: 2000 },
      { progress: 80, delay: 2500 },
      { progress: 95, delay: 3000 },
      { progress: 100, delay: 3500 },
    ];

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => {
        const currentTask = this.taskStore.get(taskId);
        if (!currentTask) return;

        if (progress === 100) {
          // 生成完成 - 每次只生成1张图片
          const newImages = generateMockImages(data.prompt, data.ratio, 1, 'text2image');
          
          this.taskStore.set(taskId, {
            status: 'completed',
            progress: 100,
            images: newImages,
          });
        } else {
          // 更新进度
          this.taskStore.set(taskId, {
            ...currentTask,
            progress,
          });
        }
      }, delay);
    });
  }

  // 模拟图片转图片生成 - 立即返回任务ID，后台处理
  async generateImageToImage(data: GenerateImageToImageRequest): Promise<GenerateResponse> {
    console.log('Mock API: Starting image to image generation', data);
    
    const taskId = generateTaskId();
    
    // 设置初始任务状态
    this.taskStore.set(taskId, {
      status: 'processing',
      progress: 0,
    });
    
    // 后台模拟进度更新 (Image to Image 稍快一些)
    this.simulateImageToImageGeneration(taskId, data);
    
    return {
      success: true,
      data: {
        images: [],
        taskId,
      },
      message: 'Image to image generation started',
    };
  }

  // 模拟图片转图片渐进式生成过程
  private simulateImageToImageGeneration(taskId: string, data: GenerateImageToImageRequest) {
    const progressSteps = [
      { progress: 15, delay: 400 },
      { progress: 35, delay: 800 },
      { progress: 55, delay: 1200 },
      { progress: 75, delay: 1600 },
      { progress: 90, delay: 2000 },
      { progress: 100, delay: 2400 },
    ];

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => {
        const currentTask = this.taskStore.get(taskId);
        if (!currentTask) return;

        if (progress === 100) {
          // 生成完成 - 每次只生成1张图片
          const newImages = generateMockImages('Image transformation', data.ratio || '', 1, 'image2image', data.imageFile.name);
          
          this.taskStore.set(taskId, {
            status: 'completed',
            progress: 100,
            images: newImages,
          });
        } else {
          // 更新进度
          this.taskStore.set(taskId, {
            ...currentTask,
            progress,
          });
        }
      }, delay);
    });
  }

  // 获取示例图片
  async getExampleImages(category: 'text' | 'image'): Promise<ExampleImage[]> {
    console.log('Mock API: Getting example images for', category);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockExampleImages[category];
  }

  // 获取风格建议
  async getStyleSuggestions(): Promise<StyleSuggestion[]> {
    console.log('Mock API: Getting style suggestions');
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return getRandomStyleSuggestions(6);
  }

  // 下载图片
  async downloadImage(imageId: string, format: 'png' | 'pdf'): Promise<Blob> {
    console.log('Mock API: Downloading image', imageId, format);
    
    // 模拟下载延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 首先尝试从GeneratedImage中查找
    let image = this.generatedImagesStore.find(img => img.id === imageId);
    let imageUrl: string | null = null;
    let imageRatio: string = '1:1';
    
    // 如果在存储中找不到，尝试从任务状态中查找
    if (!image) {
      for (const [, task] of this.taskStore.entries()) {
        if (task.images) {
          const foundImage = task.images.find(img => img.id === imageId);
          if (foundImage) {
            image = foundImage;
            break;
          }
        }
      }
    }
    
    // 如果是GeneratedImage，使用其url（默认的黑白线稿图片）和ratio
    if (image) {
      imageUrl = image.url;
      imageRatio = image.ratio;
    } else {
      // 尝试从CategoryImage中查找
      const { CategoriesService } = await import('./categoriesService');
      const categoryImage = await CategoriesService.getImageById(imageId);
      if (categoryImage) {
        imageUrl = categoryImage.url; // 使用黑白图片
        imageRatio = categoryImage.ratio;
      } else {
        // 尝试从HomeImage中查找
        const homeImage: HomeImage | undefined = HomeImageService.getImageById(imageId);
        if (homeImage) {
          imageUrl = homeImage.defaultUrl; // 使用默认的黑白图片
          // 根据HomeImage的尺寸计算比例
          const { width, height } = homeImage.dimensions;
          if (width === height) {
            imageRatio = '1:1';
          } else if (width > height) {
            imageRatio = '4:3';
          } else {
            imageRatio = '3:4';
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error('Image not found');
    }

    try {
      // 获取图片内容
      let imageContent: string;
      
      if (imageUrl.endsWith('.svg')) {
        // 如果是SVG文件
        const response = await fetch(imageUrl);
        imageContent = await response.text();
        
        if (format === 'png') {
          return ImageConverter.convertSvgToPng(imageContent, imageRatio, false); // PNG保持原始质量
        } else {
          return ImageConverter.convertSvgToPdf(imageContent, imageRatio);
        }
      } else {
        // 如果是PNG/JPG等图片文件，直接转换
        if (format === 'png') {
          return ImageConverter.convertImageToPng(imageUrl, false); // PNG不需要高分辨率，保持原始质量
        } else {
          return ImageConverter.convertImageToPdf(imageUrl);
        }
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      // 如果转换失败，返回错误信息
      const errorBlob = new Blob([`Error: Could not convert image - ${error}`], { type: 'text/plain' });
      return errorBlob;
    }
  }

  // 获取生成任务状态
  async getTaskStatus(taskId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    images?: GeneratedImage[];
    error?: string;
  }> {
    console.log('Mock API: Getting task status', taskId);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const task = this.taskStore.get(taskId);
    if (!task) {
      return {
        status: 'failed',
        progress: 0,
        error: 'Task not found',
      };
    }
    
    return task;
  }

  // 重新创建示例图片
  async recreateExample(exampleId: string): Promise<GenerateResponse> {
    console.log('Mock API: Recreating example', exampleId);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 查找示例图片
    const textExample = mockExampleImages.text.find(img => img.id === exampleId);
    const imageExample = mockExampleImages.image.find(img => img.id === exampleId);
    const example = textExample || imageExample;
    
    if (!example) {
      return {
        success: false,
        data: {
          images: [],
          taskId: '',
        },
        message: 'Example not found',
      };
    }
    
    // 生成新图片
    const newImages = generateMockImages(
      example.prompt || 'Recreated from example',
      '3:4', // 默认比例
      1,
      example.category === 'text' ? 'text2image' : 'image2image'
    );
    
    // 添加到存储
    this.generatedImagesStore.push(...newImages);
    
    return {
      success: true,
      data: {
        images: newImages,
        taskId: generateTaskId(),
      },
      message: 'Example recreated successfully',
    };
  }

  // 获取所有生成的图片
  async getAllGeneratedImages(userId?: string): Promise<GeneratedImage[]> {
    console.log('Mock API: Getting all generated images', userId ? `for user: ${userId}` : '');
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (userId) {
      // 如果指定了userId，返回该用户的图片
      return createInitialMockImages(userId);
    }
    
    // 否则返回存储中的所有图片（包括动态生成的）
    // return [...this.generatedImagesStore].reverse(); // 最新的在前面
    return []
  }

  // 根据userId获取图片
  async getImagesByUserId(userId: string): Promise<GeneratedImage[]> {
    console.log('Mock API: Getting images by userId', userId);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return createInitialMockImages(userId);
  }

  // 删除生成的图片
  async deleteGeneratedImage(imageId: string): Promise<{ success: boolean; message: string }> {
    console.log('Mock API: Deleting generated image', imageId);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const index = this.generatedImagesStore.findIndex(img => img.id === imageId);
    if (index === -1) {
      return {
        success: false,
        message: 'Image not found',
      };
    }
    
    this.generatedImagesStore.splice(index, 1);
    
    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}

// ==================== 服务实例 ====================
// 真实API服务实例
export const apiService = new ApiService();

// Mock API服务实例
export const mockApiService = new MockApiService();

// 默认导出Mock服务（用于开发环境）
export const generateService = mockApiService;

// 导出工具函数供外部使用
export {
  getRandomStyleSuggestions,
  simulateGenerationDelay,
  generateTaskId,
  generateMockImages,
  mockGeneratedImages,
  mockExampleImages,
  styleSuggestions,
  createInitialMockImages,
  getImagesByUserId,
}; 