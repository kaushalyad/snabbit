import { useState, useCallback, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Reports from "../reports/Reports";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setGlobalSearchQuery(value);
  }, []);

  return (
    <div className=" bg-gray-200">
      <Header 
        onMenuClick={handleMenuClick} 
        searchQuery={globalSearchQuery}
        setSearchQuery={handleSearchChange}
        isMobile={isMobile}
      />
      <div className="flex pt-16">
        <div className={`${isMobile ? 'w-64 flex-shrink-0' : 'w-64 flex-shrink-0'} ${!isSidebarOpen && isMobile ? 'hidden' : ''}`}>
          <Sidebar />
        </div>
        <main className="flex-1 bg-gray-200 ">
          <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="max-w-[2000px] mx-auto">
              <Reports globalSearchQuery={globalSearchQuery} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 