import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Composer } from './pages/Composer';
import { Calendar } from './pages/Calendar';
import { MediaLibrary } from './pages/MediaLibrary';
import { Analytics } from './pages/Analytics';
import { Accounts } from './pages/Accounts';
import { Help } from './pages/Help';
import { Landing } from './pages/Landing';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { Notifications } from './pages/Notifications';
import { DashboardLayout } from './components/DashboardLayout';
import { MarketingLayout } from './components/MarketingLayout';
import { FeaturesPage } from './pages/marketing/FeaturesPage';
import { PricingPage } from './pages/marketing/PricingPage';
import { AboutPage } from './pages/marketing/AboutPage';
import { ContactPage } from './pages/marketing/ContactPage';
import { GoToTop } from './components/GoToTop';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const sessionStr = localStorage.getItem('autopost_admin_session');

  const isAdminEmail =
    user?.email === 'muhammadaffan1445@gmail.com' ||
    user?.email === 'admin@autopost.io' ||
    user?.email === 'affan.work05@gmail.com' ||
    user?.email === 'admin@autopost.com' ||
    (user as any)?.user_metadata?.role === 'admin' ||
    (user as any)?.user_metadata?.is_admin === true;

  if (isAdminEmail) {
    if (!sessionStr) {
      localStorage.setItem('autopost_admin_session', JSON.stringify({
        email: user?.email,
        name: user?.user_metadata?.full_name || 'Muhammad Affan (Platform Owner)',
        role: 'SUPERADMIN',
        token: 'admin-autopost-sec-jwt-2026',
        userId: user?.id,
        loggedInAt: new Date().toISOString()
      }));
    }
    return <>{children}</>;
  }

  if (!sessionStr) {
    return <Navigate to="/login" replace />;
  }
  try {
    const session = JSON.parse(sessionStr);
    if (!session || !session.email) {
      return <Navigate to="/login" replace />;
    }
    if (user && user.email !== session.email) {
      return <Navigate to="/login" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <GoToTop />
          <Routes>
            {/* Public Marketing Multi-Page Routes */}
            <Route element={<MarketingLayout />}>
              <Route path="/welcome" element={<Landing />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>

            {/* Unified Auth Page (Handles both Admin & User login) */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            
            {/* Protected App Dashboard Routes */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
              <Route path="/create" element={<Composer />} />
              <Route path="/composer" element={<Composer />} />
              <Route path="/schedule" element={<Calendar />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/posts" element={<MediaLibrary />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/help" element={<Help />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
