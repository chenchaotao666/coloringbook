import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import GenerateServiceInstance, { StyleSuggestion } from '../services/generateService';
import { HomeImage } from '../services/imageService';
import { useLanguage } from '../contexts/LanguageContext';

export interface UseGeneratePageState {
  // 基础状态
  prompt: string;
  selectedTab: 'text' | 'image';
  selectedRatio: '3:4' | '4:3' | '1:1';
  textPublicVisibility: boolean;   // Text to Image 的 Public Visibility
  imagePublicVisibility: boolean;  // Image to Image 的 Public Visibility
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

  // 用户生成历史状态
  hasTextToImageHistory: boolean;  // 用户是否有 text to image 生成历史
  hasImageToImageHistory: boolean; // 用户是否有 image to image 生成历史
}

export interface UseGeneratePageActions {
  // 基础操作
  setPrompt: (prompt: string) => void;
  setSelectedTab: (tab: 'text' | 'image') => void;
  setSelectedRatio: (ratio: '3:4' | '4:3' | '1:1') => void;
  setTextPublicVisibility: (visible: boolean) => void;
  setImagePublicVisibility: (visible: boolean) => void;
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
  const { language } = useLanguage();
  
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
  const getInitialIsPublic = (): boolean => {
    const isPublic = searchParams.get('isPublic');
    return isPublic === 'true';
  };
  const getSourceImageUrl = (): string | null => {
    return searchParams.get('sourceImageUrl');
  };

