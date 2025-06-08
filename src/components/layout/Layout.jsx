import React, { useState, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Reports from '../reports/Reports';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const handleMenuClick = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleSearchChange = useCallback((value) => {
    setGlobalSearchQuery(value);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={handleMenuClick} 
        searchQuery={globalSearchQuery}
        setSearchQuery={handleSearchChange}
      />
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
          <div className="container mx-auto px-4 py-8">
            <Reports globalSearchQuery={globalSearchQuery} />
          </div>
        </main>
      </div>
    </div>
  );
} 