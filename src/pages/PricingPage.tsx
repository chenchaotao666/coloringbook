import React from 'react';
import Layout from '../components/layout/Layout';
import PricingSection from '../components/common/PricingSection';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation } from '../contexts/LanguageContext';


const PricingPage: React.FC = () => {
  const { t } = useAsyncTranslation('pricing');

  return (
    <Layout>
      <SEOHead
        title={t('seo.title')}
        description={t('seo.description')}
      />
      <PricingSection 
        showTitle={true}
        showGradientBg={true}
        showFAQ={true}
        showCTA={true}
      />
    </Layout>
  );
};

export default PricingPage; 