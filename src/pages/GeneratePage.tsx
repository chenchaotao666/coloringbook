import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import useGeneratePage from '../hooks/useGeneratePage';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/textUtils';
import CircularProgress from '../components/ui/CircularProgress';
import DeleteImageConfirmDialog from '../components/ui/DeleteImageConfirmDialog';
import Tooltip from '../components/ui/Tooltip';
import ColoringPageTool, { ColoringPageToolData } from '../components/common/ColoringPageTool';
import GenerateExample from '../components/common/GenerateExample';
import WhyChoose, { WhyChooseData } from '../components/common/WhyChoose';
import CanCreate, { CanCreateData } from '../components/common/CanCreate';
import HowToCreate, { HowToCreateData } from '../components/common/HowToCreate';
import UserSaying, { TestimonialItem } from '../components/common/UserSaying';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import ColoringPageConversion, { ColoringPageConversionData } from '../components/common/ColoringPageConversion';
import PricingSection from '../components/common/PricingSection';

import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';
import {
  getCenterImageSize,
  getImageContainerSize,
  getGeneratingContainerSize,
} from '../utils/imageUtils';
const addImageIcon = '/images/add-image.svg';
const refreshIcon = '/images/refresh.svg';
const crownIcon = '/images/crown.svg';
const tipIcon = '/images/tip.svg';
const subtractColorIcon = '/images/subtract-color.svg';
const subtractIcon = '/images/subtract.svg';
const downloadIcon = '/images/download.svg';
const moreIcon = '/images/more.svg';
const deleteIcon = '/images/delete.svg';
const textCountIcon = '/images/text-count.svg';
const generateFailIcon = '/images/generate-fail.svg';

import { useUploadImage } from '../contexts/UploadImageContext';

interface GeneratePageProps {
  initialTab?: 'text' | 'image';
}

