import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  Image as ImageIcon, 
  Clock, 
  ShieldCheck, 
  Database, 
  Sparkles,
  Link as LinkIcon,
  Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-lg border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              <Send className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-bold text-gray-600">
            <a href="#how-it-works" className="hover:text-orange-600 transition-colors">How It Works</a>
            <a href="#features" className="hover:text-orange-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-orange-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-orange-600 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-white">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-orange-300/20 via-amber-300/20 to-transparent blur-3xl pointer-events-none rounded-full"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto px-6 text-center space-y-8"
        >
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Direct LinkedIn REST API Integration • Zero Third-Party Middlemen</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-gray-900 tracking-tight leading-[1.08]">
            Your LinkedIn. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">
              On Autopilot.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Upload your own content, schedule your posts, and let our reliable background worker publish them automatically. No AI fluff. No third-party bloat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-xl shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-gray-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/70 transition-all flex items-center justify-center space-x-2"
            >
              <span>See How It Works</span>
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-500">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>Direct LinkedIn API</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-orange-600" />
              <span>Independent Server-Side Worker</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-orange-600" />
              <span>Supabase RLS Multi-Tenant</span>
            </div>
          </div>

        </motion.div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Pure Simplicity</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Connect → Create → Upload → Schedule
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Designed from the ground up for busy founders, creators, and operators who need consistency without spending hours inside bloated social media suites.
            </p>
          </div>

          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, amount: 0.2 }} 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              {
                step: '01',
                title: 'Connect Account',
                desc: 'Authenticate directly with LinkedIn OAuth. We encrypt access tokens at rest.',
                icon: LinkIcon,
              },
              {
                step: '02',
                title: 'Compose Post',
                desc: 'Write plain text, emojis, and hashtags with live character counters.',
                icon: Send,
              },
              {
                step: '03',
                title: 'Upload Media',
                desc: 'Attach your PNG, JPG, or MP4 video files directly to Supabase storage.',
                icon: ImageIcon,
              },
              {
                step: '04',
                title: 'Autopilot Delivery',
                desc: 'Our Node.js worker triggers at the exact minute even if your laptop is closed.',
                icon: Clock,
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div 
                  variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                  key={card.step} 
                  className="bg-orange-50/50 rounded-3xl p-8 border border-orange-100 relative group hover:bg-orange-50 hover:shadow-lg transition-all"
                >
                  <span className="text-4xl font-black text-orange-200 group-hover:text-orange-300 transition-colors">
                    {card.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-white text-orange-600 flex items-center justify-center my-4 shadow-sm border border-orange-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h4>
                  <p className="text-xs leading-relaxed text-gray-500">{card.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 3. FEATURES */}
      <section id="features" className="py-24 bg-gradient-to-b from-orange-50/30 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Enterprise Reliability</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Engineered to Never Miss a Post
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Unlike browser extensions that fail when your tab closes, AutoPost runs on dedicated server-side architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Background Worker</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Persistent server polling that monitors schedules every 60 seconds. Posts go live whether you are sleeping or offline.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Idempotency & Anti-Duplicate</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Row-locking state machines ensure posts are marked as PROCESSING before dispatching to LinkedIn, preventing double posts.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Media Asset Library</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Upload once and reuse your high-performing banners and videos across multiple campaign posts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRICING */}
      <section id="pricing" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Predictable Plans</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Simple, Transparent Pricing
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Start free today, scale as your audience grows.
            </p>
          </div>

          <motion.div 
            initial="hidden" 
            whileInView="show" 
            viewport={{ once: true, amount: 0.2 }} 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center"
          >
            
            {/* Free */}
            <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Free</h4>
                <p className="text-xs text-gray-500 mt-1">Perfect for solo creators starting out</p>
                <div className="text-4xl font-black text-gray-900 mt-4">$0</div>
              </div>
              <ul className="space-y-3 text-xs text-gray-600 font-medium">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> 1 LinkedIn Account</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> 15 Scheduled Posts / mo</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> 500 MB Media Storage</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Live Feed Simulator</li>
              </ul>
              <Link to="/login" className="block text-center py-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors">
                Get Started Free
              </Link>
            </motion.div>

            {/* Pro (Highlighted) */}
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="bg-gradient-to-b from-orange-600 to-amber-600 rounded-3xl p-8 text-white shadow-2xl shadow-orange-600/25 space-y-6 md:-translate-y-2 relative">
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Pro Creator</h4>
                <p className="text-xs text-orange-100 mt-1">For serious founders and operators</p>
                <div className="text-4xl font-black text-white mt-4">$19<span className="text-sm font-semibold text-orange-200">/mo</span></div>
              </div>
              <ul className="space-y-3 text-xs text-orange-50 font-medium">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-white mr-2" /> Unlimited Scheduled Posts</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-white mr-2" /> 10 GB Media Storage</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-white mr-2" /> High-Priority Worker Queue</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-white mr-2" /> Video Publishing Support</li>
              </ul>
              <Link to="/login" className="block text-center py-3.5 rounded-xl text-xs font-bold bg-white text-orange-700 hover:bg-orange-50 shadow-md transition-colors">
                Start 14-Day Free Trial
              </Link>
            </motion.div>

            {/* Agency */}
            <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm space-y-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Agency / Team</h4>
                <p className="text-xs text-gray-500 mt-1">Multi-account and company page support</p>
                <div className="text-4xl font-black text-gray-900 mt-4">$49<span className="text-sm font-semibold text-gray-500">/mo</span></div>
              </div>
              <ul className="space-y-3 text-xs text-gray-600 font-medium">
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Multiple LinkedIn Accounts</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> 50 GB Media Storage</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Team Workspaces & Roles</li>
                <li className="flex items-center"><CheckCircle2 className="w-4 h-4 text-green-500 mr-2" /> Dedicated API Support</li>
              </ul>
              <Link to="/login" className="block text-center py-3 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-900 transition-colors">
                Contact Sales
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="py-24 bg-orange-50/40">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-orange-600">Answers</h2>
            <h3 className="text-3xl font-black text-gray-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Does AutoPost use AI to rewrite my posts?',
                a: 'No. We strictly believe your content is your own. We do not generate, modify, or rewrite your text or media. We are a reliable publishing pipeline.',
              },
              {
                q: 'Do you use Buffer, Zapier, or Make behind the scenes?',
                a: 'Never. AutoPost connects directly to LinkedIn via official developer OAuth and REST endpoints, ensuring zero third-party platform dependencies.',
              },
              {
                q: 'Will my posts publish if my computer is off?',
                a: 'Yes. Our server-side Node.js worker polls schedules every 60 seconds independently of your browser.',
              },
              {
                q: 'Is my data isolated from other users?',
                a: 'Completely. Supabase Row Level Security (RLS) guarantees complete cryptographic and database isolation between tenants.',
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm space-y-2">
                <h4 className="text-sm font-bold text-gray-900">{faq.q}</h4>
                <p className="text-xs leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-center">
        <div className="max-w-3xl mx-auto px-6 space-y-6">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
            Ready to Put Your LinkedIn on Autopilot?
          </h2>
          <p className="text-orange-100 text-base">
            Create your account in 30 seconds and start scheduling your content today.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl text-base font-bold bg-white text-orange-700 hover:bg-orange-50 shadow-xl transition-all"
          >
            <span>Get Started Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-gray-950 text-gray-400 py-12 text-xs border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white">
              <Send className="w-4 h-4 -rotate-45" />
            </div>
            <span className="text-base font-bold text-white">AutoPost</span>
            <span>© {new Date().getFullYear()} AutoPost. All rights reserved.</span>
          </div>
          <div className="flex space-x-6">
            <Link to="/login" className="hover:text-white">Privacy Policy</Link>
            <Link to="/login" className="hover:text-white">Terms of Service</Link>
            <Link to="/login" className="hover:text-white">Direct LinkedIn API</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};
