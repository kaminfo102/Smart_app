
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Don't show layout on admin panel or course viewer if it has its own sidebar
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/course/')) {
      return <>{children}</>;
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0 flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      <MobileNav />
    </div>
  );
};

export default Layout;
