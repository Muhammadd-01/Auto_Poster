import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LinkedInPreview } from '../components/LinkedInPreview';
import { HookLibraryModal } from '../components/HookLibraryModal';
import { applyStyleToSelection, type StyleType } from '../utils/textStyling';
import { evaluateHookScore } from '../utils/hookScorecard';
import { 
  Image as ImageIcon, 
  Video, 
  Clock, 
  Send, 
  X, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  AlertCircle,
  List,
  CheckSquare,
  ArrowRight,
  ListOrdered,
  BookOpen,
  MessageSquarePlus,
  Eye,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Check,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CONTENT_PILLARS = [
  { id: 'Educational', label: '📚 Educational' },
  { id: 'Story', label: '💡 Story & Lessons' },
  { id: 'Proof', label: '🏆 Proof & Results' },
  { id: 'Promo', label: '🚀 Promo & Launch' },
];

export const Composer = () => {
  const { user, linkedInAccount } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [caption, setCaption] = useState('');
  const [firstComment, setFirstComment] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('Educational');
  const [showScorecardDetails, setShowScorecardDetails] = useState(false);
  const [showFirstCommentBox, setShowFirstCommentBox] = useState(false);
  const [isHookModalOpen, setIsHookModalOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  
  // Default to tomorrow 10:00 AM
  const defaultDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const [scheduleDate, setScheduleDate] = useState(defaultDate);
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [timezone, setTimezone] = useState('Asia/Karachi');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hook fold calculation
  const foldCutoff = 210;
  const isOverFold = caption.length > foldCutoff;

  const handleApplyStyle = (style: StyleType) => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const { newText, newStart, newEnd } = applyStyleToSelection(caption, start, end, style);
    setCaption(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newStart, newEnd);
      }
    }, 10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
  };

  const addHashtag = (tag: string) => {
    setCaption((prev) => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSelectTemplate = (template: string) => {
    if (caption.trim() && !window.confirm('Replace existing text in the editor with this blueprint?')) {
      return;
    }
    setCaption(template);
  };

  const applyQuickSlot = (daysAhead: number, timeStr: string) => {
    const targetDate = new Date(Date.now() + daysAhead * 24 * 3600 * 1000).toISOString().split('T')[0];
    setScheduleDate(targetDate);
    setScheduleTime(timeStr);
    setIsScheduling(true);
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!file || !user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) {
        console.warn('Supabase storage upload error:', uploadError);
        return `fallback/${file.name}`;
      }
      return fileName;
    } catch (err) {
      console.warn('Storage upload exception:', err);
      return `fallback/${file.name}`;
    }
  };

  const handleSubmit = async (action: 'DRAFT' | 'SCHEDULED' | 'PROCESSING') => {
    if (!caption.trim()) {
      setErrorMsg('Please write a caption before saving or scheduling.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      let mediaPath = null;
      if (file) {
        mediaPath = await uploadMedia();
      }

      let scheduled_at = null;
      if (action === 'SCHEDULED' && scheduleDate && scheduleTime) {
        scheduled_at = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      } else if (action === 'PROCESSING') {
        scheduled_at = new Date().toISOString();
      }

      // 1. Prepare post payload with first_comment and tags
      const insertData: any = {
        user_id: user?.id,
        caption,
        first_comment: firstComment.trim() || null,
        tags: [selectedPillar],
        status: action,
        scheduled_at,
        timezone,
      };

      let postResult = await supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single();

      // Graceful fallback if first_comment or tags column is not yet migrated in Supabase
      if (postResult.error && (postResult.error.message?.includes('first_comment') || postResult.error.message?.includes('tags'))) {
        delete insertData.first_comment;
        delete insertData.tags;
        postResult = await supabase
          .from('posts')
          .insert([insertData])
          .select()
          .single();
      }

      if (postResult.error) throw postResult.error;
      const post = postResult.data;

      if (post && mediaPath) {
        const { data: mediaRec } = await supabase
          .from('media')
          .insert([
            {
              user_id: user?.id,
              filename: file?.name || 'media',
              storage_path: mediaPath,
              mime_type: file?.type || 'application/octet-stream',
              size: file?.size || 0,
            },
          ])
          .select()
          .single();

        if (mediaRec) {
          await supabase.from('post_media').insert([
            {
              post_id: post.id,
              media_id: mediaRec.id,
            },
          ]);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/schedule');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>LinkedIn Creator Autopilot</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create & Schedule Post
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsHookModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 transition-all shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-orange-600" />
              <span>Viral Hooks & Blueprints</span>
            </button>

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-gray-500">Timezone:</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="text-xs font-bold bg-white border border-orange-200 text-gray-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                <option value="Asia/Karachi">Asia/Karachi (UTC+5)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
            <span className="font-bold">Post saved & queued successfully! Redirecting...</span>
          </div>
        )}

        {/* 2-Column Responsive Layout: Editor on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Composer Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5 border border-orange-100">
              
              {/* Native Unicode Formatting Toolbar */}
              <div className="mb-3 pb-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                    Text Style:
                  </span>
                  
                  <button
                    type="button"
                    title="Bold Sans (Unicode)"
                    onClick={() => handleApplyStyle('bold')}
                    className="p-1.5 px-2 text-xs font-black text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    𝗕
                  </button>

                  <button
                    type="button"
                    title="Bold Serif (Unicode)"
                    onClick={() => handleApplyStyle('bold-serif')}
                    className="p-1.5 px-2 text-xs font-serif font-black text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    𝐁
                  </button>

                  <button
                    type="button"
                    title="Italic (Unicode)"
                    onClick={() => handleApplyStyle('italic')}
                    className="p-1.5 px-2 text-xs italic font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    𝘪
                  </button>

                  <button
                    type="button"
                    title="Monospace Code Font"
                    onClick={() => handleApplyStyle('monospace')}
                    className="p-1.5 px-2 text-xs font-mono text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    𝚌
                  </button>

                  <button
                    type="button"
                    title="Strikethrough"
                    onClick={() => handleApplyStyle('strikethrough')}
                    className="p-1.5 px-2 text-xs line-through text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    s̶
                  </button>

                  <div className="h-4 w-px bg-gray-200 mx-1" />

                  <button
                    type="button"
                    title="Bullet List (•)"
                    onClick={() => handleApplyStyle('bullet')}
                    className="p-1.5 text-xs text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Checkmark List (✓)"
                    onClick={() => handleApplyStyle('check')}
                    className="p-1.5 text-xs text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Arrow List (→)"
                    onClick={() => handleApplyStyle('arrow')}
                    className="p-1.5 text-xs text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    title="Numbered List (1. 2.)"
                    onClick={() => handleApplyStyle('numbered')}
                    className="p-1.5 text-xs text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                </div>

                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  Select text to style
                </span>
              </div>

              {/* Content Pillar Selector */}
              <div className="mb-3 flex items-center space-x-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                  Pillar:
                </span>
                {CONTENT_PILLARS.map((pillar) => (
                  <button
                    key={pillar.id}
                    type="button"
                    onClick={() => setSelectedPillar(pillar.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      selectedPillar === pillar.id
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                    }`}
                  >
                    {pillar.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  rows={9}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What do you want to share with your LinkedIn network today?
Tip: Highlight text to format in Bold or Italic, or pick a Viral Blueprint above."
                  className="w-full text-base sm:text-lg text-gray-800 placeholder-gray-400 border-0 focus:ring-0 p-0 resize-none leading-relaxed focus:outline-none"
                />
              </div>

              {/* Fold Line Alert Bar */}
              {caption.trim().length > 0 && (
                <div className={`mt-3 px-3 py-2 rounded-xl text-xs flex items-center justify-between border ${
                  isOverFold 
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900' 
                    : 'bg-green-50/60 border-green-200 text-green-900'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {isOverFold ? (
                        <>
                          <strong className="font-bold">Opening Hook ({foldCutoff} chars):</strong> Make sure the first 3 lines grip readers before the <em>"...see more"</em> fold!
                        </>
                      ) : (
                        <>
                          <strong className="font-bold">Complete Hook:</strong> Full text is visible in feeds without needing to click <em>"...see more"</em>!
                        </>
                      )}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold">
                    {caption.length} chars
                  </span>
                </div>
              )}

              {/* Pre-Publish Hook Health Scorecard */}
              {caption.trim().length > 0 && (() => {
                const scorecard = evaluateHookScore(caption, firstComment);
                return (
                  <div className="mt-3 p-3.5 rounded-2xl bg-gray-50/90 border border-gray-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-bold text-gray-900">
                          Hook Quality Score:
                        </span>
                        <span className={`text-xs font-extrabold ${scorecard.color}`}>
                          {scorecard.score}/100 • {scorecard.grade}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowScorecardDetails(!showScorecardDetails)}
                        className="text-[11px] font-bold text-orange-600 hover:text-orange-800 flex items-center space-x-1"
                      >
                        <span>{showScorecardDetails ? 'Hide Checklist' : 'Show Scorecard Checklist'}</span>
                        {showScorecardDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          scorecard.score >= 80 ? 'bg-green-500' : scorecard.score >= 50 ? 'bg-orange-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${scorecard.score}%` }}
                      />
                    </div>

                    {showScorecardDetails && (
                      <div className="pt-2 border-t border-gray-200/70 space-y-2 animate-fade-in">
                        {scorecard.checks.map(chk => (
                          <div key={chk.id} className="flex items-start space-x-2 text-[11px]">
                            {chk.passed ? (
                              <div className="w-4 h-4 rounded-full bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Info className="w-2.5 h-2.5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <span className={`font-bold ${chk.passed ? 'text-gray-800' : 'text-amber-900'}`}>
                                {chk.label}
                              </span>
                              <p className="text-gray-500 leading-tight">{chk.tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}


              {/* Hashtag Quick Selectors */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-gray-400 mr-1">Quick Tags:</span>
                {['#LinkedInGrowth', '#BuildingInPublic', '#Tech', '#SaaS', '#Leadership', '#Productivity'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addHashtag(tag)}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200/50 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Upload Dropzone / Preview */}
              {previewUrl ? (
                <div className="mt-5 relative rounded-2xl overflow-hidden bg-gray-50 border border-orange-200/60 p-3 group">
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-5 right-5 p-1.5 bg-gray-900/80 hover:bg-red-600 text-white rounded-full transition-colors z-10 shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {file?.type.startsWith('video/') ? (
                    <video src={previewUrl} controls className="max-h-80 w-full rounded-xl object-contain bg-black/5" />
                  ) : (
                    <img src={previewUrl} alt="Attached" className="max-h-80 w-full rounded-xl object-contain" />
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500 px-1">
                    <span className="font-medium truncate max-w-xs">{file?.name}</span>
                    <span>{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              ) : null}

              {/* Media Attach Bar & Character Count */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition-all">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                    <span>Attach Image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                  <label className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border border-gray-200 hover:border-orange-200 transition-all">
                    <Video className="w-4 h-4 text-amber-500" />
                    <span>Attach Video</span>
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
                  </label>

                  {/* Toggle First Comment Accordion */}
                  <button
                    type="button"
                    onClick={() => setShowFirstCommentBox(!showFirstCommentBox)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                      firstComment.trim() || showFirstCommentBox
                        ? 'bg-orange-500 text-white border-orange-600 shadow-2xs'
                        : 'text-gray-700 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 border-gray-200'
                    }`}
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>First Comment {firstComment.trim() ? '(Active)' : ''}</span>
                    {showFirstCommentBox ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${caption.length > 2800 ? 'text-red-500' : 'text-gray-400'}`}>
                    {3000 - caption.length} left
                  </span>
                </div>
              </div>

              {/* Automated First Comment Box */}
              {showFirstCommentBox && (
                <div className="mt-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-200 animate-slide-up space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-bold text-orange-950">
                        Automated First Comment (Algorithm Reach Maximizer)
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-500">
                      {1250 - firstComment.length} chars left
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-snug">
                    LinkedIn's algorithm penalizes posts with outbound links in the caption. Place your website URL, PDF link, or newsletter sign-up here—it will be queued as the first comment.
                  </p>

                  <textarea
                    rows={3}
                    value={firstComment}
                    onChange={(e) => setFirstComment(e.target.value)}
                    placeholder="e.g., 📌 Check out the full case study & live code here: https://yourdomain.com/article"
                    className="w-full bg-white border border-orange-200 rounded-xl p-3 text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              )}

              {/* Scheduling Panel */}
              {isScheduling && (
                <div className="mt-5 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 animate-slide-up space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Configure Delivery Schedule</span>
                    </h4>
                    <button
                      onClick={() => setIsScheduling(false)}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-800"
                    >
                      Cancel Schedule
                    </button>
                  </div>

                  {/* Smart Slot Presets */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">Quick Slots:</span>
                    <button
                      type="button"
                      onClick={() => applyQuickSlot(1, '10:00')}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-orange-100 text-orange-800 border border-orange-200"
                    >
                      Tomorrow 10:00 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickSlot(2, '09:30')}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-orange-100 text-orange-800 border border-orange-200"
                    >
                      In 2 Days 09:30 AM
                    </button>
                    <button
                      type="button"
                      onClick={() => applyQuickSlot(7, '11:00')}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white hover:bg-orange-100 text-orange-800 border border-orange-200"
                    >
                      Next Week
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Publish Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Publish Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full bg-white border border-orange-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Action Footer */}
              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={loading || !caption.trim()}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 disabled:opacity-40 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span>Save as Draft</span>
                </button>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  {!isScheduling && (
                    <button
                      type="button"
                      onClick={() => setIsScheduling(true)}
                      disabled={loading || !caption.trim()}
                      className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold text-orange-800 bg-orange-100/80 hover:bg-orange-200 border border-orange-300 rounded-xl disabled:opacity-40 transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span>Schedule for Later</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSubmit(isScheduling ? 'SCHEDULED' : 'PROCESSING')}
                    disabled={loading || !caption.trim()}
                    className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/30 rounded-xl disabled:opacity-50 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : isScheduling ? 'Confirm Schedule' : 'Publish to LinkedIn Now'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Live LinkedIn Feed Simulator (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Live Feed Preview
              </span>
              <span className="text-xs font-medium text-orange-600">
                Syncs with editor
              </span>
            </div>

            <LinkedInPreview
              caption={caption}
              firstComment={firstComment}
              previewUrl={previewUrl}
              fileType={file?.type || null}
              authorName={linkedInAccount?.display_name || user?.user_metadata?.full_name || 'Your Profile'}
              authorHeadline={linkedInAccount ? 'Connected LinkedIn Profile' : (user?.user_metadata?.headline || 'LinkedIn Creator')}
              authorAvatar={linkedInAccount?.profile_url || user?.user_metadata?.avatar_url || ''}
            />
          </div>

        </div>
      </main>

      {/* Hook Library Modal */}
      <HookLibraryModal
        isOpen={isHookModalOpen}
        onClose={() => setIsHookModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