  // 从URL下载图片并转换为File对象
  const downloadImageAsFile = async (imageUrl: string): Promise<File | null> => {
    try {
      // 处理相对路径，转换为绝对路径
      const absoluteUrl = imageUrl.startsWith('/') 
        ? `${window.location.origin}${imageUrl}`
        : imageUrl;
      
      console.log('Starting to fetch image from:', absoluteUrl);
      const response = await fetch(absoluteUrl);
      console.log('Fetch response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      console.log('Blob created:', blob.size, 'bytes, type:', blob.type);
      
      // 从URL中提取文件名，如果没有则使用默认名称
      const urlPath = imageUrl.includes('/') ? imageUrl : absoluteUrl;
      const fileName = urlPath.split('/').pop() || 'recreated-image.jpg';
      console.log('Generated filename:', fileName);
      
      // 创建File对象
      const file = new File([blob], fileName, { type: blob.type });
      console.log('File created:', file.name, file.size, 'bytes, type:', file.type);
      return file;
    } catch (error) {
      console.error('Error downloading image as file:', error);
      return null;
    }
  };
  
  // 预设的50种常用图片生成建议
  const STYLE_SUGGESTIONS = {
    zh: [
      // 动物类
      { id: 'cute-cat', name: '可爱小猫', content: '一只可爱的小猫咪，有着大大的眼睛和蓬松的毛发', category: 'animals' },
      { id: 'friendly-dog', name: '友好小狗', content: '一只友善的小狗，摇着尾巴，表情开心', category: 'animals' },
      { id: 'colorful-butterfly', name: '彩色蝴蝶', content: '一只美丽的彩色蝴蝶，翅膀上有精美的花纹', category: 'animals' },
      { id: 'wise-owl', name: '智慧猫头鹰', content: '一只聪明的猫头鹰，戴着小眼镜，坐在树枝上', category: 'animals' },
      { id: 'happy-elephant', name: '快乐大象', content: '一只快乐的大象，长长的鼻子，温和的眼神', category: 'animals' },
      { id: 'graceful-swan', name: '优雅天鹅', content: '一只优雅的白天鹅，在清澈的湖水中游泳', category: 'animals' },
      { id: 'playful-dolphin', name: '顽皮海豚', content: '一只顽皮的海豚，正在海水中跳跃嬉戏', category: 'animals' },
      { id: 'majestic-lion', name: '威严狮子', content: '一只威严的狮子，有着浓密的鬃毛和王者气息', category: 'animals' },
      { id: 'cute-panda', name: '可爱熊猫', content: '一只可爱的大熊猫，黑白分明，正在吃竹子', category: 'animals' },
      { id: 'colorful-parrot', name: '彩色鹦鹉', content: '一只色彩斑斓的鹦鹉，有着明亮的羽毛', category: 'animals' },

      // 自然风景类
      { id: 'beautiful-flower', name: '美丽花朵', content: '一朵美丽的花，花瓣层层叠叠，色彩鲜艳', category: 'nature' },
      { id: 'tall-tree', name: '高大树木', content: '一棵高大的树木，枝叶茂盛，根系发达', category: 'nature' },
      { id: 'peaceful-mountain', name: '宁静山峰', content: '宁静的山峰，云雾缭绕，景色壮观', category: 'nature' },
      { id: 'flowing-river', name: '流淌小河', content: '一条清澈的小河，水流潺潺，两岸绿树成荫', category: 'nature' },
      { id: 'bright-sun', name: '明亮太阳', content: '明亮的太阳，散发着温暖的光芒', category: 'nature' },
      { id: 'crescent-moon', name: '弯弯月亮', content: '弯弯的月亮，在夜空中闪闪发光', category: 'nature' },
      { id: 'twinkling-stars', name: '闪烁星星', content: '满天的星星，在夜空中闪闪发光', category: 'nature' },
      { id: 'fluffy-clouds', name: '蓬松云朵', content: '蓬松的白云，在蓝天中飘荡', category: 'nature' },
      { id: 'colorful-rainbow', name: '彩色彩虹', content: '美丽的彩虹，横跨天空，色彩斑斓', category: 'nature' },
      { id: 'ocean-waves', name: '海洋波浪', content: '汹涌的海浪，拍打着海岸，溅起雪白的浪花', category: 'nature' },

      // 卡通人物类
      { id: 'happy-princess', name: '快乐公主', content: '一位快乐的公主，穿着华丽的裙子，戴着王冠', category: 'characters' },
      { id: 'brave-knight', name: '勇敢骑士', content: '一位勇敢的骑士，穿着闪亮的盔甲，手持长剑', category: 'characters' },
      { id: 'magical-fairy', name: '魔法仙女', content: '一位魔法仙女，有着透明的翅膀和魔法棒', category: 'characters' },
      { id: 'funny-clown', name: '有趣小丑', content: '一个有趣的小丑，红鼻子，彩色的衣服，表情搞笑', category: 'characters' },
      { id: 'superhero', name: '超级英雄', content: '一位超级英雄，穿着酷炫的服装，准备拯救世界', category: 'characters' },
      { id: 'cute-robot', name: '可爱机器人', content: '一个可爱的机器人，有着圆圆的身体和友善的表情', category: 'characters' },
      { id: 'friendly-alien', name: '友好外星人', content: '一个友好的外星人，有着大眼睛和绿色的皮肤', category: 'characters' },
      { id: 'wise-wizard', name: '智慧巫师', content: '一位智慧的巫师，长胡子，穿着星星图案的长袍', category: 'characters' },
      { id: 'dancing-ballerina', name: '舞蹈芭蕾', content: '一位优雅的芭蕾舞者，穿着蓬蓬裙，正在跳舞', category: 'characters' },
      { id: 'smiling-chef', name: '微笑厨师', content: '一位微笑的厨师，戴着高高的厨师帽，围着围裙', category: 'characters' },

      // 交通工具类
      { id: 'fast-car', name: '快速汽车', content: '一辆快速的汽车，流线型车身，准备出发', category: 'vehicles' },
      { id: 'big-truck', name: '大卡车', content: '一辆大卡车，车厢宽敞，轮子很大', category: 'vehicles' },
      { id: 'flying-airplane', name: '飞行飞机', content: '一架飞行的飞机，在蓝天白云中翱翔', category: 'vehicles' },
      { id: 'sailing-boat', name: '航行帆船', content: '一艘航行的帆船，白色的帆布鼓满了风', category: 'vehicles' },
      { id: 'speedy-train', name: '快速火车', content: '一列快速的火车，在铁轨上疾驰而过', category: 'vehicles' },
      { id: 'colorful-bicycle', name: '彩色自行车', content: '一辆彩色的自行车，有着明亮的颜色和铃铛', category: 'vehicles' },
      { id: 'fire-truck', name: '消防车', content: '一辆红色的消防车，装满了救火设备', category: 'vehicles' },
      { id: 'school-bus', name: '校车', content: '一辆黄色的校车，载着孩子们去上学', category: 'vehicles' },
      { id: 'police-car', name: '警车', content: '一辆警车，有着闪烁的警灯和警报器', category: 'vehicles' },
      { id: 'ambulance', name: '救护车', content: '一辆救护车，白色车身，红十字标记', category: 'vehicles' },

      // 食物类
      { id: 'delicious-cake', name: '美味蛋糕', content: '一个美味的蛋糕，多层设计，上面有奶油和装饰', category: 'food' },
      { id: 'fresh-fruit', name: '新鲜水果', content: '新鲜的水果，苹果、香蕉、橙子等，色彩丰富', category: 'food' },
      { id: 'tasty-pizza', name: '美味披萨', content: '一个美味的披萨，上面有丰富的配菜和芝士', category: 'food' },
      { id: 'sweet-ice-cream', name: '甜美冰淇淋', content: '甜美的冰淇淋，多种口味，装在蛋筒里', category: 'food' },
      { id: 'colorful-candy', name: '彩色糖果', content: '彩色的糖果，各种形状和颜色，看起来很甜', category: 'food' },
      { id: 'healthy-vegetables', name: '健康蔬菜', content: '健康的蔬菜，胡萝卜、花椰菜、青菜等', category: 'food' },
      { id: 'warm-bread', name: '温暖面包', content: '温暖的面包，刚出炉，散发着香气', category: 'food' },
      { id: 'refreshing-drink', name: '清爽饮料', content: '清爽的饮料，装在杯子里，有吸管', category: 'food' },
      { id: 'chocolate-cookies', name: '巧克力饼干', content: '美味的巧克力饼干，酥脆可口', category: 'food' },
      { id: 'birthday-cupcake', name: '生日纸杯蛋糕', content: '生日纸杯蛋糕，上面有蜡烛和彩色装饰', category: 'food' }
    ],
    en: [
      // Animals
      { id: 'cute-cat', name: 'Cute Cat', content: 'A cute little kitten with big eyes and fluffy fur', category: 'animals' },
      { id: 'friendly-dog', name: 'Friendly Dog', content: 'A friendly little dog wagging its tail with a happy expression', category: 'animals' },
      { id: 'colorful-butterfly', name: 'Colorful Butterfly', content: 'A beautiful colorful butterfly with intricate patterns on its wings', category: 'animals' },
      { id: 'wise-owl', name: 'Wise Owl', content: 'A smart owl wearing little glasses, sitting on a tree branch', category: 'animals' },
      { id: 'happy-elephant', name: 'Happy Elephant', content: 'A happy elephant with a long trunk and gentle eyes', category: 'animals' },
      { id: 'graceful-swan', name: 'Graceful Swan', content: 'An elegant white swan swimming in clear lake water', category: 'animals' },
      { id: 'playful-dolphin', name: 'Playful Dolphin', content: 'A playful dolphin jumping and playing in the ocean water', category: 'animals' },
      { id: 'majestic-lion', name: 'Majestic Lion', content: 'A majestic lion with a thick mane and royal presence', category: 'animals' },
      { id: 'cute-panda', name: 'Cute Panda', content: 'A cute giant panda with distinct black and white markings, eating bamboo', category: 'animals' },
      { id: 'colorful-parrot', name: 'Colorful Parrot', content: 'A colorful parrot with bright and vibrant feathers', category: 'animals' },

      // Nature
      { id: 'beautiful-flower', name: 'Beautiful Flower', content: 'A beautiful flower with layered petals in bright colors', category: 'nature' },
      { id: 'tall-tree', name: 'Tall Tree', content: 'A tall tree with lush foliage and strong roots', category: 'nature' },
      { id: 'peaceful-mountain', name: 'Peaceful Mountain', content: 'Peaceful mountain peaks surrounded by mist with spectacular scenery', category: 'nature' },
      { id: 'flowing-river', name: 'Flowing River', content: 'A clear flowing river with gentle currents and green trees on both sides', category: 'nature' },
      { id: 'bright-sun', name: 'Bright Sun', content: 'A bright sun radiating warm light', category: 'nature' },
      { id: 'crescent-moon', name: 'Crescent Moon', content: 'A crescent moon shining brightly in the night sky', category: 'nature' },
      { id: 'twinkling-stars', name: 'Twinkling Stars', content: 'Countless stars twinkling in the night sky', category: 'nature' },
      { id: 'fluffy-clouds', name: 'Fluffy Clouds', content: 'Fluffy white clouds floating in the blue sky', category: 'nature' },
      { id: 'colorful-rainbow', name: 'Colorful Rainbow', content: 'A beautiful rainbow stretching across the sky with vibrant colors', category: 'nature' },
      { id: 'ocean-waves', name: 'Ocean Waves', content: 'Powerful ocean waves crashing against the shore with white foam', category: 'nature' },

      // Characters
      { id: 'happy-princess', name: 'Happy Princess', content: 'A happy princess wearing a gorgeous dress and a crown', category: 'characters' },
      { id: 'brave-knight', name: 'Brave Knight', content: 'A brave knight in shining armor holding a sword', category: 'characters' },
      { id: 'magical-fairy', name: 'Magical Fairy', content: 'A magical fairy with transparent wings and a magic wand', category: 'characters' },
      { id: 'funny-clown', name: 'Funny Clown', content: 'A funny clown with a red nose and colorful clothes with a comical expression', category: 'characters' },
      { id: 'superhero', name: 'Superhero', content: 'A superhero in a cool costume ready to save the world', category: 'characters' },
      { id: 'cute-robot', name: 'Cute Robot', content: 'A cute robot with a round body and friendly expression', category: 'characters' },
      { id: 'friendly-alien', name: 'Friendly Alien', content: 'A friendly alien with big eyes and green skin', category: 'characters' },
      { id: 'wise-wizard', name: 'Wise Wizard', content: 'A wise wizard with a long beard wearing a star-patterned robe', category: 'characters' },
      { id: 'dancing-ballerina', name: 'Dancing Ballerina', content: 'An elegant ballerina in a tutu dress performing a dance', category: 'characters' },
      { id: 'smiling-chef', name: 'Smiling Chef', content: 'A smiling chef wearing a tall chef hat and apron', category: 'characters' },

      // Vehicles
      { id: 'fast-car', name: 'Fast Car', content: 'A fast car with streamlined body ready to go', category: 'vehicles' },
      { id: 'big-truck', name: 'Big Truck', content: 'A big truck with spacious cargo area and large wheels', category: 'vehicles' },
      { id: 'flying-airplane', name: 'Flying Airplane', content: 'An airplane flying through blue skies and white clouds', category: 'vehicles' },
      { id: 'sailing-boat', name: 'Sailing Boat', content: 'A sailing boat with white sails filled with wind', category: 'vehicles' },
      { id: 'speedy-train', name: 'Speedy Train', content: 'A fast train speeding along the railway tracks', category: 'vehicles' },
      { id: 'colorful-bicycle', name: 'Colorful Bicycle', content: 'A colorful bicycle with bright colors and a bell', category: 'vehicles' },
      { id: 'fire-truck', name: 'Fire Truck', content: 'A red fire truck equipped with firefighting equipment', category: 'vehicles' },
      { id: 'school-bus', name: 'School Bus', content: 'A yellow school bus carrying children to school', category: 'vehicles' },
      { id: 'police-car', name: 'Police Car', content: 'A police car with flashing lights and sirens', category: 'vehicles' },
      { id: 'ambulance', name: 'Ambulance', content: 'An ambulance with white body and red cross markings', category: 'vehicles' },

      // Food
      { id: 'delicious-cake', name: 'Delicious Cake', content: 'A delicious multi-layered cake with cream and decorations', category: 'food' },
      { id: 'fresh-fruit', name: 'Fresh Fruit', content: 'Fresh fruits like apples, bananas, oranges with rich colors', category: 'food' },
      { id: 'tasty-pizza', name: 'Tasty Pizza', content: 'A delicious pizza with rich toppings and cheese', category: 'food' },
      { id: 'sweet-ice-cream', name: 'Sweet Ice Cream', content: 'Sweet ice cream in various flavors served in a cone', category: 'food' },
      { id: 'colorful-candy', name: 'Colorful Candy', content: 'Colorful candies in various shapes and colors that look sweet', category: 'food' },
      { id: 'healthy-vegetables', name: 'Healthy Vegetables', content: 'Healthy vegetables like carrots, broccoli, and greens', category: 'food' },
      { id: 'warm-bread', name: 'Warm Bread', content: 'Warm bread fresh from the oven with a delicious aroma', category: 'food' },
      { id: 'refreshing-drink', name: 'Refreshing Drink', content: 'A refreshing drink served in a cup with a straw', category: 'food' },
      { id: 'chocolate-cookies', name: 'Chocolate Cookies', content: 'Delicious chocolate cookies that are crispy and tasty', category: 'food' },
      { id: 'birthday-cupcake', name: 'Birthday Cupcake', content: 'Birthday cupcakes with candles and colorful decorations', category: 'food' }
    ]
  };

  // 从数组中随机选择指定数量的元素
  const getRandomSuggestions = (suggestions: { zh: StyleSuggestion[], en: StyleSuggestion[] }, count: number = 6, language: 'zh' | 'en' = 'zh'): StyleSuggestion[] => {
    const languageSuggestions = suggestions[language];
    const shuffled = [...languageSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // 初始状态
  const initialState: UseGeneratePageState = {
    // 基础状态
    prompt: getInitialPrompt(),
    selectedTab: initialTab,
    selectedRatio: getInitialRatio(),
    textPublicVisibility: searchParams.get('isPublic') ? getInitialIsPublic() : true,
    imagePublicVisibility: searchParams.get('isPublic') ? getInitialIsPublic() : true,
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
    canGenerate: true,

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
      // 只有当标签页真的发生变化时才重置相关状态
      if (prevState.selectedTab !== selectedTab) {
        // 根据切换的目标标签页，只清空与当前模式不相关的状态
        if (selectedTab === 'text') {
          // 切换到 Text to Image，保留选中的历史图片
          return {
            ...prevState,
            selectedTab,
          };
        } else {
          // 切换到 Image to Image，保留上传的文件
          return {
            ...prevState,
            selectedTab,
          };
        }
      }
      return prevState;
    });
  }, []);

