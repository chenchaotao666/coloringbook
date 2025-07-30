import { useState, useEffect, useRef } from 'react';
import { CategoriesService, Category } from '../services/categoriesService';
import { useLanguage } from '../contexts/LanguageContext';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// 内存缓存
const cache = new Map<string, { data: Category[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCategories = async (forceFetch = false) => {
    const cacheKey = `categories-${language}`;
    
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
      const data = await CategoriesService.getCategories(language);
      
      // 只取前20个分类用于菜单显示，按热度排序
      const sortedCategories = data
        .sort((a, b) => b.hotness - a.hotness)
        .slice(0, 20);
      
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

  useEffect(() => {
    fetchCategories();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [language]);

  return {
    categories,
    loading,
    error,
    refetch
  };
};