import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';

interface Post {
  id: string;
  caption: string;
  status: string;
  scheduled_at: string;
  published_at: string;
  created_at: string;
}

export const Calendar = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setPosts(data);
      setLoading(false);
    };

    fetchPosts();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'SCHEDULED': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Edit2 className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200',
      SCHEDULED: 'bg-brand-100 text-brand-800 border-brand-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return (
      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full border ${styles[status] || styles.DRAFT}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-gray-400 hover:text-brand-600 mr-4 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Content Calendar</h1>
            </div>
            <Link to="/composer" className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 transition-all transform hover:-translate-y-0.5 shadow-sm">
              New Post
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="bg-white shadow-sm border border-brand-100 overflow-hidden sm:rounded-2xl animate-slide-up">
          {loading ? (
            <div className="p-8 text-center text-brand-600 font-medium">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 bg-brand-50/50">
              <CalendarIcon className="w-12 h-12 mx-auto text-brand-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No posts found</p>
              <p className="mt-1">Create your first post to see it here!</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {posts.map((post) => (
                <li key={post.id} className="transition-colors hover:bg-brand-50/30">
                  <div className="px-6 py-5 sm:px-8">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-2xl">
                        {post.caption}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        {getStatusBadge(post.status)}
                      </div>
                    </div>
                    <div className="mt-3 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500 font-medium">
                          {getStatusIcon(post.status)}
                          <span className="ml-2">
                            {post.status === 'PUBLISHED' ? 'Published' : post.status === 'SCHEDULED' ? 'Scheduled for' : 'Created'}: 
                            {' '}
                            <span className="text-gray-900">{format(parseISO(post.published_at || post.scheduled_at || post.created_at), 'PPP p')}</span>
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};
