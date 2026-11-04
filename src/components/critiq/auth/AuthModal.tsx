/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../../state/AuthContext';
import { Button } from '../../ui/Button';

const EASE_CUSTOM = [0.16, 1, 0.3, 1];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authPromptMessage,
    login,
    signup,
    closeAuthModal,
    setAuthModalMode,
    quickDemoLogin,
    continueAsGuest
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form states when modal opens or switches mode
  useEffect(() => {
    if (isAuthModalOpen) {
      setError(null);
      setIsLoading(false);
      setShowPassword(false);
      // Pre-fill demo email if switching to login for ease of testing
      if (authModalMode === 'login' && !email) {
        setEmail('alex@critiq.ai');
        setPassword('password123');
      }
    }
  }, [isAuthModalOpen, authModalMode]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authModalMode === 'login') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.error || 'Failed to sign in. Please verify your credentials.');
        }
      } else {
        const res = await signup(name, email, password);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await quickDemoLogin();
    } catch (err: any) {
      setError(err?.message || 'Failed demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: EASE_CUSTOM }}
        className="relative w-full max-w-md bg-[#0a0d1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
      >
        {/* Glow Accent Header */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 120px at center, rgba(99, 102, 241, 0.25) 0%, transparent 100%)',
            filter: 'blur(30px)'
          }}
        />

        {/* Top bar with Close button */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                Critiq <span className="text-[9px] font-mono font-bold bg-white/10 border border-white/10 rounded px-1 text-indigo-300">PRO</span>
              </span>
              <span className="text-[10px] text-slate-400 font-sans block">Design Inspection Platform</span>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-4 space-y-5 relative z-10">
          {/* Prompt Message if initiated by an action */}
          {authPromptMessage && (
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{authPromptMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex p-1 bg-black/40 border border-white/5 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalMode('signup');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                authModalMode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {authModalMode === 'signup' && (
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 block">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    required
                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-sans"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 block">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 block">
                  Password
                </label>
                {authModalMode === 'login' && (
                  <span className="text-[10px] text-indigo-400/80 font-sans cursor-pointer hover:underline">
                    Default demo: password123
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={authModalMode === 'signup' ? 'Minimum 6 characters' : 'Enter password'}
                  required
                  className="w-full bg-black/40 border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-xs font-bold py-3 mt-2 shadow-lg shadow-indigo-600/25"
            >
              <span>{authModalMode === 'login' ? 'Sign In to Critiq' : 'Create Free Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>QUICK EXPLORATION</span>
              <span>1-CLICK</span>
            </div>
            
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                  A
                </div>
                <div className="text-left">
                  <span className="text-xs font-medium text-white block">Continue as Alex Chen</span>
                  <span className="text-[10px] text-slate-400 block font-mono">alex@critiq.ai</span>
                </div>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono font-bold group-hover:translate-x-0.5 transition-transform">
                Sign in →
              </span>
            </button>
          </div>

          {/* Guest inspection option if user doesn't want to sign in right now */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            {authModalMode === 'login' ? (
              <span className="text-[11px]">
                New to Critiq?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Create account
                </button>
              </span>
            ) : (
              <span className="text-[11px]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setError(null);
                  }}
                  className="text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={continueAsGuest}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
            >
              Continue as Guest
            </button>
          </div>
        </div>

        {/* Footer info badge */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            End-to-End Encrypted Session
          </span>
          <span>v2.4.0</span>
        </div>
      </motion.div>
    </div>
  );
};

