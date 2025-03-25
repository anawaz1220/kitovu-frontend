// src/components/layout/Layout.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/images/trakos-logo.jpg';
import UserMenu from './UserMenu';
import { Menu, Users, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

const Layout = ({ children, showDrawerToggle = false, onDrawerToggle, hideFooter = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm relative" style={{ zIndex: 2000 }}>
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Drawer Toggle Button (if provided) */}
              {showDrawerToggle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onDrawerToggle}
                  className="text-gray-500 hover:text-kitovu-purple z-2000"
                  style={{ zIndex: 2000 }}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              )}
              
              {/* Logo */}
              <div className="flex items-center">
                <img 
                  src={logo}
                  alt="TarkOS Logo" 
                  className="h-8 w-auto cursor-pointer"
                  onClick={() => navigate('/')}
                />
                <span className="ml-2 text-lg font-semibold text-kitovu-purple">TRAK OS</span>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* <Button 
                variant={location.pathname === '/' ? 'default' : 'ghost'}
                onClick={() => navigate('/')}
                className={location.pathname === '/' ? 'bg-kitovu-purple text-white' : 'text-gray-700'}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Dashboard
              </Button> */}
              
              {/* <Button 
                variant={location.pathname === '/farmer-registration' ? 'default' : 'ghost'}
                onClick={() => navigate('/farmer-registration')}
                className={location.pathname === '/farmer-registration' ? 'bg-kitovu-purple text-white' : 'text-gray-700'}
              >
                <Users className="h-4 w-4 mr-2" />
                Summary Stats
              </Button> */}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer - conditionally rendered */}
      {!hideFooter && (
        <footer className="bg-white border-t">
          <div className="w-full px-4 py-4">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Kitovu Technology Company. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;