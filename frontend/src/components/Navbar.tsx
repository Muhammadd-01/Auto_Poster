import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  LayoutDashboard, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Image as ImageIcon, 
  LogOut, 
  Zap, 
  ExternalLink 
} from 'lucide-react';

export const Navbar = () => {
  const { user, signOut, isDemoMode } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Post', path: '/composer', icon: PlusCircle },
    { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Media Library', path: '/media', icon: ImageIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
                <Send className="w-4 h-4 -rotate-45" />
              </div>
              <span className="text-lg font-black tracking-tight text-gray-900">
                Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50/80'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right User & Actions */}
          <div className="flex items-center space-x-3">
            {isDemoMode && (
              <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>Demo Sandbox</span>
              </span>
            )}

            <div className="flex items-center space-x-2 bg-orange-50/80 px-3 py-1.5 rounded-full border border-orange-200/60">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-gray-700 max-w-[120px] sm:max-w-[180px] truncate">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>

            <button
              onClick={signOut}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
      
      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-orange-100 bg-white/95 px-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-bold ${
                isActive ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
