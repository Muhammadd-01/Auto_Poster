import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Link as LinkIcon, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState({ total: 0, published: 0, scheduled: 0, failed: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      const { data } = await supabase.from('posts').select('status').eq('user_id', user.id);
      
      if (data) {
        const counts = { total: data.length, published: 0, scheduled: 0, failed: 0 };
        data.forEach(p => {
          if (p.status === 'PUBLISHED') counts.published++;
          if (p.status === 'SCHEDULED' || p.status === 'PROCESSING') counts.scheduled++;
          if (p.status === 'FAILED') counts.failed++;
        });
        setMetrics(counts);
      }
    };
    fetchMetrics();
    
    // Subscribe to realtime updates for live dashboard
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user?.id}` }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user]);

  const handleConnectLinkedIn = () => {
    alert('Mocking LinkedIn OAuth Flow... Successful!');
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AutoPost Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/calendar" className="inline-flex items-center px-4 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <CalendarIcon className="h-4 w-4 mr-2 text-brand-500" />
                Calendar
              </Link>
              <Link to="/composer" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 transition-all transform hover:-translate-y-0.5">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-lg text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="px-4 py-6 sm:px-0">
          
          <div className="bg-white overflow-hidden shadow-sm border border-brand-100 rounded-2xl mb-8 animate-slide-up">
            <div className="px-6 py-6 sm:p-8">
              <h3 className="text-lg leading-6 font-semibold text-gray-900 mb-4">
                LinkedIn Connection
              </h3>
              {isConnected ? (
                <div className="flex items-center text-green-600 bg-green-50 p-4 rounded-xl">
                  <Linkedin className="h-6 w-6 mr-3" />
                  <span className="font-medium">Connected to LinkedIn</span>
                  <button 
                    onClick={() => setIsConnected(false)}
                    className="ml-auto text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div className="bg-brand-50 p-6 rounded-xl border border-brand-100">
                  <p className="text-sm text-brand-800 mb-4 font-medium">
                    Connect your LinkedIn account to start scheduling and publishing posts.
                  </p>
                  <button
                    onClick={handleConnectLinkedIn}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                  >
                    <Linkedin className="h-5 w-5 mr-2" />
                    Connect LinkedIn
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
             <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-2xl px-6 py-6 text-center transform transition-all hover:scale-105 hover:shadow-md">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Posts</dt>
                <dd className="mt-2 text-4xl font-bold text-gray-900">{metrics.total}</dd>
             </div>
             <div className="bg-white overflow-hidden shadow-sm border border-brand-100 rounded-2xl px-6 py-6 text-center transform transition-all hover:scale-105 hover:shadow-md">
                <dt className="text-sm font-medium text-gray-500 truncate">Published</dt>
                <dd className="mt-2 text-4xl font-bold text-brand-600">{metrics.published}</dd>
             </div>
             <div className="bg-white overflow-hidden shadow-sm border border-yellow-100 rounded-2xl px-6 py-6 text-center transform transition-all hover:scale-105 hover:shadow-md">
                <dt className="text-sm font-medium text-gray-500 truncate">Scheduled</dt>
                <dd className="mt-2 text-4xl font-bold text-yellow-600">{metrics.scheduled}</dd>
             </div>
             <div className="bg-white overflow-hidden shadow-sm border border-red-100 rounded-2xl px-6 py-6 text-center transform transition-all hover:scale-105 hover:shadow-md">
                <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                <dd className="mt-2 text-4xl font-bold text-red-600">{metrics.failed}</dd>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};
