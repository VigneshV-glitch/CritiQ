/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Plus,
  Zap,
  Info,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth, GoogleAccountOption } from '../../../state/AuthContext';
import { Button } from '../../ui/Button';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const EASE_CUSTOM = [0.16, 1, 0.3, 1];

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authPromptMessage,
    signInWithGoogle,
    closeAuthModal,
    availableGoogleAccounts
  } = useAuth();

  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSelectAccount = async (account: GoogleAccountOption) => {
    setSelectedId(account.id);
    setIsLoading(true);
    try {
      await signInWithGoogle(account);
    } finally {
      setIsLoading(false);
      setSelectedId(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    setIsLoading(true);
    try {
      await signInWithGoogle({
        name: customName.trim() || customEmail.split('@')[0],
        email: customEmail.trim()
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAuthModal}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.3, ease: EASE_CUSTOM }}
        className="relative w-full max-w-md bg-[#0a0d1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col text-left"
      >
        {/* Soft Blue/Google Accent Glow Source */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-36 pointer-events-none"
          style={{
            background: 'radial-gradient(circle 140px at center, rgba(66, 133, 244, 0.22) 0%, rgba(52, 168, 83, 0.12) 50%, transparent 100%)',
            filter: 'blur(35px)'
          }}
        />

        {/* Top Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-white/5 ring-1 ring-white/10 shrink-0">
              <GoogleIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                Google Authentication
              </span>
              <span className="text-[10px] text-slate-400 font-sans block">
                Free Gemini AI Inspection Access
              </span>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="px-6 py-4 space-y-4 relative z-10">

          {/* Action Prompt Banner if inspection was triggered */}
          {authPromptMessage ? (
            <div className="p-3 bg-blue-500/10 border border-blue-500/25 rounded-2xl flex items-start gap-2.5 text-xs text-blue-200">
              <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-white">Google Account Required</span>
                <span className="text-[11px] text-blue-300 leading-relaxed block">{authPromptMessage}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl space-y-1">
              <h4 className="text-xs font-semibold text-white font-sans flex items-center gap-1.5">
                <span>Sign in with Google</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded font-bold">
                  FREE 50 CREDITS
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                Connect your Google Account to run cognitive UI inspections using free Google Gemini AI credits.
              </p>
            </div>
          )}

          {/* Google Accounts Selection List */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
              Choose Google Account to Continue:
            </span>

            {availableGoogleAccounts.map((account) => {
              const isItemLoading = isLoading && selectedId === account.id;
              return (
                <button
                  key={account.id}
                  onClick={() => handleSelectAccount(account)}
                  disabled={isLoading}
                  className="w-full p-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-blue-500/40 transition-all flex items-center justify-between cursor-pointer group text-left shadow-sm disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10 shrink-0">
                        {account.name[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <GoogleIcon className="w-2.5 h-2.5" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors block font-sans truncate">
                        {account.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block truncate">
                        {account.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded block">
                      {account.geminiCredits} Gemini Credits
                    </span>
                    <span className="text-[9px] text-slate-500 font-sans mt-0.5 block group-hover:text-slate-300 transition-colors">
                      {isItemLoading ? 'Connecting...' : 'Click to sign in →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Option to enter custom Google account */}
          <div className="pt-2">
            {!isCustomMode ? (
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full py-2.5 px-3 bg-transparent hover:bg-white/5 border border-dashed border-white/15 hover:border-white/25 rounded-2xl text-xs text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-3.5 bg-black/40 border border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-sans">
                    <GoogleIcon className="w-3.5 h-3.5" /> Enter your Google Account
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCustomMode(false)}
                    className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Your Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Alex Designer"
                    className="w-full bg-[#05060c] border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Google / Gmail Address</label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="username@gmail.com"
                    required
                    className="w-full bg-[#05060c] border border-white/10 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isLoading}
                  className="w-full text-xs font-bold py-2.5 bg-blue-600 hover:bg-blue-500 border-blue-400/30"
                >
                  <GoogleIcon className="w-4 h-4 mr-1.5" />
                  <span>Continue with Google</span>
                </Button>
              </form>
            )}
          </div>

          {/* Gemini AI Credits Guarantee Info */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border border-blue-500/20 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
              <span className="font-semibold text-white block">Google Gemini AI Credits Included</span>
              All design inspection tasks utilize Google's Gemini multimodal vision model. Each Google sign-in provides 50 free inspection runs without requiring a credit card.
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Official Google OAuth Protocol
          </span>
          <span>v2.4.0</span>
        </div>
      </motion.div>
    </div>
  );
};
