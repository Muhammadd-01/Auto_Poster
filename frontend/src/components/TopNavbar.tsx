import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const TopNavbar = () => {
  const { user, linkedInAccount } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const displayName = linkedInAccount?.display_name || user?.user_metadata?.full_name || user?.email || 'User';
  const avatarUrl = linkedInAccount?.profile_url || user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-4">
        {/* Toggle button removed from here, as it will be inside Sidebar */}
        <div className="hidden sm:block text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
          {format(currentTime, 'EEEE, MMMM d, yyyy • hh:mm:ss a')}
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className="relative">
          <Link to="/notifications" className="block p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </Link>
        </div>
        
        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
        
        <Link to="/profile" className="flex items-center space-x-2 p-1 pr-2 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-8 h-8 rounded-full object-cover ring-2 ring-orange-500/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">
            {displayName.split(' ')[0]}
          </span>
        </Link>
      </div>
    </header>
  );
};
