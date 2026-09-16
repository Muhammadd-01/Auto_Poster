import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';
import { 
  Send, 
  Link as LinkIcon, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Sparkles, 
  Activity, 
  Layers, 
  FileText,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Dashboard = () => {
  const { user, isDemoMode } = useAuth();
  const [isConnected, setIsConnected] = useState(true);
  const [metrics, setMetrics] = useState({ total: 0, published: 0, scheduled: 0, failed: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetricsAndPosts = async () => {
    if (!user) return;

    if (isDemoMode) {
      const stored = JSON.parse(localStorage.getItem('autopost_demo_posts') || '[]');
      const counts = { total: stored.length, published: 0, scheduled: 0, failed: 0 };
      stored.forEach((p: any) => {
        if (p.status === 'PUBLISHED') counts.published++;
        if (p.status === 'SCHEDULED' || p.status === 'PROCESSING') counts.scheduled++;
        if (p.status === 'FAILED') counts.failed++;
      });
      setMetrics(counts);
      setRecentPosts(stored.slice(0, 5));
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        const counts = { total: data.length, published: 0, scheduled: 0, failed: 0 };
        data.forEach((p) => {
          if (p.status === 'PUBLISHED') counts.published++;
          if (p.status === 'SCHEDULED' || p.status === 'PROCESSING') counts.scheduled++;
          if (p.status === 'FAILED') counts.failed++;
        });
        setMetrics(counts);
        setRecentPosts(data.slice(0, 5));
      }
    } catch (err) {
      console.warn('Fetch metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndPosts();

    if (!isDemoMode && user) {
      const subscription = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user?.id}` },
          fetchMetricsAndPosts
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user, isDemoMode]);

  const handleConnectLinkedIn = () => {
    setIsConnected(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-amber-50/40 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Welcome Hero Banner */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-2xl shadow-orange-600/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                <span>Worker Active • Polling Every 60s</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'Creator'}!
              </h1>
              <p className="text-orange-100 text-sm sm:text-base max-w-xl">
                Your LinkedIn publishing engine is online. All scheduled posts will automatically publish via our server-side worker.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/composer"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-orange-700 hover:bg-orange-50 shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </Link>
              <Link
                to="/calendar"
                className="px-5 py-3.5 rounded-xl font-bold text-sm bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all flex items-center space-x-2"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>View Calendar</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Posts</p>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{metrics.total}</h3>
              <p className="text-xs text-gray-400 mt-1">Lifetime authored</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Published</p>
              <h3 className="text-3xl font-black text-green-600 mt-1">{metrics.published}</h3>
              <p className="text-xs text-green-700/70 mt-1">Delivered to feed</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Scheduled</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{metrics.scheduled}</h3>
              <p className="text-xs text-amber-700/70 mt-1">Queued on server</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Failed / Retrying</p>
              <h3 className="text-3xl font-black text-red-500 mt-1">{metrics.failed}</h3>
              <p className="text-xs text-red-600/70 mt-1">3x retry policy</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* Two Column Section: Connected LinkedIn Account & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: LinkedIn Account Connection Card (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-[#0077b5] text-white flex items-center justify-center">
                  <LinkIcon className="w-4 h-4 fill-white" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">LinkedIn Account</h3>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                Active
              </span>
            </div>

            {isConnected ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/30"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {user?.user_metadata?.full_name || 'Alex Vance'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">Client ID: 77bk0ls0m6tm57</p>
                    <p className="text-[11px] text-green-600 font-semibold flex items-center mt-0.5">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Direct Token Linked
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1 bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                  <div className="flex justify-between">
                    <span>OAuth Scopes:</span>
                    <span className="font-mono text-gray-700">w_member_social</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Expiration:</span>
                    <span className="font-semibold text-gray-700">58 days remaining</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsConnected(false)}
                  className="w-full py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                >
                  Disconnect LinkedIn Account
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-gray-600">
                  No LinkedIn account connected yet. Authorize to start publishing directly.
                </p>
                <button
                  onClick={handleConnectLinkedIn}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0077b5] hover:bg-[#005f93] shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <LinkIcon className="w-4 h-4 fill-white" />
                  <span>Connect with LinkedIn</span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Recent Activity / Queue (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Post Queue</h3>
                <p className="text-xs text-gray-500">Live posts tracked by the publisher engine</p>
              </div>
              <Link
                to="/calendar"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
              >
                <span>View All History</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-gray-400">Loading activity...</div>
            ) : recentPosts.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-orange-50/40 rounded-2xl border border-dashed border-orange-200">
                <FileText className="w-10 h-10 mx-auto text-orange-400" />
                <p className="text-sm font-bold text-gray-700">No posts in the queue yet</p>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Create your first LinkedIn post to watch it get published automatically.
                </p>
                <Link
                  to="/composer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create First Post</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentPosts.map((post) => (
                  <div key={post.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                        {post.caption}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span>
                          {post.status === 'PUBLISHED'
                            ? 'Published: ' + format(parseISO(post.published_at || post.created_at), 'MMM d, h:mm a')
                            : post.status === 'SCHEDULED'
                            ? 'Scheduled for: ' + format(parseISO(post.scheduled_at || post.created_at), 'MMM d, h:mm a')
                            : 'Drafted: ' + format(parseISO(post.created_at), 'MMM d, h:mm a')}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{post.timezone || 'Asia/Karachi'}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                          post.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : post.status === 'SCHEDULED' || post.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : post.status === 'FAILED'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
