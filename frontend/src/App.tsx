import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import { DashboardLayout } from './components/DashboardLayout';
import { GoToTop } from './components/GoToTop';

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

function App() {
  return (
    <AuthProvider>
      <Router>
        <GoToTop />
        <Routes>
          <Route path="/welcome" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />
          
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<Composer />} />
            <Route path="/schedule" element={<Calendar />} />
            <Route path="/posts" element={<MediaLibrary />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
