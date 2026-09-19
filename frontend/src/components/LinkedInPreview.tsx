import React, { useState } from 'react';
import { 
  ThumbsUp, 
  MessageSquare, 
  Repeat2, 
  Send as SendIcon, 
  Globe, 
  MoreHorizontal, 
  Link as LinkIcon,
  Heart,
  Sparkles,
  Smartphone,
  Monitor,
  CornerDownRight,
  BadgeCheck
} from 'lucide-react';

interface LinkedInPreviewProps {
  caption: string;
  previewUrl: string | null;
  fileType: string | null;
  authorName?: string;
  authorHeadline?: string;
  authorAvatar?: string;
  firstComment?: string | null;
}

export const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({
  caption,
  previewUrl,
  fileType,
  authorName = 'Your Profile',
  authorHeadline = 'LinkedIn Content Creator',
  authorAvatar = '',
  firstComment = '',
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isExpanded, setIsExpanded] = useState(false);

  // LinkedIn desktop cuts at ~210 chars or 3 lines, mobile at ~140 chars or 2 lines
  const foldLimit = deviceMode === 'desktop' ? 210 : 140;
  const lines = caption ? caption.split('\n') : [];
  const exceedsLineThreshold = lines.length > (deviceMode === 'desktop' ? 3 : 2);
  const exceedsCharThreshold = caption.length > foldLimit;
  const shouldTruncate = (exceedsLineThreshold || exceedsCharThreshold) && !isExpanded;

  // Format text with highlighted hashtags and URLs
  const formatText = (text: string) => {
    if (!text) return null;
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

  const getTruncatedContent = () => {
    if (!shouldTruncate) return caption;
    if (exceedsLineThreshold && lines.slice(0, deviceMode === 'desktop' ? 3 : 2).join('\n').length <= foldLimit) {
      return lines.slice(0, deviceMode === 'desktop' ? 3 : 2).join('\n');
    }
    return caption.slice(0, foldLimit);
  };

  return (
    <div className="space-y-4">
      {/* Device Viewport Toggle & Fold Indicator */}
      <div className="bg-gray-100 p-1.5 rounded-xl flex items-center justify-between text-xs font-semibold text-gray-600">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => { setDeviceMode('desktop'); setIsExpanded(false); }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all ${
              deviceMode === 'desktop' 
                ? 'bg-white text-gray-900 shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => { setDeviceMode('mobile'); setIsExpanded(false); }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-all ${
              deviceMode === 'mobile' 
                ? 'bg-white text-gray-900 shadow-sm font-bold' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        <span className="text-[11px] text-gray-500 pr-2">
          {caption.length > foldLimit ? (
            <span className="text-orange-600 font-bold">
              Fold at {foldLimit} chars ({caption.length - foldLimit} hidden)
            </span>
          ) : (
            <span className="text-green-600 font-medium">100% visible before fold</span>
          )}
        </span>
      </div>

      {/* Main Post Card */}
      <div className={`bg-white rounded-2xl border border-gray-200/90 shadow-lg shadow-gray-200/50 overflow-hidden font-sans text-left transition-all ${
        deviceMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
      }`}>
        {/* Header bar indicating LinkedIn Preview */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 px-4 py-2 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wide uppercase">
            <LinkIcon className="w-4 h-4 fill-white" />
            <span>LinkedIn Feed Simulator</span>
          </div>
          <span className="text-[10px] bg-blue-600/70 px-2 py-0.5 rounded-full font-medium">
            {deviceMode === 'desktop' ? 'Desktop Feed' : 'Mobile Feed'}
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
              <div className="flex items-center space-x-1">
                <h4 className="text-sm font-bold text-gray-900 leading-snug truncate">
                  {authorName}
                </h4>
                <BadgeCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              </div>
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

        {/* Caption Content with Fold Simulator */}
        <div className="px-4 pb-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap break-words">
          {!caption ? (
            <span className="text-gray-400 italic">
              Your post preview will appear here in real time as you compose...
            </span>
          ) : (
            <>
              {formatText(getTruncatedContent())}
              {shouldTruncate ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="text-gray-500 hover:text-blue-700 font-semibold ml-1 cursor-pointer"
                >
                  ...see more
                </button>
              ) : isExpanded && (exceedsLineThreshold || exceedsCharThreshold) ? (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-blue-700 text-xs font-semibold block mt-1"
                >
                  (collapse preview)
                </button>
              ) : null}
            </>
          )}
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

        {/* Reactions bar */}
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
            <span className="ml-1 font-medium">You and 84 others</span>
          </div>
          <div className="space-x-2">
            <span>{firstComment ? '1 comment' : '0 comments'}</span>
            <span>•</span>
            <span>4 reposts</span>
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

        {/* First Comment Simulation Card */}
        {firstComment && firstComment.trim() && (
          <div className="border-t border-gray-100 bg-gray-50/70 p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-1 text-[11px] font-bold text-orange-700">
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Automated First Comment</span>
              </div>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded-full">
                Algorithm Optimized
              </span>
            </div>

            <div className="flex items-start space-x-2.5 mt-1">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {authorName[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-gray-900">{authorName}</span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">Author</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Scheduled</span>
                </div>
                <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap leading-relaxed">
                  {formatText(firstComment)}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

