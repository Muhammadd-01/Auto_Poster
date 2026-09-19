import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  Repeat2, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Zap
} from 'lucide-react';
import { addDays, format } from 'date-fns';

interface EvergreenRecycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post: any;
  userId: string;
}

export const EvergreenRecycleModal: React.FC<EvergreenRecycleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  post,
  userId,
}) => {
  const toast = useToast();
  // Default to 90 days in the future
  const defaultRecycleDate = format(addDays(new Date(), 90), 'yyyy-MM-dd');
  const [scheduledDate, setScheduledDate] = useState(defaultRecycleDate);
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [caption, setCaption] = useState(post?.caption || '');
  const [firstComment, setFirstComment] = useState(post?.first_comment || '');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (post) {
      setCaption(post.caption || '');
      setFirstComment(post.first_comment || '');
    }
  }, [post]);

  if (!isOpen || !post) return null;

  const handleQuickPreset = (days: number) => {
    setScheduledDate(format(addDays(new Date(), days), 'yyyy-MM-dd'));
  };

  const handleRecycleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      toast.warning('Empty Caption', 'Post caption cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      // Insert new scheduled post
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: userId,
            caption: caption.trim(),
            first_comment: firstComment.trim() || null,
            status: 'SCHEDULED',
            scheduled_at: scheduledAt,
            timezone: post.timezone || 'Asia/Karachi'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Duplicate media relationships if original post had media
      if (post.post_media && post.post_media.length > 0 && newPost) {
        const mediaInserts = post.post_media.map((pm: any) => ({
          post_id: newPost.id,
          media_id: pm.media_id || pm.media?.id
        })).filter((item: any) => item.media_id);

        if (mediaInserts.length > 0) {
          await supabase.from('post_media').insert(mediaInserts);
        }
      }

      toast.success(
        'Evergreen Post Re-queued!', 
        `Post scheduled to republish on ${format(new Date(scheduledAt), 'MMM dd, yyyy at p')}.`
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Recycle error:', err);
      toast.error('Recycle Failed', err.message || 'Could not re-queue post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-orange-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30">
              <Repeat2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                1-Click Evergreen Recycler
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Re-queue this proven post to reach new followers 2–3 months later.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRecycleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {/* Quick Preset Buttons */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Recycle Timeframe Presets:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickPreset(90)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 transition-colors"
              >
                +90 Days (Recommended)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(60)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                +60 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset(30)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
              >
                +30 Days
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center space-x-1">
                <CalendarIcon className="w-3.5 h-3.5 text-orange-600" />
                <span>New Date</span>
              </label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Post Caption Preview / Edit */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Post Caption (Edit or keep original)
            </label>
            <textarea
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-gray-50/60 border border-gray-200 rounded-2xl p-3 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* First Comment */}
          {firstComment && (
            <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/70 text-xs">
              <span className="font-bold text-orange-950 flex items-center space-x-1 mb-1">
                <Zap className="w-3.5 h-3.5 text-orange-600" />
                <span>Preserved 1st Comment:</span>
              </span>
              <p className="text-gray-700 text-[11px] truncate">{firstComment}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 rounded-xl shadow-md shadow-orange-600/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Re-queuing...' : 'Confirm & Re-queue Post'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
