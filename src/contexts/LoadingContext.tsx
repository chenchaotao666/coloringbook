import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  progress: number;
  startLoading: () => void;
  finishLoading: () => void;
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgressState] = useState(0);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setProgressState(30); // 开始时显示30%
  }, []);

  const finishLoading = useCallback(() => {
    setProgressState(100);
    // 延迟一点时间让用户看到100%，然后隐藏
    setTimeout(() => {
      setIsLoading(false);
      setProgressState(0);
    }, 300);
  }, []);

  const setProgress = useCallback((newProgress: number) => {
    setProgressState(Math.min(100, Math.max(0, newProgress)));
  }, []);

  const value: LoadingContextType = {
    isLoading,
    progress,
    startLoading,
    finishLoading,
    setProgress,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export default LoadingContext;