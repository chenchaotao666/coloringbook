import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface GoogleLoginButtonProps {
  rememberMe?: boolean;
  onError?: (error: Error) => void;
}

// 将应用语言映射到Google支持的locale
const getGoogleLocale = (language: string): string => {
  // Google支持的主要语言代码
  const localeMap: { [key: string]: string } = {
    'zh': 'zh',        // 简体中文 - 尝试使用更简单的格式
    'zh-CN': 'zh',     // 简体中文
    'zh-TW': 'zh_TW',  // 繁体中文
    'en': 'en',        // 英文
    'ja': 'ja',        // 日文
    'ko': 'ko',        // 韩文
    'fr': 'fr',        // 法文
    'de': 'de',        // 德文
    'es': 'es',        // 西班牙文
    'pt': 'pt',        // 葡萄牙文
    'ru': 'ru',        // 俄文
    'ar': 'ar',        // 阿拉伯文
  };
  
  // 提取语言代码（去掉地区后缀）
  const langCode = language.split('-')[0].toLowerCase();
  
  return localeMap[language] || localeMap[langCode] || 'en';
};

// 强制重置Google Sign-In的方法
const forceResetGoogleSignIn = () => {
  try {
    // 清除可能的缓存
    if (window.google?.accounts?.id) {
      // 清除所有Google相关的iframe
      const allFrames = document.querySelectorAll('iframe[src*="accounts.google.com"], iframe[src*="gstatic.com"], iframe[src*="google.com"]');
      allFrames.forEach(frame => frame.remove());
      
      // 清除所有可能的Google相关DOM元素
      const gButtons = document.querySelectorAll('[data-idomelements], .abcRioButton, .g_id_signin');
      gButtons.forEach(btn => btn.remove());
      
      // 清除可能的内部缓存和状态
      delete (window as any).__GOOGLE_ACCOUNTS__;
      delete (window as any).google;
      
      // 移除原有的Google脚本
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    }
  } catch (error) {
    console.warn('Could not reset Google Sign-In:', error);
  }
};

// 重新加载Google脚本的方法
const reloadGoogleScript = (locale: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 先清除现有脚本
    forceResetGoogleSignIn();
    
    // 创建新的脚本标签，带上语言参数
    const script = document.createElement('script');
    script.src = `https://accounts.google.com/gsi/client?hl=${locale}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log(`✅ Google script reloaded with locale: ${locale}`);
      resolve();
    };
    
    script.onerror = () => {
      console.error(`❌ Failed to reload Google script with locale: ${locale}`);
      reject(new Error('Failed to load Google script'));
    };
    
    document.head.appendChild(script);
  });
};

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  rememberMe = true, 
  onError 
}) => {
  const { googleLogin } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const handleCredentialResponse = async (response: any) => {
    try {
      const token = response.credential;
      await googleLogin(token, rememberMe);
      
      // 登录成功，跳转到首页或之前的页面
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Google登录失败:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  useEffect(() => {
    const initializeGoogleButton = async () => {
      if (typeof window === 'undefined' || !buttonRef.current) {
        return;
      }
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
      
      if (clientId === 'YOUR_GOOGLE_CLIENT_ID') {
        console.warn('请配置 VITE_GOOGLE_CLIENT_ID 环境变量');
        setIsGoogleLoaded(false);
        return;
      }
      
      try {
        // 获取Google支持的locale
        const googleLocale = getGoogleLocale(language);
        
        // 强制设置HTML lang属性
        document.documentElement.lang = googleLocale;
        document.documentElement.setAttribute('data-locale', googleLocale);
        
        // 清除之前的按钮内容
        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
        }
        
        // 重新加载Google脚本以强制应用新的语言设置
        await reloadGoogleScript(googleLocale);
        
        // 等待脚本完全加载
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!window.google || !window.google.accounts || !window.google.accounts.id) {
          throw new Error('Google Sign-In script failed to load');
        }
        
        // 初始化Google Sign-In
        const finalLocale = googleLocale === 'en' ? 'en_US' : googleLocale;
        const initializeOptions = {
          client_id: clientId,
          callback: handleCredentialResponse,
          locale: finalLocale,
          ux_mode: 'popup' as const
        };
        
        console.log('📋 Initializing Google Sign-In with options:', initializeOptions);
        window.google.accounts.id.initialize(initializeOptions);

        // 渲染按钮
        const renderOptions = { 
          theme: "outline" as const, 
          size: "large" as const,
          width: "400",
          text: "signin_with" as const,
          shape: "rectangular" as const,
          locale: finalLocale,
          type: "standard" as const
        };
        
        console.log('🎨 Rendering Google button with options:', renderOptions);
        window.google.accounts.id.renderButton(buttonRef.current, renderOptions);
        
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('Failed to initialize Google button:', error);
        setIsGoogleLoaded(false);
      }
    };

    // 延迟执行，确保DOM准备就绪
    const timer = setTimeout(initializeGoogleButton, 500);
    
    return () => clearTimeout(timer);
  }, [language]); // 依赖语言变化，重新渲染按钮

  return (
    <div className="w-full relative" style={{ minHeight: '44px' }}>
      <div 
        ref={buttonRef} 
        className={`w-full flex justify-center transition-opacity duration-200 ${
          isGoogleLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      ></div>
      
      {/* 加载状态 - 使用绝对定位避免抖动 */}
      {!isGoogleLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500 text-sm">
            正在加载Google登录...
          </div>
        </div>
      )}
    </div>
  );
};

// 声明Google对象类型
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
      };
    };
  }
}

export default GoogleLoginButton; 