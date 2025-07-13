import { Language } from '../contexts/LanguageContext';

// 翻译资源接口
interface TranslationModule {
  [key: string]: any;
}

interface TranslationCache {
  [language: string]: {
    [module: string]: TranslationModule;
  };
}

// 翻译资源缓存
const translationCache: TranslationCache = {};

// 加载状态管理
const loadingPromises: { [key: string]: Promise<TranslationModule> } = {};

/**
 * 动态加载翻译模块
 */
export const loadTranslationModule = async (
  language: Language,
  module: string
): Promise<TranslationModule> => {
  const cacheKey = `${language}-${module}`;
  
  // 检查缓存
  if (translationCache[language]?.[module]) {
    return translationCache[language][module];
  }
  
  // 检查是否正在加载
  if (cacheKey in loadingPromises) {
    return loadingPromises[cacheKey];
  }
  
  // 开始加载
  const loadPromise = (async () => {
    try {
      let translationModule: TranslationModule;
      
      // 动态导入翻译文件
      switch (module) {
        case 'common':
          translationModule = await import(`../locales/${language}/common.json`);
          break;
        case 'navigation':
          translationModule = await import(`../locales/${language}/navigation.json`);
          break;
        case 'forms':
          translationModule = await import(`../locales/${language}/forms.json`);
          break;
        case 'errors':
          translationModule = await import(`../locales/${language}/errors.json`);
          break;
        case 'home':
          translationModule = await import(`../locales/${language}/pages/home.json`);
          break;
        case 'generate':
          translationModule = await import(`../locales/${language}/pages/generate.json`);
          break;
        case 'pricing':
          translationModule = await import(`../locales/${language}/pages/pricing.json`);
          break;
        case 'categories':
          translationModule = await import(`../locales/${language}/pages/categories.json`);
          break;
        case 'creations':
          translationModule = await import(`../locales/${language}/pages/creations.json`);
          break;
        case 'profile':
          translationModule = await import(`../locales/${language}/pages/profile.json`);
          break;
        default:
          console.warn(`Unknown translation module: ${module}`);
          return {};
      }
      
      // 提取default导出（JSON模块通常有default属性）
      const translations = translationModule.default || translationModule;
      
      // 缓存翻译资源
      if (!translationCache[language]) {
        translationCache[language] = {};
      }
      translationCache[language][module] = translations;
      
      return translations;
    } catch (error) {
      console.error(`Failed to load translation module ${language}/${module}:`, error);
      return {};
    } finally {
      // 清除加载状态
      delete loadingPromises[cacheKey];
    }
  })();
  
  loadingPromises[cacheKey] = loadPromise;
  return loadPromise;
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
 * 同步获取已缓存的翻译模块（用于避免闪烁）
 */
export const getCachedTranslationModule = (
  language: Language,
  module: string
): TranslationModule | null => {
  return translationCache[language]?.[module] || null;
};

/**
 * 检查翻译模块是否已缓存
 */
export const isTranslationModuleCached = (
  language: Language,
  module: string
): boolean => {
  return !!(translationCache[language]?.[module]);
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
    loading: Object.keys(loadingPromises),
  };
}; 