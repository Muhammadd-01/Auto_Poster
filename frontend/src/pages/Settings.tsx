import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { 
  Settings as SettingsIcon, 
  Link as LinkIcon, 
  ShieldCheck, 
  Save, 
  Bell, 
  User as UserIcon, 
  Clock, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const Settings = () => {
  const { user, linkedInAccount, refreshLinkedInAccount } = useAuth();
  const toast = useToast();

  // Profile preferences
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [timezone, setTimezone] = useState('Asia/Karachi');

  // Automation Defaults
  const [defaultPostingTime, setDefaultPostingTime] = useState('10:00');
  const [defaultCadence, setDefaultCadence] = useState('weekdays');
  const [autoFirstCommentEnabled, setAutoFirstCommentEnabled] = useState(false);
  const [defaultFirstCommentTemplate, setDefaultFirstCommentTemplate] = useState('📌 Check out the full breakdown and resources: https://yourdomain.com');

  // Notifications
  const [notifyOnSuccess, setNotifyOnSuccess] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [saving, setSaving] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || linkedInAccount?.display_name || '');
      setHeadline(user.user_metadata?.headline || 'LinkedIn Content Creator');
      
      const storageKey = `autopost_settings_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.timezone) setTimezone(parsed.timezone);
          if (parsed.defaultPostingTime) setDefaultPostingTime(parsed.defaultPostingTime);
          if (parsed.defaultCadence) setDefaultCadence(parsed.defaultCadence);
          if (parsed.autoFirstCommentEnabled !== undefined) setAutoFirstCommentEnabled(parsed.autoFirstCommentEnabled);
          if (parsed.defaultFirstCommentTemplate) setDefaultFirstCommentTemplate(parsed.defaultFirstCommentTemplate);
          if (parsed.notifyOnSuccess !== undefined) setNotifyOnSuccess(parsed.notifyOnSuccess);
          if (parsed.notifyOnFailure !== undefined) setNotifyOnFailure(parsed.notifyOnFailure);
          if (parsed.weeklyDigest !== undefined) setWeeklyDigest(parsed.weeklyDigest);
        } catch (e) {
          console.warn('Failed parsing settings from localStorage', e);
        }
      }
    }
  }, [user, linkedInAccount]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const settingsPayload = {
        timezone,
        defaultPostingTime,
        defaultCadence,
        autoFirstCommentEnabled,
        defaultFirstCommentTemplate,
        notifyOnSuccess,
        notifyOnFailure,
        weeklyDigest
      };

      // 1. Save to localStorage
      if (user?.id) {
        localStorage.setItem(`autopost_settings_${user.id}`, JSON.stringify(settingsPayload));
      } else {
        localStorage.setItem('autopost_settings_default', JSON.stringify(settingsPayload));
      }

      // 2. Update Supabase user metadata
      if (user) {
        await supabase.auth.updateUser({
          data: {
            full_name: displayName,
            headline: headline,
            timezone: timezone
          }
        });
      }

      toast.success(
        'Preferences Saved!', 
        'Your publishing defaults and creator configurations are active.'
      );
    } catch (err: any) {
      console.error('Save settings error:', err);
      toast.error('Save Failed', err.message || 'Could not update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold mb-2">
            <SettingsIcon className="w-3.5 h-3.5 text-orange-600" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Workspace Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your creator defaults, automation cadence, and LinkedIn integration.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/25 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">

        {/* Section 1: Creator Profile Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Creator Profile & Brand</h2>
              <p className="text-xs text-gray-500">How your name and headline appear across live simulators</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                LinkedIn Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Founder at TechCo • Building in Public"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Primary Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full sm:w-80 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="Asia/Karachi">Asia/Karachi (UTC+5)</option>
              <option value="America/New_York">America/New_York (EST / UTC-5)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST / UTC-8)</option>
              <option value="Europe/London">Europe/London (GMT / UTC+0)</option>
              <option value="Europe/Paris">Europe/Paris (CET / UTC+1)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST / UTC+4)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST / UTC+5:30)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT / UTC+8)</option>
            </select>
            <p className="text-[11px] text-gray-400 mt-1">
              All calendar queues and scheduled posts will calculate against this timezone.
            </p>
          </div>
        </div>

        {/* Section 2: Automation & Publishing Defaults */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Automation & Scheduling Cadence</h2>
              <p className="text-xs text-gray-500">Default time slots for quick scheduling and bulk imports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Default Target Posting Time
              </label>
              <input
                type="time"
                value={defaultPostingTime}
                onChange={(e) => setDefaultPostingTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
              <p className="text-[11px] text-gray-400 mt-1">Recommended: 08:30 – 10:30 AM on weekdays.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Default Cadence Schedule
              </label>
              <select
                value={defaultCadence}
                onChange={(e) => setDefaultCadence(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="weekdays">Weekdays Only (Monday to Friday)</option>
                <option value="everyday">Every Single Day (7 Days / Week)</option>
                <option value="mwf">3 Days / Week (Monday, Wednesday, Friday)</option>
              </select>
            </div>
          </div>

          {/* First Comment Default */}
          <div className="pt-2 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Always Pre-Fill First Comment Template</span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Automatically enable the 1st Comment box in Composer with your default link/CTA.
                </p>
              </div>

              <input
                type="checkbox"
                checked={autoFirstCommentEnabled}
                onChange={(e) => setAutoFirstCommentEnabled(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
            </div>

            {autoFirstCommentEnabled && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Default First Comment Text
                </label>
                <textarea
                  rows={2}
                  value={defaultFirstCommentTemplate}
                  onChange={(e) => setDefaultFirstCommentTemplate(e.target.value)}
                  placeholder="e.g. 📌 Access the full tutorial and code files here: https://..."
                  className="w-full px-3 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Section 3: LinkedIn API Connection Status */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0077b5] text-white flex items-center justify-center shadow-md shadow-blue-900/10">
                <LinkIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">LinkedIn OAuth Integration</h2>
                <p className="text-xs text-gray-500">Official OpenID & UGC Posting Connection</p>
              </div>
            </div>

            <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider border ${
              linkedInAccount 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              {linkedInAccount ? 'Connected' : 'Action Required'}
            </span>
          </div>

          {linkedInAccount ? (
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                {linkedInAccount.profile_url ? (
                  <img
                    src={linkedInAccount.profile_url}
                    alt={linkedInAccount.display_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center">
                    {linkedInAccount.display_name[0] || 'L'}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 flex items-center space-x-1.5">
                    <span>{linkedInAccount.display_name}</span>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </h4>
                  <p className="text-xs text-gray-500">{linkedInAccount.email || 'Email connected via OpenID'}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Authorized on {new Date(linkedInAccount.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => refreshLinkedInAccount()}
                  className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Verify Auth</span>
                </button>
                <a
                  href={`http://localhost:3000/api/auth/linkedin?userId=${user?.id || 'demo'}`}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#0077b5] hover:bg-[#006097] rounded-xl transition-colors shadow-2xs"
                >
                  Reconnect
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-amber-950">No LinkedIn Profile Connected</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Connect your LinkedIn account to publish directly from your scheduled queues.
                </p>
              </div>

              <a
                href={`http://localhost:3000/api/auth/linkedin?userId=${user?.id || 'demo'}`}
                className="px-4 py-2 text-xs font-bold text-white bg-[#0077b5] hover:bg-[#006097] rounded-xl transition-all shadow-sm flex items-center space-x-1.5 whitespace-nowrap"
              >
                <span>Connect with LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start space-x-2.5">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-900 leading-relaxed">
              <strong>Enterprise Security:</strong> Tokens are authenticated through official OAuth 2.0 with the <code>w_member_social</code> and <code>openid</code> scopes. Passwords are never stored on this server.
            </p>
          </div>
        </div>

        {/* Section 4: Email & Notification Alerts */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Notifications & Delivery Alerts</h2>
              <p className="text-xs text-gray-500">Configure how and when you receive posting alerts</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Notify on Post Publication Success
                </span>
                <span className="text-[11px] text-gray-500">
                  Receive an in-app confirmation whenever a scheduled post goes live.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnSuccess}
                onChange={(e) => setNotifyOnSuccess(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Alert on Delivery Failure (Recommended)
                </span>
                <span className="text-[11px] text-gray-500">
                  Instant alert if a LinkedIn token expires or image upload fails.
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifyOnFailure}
                onChange={(e) => setNotifyOnFailure(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Weekly Analytics Digest
                </span>
                <span className="text-[11px] text-gray-500">
                  Summary of your weekly posts, impressions reach, and consistency score.
                </span>
              </div>
              <input
                type="checkbox"
                checked={weeklyDigest}
                onChange={(e) => setWeeklyDigest(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/25 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </main>
  );
};
