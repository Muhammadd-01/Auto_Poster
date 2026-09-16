import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface SocialAccount {
  id: string;
  user_id: string;
  provider: string;
  provider_account_id: string;
  display_name: string;
  profile_url?: string;
  email?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  linkedInAccount: SocialAccount | null;
  refreshLinkedInAccount: () => Promise<void>;
  signInWithDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [linkedInAccount, setLinkedInAccount] = useState<SocialAccount | null>(null);

  const fetchLinkedInAccount = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'linkedin')
        .maybeSingle();

      if (data) {
        setLinkedInAccount(data);
      } else {
        setLinkedInAccount(null);
      }
    } catch (err) {
      console.warn('Error fetching linked account:', err);
    }
  };

  const refreshLinkedInAccount = async () => {
    if (user?.id) {
      await fetchLinkedInAccount(user.id);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchLinkedInAccount(user.id);
    } else {
      setLinkedInAccount(null);
    }
  }, [user]);

  useEffect(() => {
    // 1. Check for active demo session
    const storedDemo = localStorage.getItem('autopost_demo_user');
    if (storedDemo) {
      try {
        const parsed = JSON.parse(storedDemo);
        setUser(parsed);
        setIsDemoMode(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('autopost_demo_user');
      }
    }

    // 2. Fetch real Supabase session
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        }
        if (session?.user) {
          setUser(session.user);
          setIsDemoMode(false);
        }
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // 3. Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsDemoMode(false);
        localStorage.removeItem('autopost_demo_user');
      } else if (!localStorage.getItem('autopost_demo_user')) {
        setUser(null);
        setIsDemoMode(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithDemo = () => {
    const demoUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'demo.founder@autopost.io',
      app_metadata: { provider: 'demo' },
      user_metadata: {
        full_name: 'Alex Vance',
        headline: 'Founder & LinkedIn Creator',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as User;

    localStorage.setItem('autopost_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemoMode(true);
  };

  const signOut = async () => {
    localStorage.removeItem('autopost_demo_user');
    localStorage.removeItem('autopost_admin_session');
    setIsDemoMode(false);
    setUser(null);
    setLinkedInAccount(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, linkedInAccount, refreshLinkedInAccount, signInWithDemo, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
