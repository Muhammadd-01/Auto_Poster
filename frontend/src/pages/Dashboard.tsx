import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Link as LinkIcon, 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Layers, 
  FileText,
  ShieldCheck,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [metrics, setMetrics] = useState({ total: 0, published: 0, scheduled: 0, failed: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [linkedInAccount, setLinkedInAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user) return;


    try {
      // 1. Fetch Posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsData) {
        const counts = { total: postsData.length, published: 0, scheduled: 0, failed: 0 };
        postsData.forEach((p) => {
          if (p.status === 'PUBLISHED') counts.published++;
          if (p.status === 'SCHEDULED' || p.status === 'PROCESSING') counts.scheduled++;
          if (p.status === 'FAILED') counts.failed++;
        });
        setMetrics(counts);
        setRecentPosts(postsData.slice(0, 5));
      }

      // 2. Fetch LinkedIn Account Status
      const { data: accountsData } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('provider', 'linkedin')
        .single();
      
      if (accountsData) {
        setLinkedInAccount(accountsData);
      } else {
        setLinkedInAccount(null);
      }
      
    } catch (err) {
      console.warn('Fetch metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncLinkedIn = async () => {
    if (!user?.id) {
      toast.warning('Authentication Required', 'Please log in to sync posts with LinkedIn.');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetch('http://localhost:3000/api/sync/linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to sync with LinkedIn');
      }
      if (data.restricted) {
        toast.info('Dashboard Refreshed', data.message);
      } else {
        toast.success('LinkedIn Synced!', data.message || `Synced ${data.syncedCount} posts.`);
      }
      fetchDashboardData();
    } catch (err: any) {
      toast.error('Sync Notice', err.message || 'Could not sync historical posts from LinkedIn.');
    } finally {
      setIsSyncing(false);
    }
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    const postId = postToDelete;

    try {
      try {
        const res = await fetch('http://localhost:3000/api/posts/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, userId: user?.id })
        });
        const json = await res.json();
        if (json.deletedFromLinkedIn) {
          toast.success('Deleted From LinkedIn & Dashboard', 'Post was removed from your live LinkedIn feed and dashboard.');
        } else {
          toast.success('Post Deleted', 'Post was removed from your dashboard.');
        }
      } catch {
        await supabase.from('posts').delete().eq('id', postId);
        toast.info('Post Deleted', 'Removed from database.');
      }
      setRecentPosts((prev) => prev.filter((p) => p.id !== postId));
      fetchDashboardData();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Delete Failed', err.message || 'Could not delete post.');
    } finally {
      setPostToDelete(null);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (user) {
      const subscription = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user?.id}` },
          fetchDashboardData
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

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

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Elevated Superadmin Quick Bar if logged in as Admin */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-orange-500/15 border-2 border-orange-300/80 rounded-3xl p-5 shadow-lg shadow-orange-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/30 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-600 text-white shadow-xs">
                    Superadmin Privileges
                  </span>
                  <span className="text-xs text-orange-700 font-bold hidden sm:inline">• Full Platform Control Active</span>
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  You have elevated administrator controls available to manage users, inspect global post queues, and audit live traffic.
                </p>
              </div>
            </div>
            <Link
              to="/admin"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-600 hover:bg-orange-500 text-white transition-all shadow-md shadow-orange-600/20 whitespace-nowrap flex items-center space-x-1.5 active:scale-95"
            >
              <span>Open Platform Admin Suite</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}

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
                Welcome back, {(linkedInAccount?.display_name || user?.user_metadata?.full_name || 'Creator').split(' ')[0]}!
              </h1>
              <p className="text-orange-100 text-sm sm:text-base max-w-xl">
                Your LinkedIn publishing engine is online. All scheduled posts will automatically publish via our server-side worker.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/create"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-orange-700 hover:bg-orange-50 shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </Link>
              <Link
                to="/schedule"
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
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${linkedInAccount ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {linkedInAccount ? 'Active' : 'Offline'}
              </span>
            </div>

            {linkedInAccount ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  {linkedInAccount.profile_url ? (
                    <img
                      src={linkedInAccount.profile_url}
                      alt={linkedInAccount.display_name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/30 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg flex-shrink-0">
                      {linkedInAccount.display_name?.charAt(0) || user?.email?.charAt(0) || 'L'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {linkedInAccount.display_name || 'Authenticated User'}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">Token Linked</p>
                    <p className="text-[11px] text-green-600 font-semibold flex items-center mt-0.5">
                      <ShieldCheck className="w-3 h-3 mr-1" /> Ready to publish
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col space-y-2">
                  <button
                    onClick={handleSyncLinkedIn}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Refresh & Sync Queue'}</span>
                  </button>

                  <Link
                    to="/accounts"
                    className="block text-center w-full py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                  >
                    Manage Connection
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-gray-600">
                  No LinkedIn account connected yet. Authorize to start publishing directly.
                </p>
                <Link
                  to="/accounts"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#0077b5] hover:bg-[#005f93] shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <LinkIcon className="w-4 h-4 fill-white" />
                  <span>Connect with LinkedIn</span>
                </Link>
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
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSyncLinkedIn}
                  disabled={isSyncing}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 shadow-xs transition-all disabled:opacity-50"
                  title="Sync posts from LinkedIn"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                </button>
                <Link
                  to="/schedule"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <span>View All History</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
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
                  to="/create"
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
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {post.caption}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span>
                          {post.status === 'PUBLISHED'
                            ? 'Published: ' + format(parseISO(post.published_at || post.created_at), 'MMM d, h:mm a')
                            : post.status === 'SCHEDULED'
                            ? 'Scheduled for: ' + format(parseISO(post.scheduled_at || post.created_at), 'MMM d, h:mm a')
                            : 'Drafted: ' + format(parseISO(post.created_at), 'MMM d, h:mm a')}
                        </span>
                        {post.linkedin_post_id && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center text-[10px] font-bold text-[#0077b5] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              LinkedIn Post
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="font-mono text-[11px]">{post.timezone || 'Asia/Karachi'}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 flex items-center space-x-2">
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

                      <button
                        onClick={() => setPostToDelete(post.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete post from dashboard & LinkedIn"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <ConfirmModal
        isOpen={!!postToDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? If it has been published to LinkedIn, it will also be deleted from your live LinkedIn profile."
        confirmText="Delete Post"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onClose={() => setPostToDelete(null)}
      />
    </div>
  );
};
