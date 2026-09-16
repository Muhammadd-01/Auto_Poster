import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle2, Clock, Sparkles, Headphones, Zap } from 'lucide-react';
import { AnimatedCounter } from '../../components/AnimatedCounter';

export const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-white">
      
      {/* Header */}
      <section className="relative pt-20 pb-12 overflow-hidden bg-gradient-to-b from-orange-50/70 via-white to-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>We’d Love to Hear From You</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight">
            Get in Touch With <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Our Team</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Have a question, feature request, or need help setting up your LinkedIn Developer API app? Send us a message and we'll reply promptly.
          </p>

          {/* Animated Response Counters */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={4} prefix="< " suffix="h" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Average Reply</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-600">
                <AnimatedCounter end={99.8} decimals={1} suffix="%" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Resolution Rate</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-orange-600">
                <AnimatedCounter end={24} suffix="/7" />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Ticket Coverage</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
              <div className="flex items-center justify-center gap-1 text-2xl sm:text-3xl font-black text-amber-600">
                <AnimatedCounter end={0} />
              </div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mt-1">Bot Canned Answers</p>
            </div>
          </div>

          {/* Orangish Hero Showcase Image */}
          <div className="pt-8 max-w-4xl mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-orange-500/20 border-2 border-orange-200/80 bg-gradient-to-tr from-orange-600/30 via-amber-500/20 to-orange-400/30">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80"
                alt="AutoPost Direct Support Team"
                className="w-full h-64 sm:h-80 object-cover mix-blend-multiply opacity-95 filter brightness-105 contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/85 via-orange-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-left text-white">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-orange-500/90 text-white font-bold text-xs uppercase tracking-wider backdrop-blur-sm flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5" /> Human Specialists Only
                  </span>
                  <span className="px-3 py-1 rounded-full bg-black/50 text-orange-300 font-medium text-xs backdrop-blur-sm flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-orange-400" /> Direct LinkedIn API setup guidance
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Real engineers answering your architectural questions
                </h3>
                <p className="text-xs sm:text-sm text-orange-100/90 max-w-xl mt-1">
                  We'll help you configure your LinkedIn OAuth, verify permissions, and troubleshoot any API issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Form & Channels */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-orange-100 shadow-xl shadow-orange-950/5">
            {submitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Message Received!</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out, <span className="font-bold text-gray-900">{name || 'Creator'}</span>. Our support engineers will review your inquiry and email you back at <span className="font-semibold text-orange-600">{email}</span> within 24 hours.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                    setSubject('');
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Send an Inquiry</h3>
                  <p className="text-xs text-gray-500 mt-1">Fill out the form below and we'll respond promptly.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Subject</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Question about LinkedIn API scopes"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe how we can help you..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Details & Status (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct Channels Card */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-md space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Direct Support Channels</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Support Email</h4>
                    <p className="text-xs text-gray-500">support@autopost.io</p>
                    <p className="text-[11px] text-orange-600 font-semibold mt-0.5">Average reply time: under 4 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Developer Community</h4>
                    <p className="text-xs text-gray-500">Join our Discord community of 2,400+ creators and engineers.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Operating Hours</h4>
                    <p className="text-xs text-gray-500">Monday - Saturday, 9:00 AM – 9:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status Live Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">System Status</span>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                  <span>99.98% Uptime</span>
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-200">
                All services operational: LinkedIn OAuth, Cron Worker & Media Storage.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
