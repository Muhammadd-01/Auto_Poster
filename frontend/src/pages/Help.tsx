import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Zap, 
  Sparkles, 
  FileSpreadsheet, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  Send, 
  Award
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  badge?: string;
}

const FAQS: FAQItem[] = [
  {
    id: 'first-comment-hack',
    category: 'Algorithm & Strategy',
    badge: 'High Impact',
    question: 'Why does AutoPost automatically schedule links in the First Comment?',
    answer: 'LinkedIn’s algorithm intentionally reduces organic distribution (by an estimated 40–60%) for posts containing outbound hyperlinks in the main caption, because the platform prefers keeping users on LinkedIn. By putting your blog, newsletter, or product link in the automated First Comment, you retain 100% of your organic feed reach while still driving conversions.'
  },
  {
    id: 'unicode-formatting',
    category: 'Composer & Styler',
    badge: 'Creator Tool',
    question: 'How does the Unicode Text Styler format Bold and Italic text?',
    answer: 'LinkedIn’s native post editor only supports plain unformatted text. AutoPost uses client-side Mathematical Alphanumeric Unicode character mapping. When you select text and click Bold, Italic, or Monospace, your text is mathematically converted into native Unicode glyphs that render identically across all desktop browsers, Android, and iOS LinkedIn apps without needing external websites like YayText.'
  },
  {
    id: 'see-more-fold',
    category: 'Algorithm & Strategy',
    question: 'What is the "See More" fold threshold and why does it matter?',
    answer: 'On desktop feeds, LinkedIn truncates posts after approximately 210 characters (about 3 lines). On mobile devices, it truncates after ~140 characters. If your opening hook does not capture attention before this fold, users will scroll past without clicking "...see more". AutoPost provides a real-time Fold Indicator and simulator so you can test your opening lines before hitting schedule.'
  },
  {
    id: 'bulk-import-format',
    category: 'Automation',
    badge: 'Productivity',
    question: 'How do I format a CSV file for Bulk Importing?',
    answer: 'Your CSV should contain columns: "Caption", "Optional First Comment", "Optional Date/Time". If you do not specify dates, AutoPost’s Smart Cadence scheduler automatically distributes the posts across future weekdays (Monday–Friday) or every single day at your default preferred posting time (e.g. 10:00 AM).'
  },
  {
    id: 'evergreen-recycler',
    category: 'Automation',
    question: 'How often is it safe to recycle evergreen posts?',
    answer: 'Top creators recommend recycling high-performing evergreen content every 60 to 90 days. Because LinkedIn feeds move rapidly and your network continuously gains new followers, roughly 85% of your audience will have never seen your original post. Our 1-Click Evergreen Recycler defaults to a +90 Days schedule for maximum safety and organic engagement.'
  },
  {
    id: 'linkedin-oauth-security',
    category: 'Account & Security',
    question: 'How does LinkedIn authorization work and are my credentials safe?',
    answer: 'AutoPost integrates directly through official LinkedIn OAuth 2.0 with the standard "w_member_social" and "openid" scopes. Your LinkedIn password is never seen or stored on our servers. Access tokens are stored securely in Supabase and only used by the automated posting worker when your scheduled time arrives.'
  },
  {
    id: 'client-review-portal',
    category: 'Collaboration',
    question: 'How do clients review posts without creating an account?',
    answer: 'In the Calendar tab, click "Client Review" to open the distraction-free presentation feed. You can copy the shareable review link and send it directly to your client or marketing team. They can view authentic LinkedIn card simulators for every queued post and click "Mark as Approved".'
  },
  {
    id: 'media-guidelines',
    category: 'Composer & Styler',
    question: 'What media formats and dimensions are supported?',
    answer: 'AutoPost supports standard image formats (JPEG, PNG, WebP) and video formats (MP4, MOV). Recommended image ratios are 1:1 (square 1200x1200px) or 4:5 (portrait 1080x1350px) for maximum vertical screen real estate on mobile feeds. Maximum file size is 50MB.'
  }
];

