import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Link as LinkIcon, Trash2, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { format, parseISO } from 'date-fns';
import { useSearchParams } from 'react-router-dom';

export const Accounts = () => {
  const { user, isDemoMode } = useAuth();
  const [searchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const successParam = searchParams.get('success');
  const errorParam = searchParams.get('error');
  const detailsParam = searchParams.get('details');

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  const fetchAccounts = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) setAccounts(data);
    } catch (err) {
      console.warn('Error fetching social accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectLinkedIn = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/api/auth/linkedin?userId=${user?.id}`;
  };

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Disconnect LinkedIn?\n\nYou will no longer be able to publish to LinkedIn from this account until you reconnect it.')) return;
    
    try {
      await supabase.from('social_accounts').delete().eq('id', accountId);
      setAccounts(accounts.filter(a => a.id !== accountId));
    } catch (err) {
      alert('Failed to disconnect account.');
    }
  };

  const linkedInAccount = accounts.find(a => a.provider === 'linkedin');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-3">
            <Users className="w-8 h-8 text-orange-500" />
            <span>Connected Accounts</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage your social media integrations for autopilot posting.
          </p>
        </div>

        {/* Feedback Banners */}
        {successParam === 'linkedin_connected' && (
          <div className="p-4 rounded-2xl bg-green-50 border border-green-200 flex items-center space-x-3 text-green-800 text-sm font-semibold">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span>Your LinkedIn account has been successfully linked and authenticated!</span>
          </div>
        )}

        {errorParam && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-800 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p>Authentication error: {errorParam}</p>
              {detailsParam && (
                <p className="text-xs font-mono bg-red-100/60 p-2 rounded-lg mt-1 text-red-900">
                  {detailsParam}
                </p>
              )}
            </div>
          </div>
        )}

        {isDemoMode && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs font-semibold">
            <span>You are currently in Instant Demo Mode. Live LinkedIn connections require a registered user session.</span>
          </div>
        )}
        
        <div className="bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-950/5 overflow-hidden">
          
          {/* LinkedIn Section */}
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0077b5] flex items-center justify-center shadow-md">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">LinkedIn</h2>
            </div>

            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : linkedInAccount ? (
              <div className="bg-green-50/50 border border-green-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-green-800">Connected</span>
                  </div>
                  <p className="text-sm text-gray-900 font-medium">Account: <span className="text-gray-600 font-normal">{linkedInAccount.display_name || 'Authorized LinkedIn User'}</span></p>
                  <p className="text-xs text-gray-500">Connected on: {format(parseISO(linkedInAccount.created_at), 'PPP')}</p>
                </div>
                
                <button 
                  onClick={() => handleDisconnect(linkedInAccount.id)}
                  className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900">Not Connected</p>
                  <p className="text-xs text-gray-500 mt-1">Connect your LinkedIn profile to start scheduling posts automatically.</p>
                </div>
                <button 
                  onClick={handleConnectLinkedIn}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-[#0077b5] hover:bg-[#006396] shadow-md shadow-blue-900/20 rounded-xl transition-all flex items-center space-x-2"
                >
                  <span>Connect LinkedIn</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </motion.div>
  );
};
