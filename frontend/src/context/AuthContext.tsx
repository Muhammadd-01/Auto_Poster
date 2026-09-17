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
  linkedInAccount: SocialAccount | null;
  refreshLinkedInAccount: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
    // Fetch real Supabase session
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        }
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Failed to get session:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('autopost_admin_session');
    setUser(null);
    setLinkedInAccount(null);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, linkedInAccount, refreshLinkedInAccount, signOut }}>
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
