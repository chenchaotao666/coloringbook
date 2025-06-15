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
  generatedImages: HomeImage[];
  textExampleImages: HomeImage[];  // Text to Image 示例图片
  imageExampleImages: HomeImage[]; // Image to Image 示例图片
  styleSuggestions: StyleSuggestion[];
  
  // 加载状态
  isGenerating: boolean;
  isLoadingTextExamples: boolean;  // Text to Image 加载状态
  isLoadingImageExamples: boolean; // Image to Image 加载状态
  isLoadingStyles: boolean;
  isLoadingGeneratedImages: boolean; // 生成历史加载状态
  
  // 错误状态
  error: string | null;
  
  // 任务状态
  currentTaskId: string | null;
  generationProgress: number;

  // 积分状态
  userCredits: number;
  canGenerate: boolean;
  isCheckingCredits: boolean;
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
  
  // 初始状态
  const initialState: UseGeneratePageState = {
    // 基础状态
    prompt: getInitialPrompt(),
    selectedTab: initialTab,
    selectedRatio: getInitialRatio(),
    publicVisibility: false,
    selectedImage: null,
    uploadedFile: null,
    
    // 数据状态
    generatedImages: [],
    textExampleImages: [],
    imageExampleImages: [],
    styleSuggestions: [],
    
    // 加载状态
    isGenerating: false,
    isLoadingTextExamples: false,
    isLoadingImageExamples: false,
    isLoadingStyles: false,
    isLoadingGeneratedImages: false,
    
    // 错误状态
    error: null,
    
    // 任务状态
    currentTaskId: null,
    generationProgress: 0,

    // 积分状态
    userCredits: 0,
    canGenerate: false,
    isCheckingCredits: false,
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
      updateState({ isLoadingGeneratedImages: true });
      
      // 获取当前用户ID
      const { UserService } = await import('../services/userService');
      const user = await UserService.getCurrentUser();
      
      if (user) {
        const images = await GenerateServiceInstance.getUserGeneratedImages(user.id);
        updateState({ generatedImages: images, isLoadingGeneratedImages: false });
      } else {
        // 如果用户未登录，清空生成历史
        updateState({ generatedImages: [], isLoadingGeneratedImages: false });
      }
    } catch (error) {
      console.error('Failed to load generated images:', error);
      updateState({ generatedImages: [], isLoadingGeneratedImages: false });
    }
  }, [updateState]);

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

  // 从所有图片中随机选择3张
  const getRandomImages = useCallback((allImages: HomeImage[]): HomeImage[] => {
    const shuffled = [...allImages].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
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
      const styles = await GenerateServiceInstance.getStyleSuggestions();
      updateState({ styleSuggestions: styles });
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
        // Text to Image: 使用示例图片的 prompt 信息
        const promptToUse = exampleImage.prompt || exampleImage.title || exampleImage.description || '';
        
        if (!promptToUse.trim()) {
          throw new Error('No prompt information available for this example');
        }
        
        // 设置 prompt 到输入框
        updateState({ 
          prompt: promptToUse,
          isGenerating: true, 
          error: null,
          generationProgress: 0
        });
        
        // 调用 Text to Image 生成方法
        const response = await GenerateServiceInstance.generateTextToImage({
          prompt: promptToUse,
          ratio: state.selectedRatio,
          isPublic: state.publicVisibility
        });
        
        if (response.status === 'success' && response.data.taskId) {
          updateState({
            currentTaskId: response.data.taskId,
          });
          
          // 开始轮询任务状态
          pollTaskStatus(response.data.taskId);
        } else {
          throw new Error(response.message || 'Generation failed');
        }
      } else {
        // Image to Image: 这里可以根据需要实现相应的逻辑
        // 目前先抛出错误，提示功能未实现
        throw new Error('Image to Image recreate functionality not implemented yet');
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Recreation failed',
        isGenerating: false,
      });
    }
  }, [updateState, pollTaskStatus, state.selectedTab, state.textExampleImages, state.imageExampleImages, state.selectedRatio, state.publicVisibility]);

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
      error: null,
      currentTaskId: null,
      generationProgress: 0,
    });
  }, [updateState]);

  // 刷新示例（只有点击 Change 按钮时才调用）
  const refreshExamples = useCallback(() => {
    if (state.selectedTab === 'text') {
      // Text to Image 刷新逻辑 - 只从缓存中随机选择
      if (textExampleCache.current.allImages.length > 0) {
        const randomImages = getRandomImages(textExampleCache.current.allImages);
        setState(prev => ({ 
          ...prev,
          textExampleImages: randomImages
        }));
      } else {
        console.warn('Text example cache is empty, cannot refresh');
      }
    } else {
      // Image to Image 刷新逻辑 - 只从缓存中随机选择
      if (imageExampleCache.current.allImages.length > 0) {
        const randomImages = getRandomImages(imageExampleCache.current.allImages);
        setState(prev => ({ 
          ...prev,
          imageExampleImages: randomImages
        }));
      } else {
        console.warn('Image example cache is empty, cannot refresh');
      }
    }
  }, [state.selectedTab]);

  // 刷新风格建议
  const refreshStyleSuggestions = useCallback(async () => {
    await loadStyleSuggestions();
  }, [loadStyleSuggestions]);

  // 删除图片
  const deleteImage = useCallback(async (imageId: string): Promise<boolean> => {
    try {
      const { ImageService } = await import('../services/imageService');
      const success = await ImageService.deleteImage(imageId);
      
      if (success) {
        // 从生成的图片列表中移除
        setState(prevState => ({
          ...prevState,
          generatedImages: prevState.generatedImages.filter(img => img.id !== imageId),
          selectedImage: prevState.selectedImage === imageId ? null : prevState.selectedImage
        }));
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
