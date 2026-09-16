import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Send, Menu, X, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const MarketingLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/welcome' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* Public Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/welcome" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
              <Send className="w-5 h-5 -rotate-45" />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900">
              Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Post</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/welcome' && location.pathname === '/');
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'text-orange-600 bg-orange-50/80'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-orange-50 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-orange-100 bg-white px-6 py-5 space-y-4"
            >
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-base font-bold text-gray-700 hover:text-orange-600"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl font-bold text-sm bg-orange-600 text-white shadow-md"
                  >
                    Launch Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl font-bold text-sm text-gray-700 bg-gray-100"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Marketing Page Outlet with Framer Motion */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Unified Public Footer */}
      <footer className="bg-gray-950 text-gray-400 pt-16 pb-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-900">
            
            {/* Brand Column (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/welcome" className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center text-white shadow-md">
                  <Send className="w-4 h-4 -rotate-45" />
                </div>
                <span className="text-xl font-black text-white tracking-tight">
                  Auto<span className="text-orange-500">Post</span>
                </span>
              </Link>
              <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
                The developer-grade, direct LinkedIn API autopilot publisher. Write once, automate forever, and maximize your executive reach.
              </p>
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span>Direct LinkedIn v2 REST Integration Active</span>
              </div>
            </div>

            {/* Column 1: Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing & Plans</Link></li>
                <li><Link to="/welcome#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/accounts" className="hover:text-white transition-colors">Connected Accounts</Link></li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                <li><a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">LinkedIn Community</a></li>
                <li><Link to="/about#privacy" className="hover:text-white transition-colors">Privacy & Security</Link></li>
              </ul>
            </div>

            {/* Column 3: Trust */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-200">Security & Trust</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center space-x-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  <span>Zero 3rd-party bots</span>
                </li>
                <li className="flex items-center space-x-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Supabase PostgreSQL RLS</span>
                </li>
                <li className="flex items-center space-x-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Official OAuth 2.0 OpenID</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
            <p>© {new Date().getFullYear()} AutoPost Technologies Inc. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <Link to="/about" className="hover:text-gray-400">Terms</Link>
              <Link to="/about" className="hover:text-gray-400">Privacy</Link>
              <Link to="/contact" className="hover:text-gray-400">Status</Link>
              <Link to="/admin" className="text-orange-400/90 hover:text-orange-300 font-bold flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20">
                🔒 Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
