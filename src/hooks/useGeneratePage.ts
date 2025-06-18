import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import GenerateServiceInstance, { StyleSuggestion } from '../services/generateService';
import { HomeImage } from '../services/imageService';

export interface UseGeneratePageState {
  // 基础状态
  prompt: string;
  selectedTab: 'text' | 'image';
  selectedRatio: '3:4' | '4:3' | '1:1';
  publicVisibility: boolean;
  selectedImage: string | null;
  uploadedFile: File | null;
  
  // 数据状态
  generatedImages: HomeImage[];  // 保留用于兼容性，包含所有图片
  textGeneratedImages: HomeImage[];   // Text to Image 生成的图片
  imageGeneratedImages: HomeImage[];  // Image to Image 生成的图片
  textExampleImages: HomeImage[];     // Text to Image 示例图片
  imageExampleImages: HomeImage[];    // Image to Image 示例图片
  styleSuggestions: StyleSuggestion[];
  
  // 加载状态
  isGenerating: boolean;
  isLoadingTextExamples: boolean;  // Text to Image 加载状态（包括示例和生成历史）
  isLoadingImageExamples: boolean; // Image to Image 加载状态（包括示例和生成历史）
  isLoadingStyles: boolean;
  isInitialDataLoaded: boolean;    // 初始数据（生成历史）是否已加载完成
  
  // 错误状态
  error: string | null;
  
  // 任务状态
  currentTaskId: string | null;
  generationProgress: number;

  // 积分状态
  userCredits: number;
  canGenerate: boolean;
  isCheckingCredits: boolean;

  // 用户生成历史状态
  hasTextToImageHistory: boolean;  // 用户是否有 text to image 生成历史
  hasImageToImageHistory: boolean; // 用户是否有 image to image 生成历史
}

