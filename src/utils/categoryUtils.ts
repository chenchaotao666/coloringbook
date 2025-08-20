import { LocalizedText } from './textUtils';
import { NavigateFunction } from 'react-router-dom';
import { navigateWithLanguage } from './navigationUtils';
import { Category } from '../services/categoriesService';

// 动态映射存储
let categoryIdToNameMap: Record<string, string> = {};
let categoryNameToIdMap: Record<string, string> = {};

/**
 * 将displayName转换为SEO友好的URL路径
 */
export const convertDisplayNameToPath = (displayName: string): string => {
  return displayName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为短划线
    .replace(/-+/g, '-') // 多个短划线合并为一个
    .trim();
};

/**
 * 从分类数据中提取英文名称作为SEO路径
 */
export const getEnglishNameFromCategory = (displayName: LocalizedText | string): string => {
  if (typeof displayName === 'string') {
    return convertDisplayNameToPath(displayName);
  }
  
  // 如果是LocalizedText对象，优先使用英文
  const englishName = displayName.en || displayName.zh || '';
  return convertDisplayNameToPath(englishName);
};

/**
 * 更新分类映射表（从API数据动态生成）
 */
export const updateCategoryMappings = (categories: Array<{categoryId: string, displayName: LocalizedText | string}>, append: boolean = false) => {
  if (!append) {
    // 默认行为：重置映射表
    categoryIdToNameMap = {};
    categoryNameToIdMap = {};
  }
  
  categories.forEach(category => {
    const seoName = getEnglishNameFromCategory(category.displayName);
    categoryIdToNameMap[category.categoryId] = seoName;
    categoryNameToIdMap[seoName] = category.categoryId;
  });
};

/**
 * 添加单个分类到映射表
 */
export const addCategoryToMappings = (category: {categoryId: string, displayName: LocalizedText | string}) => {
  const seoName = getEnglishNameFromCategory(category.displayName);
  categoryIdToNameMap[category.categoryId] = seoName;
  categoryNameToIdMap[seoName] = category.categoryId;
};

/**
 * 根据分类ID获取SEO友好的名称
 */
export const getCategoryNameById = (categoryId: string): string => {
  return categoryIdToNameMap[categoryId] || categoryId;
};

/**
 * 根据SEO友好的名称获取分类ID
 */
export const getCategoryIdByName = (categoryName: string): string => {
  return categoryNameToIdMap[categoryName] || categoryName;
};

/**
 * 检查给定的字符串是否是分类名称（而不是ID）
 */
export const isCategoryName = (value: string): boolean => {
  return value in categoryNameToIdMap;
};

/**
 * 检查给定的字符串是否是分类ID
 */
export const isCategoryId = (value: string): boolean => {
  return value in categoryIdToNameMap;
};

/**
 * 处理分类点击 - 导航到详情页面（使用英文名称）
 */
export const handleCategoryClick = (
  category: Category,
  navigate: NavigateFunction
) => {
  // 使用映射表获取SEO友好的名称
  const categoryPath = getCategoryNameById(category.categoryId);
  navigateWithLanguage(navigate, `/categories/${categoryPath}`, { state: { category } });
}; 