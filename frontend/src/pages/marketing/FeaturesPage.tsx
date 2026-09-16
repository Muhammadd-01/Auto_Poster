import { motion } from 'framer-motion';
import { 
  Zap, 
  Send, 
  Clock, 
  Database, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from '../../components/AnimatedCounter';

export const FeaturesPage = () => {
  const featureList = [
    {
      icon: Send,
      title: 'Direct LinkedIn REST API Integration',
      description: 'Unlike extension hacks and browser automation scrapers that get your profile shadowbanned, AutoPost talks directly to LinkedIn’s official REST API endpoints using OAuth 2.0 with OpenID Connect.',
      highlight: '100% Safe & TOS Compliant',
      tag: 'Core Engine'
    },
    {
      icon: Clock,
      title: 'Idempotent 60-Second Background Worker',
      description: 'Our server-side cron worker evaluates and queues your posts every 60 seconds with strict database locking to ensure zero duplicate posts, even during network spikes.',
      highlight: 'Zero Duplicate Execution',
      tag: 'Reliability'
    },
    {
      icon: Layers,
      title: 'Smart Timezone Scheduling',
      description: 'Choose your audience’s exact geographical timezone (e.g. Asia/Karachi, America/New_York, Europe/London). We calculate the precise UTC timestamp so your post arrives at peak engagement hours.',
      highlight: 'Global Audience Targeting',
      tag: 'Automation'
    },
    {
      icon: ImageIcon,
      title: 'Multi-Media Cloud Asset Vault',
      description: 'Upload high-resolution images, carousels, and MP4 videos directly to your private Supabase Storage bucket. Assets are generated with signed public URLs on demand for flawless LinkedIn delivery.',
      highlight: 'Images & Video Support',
      tag: 'Media'
    },
    {
      icon: Sparkles,
      title: 'Pixel-Perfect Live Feed Simulator',
      description: 'Preview how your hook, hashtag wrapping, line breaks, and attached media will appear on mobile and desktop LinkedIn feeds before you hit schedule.',
      highlight: 'What You See Is What Posts',
      tag: 'Preview'
    },
    {
      icon: Database,
      title: 'Multi-Tenant PostgreSQL RLS Security',
      description: 'Your tokens, drafts, and media belong strictly to you. Built on top of Supabase PostgreSQL with isolated Row Level Security (RLS) policies enforcing multi-tenant boundaries.',
      highlight: 'Bank-Grade Isolation',
      tag: 'Security'
    }
  ];

  return (
    <div className="bg-white">
      
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
            <span>Built For Serious Creators, Founders & Agencies</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Engineered For Consistent <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">LinkedIn Growth</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover the technical features and developer-grade architecture that power automated LinkedIn publishing with zero friction.
          </p>

          {/* Animated Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={60} suffix="s" />
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Polling Cycle</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={100} suffix="%" />
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">REST API Pure</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={3} suffix="x" />
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Retry Resilience</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
              <div className="text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={4} suffix="K" />
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Media Quality</div>
            </div>
          </div>

          {/* Orangish Hero Showcase Image */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-2 bg-gradient-to-tr from-orange-500/20 via-amber-400/20 to-orange-600/30 border border-orange-200 shadow-xl shadow-orange-950/10">
              <img
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1600"
                alt="Technical Architecture Features"
                className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-2xl filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent rounded-2xl"></div>
              <div className="absolute bottom-6 left-6 text-left text-white max-w-lg space-y-1">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-orange-500 text-white">Full Stack Reliability</span>
                <h4 className="text-lg font-bold">Autonomous Cloud Execution Engine</h4>
                <p className="text-xs text-gray-300">Directly interacts with LinkedIn OpenID Connect & v2 API endpoints without browser dependencies.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Grid of Features */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-orange-100/90 shadow-lg shadow-orange-950/5 hover:shadow-2xl hover:border-orange-300 transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200/60">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-orange-600 space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                  <span>{feature.highlight}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Interactive Tech Architecture Showcase */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Behind the Scenes Architecture
            </h2>
            <p className="text-base text-gray-600">
              How our decoupled stack ensures 99.9% publishing uptime without keeping a browser open.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">1</div>
              <h4 className="font-bold text-lg text-gray-900">React & Vite Frontend</h4>
              <p className="text-xs text-gray-500">Composes rich drafts, provides live feed preview, and captures schedule times in any world timezone.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-black">2</div>
              <h4 className="font-bold text-lg text-gray-900">Node Cron Publisher</h4>
              <p className="text-xs text-gray-500">Autonomous server worker polls every 60s, executes media uploads, and posts to LinkedIn v2 API with 3x retry protection.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-3">
              <div className="w-10 h-10 mx-auto rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-black">3</div>
              <h4 className="font-bold text-lg text-gray-900">Supabase DB & Storage</h4>
              <p className="text-xs text-gray-500">Stores verified OAuth tokens, media binaries, and historical post analytics with multi-tenant isolation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Ready to experience effortless LinkedIn scheduling?
          </h2>
          <p className="text-base text-gray-600 max-w-xl mx-auto">
            Get started in less than 2 minutes. Connect your LinkedIn account and schedule your first post today.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl font-black text-base text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-xl shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
