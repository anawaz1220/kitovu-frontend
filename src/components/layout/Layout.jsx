// src/components/layout/Layout.jsx
import React from 'react';
import logo from '../../assets/images/trakos-logo.jpg';
import UserMenu from './UserMenu';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img 
                src={logo}
                alt="TarkOS Logo" 
                className="h-8 w-auto"
              />
              <h1 className="ml-4 text-xl font-semibold text-kitovu-purple">
                {/* TrakOS */}
              </h1>
            </div>
            
            {/* User Menu */}
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Kitovu Technology Company. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;