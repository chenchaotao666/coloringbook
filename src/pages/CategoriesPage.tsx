import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import Breadcrumb from '../components/common/Breadcrumb';
import { CategoriesService, Category } from '../services/categoriesService';
import CategoryGrid from '../components/layout/CategoryGrid';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import SEOHead from '../components/common/SEOHead';
import { getCategoryNameById, updateCategoryMappings } from '../utils/categoryUtils';
import { navigateWithLanguage } from '../utils/navigationUtils';
import WhyChooseColoringPages from '../components/common/WhyChooseColoringPages';
import ColoringPagesFor from '../components/common/ColoringPagesFor';
import HowToCreate, { HowToCreateData } from '../components/common/HowToCreate';
import UserSaying, { TestimonialItem } from '../components/common/UserSaying';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
const noResultIcon = '/images/no-result.svg';



const CategoriesPage: React.FC = () => {
  const { t } = useAsyncTranslation('categories');
  const { t: tCommon } = useAsyncTranslation('common');
  const navigate = useNavigate();
  const { language } = useLanguage();

  // WhyChooseColoringPages data
  const whyChooseColoringPagesData = {
    title: "Why Choose Free Coloring Pages?",
    subtitle: "Coloring isn't just fun—it's a powerful tool for growth and relaxation.",
    features: [
      {
        id: 'creative-play',
        title: 'Creative Play for the Imagination',
        description: 'Coloring sparks imagination and storytelling, turning simple pages into a world of adventure and creativity for kids and adults alike.',
        image: '/images/whychoosecoloringpage/image-1.png',
        buttonText: 'Download Now - Free',
        buttonLink: '#download-section'
      },
      {
        id: 'educational-skills',
        title: 'Boost Educational Skills',
        description: 'Enhance fine motor skills, color recognition, and concentration through fun, engaging coloring activities for kids—perfect for learning and play.',
        image: '/images/whychoosecoloringpage/image-2.png',
        buttonText: 'Download Now - Free',
        buttonLink: '#download-section'
      },
      {
        id: 'stress-relief',
        title: 'Instant Stress Relief',
        description: 'Coloring is a great stress-relief activity for adults, offering a calming, screen-free break to unwind and relax after a busy day.',
        image: '/images/whychoosecoloringpage/image-3.png',
        buttonText: 'Download Now - Free',
        buttonLink: '#download-section'
      },
      {
        id: 'bonding-activity',
        title: 'A Fun Bonding Activity',
        description: 'Create special moments with family, friends, or students through shared coloring activities—perfect for bonding and nurturing creativity.',
        image: '/images/whychoosecoloringpage/image-4.png',
        buttonText: 'Download Now - Free',
        buttonLink: '#download-section'
      },
      {
        id: 'absolutely-free',
        title: 'Absolutely Free to Use',
        description: 'Download and print your favorite coloring pages instantly for free—no signup required, no hidden costs. Fun, easy, and stress-free!',
        image: '/images/whychoosecoloringpage/image-5.png',
        buttonText: 'Download Now - Free',
        buttonLink: '#download-section'
      }
    ]
  };

  // ColoringPagesFor data
  const coloringPagesForData = {
    title: "Who Are These Free Coloring Pages For?",
    audiences: [
      {
        id: 'preschool',
        title: 'Preschool & Elementary Children',
        description: 'Designed specifically for little hands, our pages feature bold outlines and fun themes that kids love. These free, printable coloring sheets are a fantastic tool for boosting creativity, improving concentration, and developing essential fine motor skills, making learning a joyful adventure.',
        image: '/images/coloringpagefor/image-1.png'
      },
      {
        id: 'teachers',
        title: 'Teachers & Homeschoolers',
        description: 'Supplement your lesson plans with our free educational resources. These printable coloring pages are perfect for classroom activities, homeschool art sessions, or quiet take-home assignments. They are a simple, no-cost way to keep students engaged, reinforce learning, and provide a creative outlet during the school day.',
        image: '/images/coloringpagefor/image-2.png'
      },
      {
        id: 'parents',
        title: 'Parents & Caregivers',
        description: 'Searching for a simple and fun screen-free activity? Our coloring pages are the perfect solution for rainy days, quiet afternoons, or a relaxing family evening. It\'s a wonderful way to bond with your children, spark their imagination, and create beautiful keepsakes together without any prep work.',
        image: '/images/coloringpagefor/image-3.png'
      }
    ]
  };

  // HowToCreate data
  const howToCreateData: HowToCreateData = {
    title: "How to Get Started with Your Free Coloring Pages?",
    subtitle: "Getting your printable pages is easy and completely free. Just follow these simple steps:",
    image: "/images/categorieshowtocreate/image-1.png",
    steps: [
      {
        id: 'download',
        number: '01',
        title: 'Download Your Collection',
        description: 'Instantly save the entire PDF collection with a single click. No registration required.'
      },
      {
        id: 'print',
        number: '02',
        title: 'Print from Home',
        description: 'Our pages are optimized for standard paper. Easily print your favorite designs on any home printer.'
      },
      {
        id: 'color',
        number: '03',
        title: 'Grab Your Colors',
        description: 'Grab your crayons, markers, or colored pencils. These designs are perfect for any coloring tool, so get creative!'
      },
      {
        id: 'share',
        number: '04',
        title: 'Repeat & Share the Fun',
        description: 'Print your favorite designs as many times as you want. Feel free to share this free coloring fun with friends, family, and students.'
      }
    ]
  };

  // UserSaying data
  const categoriesTestimonials: TestimonialItem[] = [
    {
      id: 'testimonial-1',
      name: 'Marty Behr',
      date: 'Oct 20, 2024',
      avatar: '/images/categoriesusersaying/avatar-1.png',
      content: '"I downloaded the free coloring pages for my 5-year-old daughter, and she hasn\'t stopped coloring since! The designs are adorable and easy for her to enjoy on her own."',
      image: '/images/categoriesusersaying/friendly-robot-friends_faae1c8a.jpg'
    },
    {
      id: 'testimonial-2',
      name: 'Judith Madrid',
      date: 'Mar 18, 2025',
      avatar: '/images/categoriesusersaying/avatar-2.png',
      content: '"As a preschool teacher, I\'m always hunting for quality printables. These free coloring pages are a lifesaver—perfect for morning activities and quiet time. The kids love the variety, and I love how quickly I can print them out!"',
      image: '/images/categoriesusersaying/birthday-cake-extravaganza_6a09bd9b.jpg'
    },
    {
      id: 'testimonial-3',
      name: 'Ruth Cox',
      date: 'Aug 15, 2024',
      avatar: '/images/categoriesusersaying/avatar-3.png',
      content: '"I never thought I\'d enjoy coloring as an adult, but the mandala pages are so calming! I print a few each week for my own relaxation. It\'s a perfect way to unwind after a long day."',
      image: '/images/categoriesusersaying/brave-firefighters-in-action_ab7d9d79.jpg'
    },
    {
      id: 'testimonial-4',
      name: 'Irving Dunne',
      date: 'May 12, 2024',
      avatar: '/images/categoriesusersaying/avatar-4.png',
      content: '"I was searching for a last-minute printable for my son\'s playdate, and this collection was perfect. Easy to download, and the kids were entertained for hours. I\'ll definitely be coming back for more!"',
      image: '/images/categoriesusersaying/pirate-chickens-treasure-hunt_b7b2977b.jpg'
    },
    {
      id: 'testimonial-5',
      name: 'Megan Dubreuil',
      date: 'Dec 10, 2024',
      avatar: '/images/categoriesusersaying/avatar-5.png',
      content: '"We used the Christmas-themed free coloring pages for our family holiday gathering. Even the adults joined in—it was such a fun bonding moment! Everyone, young and old, enjoyed it, and it added a special touch to our celebrations."',
      image: '/images/categoriesusersaying/cat-cafe-delights_da202c11.jpg'
    },
    {
      id: 'testimonial-6',
      name: 'Valarie Jones',
      date: 'Sep 5, 2024',
      avatar: '/images/categoriesusersaying/avatar-6.png',
      content: '"The variety is amazing! From animals to holiday themes, these free coloring pages have something for every child in my classroom. The kids really love the wide selection, and it\'s so easy to print them out as needed."',
      image: '/images/categoriesusersaying/classroom-creativity_a0658ea9.jpg'
    },
    {
      id: 'testimonial-7',
      name: 'Brady Briseno',
      date: 'Mar 22, 2025',
      avatar: '/images/categoriesusersaying/avatar-7.png',
      content: '"My son loves dinosaurs, so these free coloring pages have been a huge hit! He colors them every day, and it\'s a great way to keep him entertained during quiet time. He can even recognize some of the dinosaurs by name!"',
      image: '/images/categoriesusersaying/dino-playtime_9f0887a3.jpg'
    },
    {
      id: 'testimonial-8',
      name: 'Evelyn Phipps',
      date: 'Jun 18, 2025',
      avatar: '/images/categoriesusersaying/avatar-8.png',
      content: '"As a mom of twins, I\'m always looking for activities that keep them engaged. These coloring pages are perfect—easy to print, and they love all the fun designs! It\'s nice to have something simple to keep them busy."',
      image: '/images/categoriesusersaying/sleepy-bear-in-the-moonlight_081ab799.jpg'
    },
    {
      id: 'testimonial-9',
      name: 'Mary Martin',
      date: 'Sep 14, 2024',
      avatar: '/images/categoriesusersaying/avatar-9.png',
      content: '"These animal-themed coloring pages are a huge hit in our house! My daughter loves the variety and can\'t wait to color a new one every day. It\'s such a wonderful way to encourage her creativity!"',
      image: '/images/categoriesusersaying/enchanted-dollhouse_ff09403a.jpg'
    }
  ];

  // GenerateFAQ data
  const categoriesFAQData: FAQData[] = [
    {
      question: "What ages are the free coloring pages suitable for?",
      answer: "Our free printable coloring pages are designed for a wide range of ages. For younger children, such as toddlers and preschoolers, we offer simple and large designs that help with fine motor skills. Older kids and adults can enjoy more intricate patterns like mandalas, animals, and holiday-themed designs. Our collection includes something for everyone, ensuring all ages can find engaging coloring pages for kids or adults to enjoy!"
    },
    {
      question: "Do I need to sign up to download the pages?",
      answer: "No registration required! Our free coloring pages can be downloaded instantly without creating an account. Simply browse our collection, click on the pages you like, and start printing immediately. We believe in keeping things simple and accessible for everyone."
    },
    {
      question: "Are the coloring pages printable?",
      answer: "Absolutely! All our coloring pages are specifically designed for printing at home. They're optimized for standard 8.5x11 inch paper and work perfectly with any home printer. The high-quality line art ensures crisp, clear prints every time."
    },
    {
      question: "Can I use these for classroom or group activities?",
      answer: "Yes! Our free coloring pages are perfect for educational settings. Teachers, homeschoolers, and group leaders are welcome to print and use these pages for classroom activities, lesson plans, quiet time, or group projects. There's no limit on how many you can print for educational purposes."
    },
    {
      question: "How often do you update the collection?",
      answer: "We regularly add new coloring pages to our collection! New designs are added weekly, including seasonal themes, trending characters, and user-requested designs. Follow us or check back frequently to discover the latest additions to our free library."
    },
    {
      question: "Can I share these coloring pages with my friends or family?",
      answer: "Of course! We encourage sharing the joy of coloring. You can share our coloring pages with friends, family members, or anyone who might enjoy them. You can also share the link to our website so others can access the full collection of free printable pages."
    },
    {
      question: "Are these coloring pages suitable for digital coloring?",
      answer: "Yes! While our pages are designed primarily for printing and traditional coloring, they work great for digital coloring too. You can download the images and use them with tablets, coloring apps, or digital art software. The clean line art translates perfectly to digital formats."
    },
    {
      question: "Can I suggest a theme or request a specific design?",
      answer: "We love hearing from our users! While we can't guarantee every request will be fulfilled, we do consider popular suggestions for future additions. Feel free to contact us with your ideas – many of our most popular designs came from user suggestions."
    },
    {
      question: "Are there any copyright restrictions on the coloring pages?",
      answer: "Our original coloring pages are free for personal, educational, and non-commercial use. You can print them for home, school, or personal enjoyment. However, please don't redistribute them commercially or claim them as your own work. If you're unsure about a specific use case, feel free to contact us."
    },
    {
      question: "What if I encounter any problems downloading or printing the pages?",
      answer: "If you experience any technical issues, first try refreshing your browser or clearing your cache. Make sure your printer settings are set to 'Fit to Page' or '100% scale' for best results. If problems persist, please contact our support team – we're here to help ensure you have a smooth coloring experience!"
    }
  ];

  
  // 状态管理
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // 加载分类数据
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await CategoriesService.getCategories(language);
        
        // 更新分类映射表
        updateCategoryMappings(categoriesData);
        
        setCategories(categoriesData);
        setFilteredCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [language]);

  // 当分类数据加载完成时，重置过滤结果
  useEffect(() => {
    if (!isSearchActive) {
      setFilteredCategories(categories);
    }
  }, [categories, isSearchActive]);

  // 处理分类点击 - 导航到详情页面（使用英文名称）
  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryNameById(category.categoryId);
    console.log('分类ID:', category.categoryId, '→ SEO路径:', categoryPath);
    navigateWithLanguage(navigate, `/categories/${categoryPath}`);
  };

  // 执行搜索
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      // 手动执行搜索过滤
      const filtered = categories.filter(category => {
        const displayName = getLocalizedText(category.displayName, language);
        const name = category.name || '';
        return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               name.toLowerCase().includes(searchQuery.toLowerCase());
      });
      setFilteredCategories(filtered);
    } else {
      setIsSearchActive(false);
      setFilteredCategories(categories);
    }
  };

  // 搜索输入处理
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // 主分类列表页面
  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.categories.title', 'Free Coloring Page Categories - Disney, Animals, Characters & More')}
        description={tCommon('seo.categories.description', 'Browse our collection of free printable coloring pages by category. Disney characters, animals, superheroes, and more. Download PDF and PNG formats instantly.')}
        keywords={tCommon('seo.categories.keywords', 'coloring page categories, Disney coloring pages, animal coloring pages, character coloring pages, free printable coloring pages')}
        ogTitle={tCommon('seo.categories.title', 'Free Coloring Page Categories - Disney, Animals, Characters & More')}
        ogDescription={tCommon('seo.categories.description', 'Browse our collection of free printable coloring pages by category. Disney characters, animals, superheroes, and more. Download PDF and PNG formats instantly.')}
        noIndex={true}
      />
      <div className="w-full bg-[#F9FAFB] pb-12 md:pb-[120px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-8 max-w-[1380px]">
          <Breadcrumb 
            items={[
              { label: t('breadcrumb.home', 'Home'), path: '/' },
              { label: t('breadcrumb.categories', 'Coloring Pages Free'), current: true }
            ]}
          />
        </div>
        
        {/* Page Title */}
        <div className="container mx-auto text-center mb-4 lg:mb-8">
          <h1 className="text-center text-[#161616] text-3xl lg:text-[46px] font-bold capitalize mb-4 md:mb-[24px] leading-relaxed lg:leading-[1]">
{isLoadingCategories ? <div>&nbsp;</div> : t('title', `${categories.length} categories to explore`, { count: categories.length })}
          </h1>
        </div>
        
        {/* Search Bar */}
        <div className="container mx-auto flex justify-center mb-8 lg:mb-16">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[630px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder', 'Enter the category to search')}
              className="w-full h-[60px] px-4 py-2 bg-white border border-[#EDEEF0] rounded-lg text-base focus:outline-none focus:border-gray-300 transition-colors"
            />
            <Button 
              type="submit"
              variant="gradient"
              className="absolute right-0 top-0 h-[60px] w-[122px] font-bold text-xl rounded-r-lg"
            >
{t('search.button', 'Search')}
            </Button>
          </form>
        </div>
        
        {/* Category Grid */}
        <div className="container mx-auto px-4 ">
          <CategoryGrid
            categories={filteredCategories}
            isLoading={isLoadingCategories}
            emptyState={
              filteredCategories.length === 0
                ? isSearchActive
                  ? {
                      icon: noResultIcon,
                      title: t('emptyState.noResults.title', 'No results found'),
                      description: t('emptyState.noResults.description', 'No categories found matching your search.')
                    }
                  : {
                      icon: noResultIcon,
                      title: t('emptyState.noCategories.title', 'No categories found'),
                      description: t('emptyState.noCategories.description', 'Categories are being loaded. Please wait a moment.')
                    }
                : undefined
            }
            onCategoryClick={handleCategoryClick}
          />
        </div>
      </div>
      
      {/* Why Choose Coloring Pages Section */}
      <div className="w-full bg-white py-16 lg:pt-32">
        <WhyChooseColoringPages data={whyChooseColoringPagesData} />
      </div>
      
      {/* Coloring Pages For Section */}
      <div className="w-full bg-white py-16 lg:py-16">
        <ColoringPagesFor data={coloringPagesForData} />
      </div>
      
      {/* How To Create Section */}
      <div className="w-full bg-white py-16 lg:py-16">
        <HowToCreate data={howToCreateData} />
      </div>
      
      {/* User Saying Section */}
      <div className="w-full bg-white py-16 lg:py-16">
        <UserSaying testimonials={categoriesTestimonials} />
      </div>
      
      {/* FAQ Section */}
      <div className="w-full bg-white py-16 lg:py-16">
        <GenerateFAQ faqData={categoriesFAQData} />
      </div>
      
      {/* TryNow Section */}
      <TryNow 
        title="Ready to Start Coloring?"
        description="Whether you're a parent looking for a fun activity for your kids, a teacher needing classroom resources, or an adult who enjoys the therapeutic benefits of coloring, our collection is here for you. Start exploring today and bring joy, calm, and creativity into your day!"
        buttonText="Try Now"
        buttonLink="/generate"
      />
    </Layout>
  );
};

export default CategoriesPage; 