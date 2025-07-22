import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutNoFooter: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col pt-[70px]">
        {children}
      </main>
    </div>
  );
};

export default LayoutNoFooter; 