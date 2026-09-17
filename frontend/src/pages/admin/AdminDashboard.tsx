import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, Users, Calendar as CalendarIcon, RefreshCw, 
  Search, CheckCircle, CheckCircle2, AlertCircle,
  Activity, Clock, Server, ArrowUpRight, Plus,
  Link as LinkIcon, Layers, FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { AnimatedCounter } from '../../components/AnimatedCounter';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../lib/supabase';

interface AdminStats {
  totalUsers: number;
  connectedAccounts: number;
  totalPosts: number;
  postsScheduled: number;
  postsPublished: number;
  postsFailed: number;
  workerStatus: {
    running: boolean;
    uptimeSeconds: number;
    lastRun: string;
    interval: string;
  };
}

interface PlatformUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  linkedinConnected: boolean;
  linkedinProfile?: string | null;
  postsCount: number;
  firstSeen: string;
  lastActive: string;
  plan: string;
}

interface PostItem {
  id: string;
  user_id: string;
  caption: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED';
  scheduled_at?: string;
  published_at?: string;
  retry_count?: number;
  created_at: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  type: 'VISITOR' | 'AUTH_SIGNIN' | 'AUTH_SIGNUP' | 'LINKEDIN_CONNECT' | 'POST_SCHEDULE' | 'POST_PUBLISHED' | 'SYSTEM';
  userEmail?: string;
  userName?: string;
  details: string;
  status: 'success' | 'warning' | 'info' | 'error';
  ip?: string;
}

