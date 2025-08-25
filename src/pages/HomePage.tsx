import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Gallery from '../components/home/Gallery';
import Testimonials from '../components/home/Testimonials';
import HowToCreate from '../components/home/HowToCreate';
import GenerateFAQ, { FAQData } from '../components/common/GenerateFAQ';
import TryNow from '../components/common/TryNow';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';
import { ImageService } from '../services/imageService';
import { useState, useEffect } from 'react';

const HomePage = () => {
  const { loading, t } = useAsyncTranslation('home');
  const { t: tCommon } = useAsyncTranslation('common');
  const [imageCount, setImageCount] = useState<number>(0); // 默认值

  // FAQ 数据
  const homeFAQData: FAQData[] = [
    {
      question: t('faq.question1.q'),
      answer: t('faq.question1.a')
    },
    {
      question: t('faq.question2.q'),
      answer: t('faq.question2.a')
    },
    {
      question: t('faq.question3.q'),
      answer: t('faq.question3.a')
    },
    {
      question: t('faq.question4.q'),
      answer: t('faq.question4.a')
    },
    {
      question: t('faq.question5.q'),
      answer: t('faq.question5.a')
    },
    {
      question: t('faq.question6.q'),
      answer: t('faq.question6.a')
    }
  ];
  
  // 获取图片总数
  useEffect(() => {
    const fetchImageCount = async () => {
      try {
        const count = await ImageService.getImageCount();
        setImageCount(count);
      } catch (error) {
        console.error('Failed to fetch image count:', error);
        // 保持默认值1281
      }
    };
    
    fetchImageCount();
  }, []);
  
  // 如果翻译还在加载中，不显示任何内容
  if (loading) {
    return (
      <div className="bg-white min-w-0 overflow-hidden">
        <Layout>
          <div className="w-full min-w-0 flex items-center justify-center min-h-[400px]">
            {/* 加载时不显示任何内容 */}
          </div>
        </Layout>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-w-0 overflow-hidden">
      <SEOHead
        title={tCommon('seo.home.title')}
        description={tCommon('seo.home.description')}
        keywords={tCommon('seo.home.keywords')}
        ogTitle={tCommon('seo.home.title')}
        ogDescription={tCommon('seo.home.description')}
      />
      <Layout>
        <div className="w-full min-w-0">
          <Hero imageCount={imageCount} />
          <Features />
          <Gallery imageCount={imageCount} />
          <Testimonials />
          <HowToCreate />
          <GenerateFAQ 
            faqData={homeFAQData} 
            title={t('faq.title')}
          />
          <TryNow
            title={t('cta.title')}
            description={t('cta.description')}
            buttonText={t('cta.tryNow')}
            buttonLink="/text-coloring-page"
          />
        </div>
      </Layout>
    </div>
  );
};

export default HomePage; 