import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutNoFooter from '../components/layout/LayoutNoFooter';
import useGeneratePage from '../hooks/useGeneratePage';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedText } from '../utils/textUtils';
import CircularProgress from '../components/ui/CircularProgress';
import DeleteImageConfirmDialog from '../components/ui/DeleteImageConfirmDialog';
import BackToTop from '../components/common/BackToTop';
import Tooltip from '../components/ui/Tooltip';
import ColoringPageTool, { ColoringPageToolData } from '../components/common/ColoringPageTool';
import WhyChoose, { WhyChooseData } from '../components/common/WhyChoose';
import CanCreate, { CategoryItem, CanCreateData } from '../components/common/CanCreate';
import HowToCreate, { HowToCreateData } from '../components/common/HowToCreate';
import UserSaying, { TestimonialItem } from '../components/common/UserSaying';
import { sampleTestimonials } from '../components/common/UserSaying.text';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import Footer from '../components/layout/Footer';
import ColoringPageConversion, { ColoringPageConversionData } from '../components/common/ColoringPageConversion';

import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import {
  getCenterImageSize,
  getImageSize,
  getImageContainerSize,
  getGeneratingContainerSize,
  EXAMPLE_IMAGE_DIMENSIONS,
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
  const { t: tCommon } = useAsyncTranslation('common');
  
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
    recreateExample,
    downloadImage,
    clearError,
    refreshExamples,
    refreshStyleSuggestions,
    deleteImage,
  } = useGeneratePage(initialTab, refreshUser);

  const { uploadedImage: globalUploadedImage, setUploadedImage: setGlobalUploadedImage } = useUploadImage();

  // Data for ColoringPageTool component - Text to Image mode
  const textColoringPageToolData: ColoringPageToolData = {
    title: "What Is a Text to Coloring Page Tool?",
    subtitle: "AI makes it easier than ever to create coloring pages from your words.",
    description: "Our Text to Coloring Page tool transforms simple text descriptions into unique, hand-drawn-style coloring pages. It's great for parents, teachers, creative explorers, or anyone who loves to imagine! This tool opens a world of fun, learning, and creativity, turning your words into black-and-white line drawings ready to print or share.",
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
    title: "What Is a Text to Coloring Page Tool?",
    subtitle: "AI makes it easier than ever to create coloring pages from your words.",
    description: "Our Text to Coloring Page tool transforms simple text descriptions into unique, hand-drawn-style coloring pages. It's great for parents, teachers, creative explorers, or anyone who loves to imagine! This tool opens a world of fun, learning, and creativity, turning your words into black-and-white line drawings ready to print or share.",
    images: {
      center: { left: "/images/image2image/left-4-color.png", right: "/images/image2image/left-4-line.png" },
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
    title: "Why Choose This Tool?",
    subtitle: "Here's why our Text to Coloring Page generator is the ultimate choice for creative fun:",
    features: [
      {
        id: 'creative-freedom',
        icon: '/images/textwhychoose/logo-1.png',
        title: 'Creative Freedom',
        description: 'Unleash your imagination! Whether it\'s a wild adventure or a whimsical dream, transform any idea into a visual coloring experience that both kids and adults can enjoy. Watch your ideas come to life on paper with just a few words.'
      },
      {
        id: 'kid-friendly',
        icon: '/images/textwhychoose/logo-2.png',
        title: 'Kid-Friendly & Safe',
        description: 'Designed with young users in mind, our tool features simple navigation and secure filters, making it easy and safe for children to explore their creativity, whether independently or under supervision.'
      },
      {
        id: 'educational-value',
        icon: '/images/textwhychoose/logo-3.png',
        title: 'Educational Value',
        description: 'Combine the best of both worlds—literacy and art. Our tool encourages storytelling, language development, fine motor skills, and cognitive growth, making learning fun and interactive for all ages.'
      },
      {
        id: 'instant-hassle-free',
        icon: '/images/textwhychoose/logo-4.png',
        title: 'Instant & Hassle-Free',
        description: 'No need for signups or waiting! Simply type your idea, hit generate, and in seconds you\'ll have a printable coloring page ready to go. It\'s quick, easy, and stress-free.'
      },
      {
        id: 'ready-to-print',
        icon: '/images/textwhychoose/logo-5.png',
        title: 'Ready to Print or Share',
        description: 'Download your high-resolution coloring page instantly. It\'s perfect for printing at home, sharing with friends, or using on digital devices—flexible for any activity.'
      },
      {
        id: 'free-forever',
        icon: '/images/textwhychoose/logo-6.png',
        title: '100% Free, Forever',
        description: 'Enjoy unlimited creative fun without any hidden fees or trials. Generate as many pages as you want, anytime, all for free. No strings attached.'
      }
    ]
  };

  // UserSaying data for image mode
  const imageUserSayingTestimonials: TestimonialItem[] = [
    {
      id: '1',
      name: 'Megan Thompson',
      date: 'Apr 15, 2025',
      avatar: '/images/imageusersaying/avatar-1.png',
      content: '"I was honestly a bit skeptical, figuring the result would be a blurry mess. But I uploaded a simple phone picture of our golden retriever, and what this tool generated was a genuinely perfect, clean outline. My 6-year-old saw it printing and went absolutely wild. We\'ve now made an entire \'Adventures of Gus\' coloring book with photos from the park. It\'s her favorite activity."',
      image: '/images/imageusersaying/image-1.png'
    },
    {
      id: '2',
      name: 'David Alvarez',
      date: 'Dec 5, 2024',
      avatar: '/images/imageusersaying/avatar-2.png',
      content: '"In a 3rd-grade art class, engagement is everything. This tool has been a game-changer for me. I had students do a self-portrait sketch, and then we used this to turn each one into a professional-looking coloring page. The pride on their faces when they got to color their own artwork was priceless. It\'s my go-to for quick, deeply personal activities."',
      image: '/images/imageusersaying/image-2.png'
    },
    {
      id: '3',
      name: 'Sasha Williams',
      date: 'May 2, 2025',
      avatar: '/images/imageusersaying/avatar-3.png',
      content: '"As a freelance illustrator, my workflow is all about speed and efficiency. Sometimes I just need to see how a composition feels in simple black and white without committing to inking a sketch. This tool is surprisingly effective for that. I can upload a reference photo or a rough digital painting and get clean, usable linework in seconds. It\'s a genuine time-saver."',
      image: '/images/imageusersaying/image-3.png'
    },
    {
      id: '4',
      name: 'Jordan Foster',
      date: 'Jul 28, 2024',
      avatar: '/images/imageusersaying/avatar-4.png',
      content: '"On a whim, I decided to make a mini coloring book of our favorite wedding photos to use as a funny keepsake for our first anniversary. I uploaded about ten pictures, and the results were so good I printed them out. I honestly didn\'t expect people to color them at the party, but they did—and it was an absolute hit. Such a unique way to relive the memories."',
      image: '/images/imageusersaying/image-4.png'
    },
    {
      id: '5',
      name: 'Danielle Lee',
      date: 'Mar 21, 2025',
      avatar: '/images/imageusersaying/avatar-5.png',
      content: '"My son is on the autism spectrum and responds incredibly well to structured, visual activities like coloring. This tool lets me take photos of things he\'s currently fascinated with—a specific type of train, his favorite stuffed octopus, the family car—and instantly turn them into an engaging activity that feels familiar and safe for him. It\'s an invaluable resource for us."',
      image: '/images/imageusersaying/image-5.png'
    },
    {
      id: '6',
      name: 'Liam Carter',
      date: 'Oct 19, 2024',
      avatar: '/images/imageusersaying/avatar-6.png',
      content: '"I\'ve tried a few of these \'image to coloring page\' websites for college projects, and most are bogged down with ads, require a signup, or just crash with a larger file. This one is different. It just works. Upload, convert, download. No fuss, no watermarks, no nonsense. It\'s perfect for when I need a quick, clean outline for a presentation without any hassle."',
      image: '/images/imageusersaying/image-6.png'
    },
    {
      id: '7',
      name: 'Angela Perez',
      date: 'Feb 8, 2025',
      avatar: '/images/imageusersaying/avatar-7.png',
      content: '"I\'m a huge craft enthusiast and use this tool for my scrapbooking and journaling. I can take a photo of a flower from my garden or a cool architectural detail and turn it into a perfect outline. It\'s like having a custom stamp maker without any of the expensive gear. It has totally elevated my DIY projects and I\'m completely in love with it."',
      image: '/images/imageusersaying/image-7.png'
    },
    {
      id: '8',
      name: 'Emily Rodriguez',
      date: 'Sep 14, 2024',
      avatar: '/images/imageusersaying/avatar-8.png',
      content: '"My 4-year-old\'s doodles are wild, abstract, and wonderful. I started taking pictures of her best crayon drawings and using this tool to convert them into clean, black-and-white line art. We printed them out and made her a \'My First Art Book.\' The moment she realized she was coloring her own creations, she felt like a real, published artist. It was pure magic."',
      image: '/images/imageusersaying/image-8.png'
    },
    {
      id: '9',
      name: 'Mark Chen',
      date: 'May 18, 2025',
      avatar: '/images/imageusersaying/avatar-9.png',
      content: '"We run a small neighborhood cafe and were looking for something to keep kids entertained. I took a photo of our logo—a smiling cartoon coffee cup—and used this tool to create a stack of coloring pages. Now, it\'s the first thing families grab when they come in. It\'s been a simple, free way to make our space more family-friendly and our customers absolutely love it."',
      image: '/images/imageusersaying/image-9.png'
    }
  ];

  // Data for WhyChoose component - Image mode
  const imageWhyChooseData: WhyChooseData = {
    title: "Why Choose This Tool?",
    subtitle: "Turning an image to a coloring page has never been easier — here's what makes our tool stand out:",
    features: [
      {
        id: 'no-design-skills',
        icon: '/images/imagewhychoose/logo-1.png',
        title: 'No Design Skills Needed',
        description: 'No artist or tech skills? No problem. Simply upload any image and our AI instantly handles the complex work, delivering a perfect coloring page in seconds.'
      },
      {
        id: 'print-ready-quality',
        icon: '/images/imagewhychoose/logo-2.png',
        title: 'Get Print-Ready Quality',
        description: 'Quality matters. Every coloring page is generated in high-resolution with crisp, clean lines, perfectly optimized for your home printer for a professional result.'
      },
      {
        id: 'any-image-type',
        icon: '/images/imagewhychoose/logo-3.png',
        title: 'Works with Any Kind of Image',
        description: 'From high-resolution photos to hand-drawn sketches and digital art, our tool handles it all. It intelligently converts any visual into a clean, printable coloring page.'
      },
      {
        id: 'totally-free',
        icon: '/images/imagewhychoose/logo-4.png',
        title: 'Totally Free, No Watermarks',
        description: 'Enjoy complete creative freedom with no strings attached. Our tool is 100% free—no hidden costs, signups, or watermarks on your finished coloring page.'
      },
      {
        id: 'kid-safe',
        icon: '/images/imagewhychoose/logo-5.png',
        title: 'Kid-Safe and Family-Friendly',
        description: 'Designed for the whole family, our simple interface is 100% ad-free and easy enough for kids to use on their own. Enjoy pure, distraction-free creative fun.'
      },
      {
        id: 'creative-freedom',
        icon: '/images/imagewhychoose/logo-6.png',
        title: 'Unlock Your Creative Freedom',
        description: 'The possibilities are endless. Create personalized coloring books from family photos, design unique gifts for friends, or turn any image into a relaxing art activity.'
      }
    ]
  };

  // Data for ColoringPageConversion component
  const coloringPageConversionData: ColoringPageConversionData = {
    title: "What's a Good Photo for an Image to Coloring Page Conversion?",
    subtitle: "Easily create printable coloring pages from any image, from personal photos to complex scenes. Here are some popular ideas:",
    categories: [
      {
        id: 'pet-portraits',
        title: 'Pet Portraits',
        description: 'Turn a photo of your beloved pet into a cherished keepsake that captures their unique personality.',
        upImage: '/images/coloringpageconversion/image-1-up.png',
        downImage: '/images/coloringpageconversion/image-1-down.png'
      },
      {
        id: 'family-photos',
        title: 'Family Photos',
        description: 'Create a fun activity and personalized gifts by turning your favorite family photos into coloring pages.',
        upImage: '/images/coloringpageconversion/image-2-up.png',
        downImage: '/images/coloringpageconversion/image-2-down.png'
      },
      {
        id: 'nature-landscape',
        title: 'Nature & Landscape',
        description: 'Transform a beautiful landscape or travel photo into a detailed coloring sheet, a relaxing way for adults to unwind.',
        upImage: '/images/coloringpageconversion/image-3-up.png',
        downImage: '/images/coloringpageconversion/image-3-down.png'
      },
      {
        id: 'floral-botanical',
        title: 'Floral & Botanical',
        description: 'Convert a close-up image of a flower or plant into an elegant line drawing, perfect for botanical art lovers.',
        upImage: '/images/coloringpageconversion/image-4-up.png',
        downImage: '/images/coloringpageconversion/image-4-down.png'
      },
      {
        id: 'toys-objects',
        title: 'Toys & Objects',
        description: 'Let kids color their favorite things! Turn a photo of a beloved toy or LEGO creation into a fun, creative activity.',
        upImage: '/images/coloringpageconversion/image-5-up.png',
        downImage: '/images/coloringpageconversion/image-5-down.png'
      },
      {
        id: 'vehicle',
        title: 'Vehicle',
        description: 'For the car, train, and plane enthusiast. Convert a photo of any vehicle into an exciting coloring page they\'ll love.',
        upImage: '/images/coloringpageconversion/image-6-up.png',
        downImage: '/images/coloringpageconversion/image-6-down.png'
      }
    ]
  };

  // HowToCreate data for image mode
  const imageHowToCreateData: HowToCreateData = {
    title: "How to Create a Coloring Page from Any Image?",
    subtitle: "Simply follow these 3 easy steps to convert your picture into a printable coloring page.",
    images: {
      top: "/images/imagehowtocreate/iamge-1-up.png",
      bottom: "/images/imagehowtocreate/iamge-1-down.png"
    },
    steps: [
      {
        id: "step-1",
        number: "01",
        title: "Upload Your Image",
        description: "Choose any image from your device (JPG, PNG supported)."
      },
      {
        id: "step-2", 
        number: "02",
        title: "Instant AI Conversion",
        description: "Click the button and our AI will instantly turn your image into clean line art."
      },
      {
        id: "step-3",
        number: "03", 
        title: "Preview & Download",
        description: "Your coloring sheet is ready! Save the high-quality file to your device. Perfect format for printing drawings at home"
      }
    ]
  };

  // CanCreate data for image mode
  const imageCanCreateData: CanCreateData = {
    title: "Who Is This Image to Coloring Page Tool For?",
    subtitle: "Our tool is designed for anyone who wants to turn their photos into creative art, no matter their age or experience.",
    categories: [
      {
        id: 'parents-families',
        title: 'Parents & Families',
        description: 'Turn cherished family photos, pet pics, or vacation memories into a custom coloring page. It\'s a wonderful bonding activity for a rainy afternoon and helps children connect with their favorite moments in a new, creative way.',
        image: '/images/whoisimageto/image-1.png'
      },
      {
        id: 'teachers-educators',
        title: 'Teachers & Educators',
        description: 'Create truly engaging materials for your classroom. Turn any image relevant to your lesson—from historical figures to science diagrams—into a fun coloring worksheet. It helps improve student focus and makes learning more interactive.',
        image: '/images/whoisimageto/image-2.png'
      },
      {
        id: 'artists-illustrators',
        title: 'Artists & Illustrators',
        description: 'Quickly convert reference photos or rough sketches into clean line art. Our image to coloring page tool is perfect for testing compositions, creating bases for digital painting, or simply speeding up your creative workflow.',
        image: '/images/whoisimageto/image-3.png'
      },
      {
        id: 'kids-young-creators',
        title: 'Kids & Young Creators',
        description: 'Children have boundless creativity! Empower them by letting them turn their own drawings and doodles into "official" coloring pages. It builds confidence and shows them how their ideas can become real, printable art.',
        image: '/images/whoisimageto/image-4.png'
      },
      {
        id: 'crafters-diy-lovers',
        title: 'Crafters & DIY Lovers',
        description: 'Take your DIY projects to the next level. Turn any custom design or image into a perfect outline for scrapbooking, journaling, wood burning, or even creating personalized greeting cards. It\'s a versatile tool for any crafter\'s toolbox.',
        image: '/images/whoisimageto/image-5.png'
      },
      {
        id: 'hobbyists-casual-creators',
        title: 'Hobbyists & Casual Creators',
        description: 'You don\'t need a big project to have fun. If you simply enjoy discovering easy-to-use creative tools, our generator is for you. Turn any image into a coloring page just for the joy of it—it\'s instant, satisfying, and free.',
        image: '/images/whoisimageto/image-6.png'
      }
    ]
  };

  // Data for HowToCreate component
  const howToCreateData: HowToCreateData = {
    title: "How to create your coloring page with our Text to Coloring Page Generator?",
    subtitle: "Simply follow these 3 steps to create your coloring page.",
    image: "/images/texthowtocreate/image-1.png",
    steps: [
      {
        id: 'enter-idea',
        number: '01',
        title: 'Enter Your Idea',
        description: 'Type any scene you can imagine. Be descriptive! For example: "a happy cat napping in a sunbeam" and so on.'
      },
      {
        id: 'click-generate',
        number: '02', 
        title: 'Click "Generate"',
        description: 'Our AI will instantly turn your text into a unique black-and-white illustration.'
      },
      {
        id: 'download-color',
        number: '03',
        title: 'Download & Color',
        description: 'Your new coloring page is ready! Download to print or color digitally. Perfect for relaxing, classroom activities, or a unique gift.'
      }
    ]
  };

  // FAQ data for GenerateFAQ component - Text to Image mode
  const textFAQData: FAQData[] = [
    {
      question: "Is this Text to Coloring Page tool really free?",
      answer: "Absolutely! Our tool is 100% free to use. There are no hidden fees, subscription costs, or limits on how many pages you can generate. Create to your heart's content."
    },
    {
      question: "What kind of prompts can I type into the generator?",
      answer: "You can type virtually anything! Try simple descriptions like 'a happy cat', detailed scenes like 'a dragon flying over a medieval castle', or creative combinations like 'a robot cooking pancakes'. The AI works best with clear, descriptive prompts that specify what you want to see in your coloring page."
    },
    {
      question: "Can I use the images I create for commercial purposes?",
      answer: "Yes! All coloring pages you generate are yours to use however you'd like, including for commercial purposes. You can print them, share them, sell them, or use them in your business without any restrictions or royalty fees."
    },
    {
      question: "Can I download and print the coloring pages?",
      answer: "Absolutely! Every coloring page can be downloaded in high-quality PNG or PDF format. They're optimized for standard 8.5x11 inch paper and print beautifully on any home printer. The clean, black line art uses minimal ink while providing crisp details."
    },
    {
      question: "What is the quality of the generated images?",
      answer: "Our AI generates high-resolution coloring pages with clean, professional line art. Each image is optimized for printing with clear outlines, appropriate detail levels, and smooth curves that are perfect for coloring with crayons, markers, or colored pencils."
    },
    {
      question: "Is this tool safe for my kids to use?",
      answer: "Yes! Our tool is completely child-safe. We have built-in content filters that prevent inappropriate content from being generated. The interface is simple and intuitive, making it easy for kids to use independently while parents can feel confident about the safety of the content."
    },
    {
      question: "What happens if someone types an inappropriate prompt?",
      answer: "Our advanced content filtering system automatically detects and blocks inappropriate prompts. If an unsuitable prompt is entered, the system will politely ask the user to try a different, family-friendly description instead. This keeps the platform safe for users of all ages."
    },
    {
      question: "Can I use the generator on my mobile phone or tablet?",
      answer: "Yes! Our generator is fully responsive and works perfectly on smartphones, tablets, and desktop computers. The interface adapts to your screen size, making it easy to create and download coloring pages from any device with an internet connection."
    },
    {
      question: "Do you save my prompts or the images I create?",
      answer: "Your privacy is important to us. While we may temporarily store images for technical purposes, we don't permanently save your personal creations or prompts unless you specifically choose to share them publicly. You have full control over your content and privacy settings."
    },
    {
      question: "What languages does the generator support?",
      answer: "Currently, our generator works best with English prompts, but it can understand and process descriptions in multiple languages including Spanish, French, German, and others. For the best results, we recommend using clear, simple language regardless of which language you choose."
    }
  ];

  // FAQ data for GenerateFAQ component - Image to Image mode
  const imageFAQData: FAQData[] = [
    {
      question: "What types of images work best for the image to coloring page conversion?",
      answer: "For the best results, use photos with clear subjects, good lighting, and strong contrast between the subject and the background. Simple drawings or graphics with bold lines also work wonderfully. While our AI is powerful, very dark, blurry, or overly complex photos might lose some detail in the conversion process."
    },
    {
      question: "Can I upload colored photos, or do they need to be black and white first?",
      answer: "You can absolutely upload colored photos! Our AI automatically processes full-color images and converts them into clean, black-and-white line art. There's no need to convert your photos to black and white beforehand – just upload your original colored images and let our tool handle the rest."
    },
    {
      question: "Is this image to coloring page tool really free to use?",
      answer: "Yes, our image to coloring page converter is completely free to use! There are no hidden fees, subscriptions, or limits on how many coloring pages you can create. Simply upload your image, convert it, and download your coloring page – all at no cost."
    },
    {
      question: "Do I need to install any software on my computer?",
      answer: "No software installation required! Our tool runs entirely in your web browser. Simply visit our website, upload your image, and start creating coloring pages immediately. It works on any device with internet access and a modern web browser."
    },
    {
      question: "Can I print the coloring pages I create?",
      answer: "Absolutely! All coloring pages are generated in high-quality, print-ready format. You can download them as PNG or PDF files and print them at home on standard 8.5x11 paper or any size you prefer. The line art is optimized for crisp printing results."
    },
    {
      question: "What happens to the photos I upload? Are they kept private?",
      answer: "Your privacy is our priority. Uploaded images are processed securely and temporarily to create your coloring page. We don't store your personal photos on our servers, and they're automatically deleted after processing. Your images are never shared or used for any other purpose."
    },
    {
      question: "What file formats does the tool support?",
      answer: "Our tool supports the most common image formats including JPG/JPEG, PNG, GIF, and WebP. For best results, we recommend using JPG or PNG files. The tool can handle images up to 10MB in size, which covers most standard photos and graphics."
    },
    {
      question: "Does this work on my phone or tablet?",
      answer: "Yes! Our image to coloring page tool is fully responsive and works perfectly on smartphones, tablets, and desktop computers. You can upload photos directly from your phone's camera or photo gallery and create coloring pages on the go."
    },
    {
      question: "Can I use coloring pages for my business or to sell?",
      answer: "You can use the coloring pages you create for personal, educational, and most commercial purposes. However, please ensure you have the rights to the original images you upload. If you're using copyrighted images, make sure you have permission for commercial use."
    },
    {
      question: "Can I edit the coloring page after it's been created?",
      answer: "Once downloaded, you can edit the coloring page using any image editing software like Photoshop, GIMP, or even simple paint programs. The files are standard image formats that can be modified, cropped, or enhanced as needed for your specific projects."
    }
  ];

  // Categories data for CanCreate component
  const textCanCreateData: CanCreateData = {
    title: "What Can You Create?",
    subtitle: "Turn your wildest ideas into unique coloring pages.",
    categories: [
    {
      id: 'animals',
      title: 'Animals',
      description: 'A cat playing guitar under the stars',
      image: '/images/cancreate/image-1.png'
    },
    {
      id: 'robots',
      title: 'Robots',
      description: 'A robot making pancakes for breakfast',
      image: '/images/cancreate/image-2.png'
    },
    {
      id: 'fairy-tales',
      title: 'Fairy Tales',
      description: 'A princess and a dragon playing chess',
      image: '/images/cancreate/image-3.png'
    },
    {
      id: 'circus',
      title: 'Circus',
      description: 'A bear riding a unicycle in a circus',
      image: '/images/cancreate/image-4.png'
    },
    {
      id: 'adventure',
      title: 'Adventure',
      description: 'A pirate ship sailing through the clouds',
      image: '/images/cancreate/image-5.png'
    },
    {
      id: 'forest-party',
      title: 'Forest Party',
      description: 'A family of squirrels having a tea party in a treehouse',
      image: '/images/cancreate/image-6.png'
    }
    ]
  };

  // Second categories data for second CanCreate component
  const textCanCreateData2: CanCreateData = {
    title: "Who Can Use This Tool?",
    subtitle: "Our text-to-coloring page generator is perfect for everyone.",
    categories: [
    {
      id: 'parents-teachers-kids',
      title: 'Parents, Teachers, and Kids',
      description: 'Children have boundless creativity, and this tool helps them turn their ideas into reality. Parents can create personalized, screen-free activities, while teachers can design custom worksheets that align with their lesson plans.',
      image: '/images/cancreate/image-7.png'
    },
    {
      id: 'creatives-wellness',
      title: 'Creatives and Wellness Seekers',
      description: 'Adults can relieve stress and improve concentration. Therapists and counselors also use it as a gentle way for clients to express feelings and explore difficult topics in a safe, creative format.',
      image: '/images/cancreate/image-8.png'
    },
    {
      id: 'entrepreneurs-event-hosts',
      title: 'Entrepreneurs and Event Hosts',
      description: 'Quickly create unique products and experiences. Design custom coloring pages for birthday parties and school events, or even bundle and sell your own themed coloring books online for profit.',
      image: '/images/cancreate/image-9.png'
    },
    {
      id: 'homeschooling-families',
      title: 'Homeschooling Families',
      description: 'Easily integrate art and literacy into your curriculum with almost no prep time. You can tailor unlimited coloring pages to any theme or subject you happen to be covering at home.',
      image: '/images/cancreate/image-10.png'
    },
    {
      id: 'therapists-counselors',
      title: 'Therapists & Child Counselors',
      description: 'Use prompt-based drawing as a gentle and effective way for children to express feelings, tell stories, or explore difficult topics in a completely safe and creative format.',
      image: '/images/cancreate/image-11.png'
    },
    {
      id: 'activity-planners',
      title: 'Activity Planners & Event Hosts',
      description: 'Make custom coloring pages for birthday parties, camps, or school events. You can add names, specific themes, or story-based designs for an extra touch of personalized fun.',
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
        const promptValue = getLocalizedText(selectedImageData.prompt, 'zh');
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

  const handleRecreateExample = async (exampleId: string) => {
    await recreateExample(exampleId);
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
        title: t('textToImage.title', 'Text to coloring page'),
        description: t('textToImage.description', 'Create high-quality coloring sheets for free with coloring page generator. Spark your kids\' creativity with AI-designed coloring pages.')
      },
      image: {
        title: t('imageToImage.title', 'Image to coloring page'),
        description: t('imageToImage.description', 'Upload your image and transform your photo into an amazing coloring page in just seconds, unleashing your imagination.')
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
                  {t('error.generationFailed', 'The generation failed. Please regenerate it.')}<br />
                  {t('error.tryAgain', 'If you encounter any problems, please provide feedback to us.')}
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
                            <div className="text-[#6B7280] text-sm">{t('generating.description', 'Generating...')}</div>
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
                      <span className="text-[#161616] text-sm font-medium">{t('formats.png', 'PNG')}</span>
                    </button>

                    {/* Download PDF Button */}
                    <button 
                      onClick={() => handleDownload('pdf')}
                      className="bg-[#F2F3F5] hover:bg-[#E5E7EB] border border-[#E5E7EB] rounded-lg px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none"
                    >
                      <img src={downloadIcon} alt="Download" className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="text-[#161616] text-sm font-medium">{t('formats.pdf', 'PDF')}</span>
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
                            <span className="text-sm">{t('actions.delete', 'Delete')}</span>
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
              isInitialDataLoaded && ((mode === 'text' && !hasTextToImageHistory) || (mode === 'image' && !hasImageToImageHistory)) && (
                <div>
                  {/* 固定的文字部分 - 只在显示Example时显示 */}
                  <div className="text-center lg:pb-8">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#161616] capitalize px-4">{config[mode].title}</h1>
                    <p className="text-[#6B7280] text-sm mt-2 max-w-[600px] mx-auto">
                      {config[mode].description}
                    </p>
                  </div>

                  {/* Example 标题栏 */}
                  <div className="w-full max-w-[795px] mx-auto flex justify-between items-center mb-3">
                    <div className="text-[#6B7280] font-medium text-sm">{t('examples.title', 'Example')}</div>
                    <div className="flex items-center text-[#6B7280] text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200 px-2 py-1 rounded-md" onClick={refreshExamples}>
                      {t('examples.change', 'Change')}
                      <img src={refreshIcon} alt="Change" className="w-4 h-4 ml-1" />
                    </div>
                  </div>

                  {/* Example Images */}
                  <div className="flex flex-row justify-center gap-2 sm:gap-6">
                    {currentExampleImages.length > 0 ? currentExampleImages.slice(0, window.innerWidth < 640 ? 2 : currentExampleImages.length).map((example) => {
                      // 使用 getImageSize 替代 getExampleImageSize
                      // 移动端和桌面端使用不同的尺寸限制
                      const imageUrl = mode === 'image' ? example.colorUrl : example.defaultUrl;
                      const isMobile = window.innerWidth < 640;
                      const maxWidth = isMobile ? 215 : EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH;
                      const maxHeight = isMobile ? 240 : EXAMPLE_IMAGE_DIMENSIONS.FIXED_WIDTH;
                      
                      // 设置合理的最小尺寸
                      const minWidth = isMobile ? 100 : 150;
                      const minHeight = isMobile ? 120 : 150;
                      
                      const imageSize = getImageSize(
                        example.id, 
                        imageUrl, 
                        maxWidth, 
                        maxHeight,
                        minWidth, 
                        minHeight, 
                        dynamicImageDimensions, 
                        setDynamicImageDimensions
                      );
                      
                      return (
                        <div
                          key={example.id}
                          className={`relative bg-white rounded-2xl border border-[#EDEEF0]`}
                          style={{ width: imageSize.width, height: imageSize.height }}
                        >
                          <img
                            src={mode === 'image' ? example.colorUrl : example.defaultUrl}
                            alt={getLocalizedText(example.description, 'zh') || `Example ${example.id}`}
                            className={`w-full h-full object-cover rounded-2xl`}
                          />
                          <button
                            onClick={() => handleRecreateExample(example.id)}
                            className="absolute top-3 left-3 inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#FF9D00] to-[#FF5907] text-white hover:from-[#FFB84D] hover:to-[#FF7A47] transition-all duration-300 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer"
                          >
                            {t('examples.recreate', 'Recreate')}
                          </button>
                        </div>
                      );
                    }) : (
                      // 空状态 - 没有示例图片
                      <div className="w-full flex flex-col items-center justify-center lg:py-16">
                        <div className="text-center">
                          <div className="mb-6">
                            <img 
                              src="/images/no-result.svg" 
                              alt="No example images" 
                              className="w-[305px] h-[200px] mx-auto"
                            />
                          </div>
                          <p className="text-[#6B7280] text-base font-normal leading-6">
                            {t('examples.noExamples', 'No example images.')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
                        alt={getLocalizedText(image.description, 'zh') || `Generated ${index + 1}`}
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
            <div className="text-sm font-bold text-[#161616] mb-2">{t('prompt.title', 'Prompt')}</div>
            <div className="relative">
              <textarea
                className="w-full h-[120px] sm:h-[150px] lg:h-[200px] bg-[#F2F3F5] rounded-lg border border-[#EDEEF0] p-3 pr-10 text-sm resize-none focus:outline-none"
                placeholder={t('prompt.placeholder', 'What do you want to create?')}
                value={prompt}
                onChange={handlePromptChange}
                maxLength={1000}
              ></textarea>

              {/* Clear button - 只在有内容时显示 */}
              {prompt && (
                <button
                  onClick={handleClearPrompt}
                  className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
                  title={t('prompt.clear', 'Clear prompt')}
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
                <span className="text-[#6B7280] text-xs sm:text-sm">{t('prompt.generateWithAI', 'Generate with AI')}</span>
              </div> */}
            </div>
          </div>

          {/* Ideas Section */}
          <div className="lg:mx-5 mt-5">
            <div className="flex justify-between items-start gap-2">
              <div className="text-[#6B7280] text-xs flex flex-wrap items-center gap-2 flex-1">
                <span className="shrink-0">{t('prompt.ideas', 'Ideas')}：</span>
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
            <div className="text-sm font-bold text-[#161616] mb-2">{t('settings.difficulty', 'Difficulty Level')}</div>
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
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.toddler', '幼儿')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.toddlerAge', '2-5岁')}</div>
                  </div>
                </button>
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'children' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('children')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.children', '儿童')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.childrenAge', '5-10岁')}</div>
                  </div>
                </button>
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'teen' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('teen')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.teen', '青少年')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.teenAge', '10-18岁')}</div>
                  </div>
                </button>
                <button
                  className={`h-16 flex flex-col items-center justify-center text-xs font-medium leading-none transition-all duration-200 ${
                    selectedDifficulty === 'adult' ? 'text-[#FF5C07]' : 'text-[#6B7280] hover:text-[#161616]'
                  }`}
                  onClick={() => setSelectedDifficulty('adult')}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary-600 mb-1">{t('difficulty.adult', '成人')}</div>
                    <div className="text-[10px] text-gray-500">{t('difficulty.adultAge', '18+岁')}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Ratio Selector */}
          <div className="lg:mx-5 mt-6 lg:mt-10">
            <div className="text-sm font-bold text-[#161616] mb-2">{t('settings.ratio', 'Ratio')}</div>
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
            <div className="text-sm font-bold text-[#161616] mb-2">{t('upload.title', 'Image')}</div>
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
                  <div className="text-[#A4A4A4] text-xs sm:text-sm">{t('upload.clickToUpload', 'Click to upload')}</div>
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
                    alt={getLocalizedText(image.description, 'zh') || `Generated ${index + 1}`}
                    className="w-full h-full rounded-lg object-cover"
                  />
                </div>
              );
            })
        ) : !isGenerating ? (
          // 空状态 - 根据当前标签页显示不同的提示
          <div className="text-center text-[#6B7280] text-xs mt-8">
            {selectedTab === 'text' ? t('states.noTextToImageYet', 'No text to image yet') : t('states.noImageToImageYet', 'No image to image yet')}
          </div>
        ) : null}
      </div>
    );
  };

  const handleVisibilityToggle = (isText: boolean) => {
    // Check if user is not premium (free or expired membership)
    const isNotPremium = !user?.membershipLevel || user?.membershipLevel === 'free';
    
    if (isNotPremium) {
      // If trying to set to private, redirect to pricing page
      if ((isText && textPublicVisibility) || (!isText && imagePublicVisibility)) {
        return;
      }
      // Non-premium users can't set to private, ignore the toggle
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
    <LayoutNoFooter>
      <SEOHead
        title={tCommon('seo.generate.title', 'AI Coloring Page Generator - Create Custom Coloring Pages from Text & Images')}
        description={tCommon('seo.generate.description', 'Generate unique coloring pages with AI! Transform text prompts or upload images to create personalized coloring pages. Fast, free, and printable in high quality.')}
        keywords={tCommon('seo.generate.keywords', 'AI coloring generator, text to coloring page, image to coloring page, custom coloring pages, AI art generator, printable coloring pages')}
        ogTitle={tCommon('seo.generate.title', 'AI Coloring Page Generator - Create Custom Coloring Pages from Text & Images')}
        ogDescription={tCommon('seo.generate.description', 'Generate unique coloring pages with AI! Transform text prompts or upload images to create personalized coloring pages. Fast, free, and printable in high quality.')}
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
                {t('tabs.textToImage', 'Text to Image')}
              </button>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'
                  }`}
                onClick={() => setSelectedTab('image')}
              >
                {t('tabs.imageToImage', 'Image to Image')}
              </button>
            </div>
          </div>

          {/* Dynamic Left Sidebar Content */}
          {renderLeftSidebar()}

          {/* Public Visibility - Common for both tabs */}
          <div className="mx-5 mt-5 lg:mt-8 flex items-center justify-between">
            <div className="text-[14px] font-bold text-[#161616] flex items-center">
              {t('settings.visibility', 'Public Visibility')}
              <Tooltip 
                content={t('settings.visibilityTip', 'When enabled, your generated images may be visible to other users in the public gallery. When disabled, only you can see your generated images.')}
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
                } ${!user?.membershipLevel || user?.membershipLevel === 'free' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                {isGenerating ? t('generating.title', 'Generating...') : 
                 error ? t('actions.regenerate', 'Regenerate') :
                 t('actions.generate', 'Generate')}
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
{t('tabs.textToImage', 'Text to Image')}
              </button>
              <button
                className={`flex-1 h-10 z-10 flex items-center justify-center text-sm ${selectedTab === 'image' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280]'}`}
                onClick={() => handleMobileTabChange('image')}
              >
{t('tabs.imageToImage', 'Image to Image')}
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
                  {t('settings.visibility', 'Public Visibility')}
                  <Tooltip 
                    content={t('settings.visibilityTip', 'When enabled, your generated images may be visible to other users in the public gallery. When disabled, only you can see your generated images.')}
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
                    } ${!user?.membershipLevel || user?.membershipLevel === 'free' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
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
                {isGenerating ? t('generating.title', 'Generating...') : 
                 error ? t('actions.regenerate', 'Regenerate') :
                 t('actions.generate', 'Generate')}
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
            <div className="py-8 lg:pb-16 lg:pt-32">
              <ColoringPageTool data={textColoringPageToolData} />
            </div>
          )}

          {/* ColoringPageTool component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:pb-16 lg:pt-32">
              <ColoringPageTool data={imageColoringPageToolData} />
            </div>
          )}

          {/* WhyChoose component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-16 bg-white">
              <WhyChoose data={textWhyChooseData} />
            </div>
          )}

          {/* WhyChoose component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-16 bg-white">
              <WhyChoose data={imageWhyChooseData} />
            </div>
          )}

          {/* ColoringPageConversion component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-16 bg-white">
              <ColoringPageConversion data={coloringPageConversionData} />
            </div>
          )}

          {/* HowToCreate component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-16 bg-white">
              <HowToCreate data={imageHowToCreateData} />
            </div>
          )}

          {/* CanCreate component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-16 bg-white">
              <CanCreate data={imageCanCreateData} />
            </div>
          )}

          {/* UserSaying component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-16 bg-white">
              <UserSaying testimonials={imageUserSayingTestimonials} />
            </div>
          )}

          {/* GenerateFAQ component - only show for image mode */}
          {selectedTab === 'image' && (
            <div className="py-8 lg:py-16 bg-white">
              <GenerateFAQ faqData={imageFAQData} />
            </div>
          )}

          {/* CanCreate component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-16 bg-white">
              <CanCreate data={textCanCreateData} />
            </div>
          )}

          {/* HowToCreate component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-16 bg-white">
              <HowToCreate data={howToCreateData} />
            </div>
          )}

          {/* Second CanCreate component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-16 bg-white">
              <CanCreate data={textCanCreateData2} />
            </div>
          )}

          {/* UserSaying component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-16 bg-white">
              <UserSaying testimonials={sampleTestimonials} />
            </div>
          )}

          {/* GenerateFAQ component - only show for text mode */}
          {selectedTab === 'text' && (
            <div className="py-8 lg:py-16 bg-white">
              <GenerateFAQ faqData={textFAQData} />
            </div>
          )}

          {/* TryNow component - only show for text mode */}
          {selectedTab === 'text' && (
            <TryNow
              title="Start Creating Your Coloring Pages Today"
              description="Let your imagination run wild with our Text to Coloring Page tool. Whether you're a parent bringing a flying elephant to life for your kids, an artist seeking inspiration from a dancing taco, or simply want to see a knight riding a turtle, we're here to draw it for you. Start creating your collection now and unleash your inner artist!"
              buttonText="Try Now"
              buttonLink="/text-coloring-page"
            />
          )}

          {/* TryNow component - only show for image mode */}
          {selectedTab === 'image' && (
            <TryNow
              title="Ready to Turn Your Image into a Coloring Page?"
              description="Whether you're a parent turning a family photo into a fun activity, an 
              + artist exploring a new composition, or simply looking to create a unique gift, our tool is here for you. Start transforming your favorite images now and unleash your inner artist!"
              buttonText="Try Now"
              buttonLink="#upload-section"
            />
          )}

          {/* Footer component - only show for text mode */}
          {(selectedTab === 'text' || selectedTab === 'image') && (
            <Footer />
          )}

        </div>

      {/* 删除确认对话框 */}
      <DeleteImageConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
      />

      {/* 回到顶部按钮 - 移动端使用专用滚动容器 */}
      <div className="lg:hidden">
        <BackToTop scrollContainer={mobileContentRef.current} />
      </div>
      {/* 桌面端使用默认的window滚动 */}
      <div className="hidden lg:block">
        <BackToTop />
      </div>
    </LayoutNoFooter>
  );
};

export default GeneratePage;