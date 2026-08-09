// client/src/components/ui/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Shield, Menu, X, Activity, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/evaluation', label: 'Evaluation', icon: BarChart3 },
  ];

  const isActive = (path) => location.pathname === path;

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300 ${
      isScrolled ? 'shadow-md' : 'shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-all duration-200 hover:opacity-80"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                  <span className="text-white font-bold text-sm tracking-tight">PL</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <span className="text-xl font-bold text-gray-900 tracking-tight">PatientLens</span>
                <span className="hidden sm:inline text-[10px] font-medium bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full ml-2.5 border border-indigo-200/50">
                  Research
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'text-indigo-700 bg-indigo-50/80 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive(path) ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{label}</span>
                {isActive(path) && (
                  <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-indigo-600 rounded-full"></span>
                )}
              </Link>
            ))}
            
            {/* Safety Badge */}
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200">
              <div className="flex items-center space-x-1.5 bg-amber-50/80 px-3 py-1.5 rounded-full border border-amber-200/50 hover:bg-amber-50 transition-colors duration-200">
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-amber-600 tracking-wide">Not for Clinical Use</span>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - Slide Down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive(path) ? 'text-indigo-600' : 'text-gray-400'}`} />
                <span>{label}</span>
                {isActive(path) && (
                  <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
                )}
              </Link>
            ))}
            
            {/* Mobile Safety Badge */}
            <div className="px-4 pt-3 pb-1">
              <div className="flex items-center space-x-2 text-xs text-amber-600 bg-amber-50/80 px-3 py-2 rounded-lg border border-amber-200/50">
                <Shield className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>Not for Clinical Use</span>
              </div>
            </div>
            
            {/* Mobile Version Info */}
            <div className="px-4 pt-2 pb-1">
              <span className="text-[10px] text-gray-400">PatientLens v0.1.0 · Research Prototype</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;