import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutNoFooter: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default LayoutNoFooter; 