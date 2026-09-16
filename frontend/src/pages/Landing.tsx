import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Send, 
  Clock, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  Play, 
  Repeat2, 
  ThumbsUp, 
  MessageSquare, 
  Zap, 
  Check, 
  X, 
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../components/AnimatedCounter';

export const Landing = () => {
  // Simulator State
  const samplePosts = [
    {
      type: 'Founder Milestone',
      text: 'We just crossed our first 10,000 active users! 🎉\n\nHere are 3 unconventional lessons on organic distribution that made all the difference without spending a single dollar on ads 🧵👇',
      tag: '#BuildingInPublic #Growth',
      likes: 542,
      comments: 89,
      media: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800'
    },
    {
      type: 'Engineering Insight',
      text: 'Why we ditched browser extension scrapers for official LinkedIn REST APIs:\n\n1. Zero risk of account shadowbans\n2. 99.98% background worker reliability\n3. High-res video & image support without compression glitches.',
      tag: '#SoftwareEngineering #Tech',
      likes: 812,
      comments: 134,
      media: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800'
    },
    {
      type: 'Product Launch',
      text: 'Introducing AutoPost 2.0: The direct API autopilot engine for creators, founders & modern marketing teams. Schedule in your timezone, sleep peacefully, and watch your engagement grow.',
      tag: '#SaaS #Productivity',
      likes: 1240,
      comments: 215,
      media: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
    }
  ];

  const [activeTemplate, setActiveTemplate] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [sendStep, setSendStep] = useState(0);
  const [isSent, setIsSent] = useState(false);

  // ROI Calculator State
  const [postsPerWeek, setPostsPerWeek] = useState(5);

  const hoursSavedPerMonth = Math.round(postsPerWeek * 3.5);
  const reachBoost = (postsPerWeek * 0.7 + 1.8).toFixed(1);
  const dollarValueSaved = postsPerWeek * 85;

  const handleSimulateSend = () => {
    if (isSending) return;
    setIsSending(true);
    setIsSent(false);
    setSendStep(1);

    setTimeout(() => setSendStep(2), 700);
    setTimeout(() => setSendStep(3), 1400);
    setTimeout(() => {
      setSendStep(4);
      setIsSending(false);
      setIsSent(true);
    }, 2100);
  };

  return (
    <div className="bg-white text-gray-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-orange-300/25 via-amber-300/25 to-transparent blur-3xl pointer-events-none rounded-full"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100/90 border border-orange-200 text-orange-800 text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600 animate-spin" />
            <span>Direct LinkedIn REST API Integration • Zero 3rd-Party Middlemen</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight leading-[1.05]"
          >
            Your LinkedIn. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
              On True Autopilot.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Write once, attach high-res images or videos, pick your audience’s timezone, and let our 24/7 background worker deliver posts straight to the official LinkedIn feed.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#interactive-demo"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-gray-700 bg-white hover:bg-orange-50 border border-orange-200/80 shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <span>Try Live Simulator</span>
              <Play className="w-4 h-4 text-orange-600 fill-orange-600" />
            </a>
          </motion.div>

          {/* Feature Micro-Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-500">
            <div className="flex items-center space-x-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200/60 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>100% LinkedIn TOS Compliant</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200/60 shadow-xs">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>Independent 60s Server Worker</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-white/80 px-3 py-1.5 rounded-full border border-gray-200/60 shadow-xs">
              <Database className="w-4 h-4 text-blue-600" />
              <span>Supabase Multi-Tenant RLS</span>
            </div>
          </div>

          {/* Hero Showcase Image in Orangish Theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative pt-6 max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl p-2 sm:p-3 bg-gradient-to-tr from-orange-500/30 via-amber-400/20 to-orange-600/30 backdrop-blur-xl border border-orange-300/40 shadow-2xl shadow-orange-950/15">
              <div className="overflow-hidden rounded-2xl relative group">
                <img
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=1600"
                  alt="AutoPost LinkedIn Dashboard"
                  className="w-full h-64 sm:h-96 md:h-[420px] object-cover filter contrast-105 saturate-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-orange-950/20"></div>

                {/* Floating Orangish Badges */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-orange-200/80 shadow-lg flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-900">Direct LinkedIn v2 REST Active</span>
                </div>

                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4 sm:right-auto max-w-md p-4 rounded-2xl bg-gray-900/90 backdrop-blur-md border border-orange-500/40 text-left text-white shadow-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Scheduled Post Delivered</span>
                    <span className="text-[10px] text-gray-400">9:00 AM EST</span>
                  </div>
                  <p className="text-xs font-medium text-gray-200 line-clamp-1">
                    “Consistency on LinkedIn isn’t about grinding 24/7. It’s about automated systems...”
                  </p>
                  <p className="text-[11px] text-green-400 font-bold flex items-center pt-0.5">
                    <Check className="w-3 h-3 mr-1" /> Published to LinkedIn with 0% compression loss
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. STATS BANNER WITH COUNTING ANIMATION */}
      <section className="py-10 bg-gray-950 text-white border-t border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-orange-400">
                <AnimatedCounter end={4.8} decimals={1} suffix="M+" />
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Impressions Powered</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-white">
                <AnimatedCounter end={99.98} decimals={2} suffix="%" />
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Publishing Accuracy</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-orange-400">
                <AnimatedCounter end={18500} suffix="+" />
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Posts Dispatched</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-5xl font-black text-green-400">
                <AnimatedCounter end={0} prefix="" suffix="" />
              </div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account Bans (Pure API)</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PUBLISHING SIMULATOR */}
      <section id="interactive-demo" className="py-24 bg-gradient-to-b from-white via-orange-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
              <span>Interactive Live Demo</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">
              Test Our Real-Time <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Dispatch Engine</span>
            </h2>
            <p className="text-base text-gray-600">
              Pick a viral post template below and click <strong>Simulate Dispatch</strong> to watch the background engine execute token verification and deliver the post in real-time.
            </p>
          </div>

          {/* Template Selector Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {samplePosts.map((post, idx) => (
              <button
                key={post.type}
                onClick={() => {
                  setActiveTemplate(idx);
                  setIsSent(false);
                  setSendStep(0);
                }}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs ${
                  activeTemplate === idx
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 scale-105'
                    : 'bg-white text-gray-700 hover:bg-orange-50 border border-gray-200'
                }`}
              >
                {post.type}
              </button>
            ))}
          </div>

          {/* Interactive Split Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Left: Composer Controls (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-orange-200/80 shadow-xl shadow-orange-950/5 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-xs font-mono font-bold text-gray-400 ml-2">AutoPost Composer v2.0</span>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                  API Connected
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Post Draft</label>
                <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-800 font-medium leading-relaxed min-h-[120px] whitespace-pre-wrap border border-gray-200/60">
                  {samplePosts[activeTemplate].text}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 bg-orange-50/60 p-3 rounded-xl border border-orange-100">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="font-semibold text-gray-700">Scheduled for Today at 5:00 PM</span>
                </div>
                <span className="font-mono text-gray-600">Asia/Karachi</span>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSimulateSend}
                disabled={isSending}
                className="w-full py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
              >
                <motion.div
                  animate={isSending ? { x: [0, 40, 0], y: [0, -10, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Send className="w-5 h-5 -rotate-45" />
                </motion.div>
                <span>{isSending ? 'Dispatching via Worker...' : isSent ? 'Dispatched Again' : 'Simulate Instant Dispatch'}</span>
              </button>

              {/* Progress Console */}
              {isSending && (
                <div className="p-3 bg-gray-950 text-green-400 rounded-xl font-mono text-xs space-y-1">
                  {sendStep >= 1 && <p>✓ [Worker] Authenticating OAuth token (OpenID)...</p>}
                  {sendStep >= 2 && <p>✓ [Worker] Signed image payload ready...</p>}
                  {sendStep >= 3 && <p>✓ [Worker] POST https://api.linkedin.com/v2/ugcPosts...</p>}
                  {sendStep >= 4 && <p className="text-white font-bold">🎉 Status: 201 Created! Post is live.</p>}
                </div>
              )}
            </div>

            {/* Right: Live Simulated Feed Card (6 cols) */}
            <div className="lg:col-span-6 relative">
              <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xl shadow-gray-300/40 overflow-hidden text-left transition-all">
                
                <div className="bg-gradient-to-r from-[#0077b5] to-[#005f93] text-white px-5 py-2.5 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                    <span>Live LinkedIn Feed Rendering</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">Official REST Preview</span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Author Header */}
                  <div className="flex items-start space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 leading-snug">
                        Sarah Jenkins <span className="text-xs font-normal text-gray-500">• 1st</span>
                      </h4>
                      <p className="text-xs text-gray-500">Tech Founder & LinkedIn Top Voice • 48k Followers</p>
                      <p className="text-[11px] text-gray-400 flex items-center mt-0.5">
                        <span>{isSent ? 'Just now' : 'Scheduled Preview'}</span>
                        <span className="mx-1">•</span>
                        <span>🌐 Public</span>
                      </p>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {samplePosts[activeTemplate].text}
                  </div>

                  {/* Media */}
                  <div className="rounded-2xl overflow-hidden border border-gray-100 relative group">
                    <img
                      src={samplePosts[activeTemplate].media}
                      alt="Post visual"
                      className="w-full h-48 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Simulated Reaction Counts */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px]">👍</span>
                      <span className="font-semibold text-gray-700">{isSent ? samplePosts[activeTemplate].likes + 1 : samplePosts[activeTemplate].likes}</span>
                    </div>
                    <span>{samplePosts[activeTemplate].comments} comments • 24 reposts</span>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-gray-100 grid grid-cols-4 gap-1 text-center text-xs font-bold text-gray-600">
                    <div className="py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center space-x-1 cursor-pointer">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Like</span>
                    </div>
                    <div className="py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center space-x-1 cursor-pointer">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Comment</span>
                    </div>
                    <div className="py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center space-x-1 cursor-pointer">
                      <Repeat2 className="w-3.5 h-3.5" />
                      <span>Repost</span>
                    </div>
                    <div className="py-2 hover:bg-gray-50 rounded-lg flex items-center justify-center space-x-1 cursor-pointer">
                      <Send className="w-3.5 h-3.5 -rotate-45" />
                      <span>Send</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE ROI & TIME SAVED CALCULATOR */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Calculate Your Time & Reach ROI
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Drag the slider to see how automated consistency directly multiplies your LinkedIn audience and saves dozens of hours every month.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-orange-100 shadow-xl shadow-orange-950/5 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Slider Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">How many posts do you schedule per week?</span>
                <span className="px-4 py-1.5 rounded-full bg-orange-500 text-white font-black text-lg">
                  {postsPerWeek} posts/week
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="20"
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                className="w-full h-3 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
              />

              <div className="flex justify-between text-xs font-semibold text-gray-400">
                <span>1 post (Casual)</span>
                <span>5 posts (Daily Creator)</span>
                <span>10+ posts (Power Agency)</span>
              </div>

              <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-100 text-xs text-gray-700 leading-relaxed">
                💡 <strong>Consistency Rule:</strong> LinkedIn’s distribution algorithm rewards accounts that publish 4–7 times per week during 8:00 AM – 10:00 AM in the audience’s local timezone. AutoPost guarantees you never miss that window.
              </div>
            </div>

            {/* Results Column (5 cols) */}
            <div className="lg:col-span-5 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-orange-400">Your Monthly Impact</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                  <span className="text-xs text-gray-300">Time Saved Monthly:</span>
                  <span className="text-2xl font-black text-white">{hoursSavedPerMonth} hours</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                  <span className="text-xs text-gray-300">Estimated Reach Multiplier:</span>
                  <span className="text-2xl font-black text-orange-400">{reachBoost}x</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Agency Cost Saved:</span>
                  <span className="text-2xl font-black text-green-400">\${dollarValueSaved}/mo</span>
                </div>
              </div>

              <Link
                to="/signup"
                className="block text-center w-full py-3.5 rounded-xl font-black text-xs text-gray-900 bg-white hover:bg-orange-50 shadow-md transition-all active:scale-95"
              >
                Claim This Productivity Boost Free →
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. VISUAL COMPARISON: MANUAL VS AUTOPOST */}
      <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            The Old Way vs. The AutoPost Way
          </h2>
          <p className="text-sm text-gray-600">
            See why modern executives and creators refuse to post manually.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Manual Old Way */}
          <div className="bg-red-50/40 rounded-3xl p-8 border border-red-200/80 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                <X className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-gray-900">Manual Posting & Scraper Bots</h3>
            </div>

            <ul className="space-y-4 text-xs text-gray-700">
              <li className="flex items-start space-x-2.5">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>You must stop work at 9:00 AM every day to manually open LinkedIn.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Browser extension bots simulate mouse clicks, triggering bot detection and shadowbans.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Laptop sleeps or reboots while traveling = scheduled post fails completely.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Formatting and preview errors ruin your hook before you realize it.</span>
              </li>
            </ul>
          </div>

          {/* AutoPost New Way */}
          <div className="bg-gradient-to-b from-green-50/50 to-white rounded-3xl p-8 border-2 border-green-500 shadow-xl shadow-green-500/10 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                <Check className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-black text-gray-900">The AutoPost Server Engine</h3>
            </div>

            <ul className="space-y-4 text-xs text-gray-700">
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Queue an entire month of content in 30 minutes on Sunday afternoon.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Official LinkedIn OAuth 2.0 REST endpoints guarantee 100% compliance.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Autonomous cloud cron worker polls every 60s with automatic 3x retries.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Pixel-perfect live feed simulator shows your exact mobile rendering.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 6. CREATOR TESTIMONIALS */}
      <section className="py-20 bg-gray-50 border-t border-gray-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Trusted By Creators, Founders & Growth Agencies
            </h2>
            <p className="text-sm text-gray-600">
              Join thousands of professionals who automated their LinkedIn growth without the headache.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
                  alt="David Chen"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">David Chen</h4>
                  <p className="text-xs text-gray-500">Founder, CloudScale (38k followers)</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                “AutoPost completely removed the mental burden of daily posting. I queue my technical founder logs once a week, and the background worker delivers them flawlessly every morning.”
              </p>
              <div className="text-xs font-bold text-green-600 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+240% Inbound Lead Growth</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120"
                  alt="Elena Rostova"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Elena Rostova</h4>
                  <p className="text-xs text-gray-500">VP Marketing, ScaleSaaS</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                “Other tools compression wrecked our video quality. With AutoPost, our MP4 explainers publish in full crisp resolution with verified OAuth tokens. Couldn’t recommend it more.”
              </p>
              <div className="text-xs font-bold text-green-600 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Saved 14 hours every month</span>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
                  alt="Marcus Brody"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                />
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Marcus Brody</h4>
                  <p className="text-xs text-gray-500">Managing Partner, GhostMedia</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                “We manage executive LinkedIn accounts for 12 seed-stage CEOs. The multi-tenant architecture and timezone picker are essential for targeting European and US audiences simultaneously.”
              </p>
              <div className="text-xs font-bold text-green-600 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>12 Client Accounts Managed</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. FINAL BIG CTA */}
      <section className="py-24 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Stop Posting Manually. <br />Put Your LinkedIn On Autopilot.
          </h2>
          <p className="text-lg text-orange-100 max-w-xl mx-auto">
            Join hundreds of creators who save hours every week and amplify their organic LinkedIn impressions.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black text-orange-700 bg-white hover:bg-orange-50 shadow-2xl transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>Sign Up</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>View Pricing Plans</span>
            </Link>
          </div>
          <p className="text-xs text-orange-200">
            No credit card required • Instant LinkedIn OAuth 2.0 connection • Cancel anytime
          </p>
        </div>
      </section>

    </div>
  );
};
