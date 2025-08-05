import React from 'react';
import Header from './Header';
import { useCategories } from '../../contexts/CategoriesContext';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutNoFooter: React.FC<LayoutProps> = ({ children }) => {
  const { categories, loading: categoriesLoading } = useCategories(21);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} categoriesLoading={categoriesLoading} />
      <main className="flex-1 flex flex-col pt-[70px]">
        {children}
      </main>
    </div>
  );
};

export default LayoutNoFooter; 