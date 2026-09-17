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
  Send,
  Menu,
  X,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LogoutModal } from './LogoutModal';
import { useToast } from '../context/ToastContext';

const mainNavLinks = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Create Post', path: '/create', icon: PlusCircle },
  { name: 'Posts Library', path: '/posts', icon: ImageIcon },
  { name: 'Schedule', path: '/schedule', icon: CalendarIcon },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const regularBottomNavLinks = [
  { name: 'Connected Accounts', path: '/accounts', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
  { name: 'Help & Docs', path: '/help', icon: HelpCircle },
];

const adminNavLinks = [
  { name: 'Platform Admin', path: '/admin', icon: ShieldCheck },
];

export const Sidebar = ({ isCollapsed = false, toggleSidebar }: { isCollapsed?: boolean, toggleSidebar?: () => void }) => {
  const { user, signOut, linkedInAccount } = useAuth();
  const location = useLocation();
  const toast = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  let isOfflineAdmin = false;
  try {
    const adminSession = JSON.parse(localStorage.getItem('autopost_admin_session') || 'null');
    if (adminSession && adminSession.role === 'SUPERADMIN') {
      if (!user || user.email === adminSession.email) {
        isOfflineAdmin = true;
      }
    }
  } catch (e) {}

  const isAdmin = 
    user?.email === 'muhammadaffan1445@gmail.com' ||
    user?.email === 'admin@autopost.io' ||
    user?.email === 'admin@autopost.com' ||
    user?.email === 'affan.work05@gmail.com' ||
    (user as any)?.user_metadata?.role === 'admin' ||
    (user as any)?.user_metadata?.is_admin === true ||
    isOfflineAdmin;

  const displayName = linkedInAccount?.display_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = linkedInAccount?.profile_url || user?.user_metadata?.avatar_url;

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await signOut();
      toast.info('Signed Out', 'You have been safely signed out. See you next time!');
    } catch (err: any) {
      toast.error('Sign out error', err?.message || 'Could not complete sign out');
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const NavItem = ({ link }: { link: any }) => {
    const Icon = link.icon;
    
    let isActive = false;
    if (link.path === '/admin') {
      isActive = location.pathname.startsWith('/admin');
    } else if (link.path.includes('?')) {
      isActive = (location.pathname + location.search) === link.path;
    } else {
      isActive = location.pathname === link.path;
    }
    
    return (
      <Link
        to={link.path}
        title={isCollapsed ? link.name : undefined}
        className={`flex items-center ${isCollapsed ? 'justify-center px-0 mx-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
          isActive
            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
            : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'} transition-colors`} />
        {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{link.name}</span>}
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
            {isAdmin && (
              location.pathname.startsWith('/admin') ? (
                <div className="my-3 border-t border-gray-100 pt-3">
                  <div className="px-4 text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Platform Admin</div>
                  {adminNavLinks.map(link => <NavItem key={link.path} link={link} />)}
                </div>
              ) : (
                <NavItem key={adminNavLinks[0].path} link={adminNavLinks[0]} />
              )
            )}
            <div className="my-3 border-t border-gray-100 pt-3">
              <div className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Settings & Tools</div>
              {regularBottomNavLinks.map(link => <NavItem key={link.path} link={link} />)}
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
             <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate block max-w-[150px]">
                  {displayName}
                </span>
                <div className="flex items-center space-x-1 mt-0.5">
                  {isAdmin && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                      SUPERADMIN
                    </span>
                  )}
                  {linkedInAccount && (
                    <span className="text-[10px] text-blue-600 font-bold block">LinkedIn Connected</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setShowLogoutModal(true)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><LogOut className="w-5 h-5"/></button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col ${isCollapsed ? 'w-[5.5rem]' : 'w-64'} h-screen bg-white border-r border-orange-100 sticky top-0 left-0 z-30 transition-all duration-300 relative`}>
        
        {/* Toggle Button */}
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="absolute right-0 translate-x-1/2 top-7 bg-white border border-gray-200 shadow-sm rounded-full p-1 text-gray-500 hover:text-orange-500 hover:bg-orange-50 z-50 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {/* Logo */}
        <div className={`p-6 ${isCollapsed ? 'flex justify-center px-0' : ''}`}>
          <Link to="/" className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'} group`}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <Send className="w-4.5 h-4.5 -rotate-45" />
            </div>
            {!isCollapsed && (
              <span className="text-xl font-black tracking-tight text-gray-900 whitespace-nowrap overflow-hidden">
                Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
              </span>
            )}
          </Link>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden pb-4">
          <div className="px-2">
            {mainNavLinks.map(link => <NavItem key={link.path} link={link} />)}
          </div>
          
          {/* Admin Controls Section */}
          {isAdmin && (
            location.pathname.startsWith('/admin') ? (
              <div className="py-2 mt-4 border-t border-gray-50 pt-4">
                {!isCollapsed ? (
                  <div className="px-6 text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1.5 flex items-center justify-between whitespace-nowrap">
                    <span>Platform Controls</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                  </div>
                ) : (
                  <div className="flex justify-center mb-2"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span></div>
                )}
                <div className="px-2">
                  {adminNavLinks.map(link => <NavItem key={link.path} link={link} />)}
                </div>
              </div>
            ) : (
              <div className="py-1 px-2 border-t border-gray-50 pt-2 mt-2">
                <NavItem key={adminNavLinks[0].path} link={adminNavLinks[0]} />
              </div>
            )
          )}

          <div className="py-2 mt-2 border-t border-gray-50 pt-4">
            {!isCollapsed ? (
              <div className="px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 whitespace-nowrap">Settings & Tools</div>
            ) : (
              <div className="w-8 h-px bg-gray-200 mx-auto mb-3"></div>
            )}
            <div className="px-2">
              {regularBottomNavLinks.map(link => <NavItem key={link.path} link={link} />)}
            </div>
          </div>
        </nav>

        {/* Footer / User */}
        <div className={`p-4 border-t border-gray-100 ${isCollapsed ? 'px-2 pb-6' : ''}`}>

          <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-3' : 'justify-between'} p-2 rounded-xl hover:bg-gray-50 transition-colors`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'space-x-3'} overflow-hidden`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-9 h-9 rounded-full object-cover ring-2 ring-orange-500/30 flex-shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-sm font-bold flex items-center justify-center shadow-xs flex-shrink-0">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-gray-700 truncate block">
                    {displayName}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200">
                        SUPERADMIN
                      </span>
                    )}
                    {linkedInAccount ? (
                      <span className="text-[11px] text-blue-600 font-bold flex items-center">
                        LinkedIn Active
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 block truncate">
                        {user?.email || 'Offline'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {isCollapsed ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Sign Out"
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowLogoutModal(true)}
                title="Sign Out"
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Thematic Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={displayName}
      />
    </>
  );
};
