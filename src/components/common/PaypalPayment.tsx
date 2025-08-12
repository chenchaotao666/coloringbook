import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadScript as loadScriptPaypal } from "@paypal/paypal-js";
import { useAuth } from '../../contexts/AuthContext';
import { PricingService } from '../../services/pricingService';
import { useAsyncTranslation } from '../../contexts/LanguageContext';

// PayPal Types
import type { PayPalNamespace } from "@paypal/paypal-js";

declare global {
  interface Window {
    paypal?: PayPalNamespace | null;
  }
}

interface PaypalPaymentProps {
  onBack: () => void;
  planTitle?: string;
  credits?: number;
  monthlyPrice?: string;
  totalPrice?: string;
  discount?: string;
  planCode?: string;
  billingPeriod?: 'monthly' | 'yearly';
}

const PaypalPayment: React.FC<PaypalPaymentProps> = ({
  onBack,
  planTitle = "Pro",
  credits = 60000,
  monthlyPrice = "13.00",
  totalPrice = "156.00",
  discount = "46%",
  planCode = "PRO_MONTHLY",
  billingPeriod: _billingPeriod = "monthly"
}) => {
  const { t } = useAsyncTranslation('pricing');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 加载PayPal SDK
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const loadPaypal = useRef<Promise<any> | null>(null);

  useEffect(() => {
    const initPayPal = async () => {
      try {
        if (!loadPaypal.current) {
          loadPaypal.current = loadScriptPaypal({
            clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
            components: "buttons,card-fields",
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

  // PayPal CardFields 引用
  const [cardField, setCardField] = useState<any>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [paypalInitialized, setPaypalInitialized] = useState(false);


  useEffect(() => {
    if (!paypalLoaded || !window.paypal || paypalInitialized) return;

    const initializePayPal = async () => {
      try {
        const paypal = window.paypal;
        if (!paypal || !paypalRef.current) return;

        // 清空容器
        paypalRef.current.innerHTML = '';
        
        // 渲染 PayPal 按钮
        if (paypal?.Buttons) {
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
              const planCodeValue = planTitle?.toUpperCase() as 'LITE' | 'PRO';
              const chargeType = planCode?.includes('MONTHLY') ? 'Monthly' as const : 'Yearly' as const;
              
              const response = await PricingService.createOrder({
                planCode: planCodeValue,
                method: 'paypal',
                chargeType
              });
              return response.id;
            } catch (error) {
              console.error('创建订单失败:', error);
              setIsProcessing(false);
              throw error;
            }
          },
          onApprove: async (data: any) => {
            try {
              const { orderID } = data;
              await PricingService.captureOrder(orderID);
              await refreshUser();
              onBack();
              alert(t('payment.success.message'));
              navigate('/text-coloring-page');
            } catch (error) {
              console.error('支付失败:', error);
              alert(t('payment.errors.paymentFailed'));
            } finally {
              setIsProcessing(false);
            }
          },
          onError: (error: any) => {
            console.error('PayPal错误:', error);
            alert(t('payment.errors.paypalError'));
            setIsProcessing(false);
          },
          onCancel: () => {
            setIsProcessing(false);
          },
          }).render(paypalRef.current);
        }

        // 初始化 CardFields
        if (paypal.CardFields) {
          const cardFieldInstance = paypal.CardFields({
            createOrder: async () => {
              try {
                setIsProcessing(true);
                const planCodeValue = planTitle?.toUpperCase() as 'LITE' | 'PRO';
                const chargeType = planCode?.includes('MONTHLY') ? 'Monthly' as const : 'Yearly' as const;
                
                const response = await PricingService.createOrder({
                  planCode: planCodeValue,
                  method: 'card',
                  chargeType
                });
                return response.id;
              } catch (error) {
                console.error('创建订单失败:', error);
                setIsProcessing(false);
                throw error;
              }
            },
            onApprove: async (data: any) => {
              try {
                const { orderID } = data;
                await PricingService.captureOrder(orderID);
                await refreshUser();
                onBack();
                alert(t('payment.success.message'));
                navigate('/text-coloring-page');
              } catch (error) {
                console.error('支付失败:', error);
                alert(t('payment.errors.paymentFailed'));
              } finally {
                setIsProcessing(false);
              }
            },
            onError: (error: any) => {
              console.error('CardFields错误:', error);
              alert(t('payment.errors.cardError'));
              setIsProcessing(false);
            }
          });

          setCardField(cardFieldInstance);

          const cardFieldOptions = {
            style: {
              input: {
                padding: "10px 15px",
                background: "#F5F5F5",
                "font-size": "14px",
                border: "1px solid #E6E6E6",
                "border-radius": "4px",
              },
            },
          };

          if (cardFieldInstance.isEligible()) {
            // 延迟渲染确保 DOM 元素存在
            setTimeout(() => {
              try {
                cardFieldInstance.NameField?.(cardFieldOptions)?.render("#card-name-field-container");
                cardFieldInstance.NumberField?.(cardFieldOptions)?.render("#card-number-field-container");
                cardFieldInstance.CVVField?.(cardFieldOptions)?.render("#card-cvv-field-container");
                cardFieldInstance.ExpiryField?.(cardFieldOptions)?.render("#card-expiry-field-container");
              } catch (error) {
                console.error('CardFields render error:', error);
              }
            }, 100);
          }
        }

        setPaypalInitialized(true);
      } catch (error) {
        console.error('PayPal initialization error:', error);
      }
    };

    initializePayPal();
  }, [paypalLoaded, paypalInitialized]);

  // 处理信用卡支付
  const handleCardSubmit = async () => {
    if (!cardField) return;
    
    setCardLoading(true);
    try {
      await cardField.submit();
    } catch (error) {
      console.error('Card payment failed:', error);
      alert('信用卡支付失败，请重试');
    } finally {
      setCardLoading(false);
    }
  };
  return (
    <div className="p-8 h-full w-full">
      <div 
        id="checkout-container" 
        className="w-full flex-shrink-0 mx-auto max-w-[1280px]"
      >
        {/* 返回按钮 */}
        <div className="mb-6">
          <button 
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            onClick={onBack}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="mr-2 h-4 w-4" 
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 19l-7-7 7-7m7 7H5"
              />
            </svg> 
            返回套餐
          </button>
        </div>

        {/* 支付表单容器 */}
        <div className="grid grid-cols-1 rounded-2xl border-[1px] border-gray-300 bg-white lg:grid-cols-2 w-full">
          {/* 左侧 - 订单信息 */}
          <div className="flex flex-col p-10 text-gray-800 bg-gray-50 rounded-l-2xl">
            <div className="mb-[60px]">
              <h3 className="mb-2 text-lg text-gray-600">订阅 {planTitle}</h3>
              <div className="mb-6 text-4xl font-bold text-gray-900">{credits.toLocaleString()} 积分</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>月付</span>
                <span>US${monthlyPrice}/mo</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between">
                <span>小计</span>
                <span>US$288.00</span>
              </div>
              <div className="flex justify-end text-green-600">
                <span>享受 {discount} 折扣&nbsp;</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-lg font-bold">
                <span>今日应付总金额</span>
                <span>US${totalPrice}</span>
              </div>
            </div>
          </div>

          {/* 右侧 - 支付表单 */}
          <div className="rounded-r-2xl bg-white p-10 text-[#5D5D5D]">
            <div className="mb-6 space-y-3">
              {/* PayPal 按钮容器 */}
              <div ref={paypalRef} id="paypal-button-container"></div>
              
              {isProcessing && (
                <div className="text-center text-sm text-[#6B7280] mb-4">
                  {t('payment.processing')}
                </div>
              )}

              {/* 分割线 */}
              <div className="flex items-center my-4">
                <hr className="flex-1 border-gray-300" />
                <span className="px-4 text-[#5d5d5d]">或使用银行卡支付</span>
                <hr className="flex-1 border-gray-300" />
              </div>
              
              {/* 银行卡信息 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[#161616] font-medium">银行卡信息</label>
                  <div className="flex items-center gap-2">
                    <img 
                      src="/images/paypal/mastercard.svg" 
                      alt="Mastercard" 
                      className="h-5 w-[30px]" 
                    />
                    <img 
                      src="/images/paypal/visa.png" 
                      alt="Visa" 
                      className="h-5" 
                    />
                  </div>
                </div>

                {/* PayPal CardFields 动态渲染的输入框 */}
                <div className="mb-4">
                  <div id="card-number-field-container"></div>
                </div>

                {/* 有效期和CVV */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <div id="card-expiry-field-container"></div>
                  </div>
                  <div className="flex-1">
                    <div id="card-cvv-field-container"></div>
                  </div>
                </div>

                {/* 持卡人姓名 */}
                <div className="mb-6">
                  <div id="card-name-field-container"></div>
                </div>

                {/* 支付按钮 */}
                <button 
                  className="w-full h-12 bg-[#FF2478] hover:bg-[#E1206B] text-white text-lg font-medium rounded transition-colors border-none disabled:opacity-50"
                  onClick={handleCardSubmit}
                  disabled={cardLoading || isProcessing}
                >
                  {cardLoading ? '处理中...' : '立即支付'}
                </button>

                {/* 底部说明文字 */}
                <div className="mt-4 space-y-2 text-center">
                  <p className="text-sm text-[#5D5D5D]">
                    确认订阅即表示您授权我们根据我们的条款从您的银行卡中扣除未来付款。您可以随时取消订阅。
                  </p>
                  <div className="flex items-center justify-center text-sm text-[#5D5D5D]">
                    <span>技术支持</span>
                    <img 
                      src="/images/paypal/paypal.webp" 
                      alt="PayPal" 
                      className="ml-1 h-4" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaypalPayment;