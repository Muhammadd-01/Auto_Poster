import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LinkedInPreview } from '../components/LinkedInPreview';
import { 
  Image as ImageIcon, 
  Video, 
  Clock, 
  Send, 
  X, 
  Sparkles, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Composer = () => {
  const { user, isDemoMode, linkedInAccount } = useAuth();
  const navigate = useNavigate();

  const [caption, setCaption] = useState('');
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

  const uploadMedia = async (): Promise<string | null> => {
    if (!file || !user) return null;
    if (isDemoMode) {
      return `demo-uploads/${file.name}`;
    }

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

      if (isDemoMode) {
        // Save to demo storage in localStorage
        const stored = JSON.parse(localStorage.getItem('autopost_demo_posts') || '[]');
        const newPost = {
          id: `demo_${Date.now()}`,
          user_id: user?.id,
          caption,
          status: action,
          scheduled_at,
          published_at: action === 'PROCESSING' ? new Date().toISOString() : null,
          timezone,
          created_at: new Date().toISOString(),
          media_path: mediaPath,
          preview_url: previewUrl,
        };
        localStorage.setItem('autopost_demo_posts', JSON.stringify([newPost, ...stored]));
      } else {
        // Insert into Supabase
        const { data: post, error } = await supabase
          .from('posts')
          .insert([
            {
              user_id: user?.id,
              caption,
              status: action,
              scheduled_at,
              timezone,
            },
          ])
          .select()
          .single();

        if (error) throw error;

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
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>LinkedIn Autopilot Composer</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Create & Schedule Post
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-gray-500">Target Timezone:</span>
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

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
            <span className="font-bold">Post queued successfully! Redirecting to calendar...</span>
          </div>
        )}

        {/* 2-Column Responsive Layout: Editor on Left, Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Composer Box (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-orange-950/5 border border-orange-100">
              
              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={8}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="What do you want to share with your LinkedIn network today?"
                  className="w-full text-base sm:text-lg text-gray-800 placeholder-gray-400 border-0 focus:ring-0 p-0 resize-none leading-relaxed focus:outline-none"
                />
              </div>

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
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${caption.length > 2800 ? 'text-red-500' : 'text-gray-400'}`}>
                    {3000 - caption.length} left
                  </span>
                </div>
              </div>

              {/* Scheduling Panel */}
              {isScheduling && (
                <div className="mt-5 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 animate-slide-up">
                  <div className="flex items-center justify-between mb-3">
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
              previewUrl={previewUrl}
              fileType={file?.type || null}
              authorName={linkedInAccount?.display_name || user?.user_metadata?.full_name || 'Your Profile'}
              authorHeadline={linkedInAccount ? 'Connected LinkedIn Profile' : (user?.user_metadata?.headline || 'LinkedIn Creator')}
              authorAvatar={linkedInAccount?.profile_url || user?.user_metadata?.avatar_url || ''}
            />
          </div>

        </div>
      </main>
    </div>
  );
};
