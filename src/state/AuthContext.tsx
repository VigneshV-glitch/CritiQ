/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan?: string;
  avatar?: string;
  createdAt?: string;
}

interface StoredUser extends AuthUser {
  password?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authPromptMessage: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  openLoginModal: (promptMessage?: string, onSuccess?: () => void) => void;
  openSignupModal: (promptMessage?: string, onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  quickDemoLogin: () => Promise<void>;
  continueAsGuest: () => void;
}

const STORAGE_USERS_KEY = 'critiq_registered_users';
const STORAGE_CURRENT_USER_KEY = 'critiq_current_user';

const DEFAULT_USERS: StoredUser[] = [
  {
    id: 'usr_demo_1',
    name: 'Alex Chen',
    email: 'alex@critiq.ai',
    password: 'password123',
    plan: 'PRO',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr_demo_2',
    name: 'Sarah Connor',
    email: 'sarah.design@critiq.ai',
    password: 'password123',
    plan: 'PRO',
    createdAt: new Date().toISOString()
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  // Initialize registered users and active session on mount
  useEffect(() => {
    try {
      // Initialize pre-seeded users if none exist in localStorage
      const existingUsersRaw = localStorage.getItem(STORAGE_USERS_KEY);
      if (!existingUsersRaw) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }

      // Restore active session if present
      const storedUserRaw = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (storedUserRaw) {
        const parsed = JSON.parse(storedUserRaw);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.warn('Failed to read auth state from localStorage:', err);
    }
  }, []);

  const getRegisteredUsers = (): StoredUser[] => {
    try {
      const data = localStorage.getItem(STORAGE_USERS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.warn('Failed to parse registered users:', err);
    }
    return DEFAULT_USERS;
  };

  const saveRegisteredUsers = (users: StoredUser[]) => {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    } catch (err) {
      console.error('Failed to save registered users to localStorage:', err);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      return { success: false, error: 'Email address is required' };
    }
    if (!trimmedPassword) {
      return { success: false, error: 'Password is required' };
    }

    const users = getRegisteredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!foundUser) {
      return { success: false, error: 'No account found with this email. Please sign up.' };
    }

    if (foundUser.password && foundUser.password !== trimmedPassword) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const authUser: AuthUser = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      plan: foundUser.plan || 'PRO',
      avatar: foundUser.avatar,
      createdAt: foundUser.createdAt
    };

    try {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(authUser));
    } catch (err) {
      console.error('Failed to persist session:', err);
    }

    setUser(authUser);
    setIsAuthModalOpen(false);

    if (onSuccessCallback) {
      const cb = onSuccessCallback;
      setOnSuccessCallback(null);
      cb();
    }

    return { success: true };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      return { success: false, error: 'Full name is required' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (trimmedPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const users = getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address already exists' };
    }

    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      plan: 'PRO',
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [newUser, ...users];
    saveRegisteredUsers(updatedUsers);

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      plan: newUser.plan,
      createdAt: newUser.createdAt
    };

    try {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(authUser));
    } catch (err) {
      console.error('Failed to persist session:', err);
    }

    setUser(authUser);
    setIsAuthModalOpen(false);

    if (onSuccessCallback) {
      const cb = onSuccessCallback;
      setOnSuccessCallback(null);
      cb();
    }

    return { success: true };
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    } catch (err) {
      console.error('Failed to clear session:', err);
    }
    setUser(null);
  };

  const openLoginModal = (promptMessage?: string, onSuccess?: () => void) => {
    setAuthModalMode('login');
    setAuthPromptMessage(promptMessage || null);
    setOnSuccessCallback(() => onSuccess || null);
    setIsAuthModalOpen(true);
  };

  const openSignupModal = (promptMessage?: string, onSuccess?: () => void) => {
    setAuthModalMode('signup');
    setAuthPromptMessage(promptMessage || null);
    setOnSuccessCallback(() => onSuccess || null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
    setOnSuccessCallback(null);
  };

  const quickDemoLogin = async () => {
    await login('alex@critiq.ai', 'password123');
  };

  const continueAsGuest = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
    if (onSuccessCallback) {
      const cb = onSuccessCallback;
      setOnSuccessCallback(null);
      cb();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authModalMode,
        authPromptMessage,
        login,
        signup,
        logout,
        openLoginModal,
        openSignupModal,
        closeAuthModal,
        setAuthModalMode,
        quickDemoLogin,
        continueAsGuest
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

