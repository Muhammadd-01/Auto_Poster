import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ConfirmModal } from '../components/ConfirmModal';
import { BulkImportModal } from '../components/BulkImportModal';
import { EvergreenRecycleModal } from '../components/EvergreenRecycleModal';
import { ClientReviewModal } from '../components/ClientReviewModal';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Search, 
  Plus, 
  Calendar as CalendarIcon,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Repeat2,
  Share2
} from 'lucide-react';

export const Calendar = () => {
  const { user, linkedInAccount } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [postToRecycle, setPostToRecycle] = useState<any | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    if (!user) {
      setLoading(false);
      return;
    }


    try {
      const { data } = await supabase
        .from('posts')
        .select('*, post_media(media(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
    } catch (err) {
      console.warn('Error fetching calendar posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleSyncLinkedIn = async () => {
    if (!user?.id) {
      toast.warning('Authentication Required', 'Please log in to sync with LinkedIn.');
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
      fetchPosts();
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
          toast.success('Deleted From LinkedIn & Database', 'Post removed from both your live LinkedIn feed and dashboard.');
        } else {
          toast.success('Post Deleted', 'Post removed from your schedule.');
        }
      } catch {
        await supabase.from('posts').delete().eq('id', postId);
        toast.info('Post Deleted', 'Removed from database.');
      }
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Delete Failed', err.message || 'Could not delete post.');
    } finally {
      setPostToDelete(null);
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesFilter = filter === 'ALL' || post.status === filter;
    const matchesSearch = !searchQuery || post.caption.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Publishing Schedule & History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track, search, and manage your automated LinkedIn content pipeline.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-white hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 shadow-xs transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-orange-600" />
              <span>Client Review</span>
            </button>

            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600" />
              <span>Bulk Import (CSV)</span>
            </button>

            <button
              onClick={handleSyncLinkedIn}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl font-bold text-xs text-gray-700 bg-white hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 shadow-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-500' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync LinkedIn'}</span>
            </button>

            <Link
              to="/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Post</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {['ALL', 'SCHEDULED', 'PUBLISHED', 'DRAFT', 'FAILED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === tab
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-orange-50/60 text-gray-600 hover:bg-orange-100 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by caption..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

        </div>

        {/* List of Posts */}
        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-gray-400">Loading schedule...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-orange-100 p-8 space-y-3">
            <CalendarIcon className="w-12 h-12 mx-auto text-orange-300" />
            <h3 className="text-base font-bold text-gray-900">No posts found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery ? 'No posts match your search criteria.' : 'You have no posts in this category.'}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Post</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const statusStyles: Record<string, { badge: string; icon: any; color: string }> = {
                PUBLISHED: {
                  badge: 'bg-green-100 text-green-800 border-green-200',
                  icon: CheckCircle2,
                  color: 'text-green-600',
                },
                SCHEDULED: {
                  badge: 'bg-amber-100 text-amber-800 border-amber-200',
                  icon: Clock,
                  color: 'text-amber-600',
                },
                PROCESSING: {
                  badge: 'bg-blue-100 text-blue-800 border-blue-200',
                  icon: Clock,
                  color: 'text-blue-600',
                },
                FAILED: {
                  badge: 'bg-red-100 text-red-800 border-red-200',
                  icon: AlertCircle,
                  color: 'text-red-600',
                },
                DRAFT: {
                  badge: 'bg-gray-100 text-gray-800 border-gray-200',
                  icon: FileText,
                  color: 'text-gray-600',
                },
              };

              const current = statusStyles[post.status] || statusStyles.DRAFT;
              const Icon = current.icon;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-orange-100/80 shadow-md shadow-orange-950/5 hover:shadow-lg transition-all flex flex-col sm:flex-row items-start justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${current.badge}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {post.status}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-semibold text-gray-500">
                        {post.status === 'PUBLISHED'
                          ? `Published: ${format(parseISO(post.published_at || post.created_at), 'PPP p')}`
                          : post.status === 'SCHEDULED'
                          ? `Scheduled: ${format(parseISO(post.scheduled_at || post.created_at), 'PPP p')}`
                          : `Created: ${format(parseISO(post.created_at), 'PPP p')}`}
                      </span>
                    </div>

                    <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {post.caption}
                    </p>

                    {post.first_comment && (
                      <div className="mt-2 text-xs text-orange-800 bg-orange-50/90 px-3 py-1.5 rounded-xl border border-orange-200/70 inline-flex items-center space-x-1.5 max-w-full">
                        <span className="font-bold flex-shrink-0">💬 1st Comment:</span>
                        <span className="truncate">{post.first_comment}</span>
                      </div>
                    )}

                    {post.preview_url && (
                      <div className="mt-2 inline-block rounded-xl overflow-hidden border border-gray-200 max-w-xs">
                        <img src={post.preview_url} alt="Attached Media" className="max-h-36 object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                    {post.status === 'PUBLISHED' && (
                      <button
                        type="button"
                        onClick={() => setPostToRecycle(post)}
                        title="Recycle Evergreen Post (+90 days)"
                        className="px-2.5 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 rounded-xl transition-all flex items-center space-x-1"
                      >
                        <Repeat2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>Recycle</span>
                      </button>
                    )}

                    <button
                      onClick={() => setPostToDelete(post.id)}
                      title="Delete / Cancel Post"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
      
      <ConfirmModal
        isOpen={postToDelete !== null}
        title="Cancel Post"
        message="Are you sure you want to cancel and remove this post?"
        confirmText="Yes, Cancel Post"
        onClose={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
      />

      <BulkImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={fetchPosts}
        userId={user?.id || ''}
      />

      <EvergreenRecycleModal
        isOpen={postToRecycle !== null}
        onClose={() => setPostToRecycle(null)}
        onSuccess={fetchPosts}
        post={postToRecycle}
        userId={user?.id || ''}
      />

      <ClientReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        posts={posts}
        creatorName={linkedInAccount?.display_name || user?.user_metadata?.full_name || 'Creator'}
      />
    </div>
  );
};