const GUIDES = [
  {
    id: 'guide-getting-started',
    title: '5-Minute Quickstart Guide',
    icon: Sparkles,
    color: 'from-orange-500 to-amber-500',
    description: 'Connect your account, write your first formatted post, and schedule your pipeline.',
    steps: [
      'Go to the Accounts tab and click "Connect with LinkedIn". Authorize the official OAuth connection.',
      'Navigate to Settings to verify your local timezone and preferred morning posting slot (e.g. 10:00 AM).',
      'Open the Composer. Choose a content pillar (Educational, Story, Proof, or Promo).',
      'Type your post or pick a blueprint from the Viral Hook Library. Highlight text to apply Bold or Italic Unicode styling.',
      'Add your outbound link or newsletter CTA in the First Comment box to protect your algorithmic reach.',
      'Check your Hook Scorecard score (target: >80) and click "Confirm Schedule".'
    ]
  },
  {
    id: 'guide-bulk-automation',
    title: 'Mastering Bulk CSV Scheduling',
    icon: FileSpreadsheet,
    color: 'from-blue-600 to-indigo-600',
    description: 'How to plan, batch, and queue 30 days of high-converting content in 10 minutes.',
    steps: [
      'Open the Calendar page and click "Bulk Import (CSV)".',
      'Select your schedule cadence: "Every Weekday (Mon–Fri)" or "Every Single Day".',
      'Set your target daily posting hour (recommended: 09:00 AM – 10:30 AM in your target audience’s timezone).',
      'Paste your content rows or upload a CSV file with captions and optional first-comment links.',
      'Review the parsed list in the preview step and remove any drafts that need more editing.',
      'Click "Schedule All" to queue all posts into the database at once.'
    ]
  },
  {
    id: 'guide-algorithm-secrets',
    title: 'The LinkedIn Algorithm Playbook',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    description: 'Learn the exact rules top creators follow to achieve 3x to 5x higher post engagement.',
    steps: [
      'The 3-Line Hook Rule: Always ensure your opening 210 characters present a clear intrigue, counter-intuitive insight, or number before the fold.',
      'Paragraph Spacing: Never post walls of text. Leave an empty line between your hook and body.',
      'Never put external links in the caption: Always use AutoPost’s Automated First Comment scheduler for links.',
      'Close with a Question: Posts that end with an opinion prompt or "What do you think?" receive 4x more comments, signaling high relevance to the feed algorithm.',
      'Maintain 3–4 posts per week consistency: The algorithm favors steady, predictable cadence over erratic bursts.'
    ]
  }
];

