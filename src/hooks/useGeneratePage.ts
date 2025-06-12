import { useState, useEffect, useCallback } from 'react';
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
  exampleImages: HomeImage[];
  styleSuggestions: StyleSuggestion[];
  
  // 加载状态
  isGenerating: boolean;
  isLoadingExamples: boolean;
  isLoadingStyles: boolean;
  
  // 错误状态
  error: string | null;
  
  // 任务状态
  currentTaskId: string | null;
  generationProgress: number;
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
  refreshExamples: () => Promise<void>;
}

export const useGeneratePage = (initialTab: 'text' | 'image' = 'text') => {
  const [searchParams] = useSearchParams();
  
  // 缓存示例图片，避免重复加载和闪烁
  const [exampleImagesCache, setExampleImagesCache] = useState<{
    text: HomeImage[];
    image: HomeImage[];
  }>({ text: [], image: [] });
  
  // 从URL参数获取初始值
  const getInitialPrompt = () => searchParams.get('prompt') || '';
  const getInitialRatio = (): '3:4' | '4:3' | '1:1' => {
    const ratio = searchParams.get('ratio');
    return (ratio === '3:4' || ratio === '4:3' || ratio === '1:1') ? ratio : '3:4';
  };
  
  // 状态定义
  const [state, setState] = useState<UseGeneratePageState>({
    prompt: getInitialPrompt(),
    selectedTab: initialTab,
    selectedRatio: getInitialRatio(),
    publicVisibility: true,
    selectedImage: null,
    uploadedFile: null,
    generatedImages: [],
    exampleImages: [],
    styleSuggestions: [],
    isGenerating: false,
    isLoadingExamples: false,
    isLoadingStyles: false,
    error: null,
    currentTaskId: null,
    generationProgress: 0,
  });

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<UseGeneratePageState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 基础操作
  const setPrompt = useCallback((prompt: string) => {
    updateState({ prompt });
  }, [updateState]);

  const setSelectedTab = useCallback((selectedTab: 'text' | 'image') => {
    updateState({ selectedTab, selectedImage: null, uploadedFile: null });
  }, [updateState]);

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

  // 生成图片
  const generateImages = useCallback(async () => {
    if (state.isGenerating) return;
    
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
      
      if (response.success && response.data.taskId) {
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
  }, [state.isGenerating, state.selectedTab, state.prompt, state.selectedRatio, state.publicVisibility, state.uploadedFile, updateState]);

  // 轮询任务状态
  const pollTaskStatus = useCallback(async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const taskStatus = await GenerateServiceInstance.getTaskStatus(taskId);
        
        updateState({
          generationProgress: taskStatus.progress,
        });
        
        if (taskStatus.status === 'completed') {
          clearInterval(pollInterval);
          // 使用函数式更新确保获取最新的 generatedImages
          // 新生成的图片插入到最前面
          setState(prevState => ({
            ...prevState,
            isGenerating: false,
            generatedImages: taskStatus.image ? [taskStatus.image, ...prevState.generatedImages] : prevState.generatedImages,
            selectedImage: taskStatus.image?.colorUrl || null,
            generationProgress: 100,
          }));
        } else if (taskStatus.status === 'failed') {
          clearInterval(pollInterval);
          updateState({
            isGenerating: false,
            error: 'Generation failed',
            generationProgress: 0,
          });
        }
      } catch (error) {
        clearInterval(pollInterval);
        updateState({
          isGenerating: false,
          error: error instanceof Error ? error.message : 'Failed to check status',
        });
      }
    }, 500); // 500ms检查一次状态
  }, [updateState]);

  // 加载示例图片
  const loadExampleImages = useCallback(async () => {
    // 检查缓存，如果已有数据则直接使用，避免闪烁
    if (exampleImagesCache[state.selectedTab].length > 0) {
      updateState({ 
        exampleImages: exampleImagesCache[state.selectedTab],
        isLoadingExamples: false 
      });
      return;
    }
    
    try {
      updateState({ isLoadingExamples: true, error: null });
      const examples = await GenerateServiceInstance.getExampleImages(state.selectedTab);
      
      // 更新缓存
      setExampleImagesCache(prev => ({
        ...prev,
        [state.selectedTab]: examples
      }));
      
      // 更新状态
      updateState({ exampleImages: examples, isLoadingExamples: false });
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Failed to load examples',
        isLoadingExamples: false,
      });
    }
  }, [state.selectedTab, updateState, exampleImagesCache]);

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
      updateState({ isGenerating: true, error: null });
      const response = await GenerateServiceInstance.recreateExample(exampleId);
      
      if (response.success && response.data.taskId) {
        updateState({
          currentTaskId: response.data.taskId,
        });
        
        // 开始轮询任务状态
        pollTaskStatus(response.data.taskId);
      } else {
        throw new Error(response.message || 'Recreation failed');
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'Recreation failed',
        isGenerating: false,
      });
    }
  }, [updateState, pollTaskStatus]);

  // 下载图片
  const downloadImage = useCallback(async (imageId: string, format: 'png' | 'pdf') => {
    try {
      updateState({ error: null }); // 清除之前的错误
      
      // 查找图片信息以获取更好的文件名
      const imageData = state.generatedImages.find(img => img.id === imageId);
      const fileName = imageData 
        ? `coloring-page-${imageData.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${imageId.slice(-8)}.${format}`
        : `coloring-page-${imageId}.${format}`;
      
      const blob = await GenerateServiceInstance.downloadImage(imageId, format);
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully downloaded ${fileName}`);
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

  // 刷新示例
  const refreshExamples = useCallback(async () => {
    // 清除当前标签页的缓存，强制重新加载
    setExampleImagesCache(prev => ({
      ...prev,
      [state.selectedTab]: []
    }));
    await loadExampleImages();
  }, [loadExampleImages, state.selectedTab]);

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

  // 加载生成历史
  const loadGeneratedImages = useCallback(async () => {
    try {
      const images = await GenerateServiceInstance.getAllGeneratedImages();
      updateState({ generatedImages: images });
    } catch (error) {
      console.error('Failed to load generated images:', error);
    }
  }, [updateState]);

  // 初始化加载（只执行一次）
  useEffect(() => {
    loadGeneratedImages(); // 只在初始化时加载一次
    loadStyleSuggestions(); // 风格建议也只需要加载一次
  }, []); // 空依赖数组，确保只执行一次

  // 初始化和标签页变化时加载示例图片
  useEffect(() => {
    loadExampleImages();
  }, [loadExampleImages]);

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
  };
};

export default useGeneratePage;
