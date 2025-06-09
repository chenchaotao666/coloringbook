import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import FAQ from '../components/home/FAQ';
import arrowRightIcon from '../images/arrow-right-outline.svg';
import checkIcon from '../images/check.svg';
import protectIcon from '../images/protect.svg';
import payMastercard from '../images/pay-mastercard.svg';
import payVisa from '../images/pay-visa.svg';
import payAmericanExpress from '../images/pay-americanExpress.svg';
import payApplePay from '../images/pay-applePay.svg';
import payUnionpay from '../images/pay-unionpay.svg';
import payClicktopay from '../images/pay-clicktopay.svg';

// Feature check component for pricing plans
const FeatureItem = ({ text, highlighted = false }: { text: string, highlighted?: boolean }) => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 flex items-center justify-center">
      <img src={checkIcon} alt="Check" className="w-4 h-4" />
    </div>
    <div className={`text-sm ${highlighted ? "text-[#161616] font-bold" : "text-[#6B7280]"} leading-6 flex items-center gap-1`}>
      {text}
    </div>
  </div>
);

// PricingCard component
const PricingCard = ({ 
  title, 
  price, 
  popular = false, 
  priceNote, 
  features, 
  highlighted = false,
  onSelect,
}: { 
  title: string, 
  price: string, 
  popular?: boolean,
  priceNote?: string, 
  features: string[],
  highlighted?: boolean,
  onSelect?: () => void,
}) => (
  <div 
    className={`w-[376px] p-8 bg-[#F9FAFB] rounded-2xl relative overflow-hidden cursor-pointer transition-all duration-200 border-2 ${highlighted ? 'border-[#FF5C07]' : 'border-[#EDEEF0] hover:border-[#FF5C07]/50'}`}
    onClick={onSelect}
  >
    {popular && (
      <div className="absolute -top-1 -right-1 px-6 py-2 bg-[#6200E2] text-white font-bold italic text-sm rounded-bl-2xl rounded-tr-2xl">
        Popular
      </div>
    )}
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="text-center text-[#161616] text-4xl font-bold">
          {title} {price}
        </div>
        {priceNote && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm text-[#6B7280] text-center whitespace-nowrap">{priceNote}</div>
            <div className="flex justify-center items-center gap-2">
              <img src={protectIcon} alt="Protect" className="w-3 h-3" />
              <div className="text-[#FF5C07] text-sm">Cancel anytime</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5 w-full">
        <Button 
          variant={highlighted ? 'gradient' : 'default'}
          disabled={!highlighted}
          className={`w-full h-[60px] text-xl font-bold !transition-none ${
            highlighted 
              ? '!duration-0' 
              : 'border border-[#818181] bg-white text-[#161616]'
          }`}
        >
          {title === 'Free' ? 'Try Now' : 'Buy Now'}
        </Button>
        <div className="flex flex-col gap-3">
          {features.map((feature, index) => (
            <FeatureItem 
              key={index} 
              text={feature} 
              highlighted={index === 0} 
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);



const PricingPage: React.FC = () => {
  // State to manage selected pricing plan
  const [selectedPlan, setSelectedPlan] = useState<string>('Lite'); // 默认选中Lite
  
  // State to manage billing period
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly'); // 默认月付

  // Function to handle plan selection
  const handlePlanSelect = (planTitle: string) => {
    setSelectedPlan(planTitle);
  };

  // Function to handle billing period change
  const handleBillingPeriodChange = (period: 'monthly' | 'yearly') => {
    setBillingPeriod(period);
  };

  // Features for pricing plans
  const freePlanFeatures = [
    "10 credits/month",
    "Personal use",
    "email support"
  ];

  const litePlanFeatures = [
    "300 credits/month",
    "24/7 email support",
    "Personal use",
    "Supports high print quality",
    "Supports watermark removal",
    "Protect your privacy",
    "Get new features in advance"
  ];

  const proPlanFeatures = [
    "600 credits/month",
    "24/7 email support",
    "Personal use",
    "Supports high print quality",
    "Supports watermark removal",
    "Protect your privacy",
    "Get new features in advance"
  ];

  return (
    <Layout>
      {/* Hero Section with Header Gradient - 与HomePage保持一致 */}
      <div className="relative bg-white">
        {/* 渐变背景 - 覆盖菜单和Hero区域，从上到下浅黄渐变 */}
        <div className="absolute left-0 w-full h-[100px] -top-[70px] pointer-events-none">
          {/* 主渐变背景 - 浅黄色到白色，更浅的颜色 */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[rgba(255,248,245,0.3)] to-[rgba(255,255,255,0.1)]"></div>
          
          {/* 橙色模糊光晕效果 */}
          <div 
            className="absolute top-0 w-full h-[110px] bg-gradient-to-r from-[rgba(255,153,1,0.4)] to-[rgba(255,91,7,0.4)]"
            style={{
              filter: 'blur(200px)',
            }}
          ></div>
        </div>
        
        {/* Main Content */}
        <div className="relative z-10 pt-[60px] flex flex-col items-center">
          <h1 className="text-5xl font-bold text-[#161616] mb-16">Plans & Pricing</h1>
          
          {/* Toggle for Monthly/Yearly */}
          <div className="h-12 bg-[#F2F3F5] rounded-3xl inline-flex items-center p-1 mb-16">
            <div 
              className={`w-[150px] h-10 rounded-3xl flex justify-center items-center cursor-pointer transition-all duration-200 ${
                billingPeriod === 'monthly' ? 'bg-white' : 'hover:bg-white/50'
              }`}
              onClick={() => handleBillingPeriodChange('monthly')}
            >
              <div className={`text-sm font-bold ${billingPeriod === 'monthly' ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                Monthly
              </div>
            </div>
            <div 
              className={`w-[150px] h-10 rounded-3xl flex justify-center items-center cursor-pointer transition-all duration-200 ${
                billingPeriod === 'yearly' ? 'bg-white' : 'hover:bg-white/50'
              }`}
              onClick={() => handleBillingPeriodChange('yearly')}
            >
              <div className={`text-sm ${billingPeriod === 'yearly' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280] font-medium'}`}>
                Yearly(20% off)
              </div>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="flex gap-5 mb-16">
            <PricingCard 
              title="Free" 
              price="" 
              features={freePlanFeatures}
              highlighted={selectedPlan === 'Free'}
              onSelect={() => handlePlanSelect('Free')}
            />
            <PricingCard 
              title="Lite" 
              price={billingPeriod === 'monthly' ? '$5' : '$48'} 
              priceNote={billingPeriod === 'monthly' ? 'For first time, then $10/month' : 'For first time, then $60/year (Save 20%)'} 
              features={litePlanFeatures} 
              highlighted={selectedPlan === 'Lite'}
              popular={true}
              onSelect={() => handlePlanSelect('Lite')}
            />
            <PricingCard 
              title="Pro" 
              price={billingPeriod === 'monthly' ? '$12' : '$115'} 
              priceNote={billingPeriod === 'monthly' ? 'For first time, then $20/month' : 'For first time, then $144/year (Save 20%)'} 
              features={proPlanFeatures}
              highlighted={selectedPlan === 'Pro'}
              onSelect={() => handlePlanSelect('Pro')}
            />
          </div>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-4 mb-20">
            <div className="text-[#6B7280] text-sm">Secure Payment:</div>
            <img className="h-6" src={payMastercard} alt="Mastercard" />
            <img className="h-6" src={payVisa} alt="Visa" />
            <img className="h-6" src={payAmericanExpress} alt="American Express" />
            <img className="h-6" src={payApplePay} alt="Apple Pay" />
            <img className="h-6" src={payUnionpay} alt="UnionPay" />
            <img className="h-6" src={payClicktopay} alt="Click to Pay" />
            <div className="text-[#6B7280] text-sm">More &gt;&gt;</div>
          </div>
          
          {/* FAQ Section */}
          <FAQ />
          
          {/* CTA Section */}
          <div className="w-full bg-[#F9FAFB] py-24 border-t border-b border-[#F3F4F6]">
            <div className="max-w-[800px] mx-auto flex flex-col items-center gap-6">
              <h2 className="text-5xl font-bold text-[#111928] text-center">Get Your Coloring Pages</h2>
              <p className="text-[#6B7280] text-center">
                One-click generate coloring pages—print and play! Parent-child storytelling through color, screen-free bonding experience.
              </p>
              <Button 
                variant="gradient"
                className="h-14 px-5 py-2.5 text-xl font-bold flex items-center gap-2"
              >
                Try Now
                <img src={arrowRightIcon} alt="Arrow right" className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage; 