import { useState, useEffect, useRef } from 'react';
import { CategoriesService, Category } from '../services/categoriesService';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// 内存缓存
const cache = new Map<string, { data: Category[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export const useCategories = (count?: number): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchCategories = async (forceFetch = false) => {
    const cacheKey = `categories-${count || 'all'}`;
    
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
      
      // 按热度排序，如果指定了数量则限制数量
      let sortedCategories = data.sort((a, b) => b.hotness - a.hotness);
      if (count) {
        sortedCategories = sortedCategories.slice(0, count);
      }
      
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
  }, []);

  return {
    categories,
    loading,
    error,
    refetch
  };
};