import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  BadgeCheck
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface ClientReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: any[];
  creatorName: string;
}

export const ClientReviewModal: React.FC<ClientReviewModalProps> = ({
  isOpen,
  onClose,
  posts,
  creatorName,
}) => {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [approvedPosts, setApprovedPosts] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const scheduledPosts = posts.filter(p => p.status === 'SCHEDULED');
  const shareableUrl = `${window.location.origin}/schedule?view=client_review&ref=shareable`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    toast.success('Link Copied!', 'Client review link copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleApproval = (postId: string) => {
    setApprovedPosts(prev => {
      const next = { ...prev, [postId]: !prev[postId] };
      if (next[postId]) {
        toast.success('Post Approved', 'Post marked as client approved.');
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-orange-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">
                Client Review & Approval Portal
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Share a distraction-free editorial feed for {creatorName}'s scheduled posts.
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

        {/* Share Bar */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span className="font-bold text-gray-900">{scheduledPosts.length}</span>
            <span>posts queued for approval</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="flex-1 sm:w-64 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-600 truncate">
              {shareableUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors shadow-2xs flex items-center space-x-1 whitespace-nowrap"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Review Link'}</span>
            </button>
          </div>
        </div>

        {/* Scheduled Posts Feed */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {scheduledPosts.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-xs font-medium space-y-2">
              <Clock className="w-10 h-10 text-orange-300 mx-auto" />
              <p className="text-gray-700 font-bold">No Scheduled Posts Yet</p>
              <p>Schedule posts in Composer or via Bulk Import to generate a client review feed.</p>
            </div>
          ) : (
            scheduledPosts.map((post, index) => {
              const isApproved = approvedPosts[post.id];
              return (
                <div 
                  key={post.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isApproved 
                      ? 'bg-green-50/40 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-orange-800">
                        Draft #{index + 1}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-orange-500" />
                        <span>Scheduled: {format(parseISO(post.scheduled_at || post.created_at), 'PPP p')}</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleApproval(post.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        isApproved
                          ? 'bg-green-600 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isApproved ? 'Approved by Client' : 'Mark as Approved'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-sans">
                    {post.caption}
                  </p>

                  {post.first_comment && (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-orange-800">
                      <strong>Scheduled 1st Comment:</strong> {post.first_comment}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center space-x-1.5">
            <BadgeCheck className="w-4 h-4 text-blue-600" />
            <span>Ready for agency workflow & client sign-offs.</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-gray-700 hover:bg-gray-200 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
