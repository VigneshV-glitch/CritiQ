/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';

export interface GoogleAccountOption {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  geminiCredits: number;
  geminiTier: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authPromptMessage: string | null;
  signInWithGoogle: (account?: Partial<GoogleAccountOption>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  consumeGeminiCredit: () => boolean;
  openGoogleAuthModal: (promptMessage?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  availableGoogleAccounts: GoogleAccountOption[];
}

const STORAGE_GOOGLE_USER_KEY = 'critiq_google_user';
const STORAGE_CREDITS_KEY = 'critiq_google_gemini_credits';

export const DEFAULT_GOOGLE_ACCOUNTS: GoogleAccountOption[] = [
  {
    id: 'google_alex_chen',
    name: 'Alex Chen',
    email: 'alex.chen.ux@gmail.com',
    geminiCredits: 50,
    geminiTier: 'Google AI Studio Free Tier'
  },
  {
    id: 'google_sarah_design',
    name: 'Sarah Connor',
    email: 'sarah.gemini.dev@gmail.com',
    geminiCredits: 50,
    geminiTier: 'Google AI Studio Free Tier'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  // Restore existing session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_GOOGLE_USER_KEY);
      if (stored) {
        const parsed: AuthUser = JSON.parse(stored);
        if (parsed && parsed.provider === 'google' && parsed.email) {
          // Restore dynamic credits if updated
          const savedCredits = localStorage.getItem(`${STORAGE_CREDITS_KEY}_${parsed.id}`);
          if (savedCredits !== null) {
            parsed.geminiCredits = parseInt(savedCredits, 10);
          }
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to restore Google authentication state:', err);
    }
  }, []);

  const signInWithGoogle = async (account?: Partial<GoogleAccountOption>): Promise<{ success: boolean; error?: string }> => {
    try {
      const accountToUse = account?.email ? account : DEFAULT_GOOGLE_ACCOUNTS[0];
      const email = (accountToUse.email || 'developer@gmail.com').trim().toLowerCase();
      const name = (accountToUse.name || email.split('@')[0] || 'Google User').trim();
      const id = accountToUse.id || `google_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Check stored credits or initialize with 50 free credits
      let credits = 50;
      const storedCredits = localStorage.getItem(`${STORAGE_CREDITS_KEY}_${id}`);
      if (storedCredits !== null) {
        credits = parseInt(storedCredits, 10);
      } else {
        localStorage.setItem(`${STORAGE_CREDITS_KEY}_${id}`, '50');
      }

      const googleUser: AuthUser = {
        id,
        name,
        email,
        plan: 'PRO',
        provider: 'google',
        geminiCredits: credits,
        geminiTier: 'Google AI Studio Free Tier',
        createdAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_GOOGLE_USER_KEY, JSON.stringify(googleUser));
      setUser(googleUser);
      setIsAuthModalOpen(false);
      setAuthPromptMessage(null);

      // Execute queued action if any
      if (onSuccessCallback) {
        const cb = onSuccessCallback;
        setOnSuccessCallback(null);
        cb();
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Google authentication failed' };
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_GOOGLE_USER_KEY);
    } catch (err) {
      console.error('Failed to clear Google session:', err);
    }
    setUser(null);
  };

  const consumeGeminiCredit = (): boolean => {
    if (!user) {
      return false;
    }

    const currentCredits = user.geminiCredits ?? 50;
    if (currentCredits <= 0) {
      return false;
    }

    const nextCredits = Math.max(0, currentCredits - 1);
    const updatedUser: AuthUser = {
      ...user,
      geminiCredits: nextCredits
    };

    try {
      localStorage.setItem(`${STORAGE_CREDITS_KEY}_${user.id}`, nextCredits.toString());
      localStorage.setItem(STORAGE_GOOGLE_USER_KEY, JSON.stringify(updatedUser));
    } catch (err) {
      console.warn('Failed to persist decremented Gemini credits:', err);
    }

    setUser(updatedUser);
    return true;
  };

  const openGoogleAuthModal = (promptMessage?: string, onSuccess?: () => void) => {
    setAuthPromptMessage(promptMessage || null);
    setOnSuccessCallback(() => onSuccess || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
    setOnSuccessCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authPromptMessage,
        signInWithGoogle,
        logout,
        consumeGeminiCredit,
        openGoogleAuthModal,
        closeAuthModal,
        availableGoogleAccounts: DEFAULT_GOOGLE_ACCOUNTS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
