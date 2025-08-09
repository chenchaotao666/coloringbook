import { Language } from '../contexts/LanguageContext';

// 同步导入所有翻译文件
import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enForms from '../locales/en/forms.json';
import enErrors from '../locales/en/errors.json';
import enHome from '../locales/en/pages/home.json';
import enGenerate from '../locales/en/pages/generate.json';
import enPricing from '../locales/en/pages/pricing.json';
import enCategories from '../locales/en/pages/categories.json';
import enCreations from '../locales/en/pages/creations.json';
import enProfile from '../locales/en/pages/profile.json';

import zhCommon from '../locales/zh/common.json';
import zhNavigation from '../locales/zh/navigation.json';
import zhForms from '../locales/zh/forms.json';
import zhErrors from '../locales/zh/errors.json';
import zhHome from '../locales/zh/pages/home.json';
import zhGenerate from '../locales/zh/pages/generate.json';
import zhPricing from '../locales/zh/pages/pricing.json';
import zhCategories from '../locales/zh/pages/categories.json';
import zhCreations from '../locales/zh/pages/creations.json';
import zhProfile from '../locales/zh/pages/profile.json';

// 翻译资源接口
interface TranslationModule {
  [key: string]: any;
}

interface TranslationCache {
  [language: string]: {
    [module: string]: TranslationModule;
  };
}

// 静态翻译资源映射
const translationModules: TranslationCache = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    forms: enForms,
    errors: enErrors,
    home: enHome,
    generate: enGenerate,
    pricing: enPricing,
    categories: enCategories,
    creations: enCreations,
    profile: enProfile,
  },
  zh: {
    common: zhCommon,
    navigation: zhNavigation,
    forms: zhForms,
    errors: zhErrors,
    home: zhHome,
    generate: zhGenerate,
    pricing: zhPricing,
    categories: zhCategories,
    creations: zhCreations,
    profile: zhProfile,
  },
};

// 翻译资源缓存
const translationCache: TranslationCache = {};

// 加载状态管理（已不再需要，因为所有资源都是同步可用的）
// const loadingPromises: { [key: string]: Promise<TranslationModule> } = {};

/**
 * 同步加载翻译模块（现在使用预先导入的资源）
 */
export const loadTranslationModule = async (
  language: Language,
  module: string
): Promise<TranslationModule> => {
  // 检查缓存
  if (translationCache[language]?.[module]) {
    return translationCache[language][module];
  }
  
  // 从预先导入的静态资源中获取翻译
  const translations = translationModules[language]?.[module];
  
  if (!translations) {
    console.warn(`Translation module not found: ${language}/${module}`);
    return {};
  }
  
  // 缓存翻译资源
  if (!translationCache[language]) {
    translationCache[language] = {};
  }
  translationCache[language][module] = translations;
  
  return translations;
};

/**
 * 批量加载多个翻译模块
 */
export const loadTranslationModules = async (
  language: Language,
  modules: string[]
): Promise<{ [module: string]: TranslationModule }> => {
  const loadPromises = modules.map(async (module) => {
    const translations = await loadTranslationModule(language, module);
    return { module, translations };
  });
  
  const results = await Promise.all(loadPromises);
  
  return results.reduce((acc, { module, translations }) => {
    acc[module] = translations;
    return acc;
  }, {} as { [module: string]: TranslationModule });
};

/**
 * 预加载核心翻译模块
 */
export const preloadCoreTranslations = async (language: Language): Promise<void> => {
  // 预加载所有常用模块，避免页面加载时的翻译闪烁
  const coreModules = [
    'common', 
    'navigation', 
    'forms', 
    'errors',
    'home',        // 首页翻译
    'pricing',     // 价格页翻译
    'categories',  // 分类页翻译
    'creations',   // 作品页翻译
    'generate'     // 生成页翻译
  ];
  
  try {
    await loadTranslationModules(language, coreModules);
    console.log(`✅ Successfully preloaded ${coreModules.length} translation modules for ${language}`);
  } catch (error) {
    console.warn('Failed to preload some translation modules:', error);
  }
};

/**
 * 获取嵌套路径的翻译值
 * 支持 'common.buttons.save' 这样的路径
 */
export const getNestedTranslation = (
  translations: TranslationModule,
  path: string,
  fallback?: string
): string => {
  const keys = path.split('.');
  let current = translations;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback || path;
    }
  }
  
  return typeof current === 'string' ? current : fallback || path;
};

/**
 * 带参数插值的翻译函数
 * 支持 'hello {name}' 这样的模板
 */
export const interpolateTranslation = (
  text: string,
  params?: { [key: string]: string | number }
): string => {
  if (!params) return text;
  
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
};

/**
 * 清除翻译缓存
 */
export const clearTranslationCache = (): void => {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
};

/**
 * 同步获取翻译模块（现在直接从静态资源获取，无需缓存检查）
 */
export const getCachedTranslationModule = (
  language: Language,
  module: string
): TranslationModule | null => {
  // 首先检查缓存
  if (translationCache[language]?.[module]) {
    return translationCache[language][module];
  }
  
  // 从静态资源中获取
  const translations = translationModules[language]?.[module];
  if (translations) {
    // 同时缓存起来
    if (!translationCache[language]) {
      translationCache[language] = {};
    }
    translationCache[language][module] = translations;
    return translations;
  }
  
  return null;
};

/**
 * 检查翻译模块是否可用（现在所有模块都是同步可用的）
 */
export const isTranslationModuleCached = (
  language: Language,
  module: string
): boolean => {
  return !!(translationCache[language]?.[module] || translationModules[language]?.[module]);
};

/**
 * 获取缓存状态信息（用于调试）
 */
export const getTranslationCacheInfo = () => {
  return {
    cached: Object.keys(translationCache).reduce((acc, lang) => {
      acc[lang] = Object.keys(translationCache[lang]);
      return acc;
    }, {} as { [lang: string]: string[] }),
    available: Object.keys(translationModules).reduce((acc, lang) => {
      acc[lang] = Object.keys(translationModules[lang]);
      return acc;
    }, {} as { [lang: string]: string[] }),
  };
}; 