export const Help = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedFaq, setExpandedFaq] = useState<string | null>('first-comment-hack');
  const [activeGuide, setActiveGuide] = useState<string>('guide-getting-started');

  // Support form state
  const [supportTopic, setSupportTopic] = useState('Feature Question');
  const [supportMessage, setSupportMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = ['All', 'Algorithm & Strategy', 'Composer & Styler', 'Automation', 'Account & Security', 'Collaboration'];

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(faq => {
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      const matchesSearch = 
        !searchQuery ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaq(prev => (prev === id ? null : id));
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) {
      toast.warning('Empty Message', 'Please describe your question or issue.');
      return;
    }

    setSubmittingTicket(true);
    setTimeout(() => {
      setSubmittingTicket(false);
      setSupportMessage('');
      toast.success(
        'Inquiry Sent!', 
        'Our support team will respond to your registered email within 24 hours.'
      );
    }, 800);
  };

  return (
    <div className="w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10 pb-20">
        
        {/* Header & Hero Search */}
        <div className="relative rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-8 sm:p-12 text-white shadow-xl shadow-orange-900/10 overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Knowledge Base & Support</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              How can we help you create & grow today?
            </h1>

            <p className="text-sm sm:text-base text-orange-100 font-medium leading-relaxed">
              Explore step-by-step guides, LinkedIn algorithm blueprints, formatting tutorials, and answers to common creator questions.
            </p>

            {/* Live Search Input */}
            <div className="pt-2">
              <div className="relative max-w-xl">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles (e.g. 'first comment', 'CSV import', 'hook score', 'bold font')..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white text-gray-900 placeholder-gray-400 rounded-2xl text-xs sm:text-sm font-semibold shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4 Quick Link Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Link
            to="/create"
            className="p-5 rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-start space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                Viral Hook Library
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">20+ proven frameworks with 1-click insertion.</p>
            </div>
          </Link>

          <Link
            to="/schedule"
            className="p-5 rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-start space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Bulk CSV Importer
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Queue weeks of content with automatic cadence.</p>
            </div>
          </Link>

          <Link
            to="/analytics"
            className="p-5 rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-start space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                Algorithm Analytics
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Monitor consistency heatmaps & pillar balance.</p>
            </div>
          </Link>

          <Link
            to="/settings"
            className="p-5 rounded-2xl bg-white border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-start space-x-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                OAuth & Settings
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">Verify tokens, timezone, and delivery alerts.</p>
            </div>
          </Link>

        </div>

        {/* Interactive Masterclass Guides Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-5">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Featured Walkthroughs</span>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Creator Masterclass Guides
              </h2>
            </div>

            {/* Guide Switcher Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
              {GUIDES.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGuide(g.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeGuide === g.id
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {g.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Guide Content */}
          {(() => {
            const current = GUIDES.find(g => g.id === activeGuide) || GUIDES[0];
            const Icon = current.icon;
            return (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-start space-x-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${current.color} text-white flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{current.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{current.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {current.steps.map((step, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-start space-x-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-medium text-gray-700 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Frequently Asked Questions (Accordion + Filter) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">
                Frequently Asked Questions
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Everything you need to know about the LinkedIn algorithm, scheduling, and formatting.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white shadow-2xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map(faq => {
              const isOpen = expandedFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOpen ? 'border-orange-300 shadow-md' : 'border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left gap-4"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <span className="text-sm font-bold text-gray-900 leading-snug">
                        {faq.question}
                      </span>
                      {faq.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 flex-shrink-0">
                          {faq.badge}
                        </span>
                      )}
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="p-12 bg-white rounded-3xl border border-gray-200 text-center space-y-2">
                <Search className="w-8 h-8 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-gray-800">No matching articles found</h4>
                <p className="text-xs text-gray-500">Try searching for different keywords or reset your category filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* 2-Column Footer Section: Contact Support + System Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Platform Support Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-5">
            <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Need Dedicated Help?</h3>
                <p className="text-xs text-gray-500">Send an inquiry directly to the platform engineering team</p>
              </div>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Topic or Category
                </label>
                <select
                  value={supportTopic}
                  onChange={(e) => setSupportTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Feature Question">Feature Question / How-To</option>
                  <option value="LinkedIn Connection">LinkedIn API & OAuth Connection</option>
                  <option value="Bulk Import">Bulk CSV Import Issue</option>
                  <option value="Billing & Plans">Account & Pricing</option>
                  <option value="Feedback / Feature Request">Feature Request</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Your Question or Feedback
                </label>
                <textarea
                  rows={4}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  placeholder="Describe what you are looking for or any error details you encountered..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-400">
                  Signed in as <strong>{user?.email || 'Creator'}</strong>
                </span>

                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-600/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingTicket ? 'Submitting...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Architecture & Live Engine Specs (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* System Status Card */}
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-xl shadow-orange-950/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Platform Status
                </span>
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>All Engines Operational</span>
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Background Cron Poller</span>
                  <span className="font-mono font-bold text-gray-900">Active (60s cycle)</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">LinkedIn OAuth API</span>
                  <span className="font-mono font-bold text-green-600">Connected (v2 REST)</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-600">Unicode Styler Engine</span>
                  <span className="font-mono font-bold text-orange-600">Client-side (0 latency)</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-600">Database & Media Store</span>
                  <span className="font-mono font-bold text-blue-600">Supabase Cloud</span>
                </div>
              </div>
            </div>

            {/* Quick Tips Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 space-y-2">
              <h4 className="text-xs font-bold text-orange-950 flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-orange-600" />
                <span>Did You Know?</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Posts published with high Hook Quality scores (&gt;80) and links kept in the First Comment receive an average of <strong>2.8x more profile clicks</strong> than standard posts.
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};
