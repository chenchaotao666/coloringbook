import React from 'react';
import Header from './Header';
import Footer from './Footer';
import BackToTop from '../common/BackToTop';
import { useCategories } from '../../contexts/CategoriesContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { categories, loading: categoriesLoading } = useCategories(21);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} categoriesLoading={categoriesLoading} />
      <main className="flex-grow pt-[70px]">
        {children}
      </main>
      <Footer categories={categories} categoriesLoading={categoriesLoading} />
      <BackToTop />
    </div>
  );
};

export default Layout; 