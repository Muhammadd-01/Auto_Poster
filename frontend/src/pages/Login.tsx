import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { 
  Send, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Link as LinkIcon
} from 'lucide-react';

export const Login = () => {
  const { user, signInWithDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setIsRateLimited(false);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match. Please try again.');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || 'LinkedIn Creator',
            },
          },
        });

        if (signUpError) {
          if (
            signUpError.message?.toLowerCase().includes('rate limit') ||
            (signUpError as any).code === 'over_email_send_rate_limit'
          ) {
            setIsRateLimited(true);
            throw new Error(
              'Supabase free email confirmation limit reached (3 per hour on default SMTP). Use Instant Demo Mode below or sign in with an existing account.'
            );
          }
          throw signUpError;
        }

        if (data?.session) {
          // Auto-logged in!
          setSuccessMsg('Account created successfully! Redirecting...');
        } else if (data?.user && !data?.session) {
          setSuccessMsg(
            'Account registered! If confirmation is enabled, check your inbox, or click "Instant Test Mode" below to explore right away.'
          );
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          throw signInError;
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-amber-50/40 flex flex-col justify-center relative overflow-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-400/15 rounded-full blur-3xl pointer-events-none translate-y-1/3"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>

      {/* Top Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
            <Send className="w-5 h-5 -rotate-45" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
          </span>
        </Link>
        <div className="flex items-center space-x-3 text-sm">
          <span className="text-gray-500 hidden sm:inline">Ready to post directly to LinkedIn?</span>
          <button
            onClick={signInWithDemo}
            className="px-4 py-2 rounded-xl text-xs font-bold text-orange-700 bg-orange-100/80 hover:bg-orange-200/80 border border-orange-300/60 shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
            <span>1-Click Test Access</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Card / Showcase (5 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-800 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              <span>Direct LinkedIn API Publisher</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
              Your LinkedIn. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
                On Autopilot.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-lg">
              Upload your captions and media, set your schedule, and let our idempotent server-side worker deliver your posts directly to LinkedIn.
            </p>

            {/* Live Interactive Post Mockup */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-5 shadow-xl shadow-orange-950/5 border border-orange-100 relative group transition-all hover:shadow-2xl hover:border-orange-200">
              <div className="flex items-start space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  alt="Avatar"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">Alex Vance</h4>
                    <span className="flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                      <Clock className="w-3 h-3 mr-1 text-orange-500" /> Scheduled
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">Founder & LinkedIn Top Voice • 24k followers</p>
                  <p className="text-xs text-gray-400">Scheduled for Today at 5:30 PM (Asia/Karachi)</p>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-800 leading-relaxed font-normal bg-orange-50/40 p-3 rounded-xl border border-orange-100/60">
                “Consistency on LinkedIn isn’t about grinding 24/7. It’s about building automated delivery systems that run while you sleep. 🚀 #LinkedInGrowth #Productivity”
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center text-green-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Idempotent Worker Ready
                </span>
                <span className="flex items-center text-orange-600 font-semibold">
                  <LinkIcon className="w-3.5 h-3.5 mr-1 fill-orange-600" /> Direct REST API
                </span>
              </div>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
                <ShieldCheck className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>Zero 3rd-party middlemen</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span>Supabase RLS Multi-Tenant</span>
              </div>
            </div>
          </div>

          {/* Right Auth Box (6 cols) */}
          <div className="lg:col-span-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-orange-950/10 border border-orange-100/80 relative">
              
              {/* Tabs Switcher */}
              <div className="flex p-1.5 rounded-2xl bg-orange-50/80 border border-orange-200/50 mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    !isSignUp
                      ? 'bg-white text-gray-900 shadow-md shadow-orange-950/5'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 ${
                    isSignUp
                      ? 'bg-white text-gray-900 shadow-md shadow-orange-950/5'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Status Notifications */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start space-x-2.5 animate-fade-in">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{error}</p>
                    {isRateLimited && (
                      <p className="mt-2 text-xs text-red-600 font-normal">
                        Tip: Supabase's default email provider throttles confirmations on free accounts. Click the orange <strong>"1-Click Instant Demo"</strong> button below to log in and use every feature right away!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800 flex items-start space-x-2.5 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="font-medium">{successMsg}</p>
                </div>
              )}

              {/* The Form */}
              <form onSubmit={handleAuth} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    {!isSignUp && (
                      <span className="text-xs text-orange-600 hover:text-orange-700 font-semibold cursor-pointer">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-gray-50/60 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-600/30 hover:shadow-orange-600/40 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <span>{isSignUp ? 'Create AutoPost Account' : 'Sign In to Dashboard'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative px-3 bg-white text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Or test immediately
                </span>
              </div>

              {/* Instant Test Mode Button */}
              <button
                type="button"
                onClick={signInWithDemo}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-orange-950 bg-gradient-to-r from-orange-100 via-amber-100 to-orange-100 hover:from-orange-200 hover:to-amber-200 border border-orange-300/80 shadow-sm transition-all flex items-center justify-center space-x-2 group"
              >
                <Zap className="w-4 h-4 text-orange-600 fill-orange-500 group-hover:scale-110 transition-transform" />
                <span>Instant Demo / Test Access (Bypass Email Limit)</span>
              </button>

              <p className="mt-5 text-center text-xs text-gray-500">
                Connected to Supabase project <code className="text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded font-mono">gxtjfzzp...</code>
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
