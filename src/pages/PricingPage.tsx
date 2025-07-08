import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadScript as loadScriptPaypal } from "@paypal/paypal-js";
import Layout from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import FAQ from '../components/home/FAQ';
import { useAuth } from '../contexts/AuthContext';
import { PricingService } from '../services/pricingService';
import { ApiError } from '../utils/apiUtils';
import SEOHead from '../components/common/SEOHead';
import { useAsyncTranslation, useLanguage } from '../contexts/LanguageContext';

// PayPal Types
import type { PayPalNamespace } from "@paypal/paypal-js";

declare global {
  interface Window {
    paypal?: PayPalNamespace | null;
  }
}

const arrowRightIcon = '/images/arrow-right-outline.svg';
const checkIcon = '/images/check.svg';
const protectIcon = '/images/protect.svg';

// 套餐配置
const planConfigs = {
  'Lite': {
    monthly: { price: 9.99, credits: 300, code: 'LITE_MONTHLY' },
    yearly: { price: 99.99, credits: 3600, code: 'LITE_YEARLY' }
  },
  'Pro': {
    monthly: { price: 19.99, credits: 600, code: 'PRO_MONTHLY' },
    yearly: { price: 199.99, credits: 7200, code: 'PRO_YEARLY' }
  }
};

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

// PayPal支付弹窗
const PayPalModal = ({ 
  isOpen, 
  onClose, 
  planTitle, 
  price,
  planCode,
  paypalLoaded
}: {
  isOpen: boolean;
  onClose: () => void;
  planTitle: string;
  price: string;
  planCode: string;
  paypalLoaded: boolean;
}) => {
  const { t } = useAsyncTranslation('pricing');
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && paypalLoaded && window.paypal && paypalRef.current) {
      // 清空之前的PayPal按钮
      paypalRef.current.innerHTML = '';
      
      const paypal = window.paypal;
      if (paypal && paypal.Buttons) {
        paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'paypal',
          },
          createOrder: async () => {
            try {
              setIsProcessing(true);
              
              // 从planCode解析planCode和chargeType
              const planCodeValue = planTitle.toUpperCase() as 'LITE' | 'PRO';
              const chargeType = planCode.includes('MONTHLY') ? 'Monthly' as const : 'Yearly' as const;
              
              const response = await PricingService.createOrder({
                method: 'paypal',
                planCode: planCodeValue,
                chargeType
              });
              return response.orderId;
            } catch (error) {
              console.error('创建订单失败:', error);
              if (error instanceof ApiError) {
                alert(`${t('payment.errors.createOrderFailed', '创建订单失败')}: ${error.message}`);
              } else {
                alert(t('payment.errors.tryAgainLater', '创建订单失败，请稍后重试'));
              }
              setIsProcessing(false);
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              const { orderID } = data;
              const response = await PricingService.captureOrder(orderID);
              
              if (response.success) {
                // 支付成功，刷新用户信息
                await refreshUser();
                
                // 计算获得的积分
                const config = planConfigs[planTitle as keyof typeof planConfigs];
                if (config) {
                  const billingPeriod = planCode.includes('MONTHLY') ? 'monthly' : 'yearly';
                  const credits = config[billingPeriod].credits;
                  
                  onClose();
                  // 这里可以显示成功弹窗
                  alert(t('payment.success.message', '支付成功！获得 {credits} 积分', { credits }));
                  navigate('/generate');
                }
              } else {
                throw new Error(response.message || '支付失败');
              }
            } catch (error) {
              console.error('捕获支付失败:', error);
              if (error instanceof ApiError) {
                alert(`${t('payment.errors.paymentFailed', '支付失败')}: ${error.message}`);
              } else {
                alert(t('payment.errors.tryAgainLater', '支付失败，请稍后重试'));
              }
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (error: any) => {
            console.error('PayPal错误:', error);
            alert(t('payment.errors.paypalError', 'PayPal支付过程中发生错误'));
            setIsProcessing(false);
          },
          onCancel: () => {
            console.log('支付已取消');
            setIsProcessing(false);
          },
        }).render(paypalRef.current);
      }
    }
  }, [isOpen, paypalLoaded, planCode, planTitle, onClose, refreshUser, navigate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h3 className="text-lg sm:text-xl font-medium text-[#161616] mb-2">{t('payment.title', 'PayPal支付')}</h3>
          <p className="text-sm text-[#6B7280]">
            {planTitle} - ${price}
          </p>
        </div>

        <div className="mb-6">
          <div ref={paypalRef}></div>
        </div>

        {isProcessing && (
          <div className="text-center text-sm text-[#6B7280] mb-4">
            {t('payment.processing', '处理中，请稍候...')}
          </div>
        )}

        <div className="text-center">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
{t('buttons.cancel', '取消')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 充值成功弹窗
const SuccessModal = ({ 
  isOpen, 
  onClose, 
  credits,
  onStartCreating
}: {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onStartCreating: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* 弹窗主体 */}
        <div className="relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 sm:p-8 pt-16 sm:pt-20 max-w-md w-full border border-orange-200">
          {/* credits-big.svg 图片 - 响应式大小，绝对定位，一半在弹框内，一半在外部 */}
          <img 
            src="/images/credits-big.svg" 
            alt="Credits" 
            className="absolute w-32 h-32 sm:w-40 sm:h-40 left-1/2 transform -translate-x-1/2 -top-16 sm:-top-20 z-10"
          />
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-4 h-4 text-[#6B7280] hover:text-[#161616] transition-colors z-20"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.854 4.854a.5.5 0 0 0-.708-.708L8 8.293 3.854 4.146a.5.5 0 1 0-.708.708L7.293 9l-4.147 4.146a.5.5 0 0 0 .708.708L8 9.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 9l4.147-4.146z"/>
            </svg>
          </button>

          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-medium text-[#161616] mb-2">Subscribe successfully</h3>
            
            {/* 积分显示 */}
            <div className="text-4xl sm:text-6xl font-bold text-[#161616] mb-4">+{credits}</div>
            
            <p className="text-sm text-[#6B7280] leading-5 mb-6 sm:mb-8">
              Thank you for your support, now you can start your creative journey!
            </p>

            <Button
              onClick={onStartCreating}
              className="w-full bg-[#FF5C07] hover:bg-[#E54A06] text-white"
            >
              Start Creating
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PricingCard component
const PricingCard = ({ 
  title, 
  price, 
  popular = false, 
  priceNote, 
  features, 
  onBuyClick,
}: { 
  title: string, 
  price: string, 
  popular?: boolean,
  priceNote?: string, 
  features: string[],
  onBuyClick?: () => void,
}) => {
  const { t } = useAsyncTranslation('pricing');
  
  return (
  <div 
    className={`w-full sm:w-[376px] p-6 sm:p-8 bg-[#F9FAFB] rounded-2xl relative overflow-hidden transition-all duration-200 border-2 ${
      popular ? 'border-[#FF5C07]' : 'border-[#EDEEF0]'
    }`}
  >
    {popular && (
      <div className="absolute -top-1 -right-1 px-4 sm:px-6 py-2 bg-[#6200E2] text-white font-bold italic text-xs sm:text-sm rounded-bl-2xl rounded-tr-2xl">
        {t('plans.lite.popular', 'Most Popular')}
      </div>
    )}
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
        <div className="text-center text-[#161616] text-2xl sm:text-4xl font-bold">
          {title} {price}
        </div>
        {priceNote && (
          <div className="flex flex-col items-center gap-2">
            <div className="text-xs sm:text-sm text-[#6B7280] text-center px-2">{priceNote}</div>
            <div className="flex justify-center items-center gap-2">
              <img src={protectIcon} alt="Protect" className="w-3 h-3" />
              <div className="text-[#FF5C07] text-xs sm:text-sm">{t('cancelAnytime', 'Cancel anytime')}</div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 sm:gap-5 w-full">
        <Button 
          variant={popular ? 'gradient' : 'default'}
          className={`w-full h-12 sm:h-[60px] text-lg sm:text-xl font-bold ${
            !popular ? 'border border-[#818181] bg-white text-[#161616] hover:bg-gray-200' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            if (onBuyClick) onBuyClick();
          }}
        >
          {title === 'Free' ? t('buttons.tryNow', 'Try Now') : t('buttons.buyNow', 'Buy Now')}
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
};

const PricingPage: React.FC = () => {
  const { t } = useAsyncTranslation('pricing');
  const { t: tCommon } = useAsyncTranslation('common');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { language, t: baseT } = useLanguage();
  
  // State to manage billing period
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // 弹窗状态
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successCredits] = useState(0);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [currentPlanCode, setCurrentPlanCode] = useState<string>('');

  // 加载PayPal SDK
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const loadPaypal = useRef<Promise<any> | null>(null);

  useEffect(() => {
    const initPayPal = async () => {
      try {
        if (!loadPaypal.current) {
                  loadPaypal.current = loadScriptPaypal({
          clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
          components: "buttons",
        });
        }
        
        await loadPaypal.current;
        setPaypalLoaded(true);
        console.log('PayPal SDK loaded successfully');
      } catch (error) {
        console.error('Failed to load PayPal SDK:', error);
      }
    };

    initPayPal();
  }, []);

  // Function to handle billing period change
  const handleBillingPeriodChange = (period: 'monthly' | 'yearly') => {
    setBillingPeriod(period);
  };

  // 处理购买按钮点击
  const handleBuyClick = (planTitle: string) => {
    if (planTitle === 'Free') {
      navigate('/generate');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 获取计划配置
    const config = planConfigs[planTitle as keyof typeof planConfigs];
    if (config) {
      const planCode = config[billingPeriod].code;
      setCurrentPlan(planTitle);
      setCurrentPlanCode(planCode);
      setShowPayPalModal(true);
    }
  };

  // 获取当前计划的价格
  const getCurrentPrice = () => {
    const config = planConfigs[currentPlan as keyof typeof planConfigs];
    if (config) {
      return config[billingPeriod].price.toFixed(2);
    }
    return '';
  };

  // 处理开始创作按钮点击
  const handleStartCreating = () => {
    setShowSuccessModal(false);
    navigate('/generate');
  };

  // Features for pricing plans - 直接从翻译文件获取数组
  const getFeatures = (planKey: string) => {
    const features = t(`plans.${planKey}.features`, '');
    if (typeof features === 'string' || !Array.isArray(features)) {
      // 如果翻译不存在或格式不正确，使用基础翻译系统的后备翻译
      
             // 使用基础翻译系统中的后备翻译
      
      if (planKey === 'free') {
        return [
          baseT('pricing.features.free.credits', language === 'zh' ? '每月40积分' : '40 credits per month'),
          baseT('pricing.features.free.basic', language === 'zh' ? '基础图片生成' : 'Basic image generation'),
          baseT('pricing.features.free.quality', language === 'zh' ? '标准质量' : 'Standard quality'),
          baseT('pricing.features.free.support', language === 'zh' ? '社区支持' : 'Community support')
        ];
      } else if (planKey === 'lite') {
        return [
          baseT('pricing.features.lite.credits', language === 'zh' ? '每月300积分' : '300 credits per month'),
          baseT('pricing.features.lite.quality', language === 'zh' ? '高质量生成' : 'High-quality generation'),
          baseT('pricing.features.lite.priority', language === 'zh' ? '优先处理' : 'Priority processing'),
          baseT('pricing.features.lite.email', language === 'zh' ? '邮件支持' : 'Email support'),
          baseT('pricing.features.lite.license', language === 'zh' ? '商业许可' : 'Commercial license')
        ];
      } else if (planKey === 'pro') {
        return [
          baseT('pricing.features.pro.credits', language === 'zh' ? '每月600积分' : '600 credits per month'),
          baseT('pricing.features.pro.premium', language === 'zh' ? '高级质量' : 'Premium quality'),
          baseT('pricing.features.pro.fastest', language === 'zh' ? '最快处理' : 'Fastest processing'),
          baseT('pricing.features.pro.support', language === 'zh' ? '优先支持' : 'Priority support'),
          baseT('pricing.features.pro.advanced', language === 'zh' ? '高级功能' : 'Advanced features'),
          baseT('pricing.features.pro.license', language === 'zh' ? '商业许可' : 'Commercial license')
        ];
      }
      
      return [];
    }
    return features as string[];
  };

  const freePlanFeatures = getFeatures('free');
  const litePlanFeatures = getFeatures('lite');
  const proPlanFeatures = getFeatures('pro');

  return (
    <Layout>
      <SEOHead
        title={tCommon('seo.pricing.title', 'Pricing Plans - Premium AI Coloring Page Generator Features')}
        description={tCommon('seo.pricing.description', 'Choose the perfect plan for unlimited AI coloring page generation. Free trial available with premium features for unlimited creativity.')}
        keywords={tCommon('seo.pricing.keywords', 'coloring page pricing, AI generator subscription, premium coloring features, unlimited coloring pages')}
        ogTitle={tCommon('seo.pricing.title', 'Pricing Plans - Premium AI Coloring Page Generator Features')}
        ogDescription={tCommon('seo.pricing.description', 'Choose the perfect plan for unlimited AI coloring page generation. Free trial available with premium features for unlimited creativity.')}
      />
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
        <div className="relative z-10 pt-4 lg:pt-16 flex flex-col items-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#161616] mb-4 sm:mb-12 md:mb-16 text-center">{t('title', 'Plans & Pricing')}</h1>
          
          {/* Toggle for Monthly/Yearly */}
          <div className="h-10 sm:h-12 bg-[#F2F3F5] rounded-3xl inline-flex items-center p-1 mb-8 sm:mb-12 md:mb-16">
            <div 
              className={`w-24 sm:w-[150px] h-8 sm:h-10 rounded-3xl flex justify-center items-center cursor-pointer transition-all duration-200 ${
                billingPeriod === 'monthly' ? 'bg-white' : 'hover:bg-white/50'
              }`}
              onClick={() => handleBillingPeriodChange('monthly')}
            >
              <div className={`text-xs sm:text-sm font-bold ${billingPeriod === 'monthly' ? 'text-[#FF5C07]' : 'text-[#6B7280]'}`}>
                {t('billing.monthly', 'Monthly')}
              </div>
            </div>
            <div 
              className={`w-32 sm:w-[150px] h-8 sm:h-10 rounded-3xl flex justify-center items-center cursor-pointer transition-all duration-200 ${
                billingPeriod === 'yearly' ? 'bg-white' : 'hover:bg-white/50'
              }`}
              onClick={() => handleBillingPeriodChange('yearly')}
            >
              <div className={`text-xs sm:text-sm ${billingPeriod === 'yearly' ? 'text-[#FF5C07] font-bold' : 'text-[#6B7280] font-medium'}`}>
                {t('billing.yearly', 'Yearly')} {t('billing.discount', '(20% off)')}
              </div>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="flex flex-col sm:flex-row gap-6 mb-8 sm:mb-12 md:mb-16 w-full max-w-6xl">
            <PricingCard 
              title={t('plans.free.title', 'Free')} 
              price="" 
              features={freePlanFeatures}
              onBuyClick={() => handleBuyClick('Free')}
            />
            <PricingCard 
              title={t('plans.lite.title', 'Lite')} 
              price={billingPeriod === 'monthly' ? '$5' : '$96'} 
              priceNote={billingPeriod === 'monthly' ? t('plans.lite.priceNote.monthly', 'For first time, then $10/month') : t('plans.lite.priceNote.yearly', 'For first time, then $120/year (Save 20%)')} 
              features={litePlanFeatures}
              popular={true}
              onBuyClick={() => handleBuyClick('Lite')}
            />
            <PricingCard 
              title={t('plans.pro.title', 'Pro')} 
              price={billingPeriod === 'monthly' ? '$12' : '$192'} 
              priceNote={billingPeriod === 'monthly' ? t('plans.pro.priceNote.monthly', 'For first time, then $20/month') : t('plans.pro.priceNote.yearly', 'For first time, then $240/year (Save 20%)')} 
              features={proPlanFeatures}
              onBuyClick={() => handleBuyClick('Pro')}
            />
          </div>
          
          {/* Payment Methods */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-16 md:mb-20 px-4">
            <div className="text-[#6B7280] text-xs sm:text-sm mb-2 sm:mb-0">{t('security.title', 'Secure Payment via PayPal')}</div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <img src={protectIcon} alt="Secure" className="h-4 sm:h-6" />
              <div className="text-[#6B7280] text-xs sm:text-sm">{t('security.description', 'SSL Encrypted')}</div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <FAQ />
          
          {/* CTA Section */}
          <div className="w-full bg-[#F9FAFB] py-12 sm:py-16 md:py-24 border-t border-b border-[#F3F4F6]">
            <div className="max-w-[800px] mx-auto flex flex-col items-center gap-4 sm:gap-6 px-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#111928] text-center">{t('cta.title', 'Get Your Coloring Pages')}</h2>
              <p className="text-[#6B7280] text-center text-sm sm:text-base">
                {t('cta.description', 'One-click generate coloring pages—print and play! Parent-child storytelling through color, screen-free bonding experience.')}
              </p>
              <Button 
                variant="gradient"
                className="h-12 sm:h-14 px-4 sm:px-5 py-2.5 text-lg sm:text-xl font-bold flex items-center gap-2"
                onClick={() => window.location.href = '/generate'}
              >
                {t('cta.button', 'Try Now')}
                <img src={arrowRightIcon} alt="Arrow right" className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PayPal支付弹窗 */}
      <PayPalModal
        isOpen={showPayPalModal}
        onClose={() => setShowPayPalModal(false)}
        planTitle={currentPlan}
        price={getCurrentPrice()}
        planCode={currentPlanCode}
        paypalLoaded={paypalLoaded}
      />

      {/* 充值成功弹窗 */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        credits={successCredits}
        onStartCreating={handleStartCreating}
      />
    </Layout>
  );
};

export default PricingPage; 