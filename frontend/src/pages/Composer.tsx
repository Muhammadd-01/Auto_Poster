import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Image as ImageIcon, Video, Clock, Send, X } from 'lucide-react';

export const Composer = () => {
  const { user } = useAuth();
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);

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

  const uploadMedia = async (): Promise<string | null> => {
    if (!file || !user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error', uploadError);
      return null;
    }
    return filePath;
  };

  const handleSubmit = async (action: 'DRAFT' | 'SCHEDULED' | 'PROCESSING') => {
    setLoading(true);
    let mediaPath = null;
    
    if (file) {
      mediaPath = await uploadMedia();
    }

    // Determine scheduled_at
    let scheduled_at = null;
    if (action === 'SCHEDULED' && scheduleDate && scheduleTime) {
      scheduled_at = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
    } else if (action === 'PROCESSING') {
      scheduled_at = new Date().toISOString(); // Now
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert([
        {
          user_id: user?.id,
          caption,
          status: action,
          scheduled_at,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      ])
      .select()
      .single();

    if (error) {
      alert('Error creating post: ' + error.message);
    } else if (post && mediaPath) {
      // Record media
      const { data: mediaRec } = await supabase.from('media').insert([{
        user_id: user?.id,
        filename: file?.name,
        storage_path: mediaPath,
        mime_type: file?.type,
        size: file?.size
      }]).select().single();

      if (mediaRec) {
        await supabase.from('post_media').insert([{
          post_id: post.id,
          media_id: mediaRec.id
        }]);
      }
    }

    setLoading(false);
    if (!error) {
      alert('Post saved successfully!');
      setCaption('');
      clearFile();
      setIsScheduling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Create Post</h2>
      
      <div className="bg-white shadow-xl shadow-brand-100/50 rounded-2xl overflow-hidden border border-gray-100 animate-slide-up">
        <div className="p-6 border-b border-gray-100">
          <textarea
            rows={6}
            className="w-full resize-none border-0 focus:ring-0 p-2 text-gray-900 placeholder-gray-400 text-lg transition-all"
            placeholder="What do you want to talk about?"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
        </div>

        {previewUrl && (
          <div className="p-6 relative bg-gray-50 border-b border-gray-100 animate-fade-in">
            <button 
              onClick={clearFile}
              className="absolute top-8 right-8 bg-gray-900/80 text-white p-1.5 rounded-full hover:bg-red-600 z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            {file?.type.startsWith('video/') ? (
              <video src={previewUrl} controls className="max-h-96 rounded-xl mx-auto shadow-md" />
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-96 rounded-xl mx-auto object-contain shadow-md" />
            )}
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <div className="flex space-x-3">
            <label className="cursor-pointer p-2.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
              <ImageIcon className="w-6 h-6" />
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="cursor-pointer p-2.5 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
              <Video className="w-6 h-6" />
              <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
          <div className="text-sm font-medium text-gray-400">
            {3000 - caption.length} characters remaining
          </div>
        </div>

        {isScheduling && (
          <div className="p-6 border-t border-gray-100 bg-brand-50 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 animate-slide-up">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-brand-900 mb-1">Date</label>
              <input 
                type="date" 
                value={scheduleDate}
                onChange={e => setScheduleDate(e.target.value)}
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-brand-900 mb-1">Time</label>
              <input 
                type="time" 
                value={scheduleTime}
                onChange={e => setScheduleTime(e.target.value)}
                className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-brand-500 focus:border-brand-500 sm:text-sm" 
              />
            </div>
            <div className="flex items-end">
               <button onClick={() => setIsScheduling(false)} className="text-sm font-medium text-brand-600 hover:text-brand-800 mb-2 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading || !caption}
            className="text-gray-500 hover:text-gray-900 font-semibold text-sm disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setIsScheduling(true)}
              disabled={loading || !caption}
              className="inline-flex items-center px-5 py-2.5 border border-gray-200 shadow-sm text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all"
            >
              <Clock className="w-4 h-4 mr-2 text-brand-500" />
              Schedule
            </button>
            
            <button
              onClick={() => handleSubmit(isScheduling ? 'SCHEDULED' : 'PROCESSING')}
              disabled={loading || !caption || (isScheduling && (!scheduleDate || !scheduleTime))}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-lg shadow-md text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : isScheduling ? 'Schedule Post' : 'Post Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
