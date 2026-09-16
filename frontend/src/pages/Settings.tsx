import { 
  Settings as SettingsIcon, 
  Link as LinkIcon, 
  Key, 
  ShieldCheck, 
  BookOpen,
  ArrowUpRight
} from 'lucide-react';

export const Settings = () => {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-gray-400" />
          <span>Platform Settings</span>
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Configure your social accounts, API keys, and notification preferences.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-8">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0077b5] flex items-center justify-center shadow-md">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">LinkedIn Developer Setup</h2>
              <p className="text-xs text-gray-500">Connect your platform to LinkedIn's Official API</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-widest border border-amber-200">
            Manual Configuration
          </span>
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
            <BookOpen className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900">How to get your LinkedIn API Keys</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                To post on behalf of yourself or your users, you need to create an app in the LinkedIn Developer portal and get your Client ID and Client Secret.
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-xs text-gray-700 font-medium mt-3 ml-1">
                <li>Go to the <a href="https://developer.linkedin.com" target="_blank" rel="noreferrer" className="text-orange-600 hover:underline inline-flex items-center">LinkedIn Developer Portal <ArrowUpRight className="w-3 h-3 ml-0.5"/></a></li>
                <li>Click <strong>Create App</strong> and fill in your app details.</li>
                <li>Go to the <strong>Auth</strong> tab to find your <code className="bg-gray-100 px-1 py-0.5 rounded">Client ID</code> and <code className="bg-gray-100 px-1 py-0.5 rounded">Client Secret</code>.</li>
                <li>Go to the <strong>Products</strong> tab and request access to <strong>Share on LinkedIn</strong> and <strong>Sign In with LinkedIn using OpenID Connect</strong>.</li>
                <li>Add your Supabase redirect URI in the Auth tab: <code className="bg-orange-100/80 px-1.5 py-0.5 rounded text-orange-800 border border-orange-200 block mt-1.5 break-all">https://gxtjfzzpannkzlyiaivu.supabase.co/auth/v1/callback</code></li>
              </ol>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center">
              <Key className="w-4 h-4 mr-2 text-gray-400" />
              API Credentials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Client ID
                </label>
                <input
                  type="text"
                  disabled
                  placeholder="Paste LinkedIn Client ID here"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 opacity-70 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Client Secret
                </label>
                <input
                  type="password"
                  disabled
                  placeholder="Paste LinkedIn Client Secret here"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                For security, API keys should be configured directly in your Supabase Dashboard under <strong>Authentication &gt; Providers &gt; LinkedIn</strong> rather than stored in plain text here.
              </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};