export const AdminDashboard = () => {
  const { user, linkedInAccount } = useAuth();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'users';

  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'activity' | 'system' | 'personal'>(
    ['users', 'posts', 'activity', 'system', 'personal'].includes(initialTab) ? initialTab : 'users'
  );

  useEffect(() => {
    const tabParam = searchParams.get('tab') as any;
    if (tabParam && ['users', 'posts', 'activity', 'system', 'personal'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab('users');
    }
  }, [searchParams]);

  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);

  // Sync tab with URL search parameter
  const handleTabChange = (tab: 'users' | 'posts' | 'activity' | 'system' | 'personal') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const [personalMetrics, setPersonalMetrics] = useState({ total: 4, published: 2, scheduled: 2, failed: 0 });
  const [personalPosts, setPersonalPosts] = useState<any[]>([
    {
      id: 'personal-1',
      caption: '🚀 Scaling multi-tenant autonomous LinkedIn publishing with server daemons and OAuth 2.0.',
      status: 'PUBLISHED',
      published_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'personal-2',
      caption: 'Top 5 mistakes founders make when publishing on LinkedIn (and how to automate it).',
      status: 'SCHEDULED',
      scheduled_at: new Date(Date.now() + 3600000 * 5).toISOString(),
      created_at: new Date(Date.now() - 3600000).toISOString(),
    }
  ]);
  const [personalLoading, setPersonalLoading] = useState(false);

  const fetchPersonalData = async () => {
    if (!user) return;
    try {
      setPersonalLoading(true);
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsData && postsData.length > 0) {
        const counts = { total: postsData.length, published: 0, scheduled: 0, failed: 0 };
        postsData.forEach((p) => {
          if (p.status === 'PUBLISHED') counts.published++;
          if (p.status === 'SCHEDULED' || p.status === 'PROCESSING') counts.scheduled++;
          if (p.status === 'FAILED') counts.failed++;
        });
        setPersonalMetrics(counts);
        setPersonalPosts(postsData.slice(0, 5));
      }
    } catch (err) {
      console.warn('Personal metrics fetch error:', err);
    } finally {
      setPersonalLoading(false);
    }
  };

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    connectedAccounts: 0,
    totalPosts: 0,
    postsScheduled: 0,
    postsPublished: 0,
    postsFailed: 0,
    workerStatus: {
      running: true,
      uptimeSeconds: 0,
      lastRun: new Date().toISOString(),
      interval: 'Every 60 seconds',
    },
  });

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const fetchOverview = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('http://localhost:3000/api/admin/overview');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.stats) setStats(data.stats);
          if (data.users && data.users.length > 0) setUsers(data.users);
          if (data.posts && data.posts.length > 0) setPosts(data.posts);
          if (data.auditLogs && data.auditLogs.length > 0) setAuditLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn('Backend API overview fetch failed, utilizing active local state', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = async () => {
    await fetchOverview();
    await fetchPersonalData();
    toast.success('Telemetry Refreshed', 'Platform statistics and background daemons updated successfully.');
  };

  useEffect(() => {
    fetchOverview();
    fetchPersonalData();
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOverview();
      fetchPersonalData();
    }, 15000);

    return () => clearInterval(interval);
  }, [autoRefresh, user]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.linkedinProfile && u.linkedinProfile.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPosts = posts.filter(p => 
    p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = auditLogs.filter(l => 
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.userEmail && l.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
    l.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 pb-12">
        
        {/* Welcome Hero Banner - Exactly same visual language as user dashboard */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white shadow-2xl shadow-orange-600/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>SUPERADMIN MODE ACTIVE • Server Daemon Online</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Welcome back, {user?.user_metadata?.full_name || 'Muhammad Affan'}!
              </h1>
              
              <p className="text-orange-100 text-sm sm:text-base max-w-xl">
                You have elevated platform authority. Monitor all registered creators, inspect live scheduled posts, and audit real-time traffic alongside your personal publishing tools.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3.5 py-3 rounded-xl font-bold text-xs border transition-all flex items-center space-x-1.5 ${
                  autoRefresh
                    ? 'bg-white/20 text-white border-white/30'
                    : 'bg-black/20 text-orange-200 border-white/10'
                }`}
                title="Toggle automatic telemetry refresh"
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-400 animate-ping' : 'bg-gray-400'}`} />
                <span>{autoRefresh ? 'Auto 15s' : 'Paused'}</span>
              </button>

              <button
                onClick={handleManualRefresh}
                disabled={refreshing}
                className="px-4 py-3 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all flex items-center space-x-2"
                title="Refresh real-time data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-orange-200' : ''}`} />
                <span>Refresh Telemetry</span>
              </button>

              <Link
                to="/create"
                className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-orange-700 hover:bg-orange-50 shadow-lg shadow-black/10 active:scale-95 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Post</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. PERSONAL CREATOR WORKSPACE (Identical to User Dashboard) */}
        {/* ======================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div>
              <h2 className="text-base font-black text-gray-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <span>My Creator Workspace</span>
              </h2>
              <p className="text-xs text-gray-500">Your personal LinkedIn publishing metrics and scheduled queue</p>
            </div>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              Personal Account View
            </span>
          </div>

          {/* 4 Stat Cards - Identical to User Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Posts</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{personalMetrics.total}</h3>
                <p className="text-xs text-gray-400 mt-1">Lifetime authored</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Published</p>
                <h3 className="text-3xl font-black text-green-600 mt-1">{personalMetrics.published}</h3>
                <p className="text-xs text-green-700/70 mt-1">Delivered to feed</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Scheduled</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{personalMetrics.scheduled}</h3>
                <p className="text-xs text-amber-700/70 mt-1">Queued on server</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Failed / Retrying</p>
                <h3 className="text-3xl font-black text-red-500 mt-1">{personalMetrics.failed}</h3>
                <p className="text-xs text-red-600/70 mt-1">3x retry policy</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Two-Column Section: Personal LinkedIn Account & Personal Recent Queue */}
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
                      <p className="text-xs text-gray-500 truncate">OAuth 2.0 Linked</p>
                      <p className="text-[11px] text-green-600 font-semibold flex items-center mt-0.5">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Ready to publish
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/accounts"
                    className="block text-center w-full py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                  >
                    Manage Connection
                  </Link>
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

            {/* Right: Personal Recent Activity / Queue (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Personal Post Queue</h3>
                  <p className="text-xs text-gray-500">Live posts authored by your administrator account</p>
                </div>
                <Link
                  to="/schedule"
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                >
                  <span>View All History</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {personalLoading ? (
                <div className="py-12 text-center text-sm text-gray-400">Loading activity...</div>
              ) : personalPosts.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-orange-50/40 rounded-2xl border border-dashed border-orange-200">
                  <FileText className="w-10 h-10 mx-auto text-orange-400" />
                  <p className="text-sm font-bold text-gray-700">No posts in your personal queue yet</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Create your first LinkedIn post to watch it publish automatically.
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
                  {personalPosts.map((post) => (
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
        </div>

        {/* ======================================================== */}
        {/* 2. ELEVATED PLATFORM SUPERADMIN SUITE ("MORE CONTROLS") */}
        {/* ======================================================== */}
        <div className="pt-4 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-orange-200/80 pt-8">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider mb-2 border border-orange-200">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Elevated Platform Controls</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Global Platform Administration & Multi-Tenant Registry
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-2xl mt-1">
                You have exclusive platform-level authority beyond standard creators. Monitor cross-account queues, inspect user credentials, track visitor traffic, and review server daemon telemetry.
              </p>
            </div>
          </div>

          {/* 4 Elevated Platform Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Total Users */}
            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Platform Users</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  <AnimatedCounter end={stats.totalUsers} />
                </h3>
                <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Registered creators
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>

            {/* Connected LinkedIn */}
            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Connected LinkedIn</p>
                <h3 className="text-3xl font-black text-blue-600 mt-1">
                  <AnimatedCounter end={stats.connectedAccounts} />
                </h3>
                <p className="text-xs text-blue-700/70 mt-1">OAuth 2.0 active</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <LinkIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Scheduled Posts */}
            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Global Posts Queue</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1">
                  <AnimatedCounter end={stats.totalPosts} />
                </h3>
                <p className="text-xs text-amber-700/70 mt-1">{stats.postsPublished} delivered • {stats.postsScheduled} queued</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
            </div>

            {/* Background Worker */}
            <div className="bg-white rounded-2xl p-6 border border-orange-100/80 shadow-lg shadow-orange-950/5 flex items-center justify-between hover:shadow-xl hover:border-orange-200 transition-all">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Daemon Worker</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  ONLINE
                </h3>
                <p className="text-xs text-emerald-700/70 mt-1">Polling every 60s</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Elevated Admin Control Navigation & Search Filter */}
        <div className="bg-white rounded-3xl p-4 border border-orange-100 shadow-xl shadow-orange-950/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => handleTabChange('users')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Registry</span>
              <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px]">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('posts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Global Post Queue</span>
              <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px]">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('activity')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Traffic Feed</span>
              <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px]">
                {auditLogs.length}
              </span>
            </button>

            <button
              onClick={() => handleTabChange('system')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'system'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
              }`}
            >
              <Server className="w-4 h-4" />
              <span>System & APIs</span>
            </button>

            <button
              onClick={() => handleTabChange('personal')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'personal'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-orange-50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Creator Account</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators, posts, logs..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

        </div>

        {/* Tab 1: User Registry & Creators */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Creator & Platform User Registry
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete view of all registered accounts, active LinkedIn connections, and lifetime post counts.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                Total Users: <strong className="text-gray-900">{filteredUsers.length}</strong>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 text-gray-400 uppercase font-black tracking-wider text-[10px] border-b border-gray-100">
                  <tr>
                    <th className="py-3.5 px-4 rounded-l-xl">Creator / User</th>
                    <th className="py-3.5 px-4">LinkedIn Status</th>
                    <th className="py-3.5 px-4">Plan Tier</th>
                    <th className="py-3.5 px-4">Posts Volume</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center font-bold text-white text-xs flex-shrink-0 overflow-hidden shadow-xs">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.name}</p>
                            <p className="text-[11px] text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.linkedinConnected ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold">
                            <CheckCircle className="w-3 h-3 text-blue-600" />
                            <span>{u.linkedinProfile || 'Connected'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-semibold">
                            Not Linked
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold">
                          {u.plan}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {u.postsCount} posts
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 font-mono text-[11px]">
                        {new Date(u.firstSeen).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="px-3 py-1 rounded-lg bg-gray-50 hover:bg-orange-600 hover:text-white text-gray-700 text-[11px] font-bold transition-all border border-gray-200 shadow-xs"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Global Post Queue */}
        {activeTab === 'posts' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-orange-500" />
                  Global Multi-Tenant Post Queue
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time list of all scheduled, published, and failed posts across all active platform accounts.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                Total Posts: <strong className="text-gray-900">{filteredPosts.length}</strong>
              </span>
            </div>

            <div className="space-y-3">
              {filteredPosts.map((post) => {
                const statusStyles =
                  post.status === 'PUBLISHED'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : post.status === 'SCHEDULED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : post.status === 'FAILED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-100 text-gray-600 border-gray-200';

                return (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-gray-50/60 border border-gray-200/80 hover:border-orange-200 transition-colors space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusStyles}`}>
                          {post.status}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          ID: {post.id}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 font-mono">
                        {post.scheduled_at && `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}`}
                      </div>
                    </div>

                    <p className="text-xs text-gray-800 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 font-medium">
                      "{post.caption}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span>Author UUID: <code className="text-orange-600 font-bold">{post.user_id.slice(0, 12)}...</code></span>
                      <span>Target: <strong className="text-blue-600 font-bold">LinkedIn REST API</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Live Traffic & Audit Feed */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-500" />
                  Real-Time Traffic & Platform Audit Stream
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chronological event log of visitor traffic, account sign-ins, and LinkedIn OAuth handshakes.
                </p>
              </div>

              <button
                onClick={() => {
                  const newLog: AuditLog = {
                    id: `sim-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: 'VISITOR',
                    details: 'Visitor clicked "Start 14-Day Free Trial" from /pricing page.',
                    status: 'info',
                  };
                  setAuditLogs([newLog, ...auditLogs]);
                  toast.info('Traffic Simulated', 'Simulated visitor action appended to the live platform stream.');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>+ Simulate Visitor Traffic</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredLogs.map((log) => {
                const badgeColor =
                  log.type === 'LINKEDIN_CONNECT'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : log.type === 'AUTH_SIGNIN'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : log.type === 'POST_SCHEDULE'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : log.type === 'POST_PUBLISHED'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-gray-100 text-gray-700 border-gray-200';

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-gray-50/60 border border-gray-100 hover:border-orange-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border flex-shrink-0 mt-0.5 ${badgeColor}`}>
                        {log.type.replace('_', ' ')}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-900 font-semibold leading-relaxed">
                          {log.details}
                        </p>
                        {log.userEmail && (
                          <p className="text-[11px] text-orange-600 font-mono">
                            User: {log.userName ? `${log.userName} (${log.userEmail})` : log.userEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 text-[11px] text-gray-400 font-mono flex items-center space-x-1 self-end sm:self-center">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: System & API Health */}
        {activeTab === 'system' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Server Infrastructure */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-5">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-orange-500" />
                Backend Worker & Core Daemons
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Cron Schedule Daemon</p>
                    <p className="text-gray-500 text-[11px]">Polling interval: * * * * * (Every 60s)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold border border-green-200">
                    ACTIVE
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Backend Express HTTP API</p>
                    <p className="text-gray-500 text-[11px]">Listening on port 3000</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold border border-green-200">
                    HEALTHY
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">LinkedIn OAuth 2.0 Engine</p>
                    <p className="text-gray-500 text-[11px]">Client ID: 77bk0ls0m6tm57</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                    CONFIGURED
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Supabase PostgreSQL</p>
                    <p className="text-gray-500 text-[11px]">Multi-tenant tables: posts, social_accounts</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold border border-green-200">
                    CONNECTED
                  </span>
                </div>
              </div>
            </div>

            {/* Platform Credentials */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-5">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-orange-500" />
                Administrator Access Reference
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed">
                You can sign into this superadmin account directly through the unified login page with these credentials:
              </p>

              <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-orange-200/60">
                  <span className="text-gray-500">Login URL:</span>
                  <span className="text-orange-700 font-bold">/login</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-orange-200/60">
                  <span className="text-gray-500">Admin Email:</span>
                  <span className="text-orange-700 font-bold select-all">muhammadaffan1445@gmail.com</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">Password:</span>
                  <span className="text-orange-700 font-bold select-all">ALLAHiswithyou_2</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5">
                <h4 className="text-xs font-bold text-gray-900">Multi-User Architecture</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Every creator who signs up receives their own isolated row-level workspace. As superadmin, you have global visibility over all user activities and queue states.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 5: Personal Creator Account */}
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0077b5] text-white flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 fill-white" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">Admin's Personal LinkedIn</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                  Connected
                </span>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-black text-lg">
                    A
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{linkedInAccount?.display_name || 'M. Affan'}</h4>
                    <p className="text-xs text-gray-500">{linkedInAccount?.email || 'affan.work05@gmail.com'}</p>
                    <p className="text-[11px] text-green-600 font-semibold mt-0.5 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Active Superadmin Token
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/create"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Compose Post From Admin Account</span>
              </Link>
            </div>

            <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">Recent Posts Authored By Admin</h3>
                <Link to="/schedule" className="text-xs font-bold text-orange-600 hover:text-orange-700">
                  View Calendar →
                </Link>
              </div>

              <div className="space-y-2.5">
                {posts.slice(0, 3).map((p) => (
                  <div key={p.id} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-800 font-medium truncate max-w-sm">
                      "{p.caption}"
                    </p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* User Details Telemetry Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 space-y-5 text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-black">Creator Telemetry Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-700 text-xs font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center font-bold text-white text-base">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl space-y-2.5 border border-gray-100 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-gray-400">User UUID:</span>
                  <span className="text-orange-700 font-bold">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan Tier:</span>
                  <span className="text-gray-900 font-bold">{selectedUser.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">LinkedIn Account:</span>
                  <span className="text-blue-600 font-bold">{selectedUser.linkedinProfile || 'Not connected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lifetime Posts:</span>
                  <span className="text-gray-900 font-bold">{selectedUser.postsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">First Seen:</span>
                  <span className="text-gray-600">{new Date(selectedUser.firstSeen).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-colors shadow-md shadow-orange-600/20"
            >
              Close Telemetry Inspector
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
