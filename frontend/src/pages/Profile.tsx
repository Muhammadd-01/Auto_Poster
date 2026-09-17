import { useState, useRef } from 'react';
import { 
  User,
  Camera,
  Trash2,
  Lock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';

export const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Avatar State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.user_metadata?.avatar_url || null
  );

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match', 'Please ensure both password fields match exactly.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password too short', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success('Password Updated', 'Your password has been successfully changed.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Image must be less than 2MB');
      }

      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);

      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      let publicUrl = objectUrl; 

      if (!uploadError && data) {
        const { data: { publicUrl: url } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        publicUrl = url;
      } else {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        publicUrl = await base64Promise;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;
      
      toast.success('Avatar Updated', 'Your profile picture has been updated.');
    } catch (err: any) {
      toast.error('Upload Failed', err.message || 'Could not upload image');
      setAvatarPreview(user?.user_metadata?.avatar_url || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUploading(true);
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null }
      });
      
      if (error) throw error;
      
      setAvatarPreview(null);
      toast.success('Avatar Removed', 'Your profile picture has been removed.');
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not remove image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-3">
          <User className="w-8 h-8 text-gray-400" />
          <span>My Profile</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage your personal profile and security settings.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-8">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Profile & Security</h2>
              <p className="text-xs text-gray-500">Update your avatar and account password</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Avatar Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Profile Picture</h3>
            <div className="flex items-center space-x-5">
              <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shrink-0 text-white font-bold text-3xl">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || <User className="w-10 h-10 text-white/90" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload New</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  
                  {avatarPreview && (
                    <button 
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">Recommended: Square image, max 2MB.</p>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Change Password</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isUpdatingPassword || !newPassword}
                className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};
