import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { CategoriesService, Category } from '../services/categoriesService';
import { useLanguage } from './LanguageContext';
import { updateCategoryMappings } from '../utils/categoryUtils';

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getCategories: (count?: number) => Category[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

interface CategoriesProviderProps {
  children: ReactNode;
}

// 内存缓存
const cache = new Map<string, { data: Category[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export const CategoriesProvider: React.FC<CategoriesProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { language } = useLanguage();

  const fetchCategories = async (forceFetch = false) => {
    const cacheKey = `categories-all`;
    
    // 检查缓存
    if (!forceFetch) {
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setCategories(cached.data);
        setLoading(false);
        setError(null);
        return;
      }
    }

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const data = await CategoriesService.getCategories();
      
      // 按热度排序，保存全量数据
      const sortedCategories = data.sort((a, b) => b.hotness - a.hotness);
      
      // 更新分类映射表
      updateCategoryMappings(sortedCategories);
      
      setCategories(sortedCategories);
      
      // 更新缓存
      cache.set(cacheKey, {
        data: sortedCategories,
        timestamp: Date.now()
      });
      
      setError(null);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Failed to fetch categories:', err);
        setError(err.message || 'Failed to fetch categories');
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCategories(true);
  };

  const getCategories = (count?: number): Category[] => {
    if (count && count > 0) {
      return categories.slice(0, count);
    }
    return categories;
  };

  useEffect(() => {
    fetchCategories();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [language]);

  const value: CategoriesContextType = {
    categories,
    loading,
    error,
    refetch,
    getCategories
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = (count?: number) => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }

  return {
    categories: context.getCategories(count),
    loading: context.loading,
    error: context.error,
    refetch: context.refetch
  };
};