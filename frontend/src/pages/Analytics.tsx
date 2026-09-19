import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Eye, 
  Sparkles, 
  Plus,
  RefreshCw,
  Repeat2,
  PieChart
} from 'lucide-react';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { EvergreenRecycleModal } from '../components/EvergreenRecycleModal';

export const Analytics = () => {
  const { user, linkedInAccount } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [postToRecycle, setPostToRecycle] = useState<any | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*, post_media(media(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.warn('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  // Filter posts based on selected timeRange
  const filteredPosts = useMemo(() => {
    if (timeRange === 'all') return posts;
    const days = timeRange === '7d' ? 7 : 30;
    const cutoffDate = subDays(new Date(), days);
    return posts.filter(p => {
      const postDate = parseISO(p.published_at || p.scheduled_at || p.created_at);
      return isAfter(postDate, cutoffDate);
    });
  }, [posts, timeRange]);

  // Calculations
  const totalPublished = filteredPosts.filter(p => p.status === 'PUBLISHED').length;
  const totalScheduled = filteredPosts.filter(p => p.status === 'SCHEDULED').length;
  const totalDrafts = filteredPosts.filter(p => p.status === 'DRAFT').length;
  const totalFailed = filteredPosts.filter(p => p.status === 'FAILED').length;

  const totalAttempted = totalPublished + totalFailed;
  const successRate = totalAttempted > 0 ? Math.round((totalPublished / totalAttempted) * 100) : 100;

  // Algorithm Optimization metric: Posts that have first comment or hook < 210 chars
  const algorithmOptimizedCount = filteredPosts.filter(
    p => (p.first_comment && p.first_comment.trim()) || p.caption.length <= 220
  ).length;
  const optimizationScore = filteredPosts.length > 0 
    ? Math.round((algorithmOptimizedCount / filteredPosts.length) * 100) 
    : 100;

  // Estimated impressions / reach multiplier based on active posting cadence
  const estimatedReach = useMemo(() => {
    // Top creators on LinkedIn average ~600 - 1500 impressions per published post with good formatting
    const baseImpressionsPerPost = 850;
    const mediaBonus = 1.3;
    let total = 0;
    filteredPosts.filter(p => p.status === 'PUBLISHED').forEach(p => {
      const hasMedia = p.post_media && p.post_media.length > 0;
      const hasFirstComment = Boolean(p.first_comment);
      let multiplier = 1;
      if (hasMedia) multiplier *= mediaBonus;
      if (hasFirstComment) multiplier *= 1.25; // Algorithm bonus for avoiding links in caption
      total += Math.round(baseImpressionsPerPost * multiplier);
    });
    return total;
  }, [filteredPosts]);

  // Day-of-week distribution (Mon - Sun)
  const dayDistribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // 0: Sun, 1: Mon, ... 6: Sat
    filteredPosts.forEach(p => {
      const date = parseISO(p.published_at || p.scheduled_at || p.created_at);
      const day = date.getDay();
      counts[day]++;
    });
    // Reorder Mon (1) to Sun (0)
    return [
      { name: 'Mon', count: counts[1] },
      { name: 'Tue', count: counts[2] },
      { name: 'Wed', count: counts[3] },
      { name: 'Thu', count: counts[4] },
      { name: 'Fri', count: counts[5] },
      { name: 'Sat', count: counts[6] },
      { name: 'Sun', count: counts[0] },
    ];
  }, [filteredPosts]);

  const maxDayCount = Math.max(...dayDistribution.map(d => d.count), 1);

  // Content type breakdown
  const formatStats = useMemo(() => {
    let withMedia = 0;
    let textOnly = 0;
    let withFirstComment = 0;

    filteredPosts.forEach(p => {
      const hasMedia = p.post_media && p.post_media.length > 0;
      if (hasMedia) withMedia++;
      else textOnly++;
      if (p.first_comment) withFirstComment++;
    });

    return { withMedia, textOnly, withFirstComment };
  }, [filteredPosts]);

  // Content Pillar distribution (Target: 40% Edu, 30% Story, 20% Proof, 10% Promo)
  const pillarStats = useMemo(() => {
    let educational = 0;
    let story = 0;
    let proof = 0;
    let promo = 0;

    filteredPosts.forEach(p => {
      const tags = p.tags || [];
      const tagStr = (Array.isArray(tags) ? tags.join(' ') : String(tags)).toLowerCase();
      const caption = p.caption?.toLowerCase() || '';

      if (tagStr.includes('story') || caption.includes('years ago') || caption.includes('mistake') || caption.includes('journey')) {
        story++;
      } else if (tagStr.includes('proof') || caption.includes('results') || caption.includes('case study') || caption.includes('metric')) {
        proof++;
      } else if (tagStr.includes('promo') || caption.includes('launch') || caption.includes('offer') || caption.includes('hiring')) {
        promo++;
      } else {
        educational++;
      }
    });

    const total = filteredPosts.length || 1;
    return [
      { name: '📚 Educational', count: educational, percent: Math.round((educational / total) * 100), target: 40, color: 'bg-orange-500' },
      { name: '💡 Story & Lessons', count: story, percent: Math.round((story / total) * 100), target: 30, color: 'bg-amber-500' },
      { name: '🏆 Proof & Results', count: proof, percent: Math.round((proof / total) * 100), target: 20, color: 'bg-blue-600' },
      { name: '🚀 Promo & Launch', count: promo, percent: Math.round((promo / total) * 100), target: 10, color: 'bg-purple-600' },
    ];
  }, [filteredPosts]);

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 pb-16">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-orange-600" />
              <span>Real-Time Performance Dashboard</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Creator Analytics & Insights
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Live engagement projections, consistency cadences, and content health scores.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Timeframe Filter Tabs */}
            <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center shadow-2xs">
              {(['7d', '30d', 'all'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTimeRange(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    timeRange === tab
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {tab === '7d' ? 'Last 7 Days' : tab === '30d' ? 'Last 30 Days' : 'All Time'}
                </button>
              ))}
            </div>

            <button
              onClick={fetchPosts}
              disabled={loading}
              title="Refresh Analytics"
              className="p-2.5 bg-white hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-xl border border-gray-200 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Published */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-lg shadow-orange-950/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Published Posts
              </span>
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-gray-900">{totalPublished}</span>
              <span className="text-xs font-semibold text-green-600">Active on Feed</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Successfully published via API</p>
          </div>

          {/* Scheduled in Queue */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-lg shadow-orange-950/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Queued in Pipeline
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-gray-900">{totalScheduled}</span>
              <span className="text-xs font-semibold text-amber-600">Upcoming</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">{totalDrafts} saved in drafts</p>
          </div>

          {/* Estimated Reach */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-lg shadow-orange-950/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Est. Total Impressions
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-gray-900">
                {estimatedReach > 0 ? estimatedReach.toLocaleString() : '—'}
              </span>
              <span className="text-xs font-semibold text-blue-600">Projected Reach</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Based on content formats & hooks</p>
          </div>

          {/* Algorithm Score */}
          <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-lg shadow-orange-950/5 relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Algorithm Health
              </span>
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-gray-900">{optimizationScore}%</span>
              <span className="text-xs font-semibold text-orange-600">Optimal</span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Hook length & 1st comment score</p>
          </div>

        </div>

        {/* 2-Column Section: Publishing Activity Heatmap + Content Pillar Health */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Day of Week Consistency Chart (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Publishing Cadence by Day of Week
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visual consistency distribution across your publishing schedule
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                Weekly Cadence
              </span>
            </div>

            {/* Custom Bar Graph */}
            <div className="pt-4 flex items-end justify-between gap-3 h-48 sm:h-56 px-2">
              {dayDistribution.map(item => {
                const heightPercent = Math.max(Math.round((item.count / maxDayCount) * 100), 8);
                const hasPosts = item.count > 0;
                return (
                  <div key={item.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-[11px] font-bold text-gray-700">
                      {item.count > 0 ? item.count : ''}
                    </span>
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-2xl transition-all ${
                        hasPosts 
                          ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-sm shadow-orange-500/20' 
                          : 'bg-gray-100'
                      }`}
                    />
                    <span className={`text-xs font-bold ${hasPosts ? 'text-gray-900' : 'text-gray-400'}`}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span>Publishing consistently 3–4 days/week boosts LinkedIn algorithmic reach by 3x.</span>
              </span>
              <span className="font-bold text-gray-900">{successRate}% Delivery Rate</span>
            </div>
          </div>

          {/* Content Format Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Content Strategy Breakdown
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Distribution of post types and algorithmic enhancements
              </p>
            </div>

            <div className="space-y-4 pt-2">
              
              {/* Media Posts */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 flex items-center space-x-1.5">
                    <span>🖼️ Rich Media Posts (Images / Videos)</span>
                  </span>
                  <span className="text-gray-900 font-bold">
                    {formatStats.withMedia} ({filteredPosts.length ? Math.round((formatStats.withMedia / filteredPosts.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${filteredPosts.length ? (formatStats.withMedia / filteredPosts.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Text Only */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 flex items-center space-x-1.5">
                    <span>📝 Plain Text / Micro-essays</span>
                  </span>
                  <span className="text-gray-900 font-bold">
                    {formatStats.textOnly} ({filteredPosts.length ? Math.round((formatStats.textOnly / filteredPosts.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${filteredPosts.length ? (formatStats.textOnly / filteredPosts.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* First Comment Strategy */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-gray-700 flex items-center space-x-1.5">
                    <span>⚡ First Comment Algorithm Hack</span>
                  </span>
                  <span className="text-gray-900 font-bold">
                    {formatStats.withFirstComment} ({filteredPosts.length ? Math.round((formatStats.withFirstComment / filteredPosts.length) * 100) : 0}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${filteredPosts.length ? (formatStats.withFirstComment / filteredPosts.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Content Pillar Balance Card */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                  <PieChart className="w-3.5 h-3.5 text-orange-600" />
                  <span>Content Pillar Balance</span>
                </span>
                <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-full">
                  Target vs Actual
                </span>
              </div>

              <div className="space-y-2.5">
                {pillarStats.map(pillar => (
                  <div key={pillar.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-700 font-medium">{pillar.name}</span>
                      <span className="text-gray-500">
                        <strong className="text-gray-900 font-bold">{pillar.percent}%</strong> (Target: {pillar.target}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${pillar.color} rounded-full transition-all`}
                        style={{ width: `${Math.min(pillar.percent, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LinkedIn Creator Profile Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 flex items-center space-x-3.5">
              {linkedInAccount?.profile_url ? (
                <img
                  src={linkedInAccount.profile_url}
                  alt={linkedInAccount.display_name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center">
                  {linkedInAccount?.display_name?.[0] || 'C'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-bold text-gray-900 truncate">
                    {linkedInAccount?.display_name || 'Creator Profile'}
                  </h4>
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.2 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate">
                  {linkedInAccount ? 'Official LinkedIn API Connected' : 'Connect LinkedIn in Accounts'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Detailed Posts Performance Table */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-950/5 overflow-hidden">
          <div className="p-6 sm:px-8 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Recent Posts History & Optimization
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Overview of recent posts, hook fold status, and publish performance
              </p>
            </div>
            <Link
              to="/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Post</span>
            </Link>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-12 h-12 text-orange-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-800">No Posts in This Period</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Schedule your first post to see real-time performance and consistency analytics.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600"
              >
                <span>Schedule a Post</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                    <th className="py-3 px-6">Post Snippet & Hook</th>
                    <th className="py-3 px-6">Format</th>
                    <th className="py-3 px-6">1st Comment</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredPosts.slice(0, 15).map(post => {
                    const isHookOptimal = post.caption.length <= 220;
                    return (
                      <tr key={post.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-4 px-6 max-w-md">
                          <p className="font-medium text-gray-900 line-clamp-2">
                            {post.caption}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] text-gray-400 font-mono">
                              {post.caption.length} chars
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isHookOptimal ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isHookOptimal ? 'Hook Visible' : 'Fold Triggered'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          {post.post_media && post.post_media.length > 0 ? (
                            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/60">
                              🖼️ Media Post
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                              📝 Text Update
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          {post.first_comment ? (
                            <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60">
                              <Zap className="w-3 h-3 text-orange-600" />
                              <span>Queued</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[11px]">None</span>
                          )}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            post.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : post.status === 'SCHEDULED'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {post.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-gray-500 font-medium">
                          {format(parseISO(post.published_at || post.scheduled_at || post.created_at), 'MMM dd, yyyy')}
                        </td>

                        <td className="py-4 px-6 whitespace-nowrap text-right">
                          {post.status === 'PUBLISHED' ? (
                            <button
                              type="button"
                              onClick={() => setPostToRecycle(post)}
                              title="Recycle Evergreen Post (+90 days)"
                              className="px-2.5 py-1 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-xl transition-all inline-flex items-center space-x-1"
                            >
                              <Repeat2 className="w-3 h-3 text-orange-600" />
                              <span>Recycle</span>
                            </button>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </main>

      <EvergreenRecycleModal
        isOpen={postToRecycle !== null}
        onClose={() => setPostToRecycle(null)}
        onSuccess={fetchPosts}
        post={postToRecycle}
        userId={user?.id || ''}
      />
    </div>
  );
};