export interface UseGeneratePageActions {
  // 基础操作
  setPrompt: (prompt: string) => void;
  setSelectedTab: (tab: 'text' | 'image') => void;
  setSelectedRatio: (ratio: '3:4' | '4:3' | '1:1') => void;
  setPublicVisibility: (visible: boolean) => void;
  setSelectedImage: (imageUrl: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  setUploadedImageWithDimensions: (file: File | null, dimensions: { width: number; height: number } | null) => void;
  
  // API 操作
  generateImages: () => Promise<void>;
  loadExampleImages: () => Promise<void>;
  loadStyleSuggestions: () => Promise<void>;
  recreateExample: (exampleId: string) => Promise<void>;
  downloadImage: (imageId: string, format: 'png' | 'pdf') => Promise<void>;
  
  // 工具操作
  clearError: () => void;
  resetForm: () => void;
  refreshExamples: () => void;
  refreshStyleSuggestions: () => void;
  loadGeneratedImages: () => Promise<void>;
  deleteImage: (imageId: string) => Promise<boolean>;
  
  // 积分相关操作
  checkUserCredits: () => Promise<void>;
  handleInsufficientCredits: () => void;
}

export const useGeneratePage = (initialTab: 'text' | 'image' = 'text', refreshUser?: () => Promise<void>): UseGeneratePageState & UseGeneratePageActions => {
  const [searchParams] = useSearchParams();
  
  // 缓存引用
  const textExampleCache = useRef<{
    allImages: HomeImage[];
    isLoaded: boolean;
    isLoading: boolean;
  }>({
    allImages: [],
    isLoaded: false,
    isLoading: false
  });

  const imageExampleCache = useRef<{
    allImages: HomeImage[];
    isLoaded: boolean;
    isLoading: boolean;
  }>({
    allImages: [],
    isLoaded: false,
    isLoading: false
  });

  // 添加初始化标记，防止重复加载
  const textInitialized = useRef(false);
  const imageInitialized = useRef(false);
  
  // 从URL参数获取初始值
  const getInitialPrompt = () => searchParams.get('prompt') || '';
  const getInitialRatio = (): '3:4' | '4:3' | '1:1' => {
    const ratio = searchParams.get('ratio');
    return (ratio === '3:4' || ratio === '4:3' || ratio === '1:1') ? ratio : '3:4';
  };
  
  // 预设的50种常用图片生成建议
  const STYLE_SUGGESTIONS: StyleSuggestion[] = [
    // 动物类
    { id: 'cute-cat', name: '可爱小猫', category: 'animals' },
    { id: 'friendly-dog', name: '友好小狗', category: 'animals' },
    { id: 'colorful-butterfly', name: '彩色蝴蝶', category: 'animals' },
    { id: 'wise-owl', name: '智慧猫头鹰', category: 'animals' },
    { id: 'happy-elephant', name: '快乐大象', category: 'animals' },
    { id: 'graceful-swan', name: '优雅天鹅', category: 'animals' },
    { id: 'playful-dolphin', name: '顽皮海豚', category: 'animals' },
    { id: 'majestic-lion', name: '威严狮子', category: 'animals' },
    { id: 'cute-panda', name: '可爱熊猫', category: 'animals' },
    { id: 'colorful-parrot', name: '彩色鹦鹉', category: 'animals' },

    // 自然风景类
    { id: 'beautiful-flower', name: '美丽花朵', category: 'nature' },
    { id: 'tall-tree', name: '高大树木', category: 'nature' },
    { id: 'peaceful-mountain', name: '宁静山峰', category: 'nature' },
    { id: 'flowing-river', name: '流淌小河', category: 'nature' },
    { id: 'bright-sun', name: '明亮太阳', category: 'nature' },
    { id: 'crescent-moon', name: '弯弯月亮', category: 'nature' },
    { id: 'twinkling-stars', name: '闪烁星星', category: 'nature' },
    { id: 'fluffy-clouds', name: '蓬松云朵', category: 'nature' },
    { id: 'colorful-rainbow', name: '彩色彩虹', category: 'nature' },
    { id: 'ocean-waves', name: '海洋波浪', category: 'nature' },

    // 卡通人物类
    { id: 'happy-princess', name: '快乐公主', category: 'characters' },
    { id: 'brave-knight', name: '勇敢骑士', category: 'characters' },
    { id: 'magical-fairy', name: '魔法仙女', category: 'characters' },
    { id: 'funny-clown', name: '有趣小丑', category: 'characters' },
    { id: 'superhero', name: '超级英雄', category: 'characters' },
    { id: 'cute-robot', name: '可爱机器人', category: 'characters' },
    { id: 'friendly-alien', name: '友好外星人', category: 'characters' },
    { id: 'wise-wizard', name: '智慧巫师', category: 'characters' },
    { id: 'dancing-ballerina', name: '舞蹈芭蕾', category: 'characters' },
    { id: 'smiling-chef', name: '微笑厨师', category: 'characters' },

    // 交通工具类
    { id: 'fast-car', name: '快速汽车', category: 'vehicles' },
    { id: 'big-truck', name: '大卡车', category: 'vehicles' },
    { id: 'flying-airplane', name: '飞行飞机', category: 'vehicles' },
    { id: 'sailing-boat', name: '航行帆船', category: 'vehicles' },
    { id: 'speedy-train', name: '快速火车', category: 'vehicles' },
    { id: 'colorful-bicycle', name: '彩色自行车', category: 'vehicles' },
    { id: 'fire-truck', name: '消防车', category: 'vehicles' },
    { id: 'school-bus', name: '校车', category: 'vehicles' },
    { id: 'police-car', name: '警车', category: 'vehicles' },
    { id: 'ambulance', name: '救护车', category: 'vehicles' },

    // 食物类
    { id: 'delicious-cake', name: '美味蛋糕', category: 'food' },
    { id: 'fresh-fruit', name: '新鲜水果', category: 'food' },
    { id: 'tasty-pizza', name: '美味披萨', category: 'food' },
    { id: 'sweet-ice-cream', name: '甜美冰淇淋', category: 'food' },
    { id: 'colorful-candy', name: '彩色糖果', category: 'food' },
    { id: 'healthy-vegetables', name: '健康蔬菜', category: 'food' },
    { id: 'warm-bread', name: '温暖面包', category: 'food' },
    { id: 'refreshing-drink', name: '清爽饮料', category: 'food' },
    { id: 'chocolate-cookies', name: '巧克力饼干', category: 'food' },
    { id: 'birthday-cupcake', name: '生日纸杯蛋糕', category: 'food' }
  ];

  // 从数组中随机选择指定数量的元素
  const getRandomSuggestions = (suggestions: StyleSuggestion[], count: number = 6): StyleSuggestion[] => {
    const shuffled = [...suggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 初始状态
  const initialState: UseGeneratePageState = {
    // 基础状态
    prompt: getInitialPrompt(),
    selectedTab: initialTab,
    selectedRatio: getInitialRatio(),
    publicVisibility: true,
    selectedImage: null,
    uploadedFile: null,
    
    // 数据状态
    generatedImages: [],
    textGeneratedImages: [],
    imageGeneratedImages: [],
    textExampleImages: [],
    imageExampleImages: [],
    styleSuggestions: [],
    
    // 加载状态
    isGenerating: false,
    isLoadingTextExamples: false,
    isLoadingImageExamples: false,
    isLoadingStyles: false,
    isInitialDataLoaded: false,
    
    // 错误状态
    error: null,
    
    // 任务状态
    currentTaskId: null,
    generationProgress: 0,

    // 积分状态
    userCredits: 0,
    canGenerate: false,
    isCheckingCredits: false,

    // 用户生成历史状态
    hasTextToImageHistory: false,  // 用户是否有 text to image 生成历史
    hasImageToImageHistory: false, // 用户是否有 image to image 生成历史
  };

  // 状态定义
  const [state, setState] = useState<UseGeneratePageState>(initialState);

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<UseGeneratePageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 基础操作
  const setPrompt = useCallback((prompt: string) => {
    updateState({ prompt });
  }, [updateState]);

  const setSelectedTab = useCallback((selectedTab: 'text' | 'image') => {
    // 使用函数式更新来检查是否真的需要更新
    setState(prevState => {
      // 只有当标签页真的发生变化时才重置selectedImage
      if (prevState.selectedTab !== selectedTab) {
        // 重置对应标签页的初始化标记，确保能够加载示例图片
        if (selectedTab === 'text') {
          textInitialized.current = false;
        } else {
          imageInitialized.current = false;
        }
        
        return {
          ...prevState,
          selectedTab,
          selectedImage: null,
          uploadedFile: null
        };
      }
      return prevState;
    });
  }, []);

  const setSelectedRatio = useCallback((selectedRatio: '3:4' | '4:3' | '1:1') => {
    updateState({ selectedRatio });
  }, [updateState]);

  const setPublicVisibility = useCallback((publicVisibility: boolean) => {
    updateState({ publicVisibility });
  }, [updateState]);

  const setSelectedImage = useCallback((selectedImage: string | null) => {
    updateState({ selectedImage });
  }, [updateState]);

  const setUploadedFile = useCallback((uploadedFile: File | null) => {
    updateState({ uploadedFile });
  }, [updateState]);

  const setUploadedImageWithDimensions = useCallback((uploadedFile: File | null, _dimensions: { width: number; height: number } | null) => {
    updateState({ uploadedFile });
  }, [updateState]);

  // 检查用户积分
  const checkUserCredits = useCallback(async () => {
    try {
      updateState({ isCheckingCredits: true });
      
      const { UserService } = await import('../services/userService');
      const user = await UserService.getCurrentUser();
      
      if (user) {
        const canGenerate = user.credits >= 20; // 需要20积分
        updateState({ 
          userCredits: user.credits, 
          canGenerate,
          isCheckingCredits: false 
        });
      } else {
        updateState({ 
          userCredits: 0, 
          canGenerate: false,
          isCheckingCredits: false 
        });
      }
    } catch (error) {
      console.error('Failed to check user credits:', error);
      updateState({ 
        userCredits: 0, 
        canGenerate: false,
        isCheckingCredits: false 
      });
    }
  }, [updateState]);

  // 处理积分不足
  const handleInsufficientCredits = useCallback(() => {
    // 跳转到充值页面
    window.location.href = '/price';
  }, []);

  // 加载生成历史
  const loadGeneratedImages = useCallback(async () => {
    try {
      // 根据当前标签页设置对应的加载状态
      if (state.selectedTab === 'text') {
        updateState({ isLoadingTextExamples: true });
      } else {
        updateState({ isLoadingImageExamples: true });
      }
      
      // 获取当前用户ID
      const { UserService } = await import('../services/userService');
      const user = await UserService.getCurrentUser();
      
      if (user) {
        // 获取所有生成的图片
        const images = await GenerateServiceInstance.getUserGeneratedImages(user.id);
        
        // 按类型分离图片
        const textImages = images.filter(img => img.type === 'text2image');
        const imageImages = images.filter(img => img.type === 'image2image');
        
        // 检查用户是否有不同类型的生成历史
        const hasTextToImageHistory = textImages.length > 0;
        const hasImageToImageHistory = imageImages.length > 0;
        
        updateState({ 
          generatedImages: images,  // 保留所有图片用于兼容性
          textGeneratedImages: textImages,
          imageGeneratedImages: imageImages,
          isLoadingTextExamples: false,
          isLoadingImageExamples: false,
          isInitialDataLoaded: true,  // 标记初始数据加载完成
          hasTextToImageHistory,
          hasImageToImageHistory
        });
      } else {
        // 如果用户未登录，清空生成历史
        updateState({ 
          generatedImages: [], 
          textGeneratedImages: [],
          imageGeneratedImages: [],
          isLoadingTextExamples: false,
          isLoadingImageExamples: false,
          isInitialDataLoaded: true,  // 即使没有用户也标记为加载完成
          hasTextToImageHistory: false,
          hasImageToImageHistory: false
        });
      }
    } catch (error) {
      console.error('Failed to load generated images:', error);
      updateState({ 
        generatedImages: [], 
        textGeneratedImages: [],
        imageGeneratedImages: [],
        isLoadingTextExamples: false,
        isLoadingImageExamples: false,
        isInitialDataLoaded: true,  // 即使出错也标记为加载完成
        hasTextToImageHistory: false,
        hasImageToImageHistory: false
      });
    }
  }, [updateState, state.selectedTab]);

  // 生成图片
  const generateImages = useCallback(async () => {
    if (state.isGenerating) return;
    
    // 检查积分
    if (!state.canGenerate) {
      handleInsufficientCredits();
      return;
    }
    
    try {
      updateState({ isGenerating: true, error: null, generationProgress: 0 });
      
      let response;
      
      if (state.selectedTab === 'text') {
        if (!state.prompt.trim()) {
          throw new Error('Please enter a prompt');
        }
        
        response = await GenerateServiceInstance.generateTextToImage({
          prompt: state.prompt,
          ratio: state.selectedRatio,
          isPublic: state.publicVisibility,
          userId: 'demo-user', // 添加默认用户ID
        });
      } else {
        if (!state.uploadedFile) {
          throw new Error('Please upload an image');
        }
        
        response = await GenerateServiceInstance.generateImageToImage({
          imageFile: state.uploadedFile,
          isPublic: state.publicVisibility,
          userId: 'demo-user', // 添加默认用户ID
        });
      }
      
      if (response.status === 'success' && response.data.taskId) {
        updateState({
          currentTaskId: response.data.taskId,
        });
        
        // 开始轮询任务状态
        pollTaskStatus(response.data.taskId);
      } else {
        throw new Error(response.message || 'Generation failed');
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'An error occurred',
        isGenerating: false,
      });
    }
  }, [state.isGenerating, state.selectedTab, state.prompt, state.selectedRatio, state.publicVisibility, state.uploadedFile, state.canGenerate, updateState, handleInsufficientCredits]);

  // 轮询任务状态完成后刷新积分
  const pollTaskStatus = useCallback(async (taskId: string) => {
    const maxAttempts = 60; // 最多轮询60次（5分钟）
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const taskStatus = await GenerateServiceInstance.getTaskStatus(taskId);
        
        updateState({
          generationProgress: taskStatus.progress || 0,
        });

        if (taskStatus.status === 'completed') {
          // 任务完成，刷新生成历史和积分
          await loadGeneratedImages();
          await checkUserCredits(); // 刷新本地积分状态
          
          // 刷新全局用户状态（更新Header中的积分显示）
          if (refreshUser) {
            try {
              await refreshUser();
            } catch (error) {
              console.error('Failed to refresh global user state:', error);
            }
          }
          
          // 设置选中的图片
          if (taskStatus.result || taskStatus.image) {
            const completedImage = taskStatus.result || taskStatus.image;
            updateState({
              selectedImage: completedImage?.id,
              isGenerating: false,
              currentTaskId: null,
              generationProgress: 100,
            });
          } else {
            updateState({
              isGenerating: false,
              currentTaskId: null,
              generationProgress: 100,
            });
          }
        } else if (taskStatus.status === 'failed') {
          updateState({
            error: taskStatus.message || 'Generation failed',
            isGenerating: false,
            currentTaskId: null,
          });
        } else if (attempts >= maxAttempts) {
          updateState({
            error: 'Generation timeout',
            isGenerating: false,
            currentTaskId: null,
          });
        } else {
          // 继续轮询
          setTimeout(poll, 5000); // 5秒后再次轮询
        }
      } catch (error) {
        console.error('Poll task status error:', error);
        updateState({
          error: 'Failed to check generation status',
          isGenerating: false,
          currentTaskId: null,
        });
      }
    };

    // 开始轮询
    poll();
  }, [updateState, loadGeneratedImages, checkUserCredits]);

