import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译文本
const translations: Record<Language, Record<string, string>> = {
  zh: {
    'nav.coloringPagesFree': '免费涂色页',
    'nav.textColoringPage': '文字涂色页',
    'nav.imageColoringPage': '图片涂色页',
    'nav.pricing': '价格',
    'nav.login': '登录',
    'language.chinese': '简体中文',
    'language.english': 'English',
    'language.current': '简体中文',
  },
  en: {
    'nav.coloringPagesFree': 'Coloring Pages Free',
    'nav.textColoringPage': 'Text Coloring Page',
    'nav.imageColoringPage': 'Image Coloring Page',
    'nav.pricing': 'Pricing',
    'nav.login': 'Login',
    'language.chinese': '简体中文',
    'language.english': 'English',
    'language.current': 'English',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  console.log('LanguageProvider render, current language:', language);

  const handleSetLanguage = (lang: Language) => {
    console.log('🔥 handleSetLanguage called with:', lang);
    setLanguage(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language]?.[key];
    return translation || key;
  };

  console.log('LanguageProvider returning context with language:', language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 