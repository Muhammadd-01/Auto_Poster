import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Calendar as CalendarIcon, 
  Image as ImageIcon,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut, 
  Zap,
  Send,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const mainNavLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Create Post', path: '/create', icon: PlusCircle },
  { name: 'Posts Library', path: '/posts', icon: ImageIcon },
  { name: 'Schedule', path: '/schedule', icon: CalendarIcon },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const bottomNavLinks = [
  { name: 'Connected Accounts', path: '/accounts', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help & Docs', path: '/help', icon: HelpCircle },
];

export const Sidebar = () => {
  const { user, signOut, isDemoMode } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NavItem = ({ link }: { link: any }) => {
    const Icon = link.icon;
    const isActive = location.pathname === link.path;
    
    return (
      <Link
        to={link.path}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
          isActive
            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
            : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'} transition-colors`} />
        <span>{link.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-orange-100 sticky top-0 z-50">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Send className="w-3.5 h-3.5 -rotate-45" />
          </div>
          <span className="text-lg font-black tracking-tight text-gray-900">
            Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
          </span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-gray-600 hover:bg-orange-50 rounded-lg">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-20 px-4 overflow-y-auto pb-6 border-b border-orange-100 flex flex-col justify-between">
          <div className="space-y-1">
            {mainNavLinks.map(link => <NavItem key={link.path} link={link} />)}
            <div className="my-4 border-t border-gray-100"></div>
            {bottomNavLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <button onClick={signOut} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><LogOut className="w-5 h-5"/></button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-orange-100 sticky top-0 left-0 z-30">
        
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <Send className="w-4.5 h-4.5 -rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
            </span>
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {mainNavLinks.map(link => <NavItem key={link.path} link={link} />)}
          
          <div className="py-4">
            <div className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Settings & Tools</div>
            {bottomNavLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>
        </nav>

        {/* Footer / User */}
        <div className="p-4 border-t border-gray-100">
          {isDemoMode && (
            <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-amber-800">Demo Sandbox</span>
            </div>
          )}
          
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-sm font-bold flex items-center justify-center shadow-xs flex-shrink-0">
                {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700 truncate">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
