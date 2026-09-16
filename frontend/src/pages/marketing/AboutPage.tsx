import { ShieldCheck, Target, Users2, Sparkles, CheckCircle2, ArrowRight, Code2, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from '../../components/AnimatedCounter';

export const AboutPage = () => {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Zero Scraping, Zero Risk',
      description: 'We believe creators should never have to risk account penalties. We built AutoPost on official REST API protocols with full OAuth 2.0 consent.'
    },
    {
      icon: Target,
      title: 'Consistency Without Burnout',
      description: 'The LinkedIn algorithm rewards daily consistency, but human beings have life, travel, and meetings. We solve the execution gap with autonomous scheduling.'
    },
    {
      icon: Users2,
      title: 'Privacy & Data Sovereignty',
      description: 'We do not sell data, read your private DMs, or post without explicit user scheduling. Your content remains 100% yours.'
    }
  ];

  return (
    <div className="bg-white">
      
      {/* Header */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Our Mission & Story</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            Building the Purest <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Publishing Engine</span> for LinkedIn
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            AutoPost was born out of frustration with clunky social media tools that require browser extensions, store passwords insecurely, or post blurry compressed images.
          </p>

          {/* Animated Milestone Counters */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Posts Dispatched</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-600">
                <AnimatedCounter end={12500} suffix="+" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Active Creators</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Official REST API</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-600">
                <AnimatedCounter end={99.98} decimals={2} suffix="%" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Daemon Uptime</p>
            </div>
          </div>

          {/* Orangish Hero Showcase Image */}
          <div className="pt-8 max-w-4xl mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border-2 border-orange-200/80 bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-orange-400/30">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
                alt="AutoPost Engineering & Design Team"
                className="w-full h-72 sm:h-96 object-cover mix-blend-multiply opacity-95 filter brightness-105 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-orange-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left text-white">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-orange-500/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" /> Engineered For Reliability
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/50 text-orange-300 font-medium text-xs backdrop-blur-sm flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-orange-400" /> Serving creators in 40+ countries
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  A passionate team obsessive about creator workflows
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/90 max-w-xl mt-1">
                  We write reliable backend systems so you can focus on writing your best content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-6 space-y-5">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Why We Started AutoPost
            </h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                In 2026, building a personal brand on LinkedIn is the highest-leverage growth activity for founders, engineers, and executives. But maintaining a regular schedule while managing product development and sales is exhausting.
              </p>
              <p>
                Existing tools either charged \$99/mo for unnecessary enterprise bloat or relied on fragile Chrome extensions that stop working the moment your computer sleeps.
              </p>
              <p>
                We engineered AutoPost as a decoupled, server-side publisher: a lightning-fast composer on the frontend, and a high-reliability background worker on the backend that handles retries, media uploads, and delivery straight to LinkedIn.
              </p>
            </div>
          </div>

          <div className="md:col-span-6 bg-gradient-to-tr from-orange-500 to-amber-400 p-1 rounded-3xl shadow-xl shadow-orange-500/20">
            <div className="bg-white rounded-[22px] p-8 space-y-6">
              <h3 className="text-xl font-bold text-gray-900">What We Stand For</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 font-medium">100% official LinkedIn Developer REST endpoints</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 font-medium">Zero browser extensions required</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 font-medium">Row Level Security in PostgreSQL protects your data</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 font-medium">Automatic 3x retry on network failures</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gray-50/70 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Our Core Principles</h2>
            <p className="text-sm text-gray-600">The tenets that guide how we engineer AutoPost every day.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Join hundreds of creators building on LinkedIn
          </h2>
          <p className="text-sm text-gray-600">
            Sign up today and start scheduling your posts in minutes.
          </p>
          <div className="pt-2">
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black text-orange-700 bg-white hover:bg-orange-50 shadow-2xl transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
