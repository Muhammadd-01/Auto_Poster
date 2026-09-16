import React from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send as SendIcon, 
  Globe, 
  MoreHorizontal, 
  Link as LinkIcon,
  Heart,
  Sparkles
} from 'lucide-react';

interface LinkedInPreviewProps {
  caption: string;
  previewUrl: string | null;
  fileType: string | null;
  authorName?: string;
  authorHeadline?: string;
  authorAvatar?: string;
}

export const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({
  caption,
  previewUrl,
  fileType,
  authorName = 'Your Profile',
  authorHeadline = 'LinkedIn Content Creator',
  authorAvatar = '',
}) => {
  // Format caption with highlighted hashtags
  const formatCaption = (text: string) => {
    if (!text) {
      return (
        <span className="text-gray-400 italic">
          Your post preview will appear here in real time as you compose...
        </span>
      );
    }

    const words = text.split(/(\s+)/);
    return words.map((word, i) => {
      if (word.startsWith('#') || word.startsWith('http://') || word.startsWith('https://')) {
        return (
          <span key={i} className="text-blue-700 font-semibold hover:underline">
            {word}
          </span>
        );
      }
      return word;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-lg shadow-gray-200/50 overflow-hidden font-sans text-left transition-all">
      {/* Header bar indicating LinkedIn Preview */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold tracking-wide uppercase">
          <LinkIcon className="w-4 h-4 fill-white" />
          <span>Live LinkedIn Feed Preview</span>
        </div>
        <span className="text-[11px] bg-blue-600/60 px-2 py-0.5 rounded-full font-medium">
          Feed Simulator
        </span>
      </div>

      {/* Author info */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-800 text-white font-bold text-base flex items-center justify-center ring-2 ring-gray-100 flex-shrink-0">
              {authorName[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-gray-900 leading-snug truncate">
              {authorName}
            </h4>
            <p className="text-xs text-gray-500 leading-snug line-clamp-1">
              {authorHeadline}
            </p>
            <div className="flex items-center space-x-1 text-[11px] text-gray-400 mt-0.5">
              <span>Just now</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-gray-400" />
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 p-1">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Caption Content */}
      <div className="px-4 pb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
        {formatCaption(caption)}
      </div>

      {/* Media Content */}
      {previewUrl && (
        <div className="w-full bg-black/5 border-t border-b border-gray-100 max-h-[420px] flex items-center justify-center overflow-hidden">
          {fileType?.startsWith('video/') ? (
            <video
              src={previewUrl}
              controls
              className="w-full max-h-[400px] object-contain"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Post media"
              className="w-full max-h-[400px] object-contain"
            />
          )}
        </div>
      )}

      {/* Fake Reactions bar */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px]">
              <ThumbsUp className="w-2.5 h-2.5 fill-white" />
            </span>
            <span className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px]">
              <Heart className="w-2.5 h-2.5 fill-white" />
            </span>
            <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px]">
              <Sparkles className="w-2.5 h-2.5 fill-white" />
            </span>
          </div>
          <span className="ml-1 font-medium">You and 42 others</span>
        </div>
        <div className="space-x-2">
          <span>8 comments</span>
          <span>•</span>
          <span>3 reposts</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-2 py-1.5 flex items-center justify-around text-gray-600 text-xs font-semibold">
        <button className="flex items-center space-x-1.5 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors">
          <ThumbsUp className="w-4 h-4" />
          <span>Like</span>
        </button>
        <button className="flex items-center space-x-1.5 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>
        <button className="flex items-center space-x-1.5 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors">
          <Repeat2 className="w-4 h-4" />
          <span>Repost</span>
        </button>
        <button className="flex items-center space-x-1.5 py-2 px-3 hover:bg-gray-100 rounded-lg transition-colors">
          <SendIcon className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
