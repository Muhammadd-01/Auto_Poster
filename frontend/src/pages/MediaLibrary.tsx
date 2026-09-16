import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Trash2, 
  HardDrive, 
  Check, 
  Copy 
} from 'lucide-react';

export const MediaLibrary = () => {
  const { user, isDemoMode } = useAuth();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    if (!user) return;

    if (isDemoMode) {
      const stored = JSON.parse(localStorage.getItem('autopost_demo_media') || '[]');
      setMediaList(stored);
      return;
    }

    try {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setMediaList(data);
    } catch (err) {
      console.warn('Error fetching media:', err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [user, isDemoMode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      if (isDemoMode) {
        const preview = URL.createObjectURL(file);
        const newMedia = {
          id: `media_${Date.now()}`,
          filename: file.name,
          mime_type: file.type,
          size: file.size,
          storage_path: `demo/${file.name}`,
          preview_url: preview,
          created_at: new Date().toISOString(),
        };
        const stored = JSON.parse(localStorage.getItem('autopost_demo_media') || '[]');
        const updated = [newMedia, ...stored];
        localStorage.setItem('autopost_demo_media', JSON.stringify(updated));
        setMediaList(updated);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const storagePath = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: storageError } = await supabase.storage
        .from('media')
        .upload(storagePath, file);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(storagePath);

      const { data: inserted, error: dbError } = await supabase
        .from('media')
        .insert([
          {
            user_id: user.id,
            filename: file.name,
            storage_path: storagePath,
            mime_type: file.type,
            size: file.size,
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      if (inserted) {
        setMediaList((prev) => [{ ...inserted, preview_url: publicUrlData.publicUrl }, ...prev]);
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, storagePath?: string) => {
    if (!confirm('Remove this media asset?')) return;

    if (isDemoMode) {
      const stored = JSON.parse(localStorage.getItem('autopost_demo_media') || '[]');
      const updated = stored.filter((m: any) => m.id !== id);
      localStorage.setItem('autopost_demo_media', JSON.stringify(updated));
      setMediaList(updated);
      return;
    }

    try {
      if (storagePath) {
        await supabase.storage.from('media').remove([storagePath]);
      }
      await supabase.from('media').delete().eq('id', id);
      setMediaList((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert('Failed to delete media: ' + err.message);
    }
  };

  const copyPath = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Media Asset Library
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload images and videos once, reuse them across scheduled LinkedIn posts.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/25 transition-all">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload Media Asset'}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Media Grid */}
        {mediaList.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-orange-100 p-8 space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
              <HardDrive className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Your media library is empty</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Store high-converting visuals and videos to attach directly to your LinkedIn schedule.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mediaList.map((item) => {
              const isVideo = item.mime_type?.startsWith('video/');
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden flex items-center justify-center">
                    {isVideo ? (
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-1">
                        <Video className="w-10 h-10 text-orange-500" />
                        <span className="text-[11px] font-bold">Video Asset</span>
                      </div>
                    ) : item.preview_url ? (
                      <img
                        src={item.preview_url}
                        alt={item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}

                    <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyPath(item.storage_path, item.id)}
                        title="Copy storage reference"
                        className="p-1.5 bg-gray-900/80 hover:bg-gray-900 text-white rounded-lg text-xs"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.storage_path)}
                        title="Delete asset"
                        className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-lg text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <p className="text-xs font-bold text-gray-900 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span>{((item.size || 0) / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{item.mime_type?.split('/')[1]?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