  // 从所有图片中随机选择（移动端1张，桌面端3张）
  const getRandomImages = useCallback((allImages: HomeImage[]): HomeImage[] => {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    const isMobile = window.innerWidth < 640;
    const count = isMobile ? 1 : 3;
    return shuffled.slice(0, count);
  }, []);

  // Text to Image 示例图片加载
  useEffect(() => {
    if (state.selectedTab === 'text' && !textInitialized.current) {
      textInitialized.current = true;
      
      // 如果缓存中有图片，从缓存中随机选择
      if (textExampleCache.current.isLoaded && textExampleCache.current.allImages.length > 0) {
        const randomImages = getRandomImages(textExampleCache.current.allImages);
        setState(prev => ({ 
          ...prev, 
          textExampleImages: randomImages,
          isLoadingTextExamples: false 
        }));
        return;
      }
      
      // 如果没有缓存且未在加载，开始加载
      if (!textExampleCache.current.isLoading) {
        const loadTextExamples = async () => {
          try {
            textExampleCache.current.isLoading = true;
            setState(prev => ({ ...prev, isLoadingTextExamples: true, error: null }));
            
            const examples = await GenerateServiceInstance.getExampleImages('text', 21);
            const randomImages = getRandomImages(examples);
            
            // 更新缓存
            textExampleCache.current = {
              allImages: examples,
              isLoaded: true,
              isLoading: false
            };
            
            setState(prev => ({ 
              ...prev, 
              textExampleImages: randomImages, 
              isLoadingTextExamples: false 
            }));
          } catch (error) {
            textExampleCache.current.isLoading = false;
            setState(prev => ({
              ...prev,
              error: error instanceof Error ? error.message : 'Failed to load text examples',
              isLoadingTextExamples: false,
            }));
          }
        };
        
        loadTextExamples();
      }
    }
  }, [state.selectedTab]);

