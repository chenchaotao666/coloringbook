import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// 从URL路径检测语言
const getCurrentLanguageFromPath = (pathname: string): 'zh' | 'en' | 'ja' => {
  if (pathname.startsWith('/zh')) {
    return 'zh';
  } else if (pathname.startsWith('/ja')) {
    return 'ja';
  }
  return 'en';
};

interface LanguageSyncProviderProps {
  children: React.ReactNode;
}

export const LanguageSyncProvider: React.FC<LanguageSyncProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, __internal_setState, __internal_setNavigate } = useLanguage();

  // 注入navigate函数到语言上下文
  useEffect(() => {
    if (__internal_setNavigate) {
      __internal_setNavigate(navigate);
    }
  }, [navigate, __internal_setNavigate]);

  // 监听URL变化，同步语言设置
  useEffect(() => {
    const urlLanguage = getCurrentLanguageFromPath(location.pathname);
    console.log('🔍 LanguageSyncProvider: URL language:', urlLanguage, 'current language:', language, 'pathname:', location.pathname);
    if (urlLanguage !== language && __internal_setState) {
      console.log('🔄 LanguageSyncProvider: Updating language from', language, 'to', urlLanguage);
      // 直接更新语言状态，不触发路径跳转
      __internal_setState(urlLanguage);
    }
  }, [location.pathname, language, __internal_setState]);

  return <>{children}</>;
}; 