// 国际化文本接口
export interface LocalizedText {
  en: string;
  zh: string;
}

// 语言类型 - 扩展为支持任意语言代码
export type Language = string;

/**
 * 安全地获取国际化文本
 * @param textObj 可能是字符串或国际化对象
 * @param language 当前语言
 * @returns 安全的字符串
 */
export const getLocalizedText = (textObj: any, language: Language = 'en'): string => {
  try {
    // 如果是字符串，直接返回
    if (typeof textObj === 'string') {
      return textObj;
    }
    
    // 如果是null或undefined，返回空字符串
    if (textObj == null) {
      return '';
    }
    
    // 如果是对象，尝试获取国际化文本
    if (typeof textObj === 'object') {
      // 防止嵌套对象或者复杂结构
      if (Array.isArray(textObj)) {
        return '';
      }
      
      // 尝试当前语言，然后回退到英文，最后尝试其他可用语言
      let result = textObj[language];
      if (!result && textObj['en']) {
        result = textObj['en'];
      }
      if (!result) {
        // 回退到第一个可用的语言
        const availableKeys = Object.keys(textObj).filter(key => textObj[key]);
        result = availableKeys.length > 0 ? textObj[availableKeys[0]] : '';
      }
      // 确保结果是字符串，并再次检查是否为对象
      if (typeof result === 'string') {
        return result;
      } else if (typeof result === 'object' && result !== null) {
        // 如果嵌套了对象，尝试递归处理一次
        return getLocalizedText(result, language);
      } else {
        return String(result || '');
      }
    }
    
    // 其他类型，强制转换为字符串
    return String(textObj || '');
  } catch (error) {
    console.warn('Error processing localized text:', error, textObj);
    return '';
  }
};

/**
 * 安全地处理可能包含国际化对象的文本数组
 * @param textArray 文本数组
 * @param language 当前语言
 * @returns 安全的字符串数组
 */
export const getLocalizedTextArray = (textArray: any[], language: Language = 'en'): string[] => {
  if (!Array.isArray(textArray)) {
    return [];
  }
  
  return textArray.map(item => getLocalizedText(item, language));
};

/**
 * 安全地处理对象中的国际化字段
 * @param obj 对象
 * @param fields 需要处理的字段名数组
 * @param language 当前语言
 * @returns 处理后的对象
 */
export const processLocalizedFields = <T extends Record<string, any>>(
  obj: T, 
  fields: (keyof T)[], 
  language: Language = 'en'
): T => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  const processed = { ...obj };
  
  fields.forEach(field => {
    if (field in processed) {
      (processed as any)[field] = getLocalizedText(processed[field], language);
    }
  });
  
  return processed;
}; 