  // Image to Image 示例图片加载
  useEffect(() => {
    if (state.selectedTab === 'image' && !imageInitialized.current) {
      imageInitialized.current = true;
      
      // 如果缓存中有图片，从缓存中随机选择
      if (imageExampleCache.current.isLoaded && imageExampleCache.current.allImages.length > 0) {
        const randomImages = getRandomImages(imageExampleCache.current.allImages);
        setState(prev => ({ 
          ...prev, 
          imageExampleImages: randomImages,
          isLoadingImageExamples: false 
        }));
        return;
      }
      
      // 如果没有缓存且未在加载，开始加载
      if (!imageExampleCache.current.isLoading) {
        const loadImageExamples = async () => {
          try {
            imageExampleCache.current.isLoading = true;
            setState(prev => ({ ...prev, isLoadingImageExamples: true, error: null }));
            
            const examples = await GenerateServiceInstance.getExampleImages('image', 21);
            const randomImages = getRandomImages(examples);
            
            // 更新缓存
            imageExampleCache.current = {
              allImages: examples,
              isLoaded: true,
              isLoading: false
            };
            
            setState(prev => ({ 
              ...prev, 
              imageExampleImages: randomImages, 
              isLoadingImageExamples: false 
            }));
          } catch (error) {
            imageExampleCache.current.isLoading = false;
            setState(prev => ({
              ...prev,
              error: error instanceof Error ? error.message : 'Failed to load image examples',
              isLoadingImageExamples: false,
            }));
          }
        };
        
        loadImageExamples();
      }
    }
  }, [state.selectedTab]);

