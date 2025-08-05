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
      question: t('faq.question1.q', 'How long does it take to clear image?'),
      answer: t('faq.question1.a', 'Upscale.Pro is a fast and efficient Al-powered tool that can process your uploaded images in a matter of seconds. You don\'t have to worry about long wait times, so you can confidently rely on it to help you clear photos in bulk without any delays.')
    },
    {
      question: t('faq.question2.q', 'Is this undetectable AI writer free to use?'),
      answer: t('faq.question2.a', 'Yes, we offer a free tier with basic features. However, for advanced features and higher usage limits, we have premium plans available.')
    },
    {
      question: t('faq.question3.q', 'Will using a humanizer compromise the quality of the original text?'),
      answer: t('faq.question3.a', 'No, our AI is designed to maintain the quality and meaning of the original text while making it more natural.')
    },
    {
      question: t('faq.question4.q', 'Can I really bypass AI detectors with this AI humanizer?'),
      answer: t('faq.question4.a', 'Our AI coloring page generator creates unique, high-quality images that are designed to be original and creative.')
    },
    {
      question: t('faq.question5.q', 'Will the rewritten text by this AI humanizer lose its SEO value?'),
      answer: t('faq.question5.a', 'No, our AI is designed to maintain the SEO value while making the content more engaging and natural.')
    },
    {
      question: t('faq.question6.q', 'How many languages does our undetectable AI tool support?'),
      answer: t('faq.question6.a', 'Currently, we support English, but we\'re working on adding more languages in the future.')
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
        title={tCommon('seo.home.title', 'AI Coloring Pages - Free Printable Coloring Pages Generator | Create Custom Coloring Books')}
        description={tCommon('seo.home.description', 'Create unlimited free AI-generated coloring pages instantly! Convert text or images to printable coloring pages. Perfect for kids, parents, and teachers. Print PDF & PNG formats.')}
        keywords={tCommon('seo.home.keywords', 'AI coloring pages, free coloring pages, printable coloring pages, coloring book generator, kids coloring pages, custom coloring pages, AI art generator')}
        ogTitle={tCommon('seo.home.title', 'AI Coloring Pages - Free Printable Coloring Pages Generator | Create Custom Coloring Books')}
        ogDescription={tCommon('seo.home.description', 'Create unlimited free AI-generated coloring pages instantly! Convert text or images to printable coloring pages. Perfect for kids, parents, and teachers. Print PDF & PNG formats.')}
        noIndex={true}
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
            title={t('faq.title', 'Frequently Asked Questions')}
          />
          <TryNow
            title={t('cta.title', 'Get Your Coloring Pages')}
            description={t('cta.description', 'One-click generate coloring pages—print and play! Parent-child storytelling through color, screen-free bonding experience.')}
            buttonText={t('cta.tryNow', 'Try Now')}
            buttonLink="/text-coloring-page"
          />
        </div>
      </Layout>
    </div>
  );
};

export default HomePage; 