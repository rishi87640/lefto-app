import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { DEMO_USER_PROFILE } from '../data/mockData';
import { fetchUserProfile } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithOtp: (phoneOrEmail: string) => Promise<{ success: boolean; error: string | null }>;
  verifyOtp: (phoneOrEmail: string, token: string) => Promise<{ success: boolean; error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(DEMO_USER_PROFILE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const loadProfile = async () => {
    try {
      const res = await fetchUserProfile();
      setProfile(res.data);
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setUser(null);
      setSession(null);
      setProfile(DEMO_USER_PROFILE);
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile();
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile();
      } else {
        setProfile(DEMO_USER_PROFILE);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isConfigured]);

  const signInWithOtp = async (phoneOrEmail: string): Promise<{ success: boolean; error: string | null }> => {
    if (!isConfigured) {
      // In demo mode, treat as successful demo flow
      return { success: true, error: null };
    }

    try {
      const isPhone = /^\+?[0-9]{10,13}$/.test(phoneOrEmail.replace(/\s+/g, ''));
      if (isPhone) {
        const formatted = phoneOrEmail.startsWith('+') ? phoneOrEmail : `+91${phoneOrEmail.replace(/\D/g, '')}`;
        const { error } = await supabase.auth.signInWithOtp({
          phone: formatted
        });
        if (error) return { success: false, error: error.message };
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: phoneOrEmail,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) return { success: false, error: error.message };
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'OTP delivery failed' };
    }
  };

  const verifyOtp = async (
    phoneOrEmail: string,
    token: string
  ): Promise<{ success: boolean; error: string | null }> => {
    if (!isConfigured) {
      return { success: true, error: null };
    }

    try {
      const isPhone = /^\+?[0-9]{10,13}$/.test(phoneOrEmail.replace(/\s+/g, ''));
      if (isPhone) {
        const formatted = phoneOrEmail.startsWith('+') ? phoneOrEmail : `+91${phoneOrEmail.replace(/\D/g, '')}`;
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formatted,
          token,
          type: 'sms'
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser(data.user);
          await loadProfile();
        }
      } else {
        const { data, error } = await supabase.auth.verifyOtp({
          email: phoneOrEmail,
          token,
          type: 'email'
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          setUser(data.user);
          await loadProfile();
        }
      }
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed' };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(DEMO_USER_PROFILE);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isConfigured,
        signInWithOtp,
        verifyOtp,
        signOut,
        refreshProfile: loadProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