  // 加载风格建议
  const loadStyleSuggestions = useCallback(async () => {
    try {
      updateState({ isLoadingStyles: true, error: null });
      
      // 模拟异步加载（可选，让用户感觉更真实）
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 从50种建议中随机选择6种
      const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6);
      
      updateState({ styleSuggestions: randomSuggestions });
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load styles',
      });
    } finally {
      updateState({ isLoadingStyles: false });
    }
  }, [updateState]);

  // 重新创建示例
  const recreateExample = useCallback(async (exampleId: string) => {
    try {
      // 根据当前标签页找到对应的示例图片
      let exampleImage: HomeImage | undefined;
      
      if (state.selectedTab === 'text') {
        // 从 Text to Image 的示例图片中查找
        exampleImage = state.textExampleImages.find(img => img.id === exampleId);
        
        // 如果当前显示的示例中没有，从缓存中查找
        if (!exampleImage && textExampleCache.current.allImages.length > 0) {
          exampleImage = textExampleCache.current.allImages.find(img => img.id === exampleId);
        }
      } else {
        // 从 Image to Image 的示例图片中查找
        exampleImage = state.imageExampleImages.find(img => img.id === exampleId);
        
        // 如果当前显示的示例中没有，从缓存中查找
        if (!exampleImage && imageExampleCache.current.allImages.length > 0) {
          exampleImage = imageExampleCache.current.allImages.find(img => img.id === exampleId);
        }
      }
      
      if (!exampleImage) {
        throw new Error('Example image not found');
      }
      
      if (state.selectedTab === 'text') {
        // Text to Image: 回填示例图片的信息到界面
        const promptToUse = exampleImage.prompt || exampleImage.title || exampleImage.description || '';
        
        if (!promptToUse.trim()) {
          throw new Error('No prompt information available for this example');
        }
        
        // 回填 prompt、ratio、isPublic 到界面，不调用生成方法
        updateState({ 
          prompt: promptToUse,
          selectedRatio: exampleImage.ratio as '3:4' | '4:3' | '1:1' || '3:4',
          publicVisibility: exampleImage.isPublic || false,
          error: null
        });
        
      } else {
        // Image to Image: 将示例图片转换为 File 对象并填充到上传表单
        try {
          // 使用 colorUrl 作为要上传的图片（因为用户看到的 example 是彩色版本）
          const imageUrl = exampleImage.colorUrl;
          
          // 从 URL 获取图片并转换为 File 对象
          const response = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          
          // 创建 File 对象
          const fileExtension = blob.type.split('/')[1] || 'jpg';
          const fileName = `example-${exampleImage.title || exampleImage.id}.${fileExtension}`;
          const file = new File([blob], fileName, { type: blob.type });
          
          // 创建图片对象来获取尺寸
          const img = new Image();
          img.onload = () => {
            // 设置文件、尺寸和其他属性
            updateState({
              uploadedFile: file,
              selectedRatio: exampleImage.ratio as '3:4' | '4:3' | '1:1' || '3:4',
              publicVisibility: exampleImage.isPublic || false,
              selectedImage: null, // 清空选中的图片，因为现在是上传模式
              error: null
            });
          };
          img.onerror = () => {
            throw new Error('Failed to load image dimensions');
          };
          img.src = URL.createObjectURL(blob); // 使用 blob URL 避免 CORS 问题
          
        } catch (fetchError) {
          console.error('Failed to fetch example image:', fetchError);
          // 如果获取图片失败，回退到原来的逻辑
          updateState({
            selectedImage: exampleImage.defaultUrl,
            selectedRatio: exampleImage.ratio as '3:4' | '4:3' | '1:1' || '3:4',
            publicVisibility: exampleImage.isPublic || false,
            error: 'Failed to load example image. Please try uploading your own image.',
          });
        }
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load example data',
      });
    }
  }, [updateState, state.selectedTab, state.textExampleImages, state.imageExampleImages]);

  // 下载图片
  const downloadImage = useCallback(async (imageId: string, format: 'png' | 'pdf') => {
    try {
      updateState({ error: null }); // 清除之前的错误
      
      // 查找图片信息
      const imageData = state.generatedImages.find(img => img.id === imageId);
      if (!imageData) {
        throw new Error('Image not found');
      }
      
      // 生成文件名
      const fileName = `coloring-page-${imageData.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${imageId.slice(-8)}.${format}`;
      
      // 根据格式选择不同的下载方式
      if (format === 'png') {
        // PNG格式直接通过URL下载
        const { downloadImageByUrl } = await import('../utils/downloadUtils');
        await downloadImageByUrl(imageData.defaultUrl, fileName);
      } else {
        // PDF格式将图片转换为PDF
        const { downloadImageAsPdf } = await import('../utils/downloadUtils');
        await downloadImageAsPdf(imageData.defaultUrl, fileName);
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Download failed',
      });
    }
  }, [updateState, state.generatedImages]);

  // 清除错误
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // 重置表单
  const resetForm = useCallback(() => {
    updateState({
      prompt: '',
      selectedImage: null,
      uploadedFile: null,
      generatedImages: [],
      textGeneratedImages: [],
      imageGeneratedImages: [],
      hasTextToImageHistory: false,
      hasImageToImageHistory: false,
      error: null,
      currentTaskId: null,
      generationProgress: 0,
    });
  }, [updateState]);

  // 刷新示例（只有点击 Change 按钮时才调用）
  const refreshExamples = useCallback(() => {
    const isMobile = window.innerWidth < 640;
    
    if (state.selectedTab === 'text') {
      // Text to Image 刷新逻辑
      if (textExampleCache.current.allImages.length > 0) {
        let randomImages: HomeImage[];
        
        if (isMobile && state.textExampleImages.length > 0) {
          // 移动端：避免显示相同的图片
          const currentImageIds = state.textExampleImages.map(img => img.id);
          const availableImages = textExampleCache.current.allImages.filter(img => !currentImageIds.includes(img.id));
          
          if (availableImages.length > 0) {
            // 从未显示的图片中选择
            randomImages = getRandomImages(availableImages);
          } else {
            // 如果所有图片都显示过了，重新开始
            randomImages = getRandomImages(textExampleCache.current.allImages);
          }
        } else {
          // 桌面端或首次加载：正常随机选择
          randomImages = getRandomImages(textExampleCache.current.allImages);
        }
        
        setState(prev => ({ 
          ...prev,
          textExampleImages: randomImages
        }));
      } else {
        console.warn('Text example cache is empty, cannot refresh');
      }
    } else {
      // Image to Image 刷新逻辑
      if (imageExampleCache.current.allImages.length > 0) {
        let randomImages: HomeImage[];
        
        if (isMobile && state.imageExampleImages.length > 0) {
          // 移动端：避免显示相同的图片
          const currentImageIds = state.imageExampleImages.map(img => img.id);
          const availableImages = imageExampleCache.current.allImages.filter(img => !currentImageIds.includes(img.id));
          
          if (availableImages.length > 0) {
            // 从未显示的图片中选择
            randomImages = getRandomImages(availableImages);
          } else {
            // 如果所有图片都显示过了，重新开始
            randomImages = getRandomImages(imageExampleCache.current.allImages);
          }
        } else {
          // 桌面端或首次加载：正常随机选择
          randomImages = getRandomImages(imageExampleCache.current.allImages);
        }
        
        setState(prev => ({ 
          ...prev,
          imageExampleImages: randomImages
        }));
      } else {
        console.warn('Image example cache is empty, cannot refresh');
      }
    }
  }, [state.selectedTab, state.textExampleImages, state.imageExampleImages]);

  // 刷新风格建议
  const refreshStyleSuggestions = useCallback(async () => {
    // 直接重新随机选择，不需要调用 loadStyleSuggestions
    const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6);
    updateState({ styleSuggestions: randomSuggestions });
  }, [updateState]);

  // 删除图片
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      const { ImageService } = await import('../services/imageService');
      const success = await ImageService.deleteImage(imageId);
      
      if (success) {
        // 从生成的图片列表中移除
        setState(prevState => {
          const newGeneratedImages = prevState.generatedImages.filter(img => img.id !== imageId);
          const newTextGeneratedImages = prevState.textGeneratedImages.filter(img => img.id !== imageId);
          const newImageGeneratedImages = prevState.imageGeneratedImages.filter(img => img.id !== imageId);
          
          // 重新计算历史状态
          const hasTextToImageHistory = newTextGeneratedImages.length > 0;
          const hasImageToImageHistory = newImageGeneratedImages.length > 0;
          
          return {
            ...prevState,
            generatedImages: newGeneratedImages,
            textGeneratedImages: newTextGeneratedImages,
            imageGeneratedImages: newImageGeneratedImages,
            hasTextToImageHistory,
            hasImageToImageHistory,
            selectedImage: prevState.selectedImage === imageId ? null : prevState.selectedImage
          };
        });
      }
      
      return success;
    } catch (error) {
      console.error('Delete image error:', error);
      updateState({
        error: error instanceof Error ? error.message : 'Failed to delete image',
      });
      return false;
    }
  }, [updateState]);

  // 初始化加载（只执行一次）
  useEffect(() => {
    loadGeneratedImages(); // 只在初始化时加载一次
    loadStyleSuggestions(); // 风格建议也只需要加载一次
    checkUserCredits(); // 检查用户积分
  }, []); // 空依赖数组，确保只执行一次

  // 当标签页切换时重新检查积分
  useEffect(() => {
    checkUserCredits();
  }, [state.selectedTab, checkUserCredits]);

  // 手动加载示例图片的函数（用于外部调用）
  const loadExampleImages = useCallback(async () => {
    // 这个函数主要用于外部手动调用，实际的自动加载在 useEffect 中处理
    console.log('Manual load example images');
  }, []);

  // 返回状态和操作
  return {
    // 状态
    ...state,
    
    // 操作
    setPrompt,
    setSelectedTab,
    setSelectedRatio,
    setPublicVisibility,
    setSelectedImage,
    setUploadedFile,
    setUploadedImageWithDimensions,
    generateImages,
    loadExampleImages,
    loadStyleSuggestions,
    recreateExample,
    downloadImage,
    clearError,
    resetForm,
    refreshExamples,
    refreshStyleSuggestions,
    loadGeneratedImages,
    deleteImage,
    checkUserCredits,
    handleInsufficientCredits,
  };
};

export default useGeneratePage;
