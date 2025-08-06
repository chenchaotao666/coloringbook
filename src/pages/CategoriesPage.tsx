import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import Breadcrumb from '../components/common/Breadcrumb';
import { Category } from '../services/categoriesService';
import CategoryGrid from '../components/layout/CategoryGrid';
import { useLanguage } from '../contexts/LanguageContext';
import { getLocalizedText } from '../utils/textUtils';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { useCategories } from '../contexts/CategoriesContext';
import SEOHead from '../components/common/SEOHead';
import { getCategoryNameById } from '../utils/categoryUtils';
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
    title: t('whyChoose.title'),
    subtitle: t('whyChoose.subtitle'),
    features: [
      {
        id: 'creative-play',
        title: t('whyChoose.features.creativePlay.title'),
        description: t('whyChoose.features.creativePlay.description'),
        image: '/images/whychoosecoloringpage/image-1.png',
        buttonText: t('whyChoose.features.creativePlay.buttonText'),
        buttonLink: '/text-coloring-page'
      },
      {
        id: 'educational-skills',
        title: t('whyChoose.features.educationalSkills.title'),
        description: t('whyChoose.features.educationalSkills.description'),
        image: '/images/whychoosecoloringpage/image-2.png',
        buttonText: t('whyChoose.features.educationalSkills.buttonText'),
        buttonLink: '/text-coloring-page'
      },
      {
        id: 'stress-relief',
        title: t('whyChoose.features.stressRelief.title'),
        description: t('whyChoose.features.stressRelief.description'),
        image: '/images/whychoosecoloringpage/image-3.png',
        buttonText: t('whyChoose.features.stressRelief.buttonText'),
        buttonLink: '/text-coloring-page'
      },
      {
        id: 'bonding-activity',
        title: t('whyChoose.features.bondingActivity.title'),
        description: t('whyChoose.features.bondingActivity.description'),
        image: '/images/whychoosecoloringpage/image-4.png',
        buttonText: t('whyChoose.features.bondingActivity.buttonText'),
        buttonLink: '/text-coloring-page'
      },
      {
        id: 'absolutely-free',
        title: t('whyChoose.features.absolutelyFree.title'),
        description: t('whyChoose.features.absolutelyFree.description'),
        image: '/images/whychoosecoloringpage/image-5.png',
        buttonText: t('whyChoose.features.absolutelyFree.buttonText'),
        buttonLink: '/text-coloring-page'
      }
    ]
  };

  // ColoringPagesFor data
  const coloringPagesForData = {
    title: t('coloringPagesFor.title'),
    audiences: [
      {
        id: 'preschool',
        title: t('coloringPagesFor.audiences.preschool.title'),
        description: t('coloringPagesFor.audiences.preschool.description'),
        image: '/images/coloringpagefor/image-1.png'
      },
      {
        id: 'teachers',
        title: t('coloringPagesFor.audiences.teachers.title'),
        description: t('coloringPagesFor.audiences.teachers.description'),
        image: '/images/coloringpagefor/image-2.png'
      },
      {
        id: 'parents',
        title: t('coloringPagesFor.audiences.parents.title'),
        description: t('coloringPagesFor.audiences.parents.description'),
        image: '/images/coloringpagefor/image-3.png'
      }
    ]
  };

  // HowToCreate data
  const howToCreateData: HowToCreateData = {
    title: t('howToCreate.title'),
    subtitle: t('howToCreate.subtitle'),
    image: "/images/categorieshowtocreate/image-1.png",
    steps: [
      {
        id: 'download',
        number: '01',
        title: t('howToCreate.steps.download.title'),
        description: t('howToCreate.steps.download.description')
      },
      {
        id: 'print',
        number: '02',
        title: t('howToCreate.steps.print.title'),
        description: t('howToCreate.steps.print.description')
      },
      {
        id: 'color',
        number: '03',
        title: t('howToCreate.steps.color.title'),
        description: t('howToCreate.steps.color.description')
      },
      {
        id: 'share',
        number: '04',
        title: t('howToCreate.steps.share.title'),
        description: t('howToCreate.steps.share.description')
      }
    ]
  };

  // UserSaying data
  const categoriesTestimonials: TestimonialItem[] = [
    {
      id: 'testimonial-1',
      name: 'Marty Behr',
      date: 'Oct 20, 2024',
      avatar: '/images/avatar/avatar9.png',
      content: t('testimonials.1.content'),
      image: '/images/categoriesusersaying/friendly-robot-friends_faae1c8a.jpg'
    },
    {
      id: 'testimonial-2',
      name: 'Judith Madrid',
      date: 'Mar 18, 2025',
      avatar: '/images/avatar/avatar10.png',
      content: t('testimonials.2.content'),
      image: '/images/categoriesusersaying/birthday-cake-extravaganza_6a09bd9b.jpg'
    },
    {
      id: 'testimonial-3',
      name: 'Ruth Cox',
      date: 'Aug 15, 2024',
      avatar: '/images/avatar/avatar11.png',
      content: t('testimonials.3.content'),
      image: '/images/categoriesusersaying/brave-firefighters-in-action_ab7d9d79.jpg'
    },
    {
      id: 'testimonial-4',
      name: 'Irving Dunne',
      date: 'May 12, 2024',
      avatar: '/images/avatar/avatar12.png',
      content: t('testimonials.4.content'),
      image: '/images/categoriesusersaying/pirate-chickens-treasure-hunt_b7b2977b.jpg'
    },
    {
      id: 'testimonial-5',
      name: 'Megan Dubreuil',
      date: 'Dec 10, 2024',
      avatar: '/images/avatar/avatar13.png',
      content: t('testimonials.5.content'),
      image: '/images/categoriesusersaying/cat-cafe-delights_da202c11.jpg'
    },
    {
      id: 'testimonial-6',
      name: 'Valarie Jones',
      date: 'Sep 5, 2024',
      avatar: '/images/avatar/avatar14.png',
      content: t('testimonials.6.content'),
      image: '/images/categoriesusersaying/classroom-creativity_a0658ea9.jpg'
    },
    {
      id: 'testimonial-7',
      name: 'Brady Briseno',
      date: 'Mar 22, 2025',
      avatar: '/images/avatar/avatar15.png',
      content: t('testimonials.7.content'),
      image: '/images/categoriesusersaying/dino-playtime_9f0887a3.jpg'
    },
    {
      id: 'testimonial-8',
      name: 'Evelyn Phipps',
      date: 'Jun 18, 2025',
      avatar: '/images/avatar/avatar16.png',
      content: t('testimonials.8.content'),
      image: '/images/categoriesusersaying/sleepy-bear-in-the-moonlight_081ab799.jpg'
    },
    {
      id: 'testimonial-9',
      name: 'Mary Martin',
      date: 'Sep 14, 2024',
      avatar: '/images/avatar/avatar17.png',
      content: t('testimonials.9.content'),
      image: '/images/categoriesusersaying/enchanted-dollhouse_ff09403a.jpg'
    }
  ];

  // GenerateFAQ data
  const categoriesFAQData: FAQData[] = [
    {
      question: t('faq.0.question'),
      answer: t('faq.0.answer')
    },
    {
      question: t('faq.1.question'),
      answer: t('faq.1.answer')
    },
    {
      question: t('faq.2.question'),
      answer: t('faq.2.answer')
    },
    {
      question: t('faq.3.question'),
      answer: t('faq.3.answer')
    },
    {
      question: t('faq.4.question'),
      answer: t('faq.4.answer')
    },
    {
      question: t('faq.5.question'),
      answer: t('faq.5.answer')
    },
    {
      question: t('faq.6.question'),
      answer: t('faq.6.answer')
    },
    {
      question: t('faq.7.question'),
      answer: t('faq.7.answer')
    },
    {
      question: t('faq.8.question'),
      answer: t('faq.8.answer')
    },
    {
      question: t('faq.9.question'),
      answer: t('faq.9.answer')
    }
  ];

  
  // 状态管理
  const { categories, loading: isLoadingCategories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  // 计算过滤后的分类
  const filteredCategories = React.useMemo(() => {
    if (!isSearchActive || !searchQuery.trim()) {
      return categories;
    }
    return categories.filter(category => {
      const displayName = getLocalizedText(category.displayName, language);
      const name = category.name || '';
      return displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [categories, isSearchActive, searchQuery, language]);

  // 处理分类点击 - 导航到详情页面（使用英文名称）
  const handleCategoryClick = (category: Category) => {
    // 使用映射表获取SEO友好的名称
    const categoryPath = getCategoryNameById(category.categoryId);
    console.log('分类ID:', category.categoryId, '→ SEO路径:', categoryPath);
    navigateWithLanguage(navigate, `/categories/${categoryPath}`);
  };

  // 执行搜索
  const handleSearch = () => {
    setIsSearchActive(searchQuery.trim() !== '');
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
        title={tCommon('seo.categories.title')}
        description={tCommon('seo.categories.description')}
        keywords={tCommon('seo.categories.keywords')}
        ogTitle={tCommon('seo.categories.title')}
        ogDescription={tCommon('seo.categories.description')}
        noIndex={true}
      />
      <div className="w-full bg-[#F9FAFB] pb-12 md:pb-[120px]">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-6 lg:pt-10 lg:pb-8 max-w-[1380px]">
          <Breadcrumb 
            items={[
              { label: t('breadcrumb.home'), path: '/' },
              { label: t('breadcrumb.categories'), current: true }
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
              placeholder={t('search.placeholder')}
              className="w-full h-[60px] px-4 py-2 bg-white border border-[#EDEEF0] rounded-lg text-base focus:outline-none focus:border-gray-300 transition-colors"
            />
            <Button 
              type="submit"
              variant="gradient"
              className="absolute right-0 top-0 h-[60px] w-[122px] font-bold text-xl rounded-r-lg rounded-l-none"
            >
              {t('search.button')}
            </Button>
          </form>
        </div>
        
        {/* Category Grid */}
        <div className="container mx-auto px-4 ">
          <CategoryGrid
            categories={filteredCategories}
            isLoading={isLoadingCategories}
            emptyState={
              filteredCategories.length === 0 && !isLoadingCategories
                ? isSearchActive
                  ? {
                      icon: noResultIcon,
                      title: t('emptyState.noResults.title'),
                      description: t('emptyState.noResults.description')
                    }
                  : {
                      icon: noResultIcon,
                      title: t('emptyState.noCategories.title'),
                      description: t('emptyState.noCategories.description')
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
        <UserSaying 
          testimonials={categoriesTestimonials} 
          title={t('testimonials.title')}
        />
      </div>
      
      {/* FAQ Section */}
      <div className="w-full bg-white pt-16 lg:pt-16">
        <GenerateFAQ 
          faqData={categoriesFAQData} 
          title={t('faq.title')}
        />
      </div>
      
      {/* TryNow Section */}
      <TryNow 
        title={t('tryNow.title')}
        description={t('tryNow.description')}
        buttonText={t('tryNow.buttonText')}
        buttonLink="/text-coloring-page"
      />
    </Layout>
  );
};

export default CategoriesPage; 