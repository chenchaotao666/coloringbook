import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Language } from '../../contexts/LanguageContext';

// 支持的语言列表
export const SUPPORTED_LANGUAGES: Language[] = ['zh', 'en', 'ja'];

// 默认语言
export const DEFAULT_LANGUAGE: Language = 'zh';

// 语言路径映射
export const LANGUAGE_PATHS: Record<Language, string> = {
  zh: '/zh',
  en: '/',
  ja: '/ja'
};

// 检测浏览器语言
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language || (navigator as any).userLanguage;
  // 检测是否为中文
  if (browserLang.toLowerCase().includes('zh')) {
    return 'zh';
  }
  return 'en';
};

// 从localStorage获取保存的语言偏好
export const getSavedLanguage = (): Language | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const saved = localStorage.getItem('preferred-language');
    if (saved === 'zh' || saved === 'en') {
      return saved;
    }
  } catch (error) {
    console.warn('Failed to read language preference from localStorage:', error);
  }
  return null;
};

// 保存语言偏好到localStorage
export const saveLanguagePreference = (language: Language) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('preferred-language', language);
  } catch (error) {
    console.warn('Failed to save language preference to localStorage:', error);
  }
};

// 获取当前语言
export const getCurrentLanguage = (pathname: string): Language => {
  // 检查路径是否以 /zh 开头
  if (pathname.startsWith('/zh')) {
    return 'zh';
  }
  // 检查路径是否以 /ja 开头
  if (pathname.startsWith('/ja')) {
    return 'ja';
  }
  // 其他情况默认为英文
  return 'en';
};

// 生成语言路径
export const generateLanguagePath = (language: Language, path: string = ''): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  if (language === 'zh') {
    return `/zh${cleanPath === '/' ? '' : cleanPath}`;
  }
  if (language === 'ja') {
    return `/ja${cleanPath === '/' ? '' : cleanPath}`;
  }
  return cleanPath;
};

// 移除语言前缀的路径
export const removeLanguagePrefix = (pathname: string): string => {
  if (pathname.startsWith('/zh')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  if (pathname.startsWith('/ja')) {
    const cleanPath = pathname.substring(3);
    return cleanPath || '/';
  }
  return pathname;
};

// 语言重定向组件
export const LanguageRedirect: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // 如果已经包含语言路径，不做任何操作
  if (currentPath.startsWith('/zh') || currentPath.startsWith('/ja') || currentPath === '/') {
    return null;
  }
  
  // 获取用户偏好的语言
  const preferredLanguage = getSavedLanguage() || detectBrowserLanguage();
  
  // 生成带语言前缀的路径
  const newPath = generateLanguagePath(preferredLanguage, currentPath);
  
  return <Navigate to={newPath} replace />;
};

// URL语言检测Hook
export const useLanguageFromUrl = (): Language => {
  const location = useLocation();
  return getCurrentLanguage(location.pathname);
};

// 语言切换Hook
export const useLanguageSwitch = () => {
  const location = useLocation();
  
  const switchLanguage = (newLanguage: Language): string => {
    const currentPath = removeLanguagePrefix(location.pathname);
    const newPath = generateLanguagePath(newLanguage, currentPath);
    
    // 保存语言偏好
    saveLanguagePreference(newLanguage);
    
    return newPath;
  };
  
  return { switchLanguage };
}; 