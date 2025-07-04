import Layout from '../components/layout/Layout';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Gallery from '../components/home/Gallery';
import Testimonials from '../components/home/Testimonials';
import HowToCreate from '../components/home/HowToCreate';
import FAQ from '../components/home/FAQ';
import CallToAction from '../components/home/CallToAction';
import { useAsyncTranslation } from '../contexts/LanguageContext';

const HomePage = () => {
  const { t, loading } = useAsyncTranslation('home');
  
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
      <Layout>
        <div className="w-full min-w-0">
          <Hero />
          <Features />
          <Gallery title={t('gallery.title', 'Browse our 1,281 free coloring pages; printable in PDF and PNG formats!')} />
          <Testimonials />
          <HowToCreate />
          <FAQ />
          <CallToAction />
        </div>
      </Layout>
    </div>
  );
};

export default HomePage; 