  const setSelectedRatio = useCallback((selectedRatio: '3:4' | '4:3' | '1:1') => {
    updateState({ selectedRatio });
  }, [updateState]);

  const setTextPublicVisibility = useCallback((textPublicVisibility: boolean) => {
    updateState({ textPublicVisibility });
  }, [updateState]);

  const setImagePublicVisibility = useCallback((imagePublicVisibility: boolean) => {
    updateState({ imagePublicVisibility });
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
      const { UserService } = await import('../services/userService');
      
      // 先检查是否已登录
      if (!UserService.isLoggedIn()) {
        updateState({ 
          userCredits: 0, 
          canGenerate: false
        });
        return;
      }
      
      const user = await UserService.getCurrentUser();
      
      if (user) {
        const canGenerate = user.credits >= 20; // 需要20积分
        updateState({ 
          userCredits: user.credits, 
          canGenerate
        });
      } else {
        updateState({ 
          userCredits: 0, 
          canGenerate: false
        });
      }
    } catch (error) {
      console.error('Failed to check user credits:', error);
      updateState({ 
        userCredits: 0, 
        canGenerate: false
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
      
      const { UserService } = await import('../services/userService');
      
      // 先检查是否已登录
      if (!UserService.isLoggedIn()) {
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
        return;
      }
      
      // 获取当前用户ID
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
          isPublic: state.textPublicVisibility,
          userId: 'demo-user', // 添加默认用户ID
        });
      } else {
        if (!state.uploadedFile) {
          throw new Error('Please upload an image');
        }
        
        response = await GenerateServiceInstance.generateImageToImage({
          imageFile: state.uploadedFile,
          isPublic: state.imagePublicVisibility,
          userId: 'demo-user', // 添加默认用户ID
        });
      }
      
      if (response.status === 'success' && response.data.taskId) {
        updateState({
          currentTaskId: response.data.taskId,
        });
        
        // 开始轮询任务状态
        const taskType = state.selectedTab === 'text' ? 'text2image' : 'image2image';
        pollTaskStatus(response.data.taskId, taskType);
      } else {
        throw new Error(response.message || 'Generation failed');
      }
    } catch (error) {
      updateState({
        error: error instanceof Error ? error.message : 'An error occurred',
        isGenerating: false,
      });
    }
  }, [state.isGenerating, state.selectedTab, state.prompt, state.selectedRatio, state.textPublicVisibility, state.imagePublicVisibility, state.uploadedFile, state.canGenerate, updateState, handleInsufficientCredits]);

  // 轮询任务状态完成后刷新积分
  const pollTaskStatus = useCallback(async (taskId: string, type: 'text2image' | 'image2image' | 'image2coloring') => {
    const maxAttempts = 60; // 最多轮询60次（5分钟）
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const taskStatus = await GenerateServiceInstance.getTaskStatus(taskId, type);
        
        updateState({
          generationProgress: taskStatus.progress || 0,
        });

        if (taskStatus.status === 'completed') {
          // 任务完成，立即将新图片添加到状态中
          if (taskStatus.result || taskStatus.image) {
            const completedImage = taskStatus.result || taskStatus.image;

            
            // 立即将新图片添加到对应的数组中，并设置为选中状态
            setState(prevState => {
              // 确保 completedImage 不为 undefined
              if (!completedImage) {
                return {
                  ...prevState,
                  isGenerating: false,
                  currentTaskId: null,
                  generationProgress: 100,
                };
              }
              
              const newImage = completedImage;
              let newTextImages = [...prevState.textGeneratedImages];
              let newImageImages = [...prevState.imageGeneratedImages];
              let newGeneratedImages = [...prevState.generatedImages];
              
              // 根据当前标签页添加到对应的数组中
              if (prevState.selectedTab === 'text') {
                // 检查是否已经存在，避免重复添加
                if (!newTextImages.some(img => img.id === newImage.id)) {
                  newTextImages.unshift(newImage); // 添加到数组开头
                }
              } else {
                // 检查是否已经存在，避免重复添加
                if (!newImageImages.some(img => img.id === newImage.id)) {
                  newImageImages.unshift(newImage); // 添加到数组开头
                }
              }
              
              // 也添加到总数组中
              if (!newGeneratedImages.some(img => img.id === newImage.id)) {
                newGeneratedImages.unshift(newImage);
              }
              
              return {
                ...prevState,
                generatedImages: newGeneratedImages,
                textGeneratedImages: newTextImages,
                imageGeneratedImages: newImageImages,
                hasTextToImageHistory: newTextImages.length > 0,
                hasImageToImageHistory: newImageImages.length > 0,
                selectedImage: newImage.id,
                isGenerating: false,
                currentTaskId: null,
                generationProgress: 100,
              };
            });
          } else {
            updateState({
              isGenerating: false,
              currentTaskId: null,
              generationProgress: 100,
            });
          }
          
          // 后台刷新积分和全局状态
          checkUserCredits();
          if (refreshUser) {
            try {
              await refreshUser();
            } catch (error) {
              console.error('Failed to refresh global user state:', error);
            }
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
    const count = isMobile ? 2 : 3;
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
  }, [state.selectedTab, getRandomImages]);

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
  }, [state.selectedTab, getRandomImages]);

  // 加载风格建议
  const loadStyleSuggestions = useCallback(async () => {
    try {
      updateState({ isLoadingStyles: true, error: null });
      
      // 模拟异步加载（可选，让用户感觉更真实）
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 从50种建议中随机选择6种
      const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6, language);
      
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
        const promptToUse = exampleImage.prompt || (typeof exampleImage.title === 'string' ? exampleImage.title : '') || (typeof exampleImage.description === 'string' ? exampleImage.description : '') || '';
        
        if (!promptToUse.trim()) {
          throw new Error('No prompt information available for this example');
        }
        
        // 回填 prompt、ratio、isPublic 到界面，不调用生成方法
        updateState({ 
          prompt: promptToUse,
          selectedRatio: exampleImage.ratio as '3:4' | '4:3' | '1:1' || '3:4',
          textPublicVisibility: exampleImage.isPublic || false,
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
          const fileName = `example-${(typeof exampleImage.title === 'string' ? exampleImage.title : exampleImage.id)}.${fileExtension}`;
          const file = new File([blob], fileName, { type: blob.type });
          
          // 创建图片对象来获取尺寸
          const img = new Image();
          img.onload = () => {
            // 设置文件、尺寸和其他属性
            updateState({
              uploadedFile: file,
              selectedRatio: exampleImage.ratio as '3:4' | '4:3' | '1:1' || '3:4',
              imagePublicVisibility: exampleImage.isPublic || false,
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
            imagePublicVisibility: exampleImage.isPublic || false,
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
      
      // 根据当前标签页选择对应的图片数组查找图片信息
      const currentImages = state.selectedTab === 'text' ? state.textGeneratedImages : state.imageGeneratedImages;
      const imageData = currentImages.find(img => img.id === imageId);
      if (!imageData) {
        throw new Error('Image not found');
      }
      
      // 生成文件名
      const imageTitle = (typeof imageData.title === 'string' ? imageData.title : 'untitled');
      const fileName = `coloring-page-${imageTitle.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 20)}-${imageId.slice(-8)}.${format}`;
      
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
  }, [updateState, state.selectedTab, state.textGeneratedImages, state.imageGeneratedImages]);

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
    const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6, language);
    updateState({ styleSuggestions: randomSuggestions });
  }, [updateState, language]);

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

  // 当语言切换时重新加载风格建议
  useEffect(() => {
    const randomSuggestions = getRandomSuggestions(STYLE_SUGGESTIONS, 6, language);
    updateState({ styleSuggestions: randomSuggestions });
  }, [language, updateState]);

  // 处理从URL参数中获取的源图片
  useEffect(() => {
    const sourceImageUrl = getSourceImageUrl();
    console.log('Source image URL from params:', sourceImageUrl);
    console.log('Initial tab:', initialTab);
    
    if (sourceImageUrl && initialTab === 'image') {
      console.log('Loading source image for Image to Image mode...');
      // 只有当前是Image to Image模式且有源图片URL时才处理
      const loadSourceImage = async () => {
        try {
          console.log('Downloading image from URL:', sourceImageUrl);
          const file = await downloadImageAsFile(sourceImageUrl);
          console.log('Downloaded file:', file);
          
          if (file) {
            // 获取图片尺寸
            const img = new Image();
            img.onload = () => {
              console.log('Image loaded successfully, dimensions:', img.width, 'x', img.height);
              setUploadedImageWithDimensions(file, {
                width: img.width,
                height: img.height
              });
            };
            img.onerror = () => {
              console.log('Failed to get image dimensions, setting file without dimensions');
              // 如果无法获取尺寸，仍然设置文件但不设置尺寸
              setUploadedImageWithDimensions(file, null);
            };
            img.src = URL.createObjectURL(file);
          } else {
            console.log('Failed to download image file');
          }
        } catch (error) {
          console.error('Failed to load source image:', error);
        }
      };
      
      loadSourceImage();
    }
  }, [initialTab, setUploadedImageWithDimensions]); // 只在初始化时执行一次

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
    setTextPublicVisibility,
    setImagePublicVisibility,
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
