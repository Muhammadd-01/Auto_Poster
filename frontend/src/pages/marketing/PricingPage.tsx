import { useState } from 'react';
import { Check, Sparkles, HelpCircle, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatedCounter } from '../../components/AnimatedCounter';

export const PricingPage = () => {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter Creator',
      tagline: 'Ideal for solo founders, engineers, and creators building their initial audience.',
      monthlyPrice: 0,
      annualPrice: 0,
      badge: 'Free Forever',
      features: [
        '1 Connected LinkedIn Account',
        'Up to 15 scheduled posts / month',
        'Direct LinkedIn REST API delivery',
        'Single Image media support',
        'Live Feed Simulator preview',
        'Community Discord Support',
      ],
      ctaText: 'Start Free',
      ctaLink: '/signup',
      highlighted: false,
    },
    {
      name: 'Pro Growth',
      tagline: 'For active thought leaders and executives who publish daily to drive inbound leads.',
      monthlyPrice: 19,
      annualPrice: 15,
      badge: 'Most Popular',
      features: [
        'Up to 3 Connected LinkedIn Accounts',
        'Unlimited scheduled posts',
        'Full Video (MP4) & Image uploads',
        'Automated 3x retry on API rate limits',
        'Advanced Timezone scheduling',
        'Post performance analytics & metrics',
        'Priority 24/7 Email support',
      ],
      ctaText: 'Start 14-Day Free Trial',
      ctaLink: '/signup',
      highlighted: true,
    },
    {
      name: 'Agency / Studio',
      tagline: 'For marketing agencies and ghostwriters managing executive personal brands.',
      monthlyPrice: 49,
      annualPrice: 39,
      badge: 'Scale Team',
      features: [
        'Unlimited Connected LinkedIn Accounts',
        'Unlimited scheduled posts & media',
        'Client content workspace switching',
        'Custom Webhooks & Zapier integration',
        'Dedicated IP address for API publishing',
        'Draft approval workflow',
        '1-on-1 Dedicated Account Manager',
      ],
      ctaText: 'Get Agency Access',
      ctaLink: '/signup',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'Will my LinkedIn account get banned for using AutoPost?',
      a: 'No. Unlike traditional browser extensions or automation bots that simulate human clicks and violate LinkedIn Terms of Service, AutoPost uses the official LinkedIn Developer Platform REST API (OAuth 2.0). Your account is 100% safe.'
    },
    {
      q: 'Do I need to leave my laptop on for posts to go live?',
      a: 'Never. Our background worker runs autonomously on cloud servers 24/7. Once you schedule a post, it publishes at the exact minute even if your laptop is closed and your phone is off.'
    },
    {
      q: 'Can I upload videos as well as images?',
      a: 'Yes! AutoPost supports high-definition images (JPEG, PNG) as well as MP4 video uploads. Video assets are uploaded to our cloud storage and sent directly to LinkedIn.'
    },
    {
      q: 'Can I cancel or change my plan anytime?',
      a: 'Yes, you can cancel, upgrade, or downgrade your plan at any time with a single click in your settings. No lock-in contracts.'
    },
    {
      q: 'Is there a free trial for paid plans?',
      a: 'Yes! Both Pro and Agency plans come with a 14-day free trial. You won’t be charged until your trial concludes.'
    }
  ];

  return (
    <div className="bg-white">
      
      {/* Header */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Simple, Transparent Pricing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            Predictable Plans For <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Every Creator</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose the plan that fits your posting schedule. Start completely free with zero credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center space-x-3">
            <span className={`text-sm font-bold ${!annual ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-14 h-8 flex items-center rounded-full p-1 bg-orange-500 transition-colors focus:outline-none shadow-inner"
              aria-label="Toggle Annual Billing"
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${annual ? 'translate-x-6' : ''}`} />
            </button>
            <span className={`text-sm font-bold flex items-center space-x-1.5 ${annual ? 'text-gray-900' : 'text-gray-500'}`}>
              <span>Annual</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-800 uppercase tracking-wide">
                Save 20%
              </span>
            </span>
          </div>

          {/* Animated Value Proof Counters */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={20} suffix="%" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Annual Savings</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-600">
                <AnimatedCounter end={14} suffix="-Day" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Free Trial</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={0} prefix="$" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Setup Fees</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-600">
                <AnimatedCounter end={99.9} decimals={1} suffix="%" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Uptime SLA</p>
            </div>
          </div>

          {/* Orangish Hero Showcase Visual */}
          <div className="pt-8 max-w-4xl mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border-2 border-orange-200/80 bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-orange-400/30">
              <img
                src="https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1400&q=80"
                alt="AutoPost ROI and Analytics Dashboard"
                className="w-full h-64 sm:h-80 object-cover mix-blend-multiply opacity-95 filter brightness-105 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-orange-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left text-white">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-orange-500/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> High ROI Guaranteed
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/50 text-orange-300 font-medium text-xs backdrop-blur-sm flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-orange-400" /> Cancel anytime with 1-click
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Join 12,000+ creators saving 15+ hours every month
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/90 max-w-xl mt-1">
                  Start risk-free today. Scale your thought leadership and convert views into real clients.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl p-8 flex flex-col justify-between transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-orange-50/50 via-white to-orange-50/20 border-2 border-orange-500 shadow-2xl shadow-orange-500/10 relative scale-105 z-10'
                    : 'bg-white border border-gray-200 shadow-lg shadow-gray-100 hover:border-orange-200'
                }`}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-gray-900">{plan.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      plan.highlighted ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>

                  <div className="flex items-baseline space-x-1">
                    <span className="text-4xl font-black text-gray-900">${price}</span>
                    <span className="text-xs font-bold text-gray-400">/ month</span>
                    {annual && plan.monthlyPrice > 0 && (
                      <span className="text-xs text-green-700 font-semibold ml-2">billed annually</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">Included features:</p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start space-x-2.5 text-xs text-gray-700">
                          <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Link
                    to={plan.ctaLink}
                    className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                      plan.highlighted
                        ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white shadow-orange-500/25'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    {plan.ctaText}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50/60 border-t border-gray-100 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-600">
              Everything you need to know about our product, safety, and billing.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-2"
              >
                <h4 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              Have more questions? <Link to="/contact" className="text-orange-600 font-bold hover:underline">Contact our friendly support team →</Link>
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