const GeneratePage: React.FC<GeneratePageProps> = ({ initialTab = 'text' }) => {
  // 获取翻译函数
  const { t } = useAsyncTranslation('generate');
  const { language } = useLanguage();

  // Sample testimonials data for text mode (moved from UserSaying.text.ts)
  const sampleTestimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Chantal Allison',
      date: 'Nov 18, 2024',
      avatar: '/images/avatar/avatar27.png',
      content: t('sampleTestimonials.1.content'),
      image: '/images/usersaying/pirate-chickens-treasure-hunt_b7b2977b.jpg'
    },
    {
      id: '2',
      name: 'Sharon Thompson',
      date: 'Sep 14, 2024',
      avatar: '/images/avatar/avatar28.png',
      content: t('sampleTestimonials.2.content'),
      image: '/images/usersaying/frog-princes-lily-pad-throne_58752d8a.jpg'
    },
    {
      id: '3',
      name: 'Natalie Wardle',
      date: 'Jun 29, 2025',
      avatar: '/images/avatar/avatar29.png',
      content: t('sampleTestimonials.3.content'),
      image: '/images/usersaying/fruit-basket-bonanza_325d8977.jpg'
    },
    {
      id: '4',
      name: 'Hershel Wallace',
      date: 'Oct 25, 2024',
      avatar: '/images/avatar/avatar30.png',
      content: t('sampleTestimonials.4.content'),
      image: '/images/usersaying/jungle-fiesta_140bfed0.jpg'
    },
    {
      id: '5',
      name: 'Valorie Rodriguez',
      date: 'Aug 20, 2024',
      avatar: '/images/avatar/avatar31.png',
      content: t('sampleTestimonials.5.content'),
      image: '/images/usersaying/little-girls-magical-tea-party_79fc1c63.jpg'
    },
    {
      id: '6',
      name: 'Mary Murray',
      date: 'May 16, 2025',
      avatar: '/images/avatar/avatar32.png',
      content: t('sampleTestimonials.6.content'),
      image: '/images/usersaying/majestic-lion-king_61df3c4d.jpg'
    },
    {
      id: '7',
      name: 'Laura Adamson',
      date: 'Dec 02, 2024',
      avatar: '/images/avatar/avatar33.png',
      content: t('sampleTestimonials.7.content'),
      image: '/images/usersaying/mandala-bloom-symphony_de39e571.jpg'
    },
    {
      id: '8',
      name: 'Fannie Rosales',
      date: 'Jul 07, 2024',
      avatar: '/images/avatar/avatar34.png',
      content: t('sampleTestimonials.8.content'),
      image: '/images/usersaying/mushroom-village_205c1700.jpg'
    },
    {
      id: '9',
      name: 'Kerry Bauer',
      date: 'Apr 22, 2025',
      avatar: '/images/avatar/avatar35.png',
      content: t('sampleTestimonials.9.content'),
      image: '/images/usersaying/otters-family-picnic_906ccd94.jpg'
    }
  ];
  
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

  // 控制定价弹窗的显示
  const [showPricingModal, setShowPricingModal] = React.useState(false);

  // 处理弹窗显示时的滚动
  React.useEffect(() => {
    if (showPricingModal) {
      // 禁用外层滚动
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // 也禁用可能的其他容器滚动
      const htmlElement = document.querySelector('html');
      if (htmlElement) {
        htmlElement.style.overflow = 'hidden';
      }
    } else {
      // 恢复外层滚动
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const htmlElement = document.querySelector('html');
      if (htmlElement) {
        htmlElement.style.overflow = '';
      }
    }
    
    // 清理函数，确保组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const htmlElement = document.querySelector('html');
      if (htmlElement) {
        htmlElement.style.overflow = '';
      }
    };
  }, [showPricingModal]);

  // 移动端内容滚动容器的引用
  const mobileContentRef = React.useRef<HTMLDivElement>(null);

  // 使用我们创建的 Hook 来管理状态和 API 调用
  const {
    // 状态
    prompt,
    selectedTab,
    selectedRatio,
    selectedDifficulty,
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
    setSelectedDifficulty,
    setTextPublicVisibility,
    setImagePublicVisibility,
    setSelectedImage,
    setUploadedImageWithDimensions,
    generateImages,
    downloadImage,
    clearError,
    refreshStyleSuggestions,
    deleteImage,
  } = useGeneratePage(initialTab, refreshUser);

  const { uploadedImage: globalUploadedImage, setUploadedImage: setGlobalUploadedImage } = useUploadImage();

  // Data for ColoringPageTool component - Text to Image mode
  const textColoringPageToolData: ColoringPageToolData = {
    title: t('textColoringPageTool.title'),
    subtitle: t('textColoringPageTool.subtitle'),
    description: t('textColoringPageTool.description'),
    images: {
      center: "/images/text2image/left-4.png",
      topLeft: "/images/text2image/left-2.png",
      topRight: "/images/text2image/left-5.png",
      bottomLeft: "/images/text2image/left-3.png",
      bottomRight: "/images/text2image/left-6.png",
      farLeft: "/images/text2image/left-1.png",
      farRight: "/images/text2image/left-7.png"
    }
  };

  // Data for ColoringPageTool component - Image to Image mode
  const imageColoringPageToolData: ColoringPageToolData = {
    title: t('imageColoringPageTool.title'),
    subtitle: t('imageColoringPageTool.subtitle'),
    description: t('imageColoringPageTool.description'),
    images: {
      center: { left: "/images/image2image/left-4-color.jpg", right: "/images/image2image/left-4-line.png" },
      topLeft: "/images/image2image/left-2.png",
      topRight: "/images/image2image/left-5.png",
      bottomLeft: "/images/image2image/left-3.png",
      bottomRight: "/images/image2image/left-6.png",
      farLeft: "/images/image2image/left-1.png",
      farRight: "/images/image2image/left-7.png"
    }
  };

  // Data for WhyChoose component - Text mode
  const textWhyChooseData: WhyChooseData = {
    title: t('textWhyChoose.title'),
    subtitle: t('textWhyChoose.subtitle'),
    features: [
      {
        id: 'creative-freedom',
        icon: '/images/textwhychoose/logo-1.png',
        title: t('textWhyChoose.features.creativeFreedom.title'),
        description: t('textWhyChoose.features.creativeFreedom.description')
      },
      {
        id: 'kid-friendly',
        icon: '/images/textwhychoose/logo-2.png',
        title: t('textWhyChoose.features.kidFriendly.title'),
        description: t('textWhyChoose.features.kidFriendly.description')
      },
      {
        id: 'educational-value',
        icon: '/images/textwhychoose/logo-3.png',
        title: t('textWhyChoose.features.educationalValue.title'),
        description: t('textWhyChoose.features.educationalValue.description')
      },
      {
        id: 'instant-hassle-free',
        icon: '/images/textwhychoose/logo-4.png',
        title: t('textWhyChoose.features.instantHassleFree.title'),
        description: t('textWhyChoose.features.instantHassleFree.description')
      },
      {
        id: 'ready-to-print',
        icon: '/images/textwhychoose/logo-5.png',
        title: t('textWhyChoose.features.readyToPrint.title'),
        description: t('textWhyChoose.features.readyToPrint.description')
      },
      {
        id: 'free-forever',
        icon: '/images/textwhychoose/logo-6.png',
        title: t('textWhyChoose.features.freeForever.title'),
        description: t('textWhyChoose.features.freeForever.description')
      }
    ]
  };

  // Complete UserSaying data for image mode
  const imageUserSayingTestimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Megan Thompson',
      date: 'Apr 15, 2025',
      avatar: '/images/avatar/avatar18.png',
      content: t('imageUserSayingTestimonials.1.content'),
      image: '/images/imageusersaying/santas-magical-workshop_f1e6324f.jpg'
    },
    {
      id: '2',
      name: 'David Alvarez',
      date: 'Dec 5, 2024',
      avatar: '/images/avatar/avatar19.png',
      content: t('imageUserSayingTestimonials.2.content'),
      image: '/images/imageusersaying/schoolyard-adventures_33bcf68a.jpg'
    },
    {
      id: '3',
      name: 'Sasha Williams',
      date: 'May 2, 2025',
      avatar: '/images/avatar/avatar20.png',
      content: t('imageUserSayingTestimonials.3.content'),
      image: '/images/imageusersaying/sky-high-adventures_ffecf70d.jpg'
    },
    {
      id: '4',
      name: 'Jordan Foster',
      date: 'Jul 28, 2024',
      avatar: '/images/avatar/avatar21.png',
      content: t('imageUserSayingTestimonials.4.content'),
      image: '/images/imageusersaying/teddy-bear-picnic_74149362.jpg'
    },
    {
      id: '5',
      name: 'Danielle Lee',
      date: 'Mar 21, 2025',
      avatar: '/images/avatar/avatar22.png',
      content: t('imageUserSayingTestimonials.5.content'),
      image: '/images/imageusersaying/sleepy-puppy-dreams_25051a9d.jpg'
    },
    {
      id: '6',
      name: 'Liam Carter',
      date: 'Oct 19, 2024',
      avatar: '/images/avatar/avatar23.png',
      content: t('imageUserSayingTestimonials.6.content'),
      image: '/images/imageusersaying/whimsical-amusement-park_1fb03126.jpg'
    },
    {
      id: '7',
      name: 'Angela Perez',
      date: 'Feb 8, 2025',
      avatar: '/images/avatar/avatar24.png',
      content: t('imageUserSayingTestimonials.7.content'),
      image: '/images/imageusersaying/robot-cityscape_22843043.jpg'
    },
    {
      id: '8',
      name: 'Emily Rodriguez',
      date: 'Sep 14, 2024',
      avatar: '/images/avatar/avatar25.png',
      content: t('imageUserSayingTestimonials.8.content'),
      image: '/images/imageusersaying/vintage-car-parade_2f8c318c.jpg'
    },
    {
      id: '9',
      name: 'Mark Chen',
      date: 'May 18, 2025',
      avatar: '/images/avatar/avatar26.png',
      content: t('imageUserSayingTestimonials.9.content'),
      image: '/images/imageusersaying/race-day-excitement_90125dee.jpg'
    }
  ];

  // Data for WhyChoose component - Image mode
  const imageWhyChooseData: WhyChooseData = {
    title: t('imageWhyChoose.title'),
    subtitle: t('imageWhyChoose.subtitle'),
    features: [
      {
        id: 'no-design-skills',
        icon: '/images/imagewhychoose/logo-1.png',
        title: t('imageWhyChoose.features.noDesignSkills.title'),
        description: t('imageWhyChoose.features.noDesignSkills.description')
      },
      {
        id: 'print-ready-quality',
        icon: '/images/imagewhychoose/logo-2.png',
        title: t('imageWhyChoose.features.printReadyQuality.title'),
        description: t('imageWhyChoose.features.printReadyQuality.description')
      },
      {
        id: 'any-image-type',
        icon: '/images/imagewhychoose/logo-3.png',
        title: t('imageWhyChoose.features.anyImageType.title'),
        description: t('imageWhyChoose.features.anyImageType.description')
      },
      {
        id: 'totally-free',
        icon: '/images/imagewhychoose/logo-4.png',
        title: t('imageWhyChoose.features.totallyFree.title'),
        description: t('imageWhyChoose.features.totallyFree.description')
      },
      {
        id: 'kid-safe',
        icon: '/images/imagewhychoose/logo-5.png',
        title: t('imageWhyChoose.features.kidSafe.title'),
        description: t('imageWhyChoose.features.kidSafe.description')
      },
      {
        id: 'creative-freedom',
        icon: '/images/imagewhychoose/logo-6.png',
        title: t('imageWhyChoose.features.creativeFreedom.title'),
        description: t('imageWhyChoose.features.creativeFreedom.description')
      }
    ]
  };

  // Data for ColoringPageConversion component
  const coloringPageConversionData: ColoringPageConversionData = {
    title: t('coloringPageConversion.title'),
    subtitle: t('coloringPageConversion.subtitle'),
    categories: [
      {
        id: 'pet-portraits',
        title: t('coloringPageConversion.categories.petPortraits.title'),
        description: t('coloringPageConversion.categories.petPortraits.description'),
        upImage: '/images/coloringpageconversion/image-1-up.png',
        downImage: '/images/coloringpageconversion/image-1-down.png'
      },
      {
        id: 'family-photos',
        title: t('coloringPageConversion.categories.familyPhotos.title'),
        description: t('coloringPageConversion.categories.familyPhotos.description'),
        upImage: '/images/coloringpageconversion/image-2-up.png',
        downImage: '/images/coloringpageconversion/image-2-down.png'
      },
      {
        id: 'nature-landscape',
        title: t('coloringPageConversion.categories.natureLandscape.title'),
        description: t('coloringPageConversion.categories.natureLandscape.description'),
        upImage: '/images/coloringpageconversion/image-3-up.png',
        downImage: '/images/coloringpageconversion/image-3-down.png'
      },
      {
        id: 'floral-botanical',
        title: t('coloringPageConversion.categories.floralBotanical.title'),
        description: t('coloringPageConversion.categories.floralBotanical.description'),
        upImage: '/images/coloringpageconversion/image-4-up.png',
        downImage: '/images/coloringpageconversion/image-4-down.png'
      },
      {
        id: 'toys-objects',
        title: t('coloringPageConversion.categories.toysObjects.title'),
        description: t('coloringPageConversion.categories.toysObjects.description'),
        upImage: '/images/coloringpageconversion/image-5-up.png',
        downImage: '/images/coloringpageconversion/image-5-down.png'
      },
      {
        id: 'vehicle',
        title: t('coloringPageConversion.categories.vehicle.title'),
        description: t('coloringPageConversion.categories.vehicle.description'),
        upImage: '/images/coloringpageconversion/image-6-up.png',
        downImage: '/images/coloringpageconversion/image-6-down.png'
      }
    ]
  };

  // HowToCreate data for image mode
  const imageHowToCreateData: HowToCreateData = {
    title: t('imageHowToCreate.title'),
    subtitle: t('imageHowToCreate.subtitle'),
    images: {
      top: "/images/imagehowtocreate/iamge-1-up.jpg",
      bottom: "/images/imagehowtocreate/iamge-1-down.png"
    },
    steps: [
      {
        id: "step-1",
        number: t('imageHowToCreate.steps.step1.number'),
        title: t('imageHowToCreate.steps.step1.title'),
        description: t('imageHowToCreate.steps.step1.description')
      },
      {
        id: "step-2", 
        number: t('imageHowToCreate.steps.step2.number'),
        title: t('imageHowToCreate.steps.step2.title'),
        description: t('imageHowToCreate.steps.step2.description')
      },
      {
        id: "step-3",
        number: t('imageHowToCreate.steps.step3.number'), 
        title: t('imageHowToCreate.steps.step3.title'),
        description: t('imageHowToCreate.steps.step3.description')
      }
    ]
  };

  // CanCreate data for image mode
  const imageCanCreateData: CanCreateData = {
    title: t('imageCanCreate.title'),
    subtitle: t('imageCanCreate.subtitle'),
    categories: [
      {
        id: 'parents-families',
        title: t('imageCanCreate.categories.parentsFamilies.title'),
        description: t('imageCanCreate.categories.parentsFamilies.description'),
        image: '/images/whoisimageto/image-1.png'
      },
      {
        id: 'teachers-educators',
        title: t('imageCanCreate.categories.teachersEducators.title'),
        description: t('imageCanCreate.categories.teachersEducators.description'),
        image: '/images/whoisimageto/image-2.png'
      },
      {
        id: 'artists-illustrators',
        title: t('imageCanCreate.categories.artistsCreatives.title'),
        description: t('imageCanCreate.categories.artistsCreatives.description'),
        image: '/images/whoisimageto/image-3.png'
      },
      {
        id: 'kids-young-creators',
        title: t('imageCanCreate.categories.kidsCreators.title'),
        description: t('imageCanCreate.categories.kidsCreators.description'),
        image: '/images/whoisimageto/image-4.png'
      },
      {
        id: 'crafters-diy-lovers',
        title: t('imageCanCreate.categories.craftersDiy.title'),
        description: t('imageCanCreate.categories.craftersDiy.description'),
        image: '/images/whoisimageto/image-5.png'
      },
      {
        id: 'hobbyists-casual-creators',
        title: t('imageCanCreate.categories.hobbyistsCasual.title'),
        description: t('imageCanCreate.categories.hobbyistsCasual.description'),
        image: '/images/whoisimageto/image-6.png'
      }
    ]
  };

  // Data for HowToCreate component
  const howToCreateData: HowToCreateData = {
    title: t('textHowToCreate.title'),
    subtitle: t('textHowToCreate.subtitle'),
    image: "/images/texthowtocreate/image-1.png",
    steps: [
      {
        id: 'enter-idea',
        number: t('textHowToCreate.steps.describe.number'),
        title: t('textHowToCreate.steps.describe.title'),
        description: t('textHowToCreate.steps.describe.description')
      },
      {
        id: 'click-generate',
        number: t('textHowToCreate.steps.generate.number'), 
        title: t('textHowToCreate.steps.generate.title'),
        description: t('textHowToCreate.steps.generate.description')
      },
      {
        id: 'download-color',
        number: t('textHowToCreate.steps.download.number'),
        title: t('textHowToCreate.steps.download.title'),
        description: t('textHowToCreate.steps.download.description')
      }
    ]
  };

  // FAQ data for GenerateFAQ component - Text to Image mode
  const textFAQData: FAQData[] = [
    {
      question: t('textFAQ.0.question'),
      answer: t('textFAQ.0.answer')
    },
    {
      question: t('textFAQ.1.question'),
      answer: t('textFAQ.1.answer')
    },
    {
      question: t('textFAQ.2.question'),
      answer: t('textFAQ.2.answer')
    },
    {
      question: t('textFAQ.3.question'),
      answer: t('textFAQ.3.answer')
    },
    {
      question: t('textFAQ.4.question'),
      answer: t('textFAQ.4.answer')
    },
    {
      question: t('textFAQ.5.question'),
      answer: t('textFAQ.5.answer')
    },
    {
      question: t('textFAQ.6.question'),
      answer: t('textFAQ.6.answer')
    },
    {
      question: t('textFAQ.7.question'),
      answer: t('textFAQ.7.answer')
    },
    {
      question: t('textFAQ.8.question'),
      answer: t('textFAQ.8.answer')
    },
    {
      question: t('textFAQ.9.question'),
      answer: t('textFAQ.9.answer')
    }
  ];

  // FAQ data for GenerateFAQ component - Image to Image mode
  const imageFAQData: FAQData[] = [
    {
      question: t('imageFAQ.0.question'),
      answer: t('imageFAQ.0.answer')
    },
    {
      question: t('imageFAQ.1.question'),
      answer: t('imageFAQ.1.answer')
    },
    {
      question: t('imageFAQ.2.question'),
      answer: t('imageFAQ.2.answer')
    },
    {
      question: t('imageFAQ.3.question'),
      answer: t('imageFAQ.3.answer')
    },
    {
      question: t('imageFAQ.4.question'),
      answer: t('imageFAQ.4.answer')
    },
    {
      question: t('imageFAQ.5.question'),
      answer: t('imageFAQ.5.answer')
    },
    {
      question: t('imageFAQ.6.question'),
      answer: t('imageFAQ.6.answer')
    },
    {
      question: t('imageFAQ.7.question'),
      answer: t('imageFAQ.7.answer')
    },
    {
      question: t('imageFAQ.8.question'),
      answer: t('imageFAQ.8.answer')
    },
    {
      question: t('imageFAQ.9.question'),
      answer: t('imageFAQ.9.answer')
    }
  ];

  // Categories data for CanCreate component
  const textCanCreateData: CanCreateData = {
    title: t('textCanCreate.title'),
    subtitle: t('textCanCreate.subtitle'),
    categories: [
    {
      id: 'animals',
      title: t('textCanCreate.categories.animals.title'),
      description: t('textCanCreate.categories.animals.description'),
      image: '/images/cancreate/image-1.png'
    },
    {
      id: 'fantasy',
      title: t('textCanCreate.categories.fantasy.title'),
      description: t('textCanCreate.categories.fantasy.description'),
      image: '/images/cancreate/image-3.png'
    },
    {
      id: 'vehicles',
      title: t('textCanCreate.categories.vehicles.title'),
      description: t('textCanCreate.categories.vehicles.description'),
      image: '/images/cancreate/image-5.png'
    },
    {
      id: 'nature',
      title: t('textCanCreate.categories.nature.title'),
      description: t('textCanCreate.categories.nature.description'),
      image: '/images/cancreate/image-6.png'
    },
    {
      id: 'robots',
      title: t('textCanCreate.categories.robots.title'),
      description: t('textCanCreate.categories.robots.description'),
      image: '/images/cancreate/image-2.png'
    },
    {
      id: 'circus',
      title: t('textCanCreate.categories.circus.title'),
      description: t('textCanCreate.categories.circus.description'),
      image: '/images/cancreate/image-4.png'
    }
    ]
  };

  // Second categories data for second CanCreate component
  const textCanCreateData2: CanCreateData = {
    title: t('textCanCreate2.title'),
    subtitle: t('textCanCreate2.subtitle'),
    categories: [
    {
      id: 'parents-teachers-kids',
      title: t('textCanCreate2.categories.parentsTeachersKids.title'),
      description: t('textCanCreate2.categories.parentsTeachersKids.description'),
      image: '/images/cancreate/image-7.png'
    },
    {
      id: 'adult-coloring-fans',
      title: t('textCanCreate2.categories.adultColoringFans.title'),
      description: t('textCanCreate2.categories.adultColoringFans.description'),
      image: '/images/cancreate/image-8.png'
    },
    {
      id: 'creative-individuals',
      title: t('textCanCreate2.categories.creativeIndividuals.title'),
      description: t('textCanCreate2.categories.creativeIndividuals.description'),
      image: '/images/cancreate/image-9.png'
    },
    {
      id: 'homeschooling-families',
      title: t('textCanCreate2.categories.homeschoolingFamilies.title'),
      description: t('textCanCreate2.categories.homeschoolingFamilies.description'),
      image: '/images/cancreate/image-10.png'
    },
    {
      id: 'therapists-counselors',
      title: t('textCanCreate2.categories.therapistsCounselors.title'),
      description: t('textCanCreate2.categories.therapistsCounselors.description'),
      image: '/images/cancreate/image-11.png'
    },
    {
      id: 'activity-planners',
      title: t('textCanCreate2.categories.activityPlanners.title'),
      description: t('textCanCreate2.categories.activityPlanners.description'),
      image: '/images/cancreate/image-12.png'
    }
    ]
  };

  // 当有全局上传的图片时，自动设置到组件状态
  useEffect(() => {
    if (globalUploadedImage && initialTab === 'image') {
      setUploadedImageWithDimensions(globalUploadedImage, null);
      // 清除全局状态
      setGlobalUploadedImage(null);
    }
  }, [globalUploadedImage, initialTab]);

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

  // 检查是否有URL参数（表示从其他页面跳转而来）
  const hasUrlParameters = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has('prompt') || searchParams.has('ratio') || searchParams.has('isPublic') || searchParams.has('sourceImageUrl');
  };

  // 自动选择最新生成的图片
  useEffect(() => {
    // 只有在初始数据加载完成后才自动选择图片
    if (!isInitialDataLoaded) return;
    
    // 如果有URL参数，说明是从其他页面跳转而来，不要自动选择历史记录
    if (hasUrlParameters()) return;
    
    const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
    
    if (currentImages.length > 0 && !isGenerating) {
      const latestImage = currentImages[0]; // 假设数组已按时间排序
      // 只有当前没有选中任何图片时，才自动选择最新的图片
      // 不再检查选中的图片是否在当前类型列表中，避免标签切换时自动选择
      if (!selectedImage) {
        setSelectedImage(latestImage.id);
      }
    }
  }, [textGeneratedImages, imageGeneratedImages, selectedTab, isGenerating, selectedImage, setSelectedImage, isInitialDataLoaded]);

  // 回填图片属性的辅助函数
  const fillImageAttributes = (imageId: string) => {
    const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
    const selectedImageData = currentImages.find(img => img.id === imageId);
    
    // 检查是否有URL参数，如果有则不要覆盖
    const searchParams = new URLSearchParams(window.location.search);
    const hasPromptParam = searchParams.has('prompt');
    const hasRatioParam = searchParams.has('ratio');
    const hasIsPublicParam = searchParams.has('isPublic');
    
    if (selectedImageData) {
      // 回填 prompt（仅对 text to image 有效，且没有URL参数时才回填）
      if (selectedTab === 'text' && !hasPromptParam) {
        const promptValue = getLocalizedText(selectedImageData.prompt, language);
        setPrompt(promptValue);
      }
      
      // 回填 ratio（没有URL参数时才回填）
      if (!hasRatioParam) {
        const validRatios = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16', '16:21'];
        if (selectedImageData.ratio && validRatios.includes(selectedImageData.ratio)) {
          setSelectedRatio(selectedImageData.ratio as any);
        }
      }
      
      // 回填 isPublic（没有URL参数时才回填）
      if (!hasIsPublicParam) {
        if (selectedTab === 'text') {
          setTextPublicVisibility(selectedImageData.isPublic);
        } else {
          setImagePublicVisibility(selectedImageData.isPublic);
        }
      }
      
      // 对于 Image to Image 模式，选择历史图片时不清空上传的文件
      // 用户可能希望在上传图片和历史图片之间切换，保持上传图片不变
      // 注释掉清空上传图片的逻辑
      // const sourceImageUrl = searchParams.get('sourceImageUrl');
      // const hasAnyUrlParams = hasPromptParam || hasRatioParam || hasIsPublicParam || sourceImageUrl;
      
      // 不再清空上传文件，让用户自主选择使用上传图片还是历史图片
      // if (selectedTab === 'image' && uploadedFile && !hasAnyUrlParams) {
      //   setUploadedImageWithDimensions(null, null);
      // }
    }
  };

  // 标签页切换时的图片选择逻辑
  useEffect(() => {
    if (selectedImage) {
      // 检查当前选中的图片是否属于当前标签页类型
      const currentImages = selectedTab === 'text' ? textGeneratedImages : imageGeneratedImages;
      const currentImage = currentImages.find(img => img.id === selectedImage);
      
      if (!currentImage) {
        // 当前选中的图片不属于当前标签页类型，清空选择
        // 不再自动选择历史图片，避免覆盖用户选择
        setSelectedImage(null);
      } else {
        // 当前选中的图片属于当前标签页，回填其属性
        fillImageAttributes(selectedImage);
      }
    }
  }, [selectedTab, textGeneratedImages, imageGeneratedImages, selectedImage, setSelectedImage]);

  // Set public visibility to true by default when component mounts
  useEffect(() => {
    setTextPublicVisibility(true);
    setImagePublicVisibility(true);
  }, []);

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
        title: t('textToImage.title'),
        description: t('textToImage.description')
      },
      image: {
        title: t('imageToImage.title'),
        description: t('imageToImage.description')
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
                  {t('error.generationFailed')}<br />
                  {t('error.tryAgain')}
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
                            <div className="text-[#6B7280] text-sm">{t('generating.description')}</div>
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
                      <span className="text-[#161616] text-sm font-medium">{t('formats.png')}</span>
                    </button>

                    {/* Download PDF Button */}
                    <button 
                      onClick={() => handleDownload('pdf')}
                      className="bg-[#F2F3F5] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none"
                    >
                      <img src={downloadIcon} alt="Download" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[#161616] text-sm font-medium">{t('formats.pdf')}</span>
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
                            <span className="text-sm">{t('actions.delete')}</span>
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
              // Text mode - 使用 GenerateExample 组件
              isInitialDataLoaded && mode === 'text' && !hasTextToImageHistory && (
                <GenerateExample 
                  type="text"
                  title={config[mode].title}
                  description={config[mode].description}
                  images={currentExampleImages.map(example => ({
                    url: example.defaultUrl,
                    prompt: getLocalizedText(example.description, language) || `Example ${example.id}`
                  }))}
                />
              )
            ) || (
              // Image mode - 使用 GenerateExample 组件
              isInitialDataLoaded && mode === 'image' && !hasImageToImageHistory && (
                <GenerateExample 
                  type="image"
                  title={config[mode].title}
                  description={config[mode].description}
                  images={currentExampleImages.map(example => ({
                    url: example.defaultUrl,
                    colorUrl: example.colorUrl,
                    coloringUrl: example.coloringUrl,
                    prompt: getLocalizedText(example.description, language) || `Example ${example.id}`
                  }))}
                />
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
                        alt={getLocalizedText(image.description, language) || `Generated ${index + 1}`}
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
            <div className="text-sm font-bold text-[#161616] mb-2">{t('prompt.title')}</div>
            <div className="relative">
              <textarea
                className="w-full h-[120px] sm:h-[150px] lg:h-[200px] bg-[#F2F3F5] rounded-lg border border-[#EDEEF0] p-3 pr-10 text-sm resize-none focus:outline-none"
                placeholder={t('prompt.placeholder')}
                value={prompt}
                onChange={handlePromptChange}
                maxLength={1000}
              ></textarea>

              {/* Clear button - 只在有内容时显示 */}
              {prompt && (
                <button
                  onClick={handleClearPrompt}
                  className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  title={t('prompt.clear')}
                >
                  <img src="/images/close-x.svg" alt="Clear" className="w-3 h-3" />
                </button>
              )}

              <div className="absolute bottom-2 right-3 text-xs sm:text-sm text-[#A4A4A4] flex mb-2 sm:mb-3 items-center gap-1">
                {prompt.length}/1000
                <img src={textCountIcon} alt="Text count" className="w-3 h-3" />
              </div>

              {/* <div className="absolute bottom-2 left-3 bg-white rounded-full px-2 sm:px-3 py-1 mb-2 sm:mb-3 flex items-center">
                <span className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2">
                  <img src={aiGenerateIcon} alt="AI Generate" className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
                <span className="text-[#6B7280] text-xs sm:text-sm">{t('prompt.generateWithAI')}</span>
              </div> */}
            </div>
          </div>

          {/* Ideas Section */}
          <div className="lg:mx-5 mt-5">
            <div className="flex justify-between items-start gap-2">
              <div className="text-[#6B7280] text-xs flex flex-wrap items-center gap-2 flex-1">
                <span className="shrink-0">{t('prompt.ideas')}：</span>
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

          {/* Difficulty Selector */}
          <div className="lg:mx-5 mt-6 lg:mt-10">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('settings.difficulty')}</div>
            <div className="bg-[#F2F3F5] rounded-lg p-1 relative">
              {/* 滑动指示器 */}
              <div
                className={`absolute rounded-md transition-all duration-200 bg-white shadow-sm ${
                  selectedDifficulty === 'toddler' ? 'w-[calc(25%-4px)] h-[calc(100%-8px)] left-[4px] top-[4px]' :
                  selectedDifficulty === 'children' ? 'w-[calc(25%-4px)] h-[calc(100%-8px)] left-[calc(25%+2px)] top-[4px]' :
                  selectedDifficulty === 'teen' ? 'w-[calc(25%-4px)] h-[calc(100%-8px)] left-[calc(50%+2px)] top-[4px]' :
                  selectedDifficulty === 'adult' ? 'w-[calc(25%-6px)] h-[calc(100%-8px)] left-[calc(75%+2px)] top-[4px]' :
                  'w-0 opacity-0'
                }`}
              ></div>
              
              {/* 难度选项 */}
              <div className="grid grid-cols-4 gap-0 relative z-10">
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'toddler' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('toddler')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.toddler')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.toddlerAge')}</div>
                  </div>
                </button>
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'children' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('children')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.children')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.childrenAge')}</div>
                  </div>
                </button>
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'teen' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('teen')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.teen')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.teenAge')}</div>
                  </div>
                </button>
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'adult' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('adult')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.adult')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.adultAge')}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Ratio Selector */}
          <div className="lg:mx-5 mt-6 lg:mt-10">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('settings.ratio')}</div>
            {/* 统一的灰色块包含所有比例选项 */}
            <div className="bg-[#F2F3F5] rounded-lg p-1 relative">
              {/* 滑动指示器 */}
              <div
                className={`absolute rounded-md transition-all duration-200 bg-white shadow-sm ${
                  selectedRatio === '21:9' ? 'w-[calc(25%-4px)] h-[calc(50%-6px)] left-[4px] top-[4px]' :
                  selectedRatio === '16:9' ? 'w-[calc(25%-4px)] h-[calc(50%-6px)] left-[calc(25%+2px)] top-[4px]' :
                  selectedRatio === '4:3' ? 'w-[calc(25%-4px)] h-[calc(50%-6px)] left-[calc(50%+2px)] top-[4px]' :
                  selectedRatio === '1:1' ? 'w-[calc(25%-6px)] h-[calc(50%-6px)] left-[calc(75%+2px)] top-[4px]' :
                  selectedRatio === '3:4' ? 'w-[calc(25%-4px)] h-[calc(50%-3px)] left-[4px] top-[calc(50%-1px)]' :
                  selectedRatio === '9:16' ? 'w-[calc(25%-4px)] h-[calc(50%-3px)] left-[calc(25%+2px)] top-[calc(50%-1px)]' :
                  selectedRatio === '16:21' ? 'w-[calc(25%-4px)] h-[calc(50%-3px)] left-[calc(50%+2px)] top-[calc(50%-1px)]' :
                  'w-0 opacity-0'
                }`}
              ></div>

              {/* 第一行：4个项目 */}
              <div className="grid grid-cols-4 gap-0 relative z-10">
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '21:9' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('21:9')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '21:9' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '28px', height: '12px'}}
                  ></div>
                  21:9
                </button>
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '16:9' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('16:9')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '16:9' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '24px', height: '14px'}}
                  ></div>
                  16:9
                </button>
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '4:3' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('4:3')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '4:3' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '20px', height: '15px'}}
                  ></div>
                  4:3
                </button>
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '1:1' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('1:1')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '1:1' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '16px', height: '16px'}}
                  ></div>
                  1:1
                </button>
              </div>

              {/* 第二行：3个项目，和第一排前3个对齐 */}
              <div className="grid grid-cols-4 gap-0 relative z-10">
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '3:4' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('3:4')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '3:4' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '15px', height: '20px'}}
                  ></div>
                  3:4
                </button>
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '9:16' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('9:16')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '9:16' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '14px', height: '24px'}}
                  ></div>
                  9:16
                </button>
                <button
                  className={`h-12 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedRatio === '16:21' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedRatio('16:21')}
                >
                  <div 
                    className={`border-2 mb-1 ${
                      selectedRatio === '16:21' ? 'border-[#FF5C07]' : 'border-[#272F3E]'
                    }`}
                    style={{width: '12px', height: '18px'}}
                  ></div>
                  16:21
                </button>
                {/* 空占位符，保持和第一行对齐 */}
                <div className="h-12"></div>
              </div>
            </div>
          </div>
        </>
      );
    } else {
      return (
        <>
          {/* Image Upload Section */}
          <div className="lg:mx-5 lg:mt-7">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('upload.title')}</div>
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
                  <div className="text-[#A4A4A4] text-xs sm:text-sm">{t('upload.clickToUpload')}</div>
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
      <div className="w-[140px] border-l border-[#E3E4E5] pt-5 pb-16 px-2 overflow-y-auto overflow-x-hidden h-full flex flex-col items-center max-w-[140px]">
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
              const isLastImage = index === currentImages.length - 1;
              return (
                <div
                  key={image.id}
                  className={`${isLastImage ? 'mb-12' : 'mb-4'} rounded-lg cursor-pointer relative transition-all border-2 ${isSelected ? 'border-[#FF5C07] shadow-lg' : 'border-transparent hover:border-gray-200'
                    }`}
                  style={getImageContainerSize(image, dynamicImageDimensions, setDynamicImageDimensions)}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img
                    src={image.defaultUrl}
                    alt={getLocalizedText(image.description, language) || `Generated ${index + 1}`}
                    className="w-full h-full rounded-lg object-cover"
                  />
                </div>
              );
            })
        ) : !isGenerating ? (
          // 空状态 - 根据当前标签页显示不同的提示
          <div className="text-center text-[#6B7280] text-xs mt-8">
            {selectedTab === 'text' ? t('states.noTextToImageYet') : t('states.noImageToImageYet')}
          </div>
        ) : null}
      </div>
    );
  };

  const handleVisibilityToggle = (isText: boolean) => {
    // Check if user is not premium (free or expired membership)
    const isNotPremium = !user?.membershipLevel || user?.membershipLevel === 'free';
    
    if (isNotPremium) {
      // Show pricing modal for free users
      setShowPricingModal(true);
      return;
    }

    // Premium users can toggle visibility
    if (isText) {
      setTextPublicVisibility(!textPublicVisibility);
    } else {
      setImagePublicVisibility(!imagePublicVisibility);
    }
  };

  return (
    <>
    <Layout className={showPricingModal ? "overflow-hidden h-screen" : ""}>
      <SEOHead
        title={t('seo.generate.title')}
        description={t('seo.generate.description')}
        keywords={t('seo.generate.keywords')}
        ogTitle={t('seo.generate.title')}
        ogDescription={t('seo.generate.description')}
        noIndex={true}
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

      <div className="flex flex-col bg-[#F9FAFB] relative">
        <div className="flex flex-col lg:flex-row h-[1200px] bg-[#F9FAFB] relative">
        {/* Left Sidebar - 移动端隐藏，桌面端显示 */}
        <div className="hidden lg:block w-[600px] bg-white h-[1200px] relative flex flex-col">
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto">
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
                {t('tabs.textToImage')}
              </button>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedTab('image')}
              >
                {t('tabs.imageToImage')}
              </button>
            </div>
          </div>

          {/* Dynamic Left Sidebar Content */}
          {renderLeftSidebar()}

          {/* Public Visibility - Common for both tabs */}
          <div className="mx-5 mt-5 lg:mt-8 flex items-center justify-between">
            <div className="text-[14px] font-bold text-[#161616] flex items-center">
              {t('settings.visibility')}
              <Tooltip 
                content={t('settings.visibilityTip')}
                side="top"
                align="start"
                className="ml-1"
              >
                <span className="w-[18px] h-[18px] cursor-help inline-block">
                  <img src={tipIcon} alt="Info" className="w-[18px] h-[18px]" />
                </span>
              </Tooltip>
            </div>
            <div className="flex items-center">
              <Tooltip
                content="Premium Feature"
                side="top"
                align="center"
                className="mr-2"
              >
                <span className="w-[18px] h-[18px] cursor-help inline-block">
                  <img src={crownIcon} alt="Premium" className="w-[18px] h-[18px]" />
                </span>
              </Tooltip>
              <button
                className={`w-[30px] h-4 rounded-lg relative ${
                  selectedTab === 'text' 
                    ? (textPublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300') 
                    : (imagePublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300')
                } cursor-pointer`}
                onClick={() => handleVisibilityToggle(selectedTab === 'text')}
              >
                <div
                  className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${
                    selectedTab === 'text' 
                      ? (textPublicVisibility ? 'right-[1px]' : 'left-[1px]') 
                      : (imagePublicVisibility ? 'right-[1px]' : 'left-[1px]')
                  }`}
                ></div>
              </button>
            </div>
          </div>
          </div>

          {/* Desktop Generate Button - Fixed at bottom of 1200px sidebar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-gray-100">
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
                {isGenerating ? t('generating.title') : 
                 error ? t('actions.regenerate') :
                 t('actions.generate')}
              </span>
            </button>
          </div>
        </div>

        {/* 移动端主要内容区域 */}
        <div className="flex flex-col lg:hidden h-[1200px] bg-white">          
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
{t('tabs.textToImage')}
              </button>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center text-sm ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => handleMobileTabChange('image')}
              >
{t('tabs.imageToImage')}
              </button>
            </div>
          </div>

          {/* 移动端内容 - 可滚动区域 */}
          <div ref={mobileContentRef} className="flex-1 overflow-y-auto pb-48">
            {renderContent(selectedTab)}
            
            {/* 移动端控制面板 */}
            <div className="bg-white border-t border-gray-200 p-4">
              {renderLeftSidebar()}
              
              {/* Public Visibility - Mobile */}
              <div className="mt-5 flex items-center justify-between">
                <div className="text-sm font-bold text-[#161616] flex items-center">
                  {t('settings.visibility')}
                  <Tooltip 
                    content={t('settings.visibilityTip')}
                    side="top"
                    align="start"
                    className="ml-1"
                  >
                    <span className="w-4 h-4 cursor-help inline-block">
                      <img src={tipIcon} alt="Info" className="w-4 h-4" />
                    </span>
                  </Tooltip>
                </div>
                <div className="flex items-center">
                  <Tooltip
                    content="Premium Feature"
                    side="top"
                    align="center"
                    className="mr-2"
                  >
                    <span className="w-4 h-4 cursor-help inline-block">
                      <img src={crownIcon} alt="Premium" className="w-4 h-4" />
                    </span>
                  </Tooltip>
                  <button
                    className={`w-[30px] h-4 rounded-lg relative ${
                      selectedTab === 'text' 
                        ? (textPublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300') 
                        : (imagePublicVisibility ? 'bg-[#FF5C07]' : 'bg-gray-300')
                    } cursor-pointer`}
                    onClick={() => handleVisibilityToggle(selectedTab === 'text')}
                  >
                    <div
                      className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${
                        selectedTab === 'text' 
                          ? (textPublicVisibility ? 'right-[1px]' : 'left-[1px]') 
                          : (imagePublicVisibility ? 'right-[1px]' : 'left-[1px]')
                      }`}
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
                {isGenerating ? t('generating.title') : 
                 error ? t('actions.regenerate') :
                 t('actions.generate')}
              </span>
            </button>
          </div>
        </div>

        {/* 桌面端中间内容区域 */}
        <div className="hidden lg:flex lg:flex-1 lg:h-[1200px]">
          {renderContent(selectedTab)}
        </div>

        {/* Right Sidebar - Generated Images - 桌面端显示 */}
        <div className="hidden lg:block">
          {renderRightSidebar()}
        </div>

        </div>
      </div>

      {/* TextToColoringPage and WhyChoose components - Full width below main layout */}
      <div className="w-full bg-white">
          {/* ColoringPageTool component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:pb-12 lg:pt-24">
              <ColoringPageTool data={textColoringPageToolData} />
            </div>
          )}

          {/* ColoringPageTool component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:pb-12 lg:pt-24">
              <ColoringPageTool data={imageColoringPageToolData} />
            </div>
          )}

          {/* WhyChoose component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-12 bg-white">
              <WhyChoose data={textWhyChooseData} />
            </div>
          )}

          {/* WhyChoose component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-12 bg-white">
              <WhyChoose data={imageWhyChooseData} />
            </div>
          )}

          {/* ColoringPageConversion component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-12 bg-white">
              <ColoringPageConversion data={coloringPageConversionData} />
            </div>
          )}

          {/* HowToCreate component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-12 bg-white">
              <HowToCreate data={imageHowToCreateData} />
            </div>
          )}

          {/* CanCreate component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-12 bg-white">
              <CanCreate data={imageCanCreateData} />
            </div>
          )}

          {/* UserSaying component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-12 bg-white">
              <UserSaying testimonials={imageUserSayingTestimonials} />
            </div>
          )}

          {/* GenerateFAQ component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-12 bg-white">
              <GenerateFAQ faqData={imageFAQData} />
            </div>
          )}

          {/* CanCreate component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-12 bg-white">
              <CanCreate data={textCanCreateData} />
            </div>
          )}

          {/* HowToCreate component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-12 bg-white">
              <HowToCreate data={howToCreateData} />
            </div>
          )}

          {/* Second CanCreate component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-12 bg-white">
              <CanCreate data={textCanCreateData2} />
            </div>
          )}

          {/* UserSaying component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="pt-8 lg:pt-12 bg-white">
              <UserSaying testimonials={sampleTestimonials} />
            </div>
          )}

          {/* GenerateFAQ component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="pt-8 lg:pt-12 bg-white">
              <GenerateFAQ faqData={textFAQData} />
            </div>
          )}

          {/* TryNow component - only show for text mode */}
          {selectedTab === 'text' && (
            <TryNow
              title={t('tryNow.text.title')}
              description={t('tryNow.text.description')}
              buttonText={t('tryNow.text.buttonText')}
              onButtonClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          )}

          {/* TryNow component - only show for image mode */}
          {selectedTab === 'image' && (
            <TryNow
              title={t('tryNow.image.title')}
              description={t('tryNow.image.description')}
              buttonText={t('tryNow.image.buttonText')}
              onButtonClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            />
          )}


        </div>

      {/* 删除确认对话框 */}
      <DeleteImageConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

    </Layout>

    {/* Full Screen Pricing Interface - Outside Layout */}
    {showPricingModal && (
      <div className="fixed inset-0 bg-white z-[9999] overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out" style={{ overscrollBehavior: 'contain' }}>
        {/* Close Button */}
        <button
          onClick={() => setShowPricingModal(false)}
          className="fixed top-4 right-4 w-12 h-12 text-[#6B7280] hover:text-[#161616] transition-all duration-200 z-[10000] bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl border border-gray-200"
        >
          <svg className="w-6 h-6" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
          </svg>
        </button>
        
        {/* Full Screen Pricing Section */}
        <PricingSection 
          showTitle={true}
          showGradientBg={true}
          showFAQ={true}
          showCTA={true}
        />
      </div>
    )}
    </>
  );
};

export default GeneratePage;