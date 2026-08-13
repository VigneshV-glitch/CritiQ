/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Sparkles, 
  User,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Compass,
  Layout,
  ShieldAlert,
  CheckCircle,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuditReport, ReviewType } from '../types';
import { ReviewIntentInput } from '../components/critiq/upload/ReviewIntentInput';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface LandingProps {
  reviews: AuditReport[];
  onSelectRecentReview: (reportId: string) => void;
  onUploadImage: (fileDataUrl: string, fileName: string, userInstruction?: string, correctionStrategy?: string) => void;
  onSelectDemo: (reviewId: string) => void;
  userEmail?: string;
  onResetData: () => void;
}

export default function Landing({
  reviews,
  onSelectRecentReview,
  onUploadImage,
  onSelectDemo,
  userEmail = 'vigneshv7678@gmail.com',
  onResetData
}: LandingProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Core local states for Prepare Inspection
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [userInstruction, setUserInstruction] = useState('');
  const [correctionStrategy, setCorrectionStrategy] = useState<'Minimal' | 'Balanced' | 'Comprehensive'>('Balanced');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Auto-infer optimization strategy if text explicitly mentions it
  const handleInstructionChange = (text: string) => {
    setUserInstruction(text);
    const lower = text.toLowerCase();
    if (lower.includes('minimal')) {
      setCorrectionStrategy('Minimal');
    } else if (lower.includes('comprehensive') || lower.includes('deep audit') || lower.includes('full audit')) {
      setCorrectionStrategy('Comprehensive');
    }
  };

  // Paste handler for convenience
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              processFile(file);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Critiq supports visual wireframes & image formats only. Please upload a PNG, JPG, or WebP screenshot.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImageSrc(reader.result);
        setUploadedFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Demo screens
  const demoScreens = [
    {
      id: 'rev_fintech_main',
      name: 'Fintech Mobile v2.1',
      badge: 'FINTECH',
      desc: 'Mobile wallet transaction feed with navigation menus and graph placements.',
      imageSrc: 'mock_fintech',
      score: 84
    },
    {
      id: 'rev_ecommerce_checkout',
      name: 'E-Commerce Checkout',
      badge: 'SAAS PORTAL',
      desc: 'Form inputs, payment selectors, and visual spacing inconsistencies.',
      imageSrc: 'mock_checkout',
      score: 69
    }
  ];

  const EASE_CUSTOM = [0.16, 1, 0.3, 1];

  const handleStartAnalysis = () => {
    if (!uploadedImageSrc) return;
    onUploadImage(
      uploadedImageSrc, 
      uploadedFileName || 'uploaded_layout.png', 
      userInstruction, 
      correctionStrategy
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 relative select-none bg-[#020512] overflow-hidden">
      
      {/* Background Ambient Gradient & Exact Reference Image Wave Lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#020514]">
        {/* Base dark midnight blue gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020512] via-[#040920] to-[#071030]" />

        {/* Reduced Bottom-Right Vibrant Blue Glow Source */}
        <div 
          className="absolute -bottom-40 -right-40 w-[450px] md:w-[550px] h-[450px] md:h-[550px] rounded-full pointer-events-none opacity-70"
          style={{
            background: 'radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.75) 0%, rgba(59, 130, 246, 0.5) 20%, rgba(37, 99, 235, 0.3) 40%, rgba(29, 78, 216, 0.12) 60%, transparent 80%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Reduced Bottom Ambient Blue Light Spread along bottom edge */}
        <div 
          className="absolute bottom-0 inset-x-0 h-[160px] pointer-events-none opacity-60"
          style={{
            background: 'linear-gradient(to top, rgba(37, 99, 235, 0.18) 0%, rgba(29, 78, 216, 0.05) 50%, transparent 100%)',
          }}
        />

        {/* Vector Wave Contour Ribbon Overlays - Constrained Height */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="waveGradRight" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
              <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.18" />
              <stop offset="85%" stopColor="#1d4ed8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Bottom Left Wave Ribbon - Positioned Lower */}
          <g opacity="0.45">
            {Array.from({ length: 20 }).map((_, i) => (
              <path
                key={`lw-${i}`}
                d={`M -120 ${810 + i * 7} C ${140 - i * 3} ${680 + i * 5}, ${370 + i * 5} ${730 + i * 7}, ${740 + i * 7} ${930}`}
                fill="none"
                stroke="url(#waveGradLeft)"
                strokeWidth="1.0"
              />
            ))}
          </g>

          {/* Bottom Right Wave Ribbon - Positioned Lower */}
          <g opacity="0.45">
            {Array.from({ length: 24 }).map((_, i) => (
              <path
                key={`rw-${i}`}
                d={`M ${880 + i * 14} 930 C ${1060 + i * 8} ${760 - i * 4}, ${1220 + i * 6} ${600 - i * 8}, 1500 ${450 - i * 9}`}
                fill="none"
                stroke="url(#waveGradRight)"
                strokeWidth="1.0"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* 1. Slim Stage 01 Navigation Header */}
      <header className="h-16 flex items-center justify-between px-6 sm:px-8 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5 font-sans">
                <span>Critiq</span>
                <span className="text-[9px] font-mono font-bold bg-white/5 border border-white/10 rounded px-1 text-indigo-300">PRO</span>
              </h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide block font-sans">Prepare Inspection</span>
            </div>
          </div>
        </div>

        {/* User Context & Profile Actions */}
        <div className="flex items-center gap-3 relative z-30">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
            title="Account Profile & Settings"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono text-xs font-bold shadow-sm shadow-indigo-600/30 ring-1 ring-white/20 shrink-0">
              {userEmail ? userEmail[0].toUpperCase() : 'V'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[10px] font-normal text-white leading-[16px] font-sans group-hover:text-indigo-200 transition-colors">
                {userEmail ? userEmail.split('@')[0] : 'Vignesh V'}
              </span>
              <span className="text-[10px] font-normal text-slate-400 leading-tight mt-0.5">
                {userEmail || 'vigneshv7678@gmail.com'}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Profile Dropdown Card */}
          <AnimatePresence>
            {showProfileMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)} 
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: EASE_CUSTOM }}
                  className="absolute right-0 top-11 w-80 bg-[#070918]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-4 font-sans"
                >
                  {/* User Identity Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-mono text-sm font-bold shadow-md shadow-indigo-600/30 ring-1 ring-white/20 shrink-0">
                      {userEmail ? userEmail[0].toUpperCase() : 'V'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-white truncate font-sans">
                          {userEmail ? userEmail.split('@')[0] : 'Vignesh V'}
                        </p>
                        <span className="text-[9px] font-mono font-bold bg-[#0161ff]/20 text-indigo-300 border border-[#0161ff]/30 px-1.5 py-0.2 rounded">
                          PRO
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">{userEmail}</p>
                    </div>
                  </div>

                  {/* Account Metrics */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Audits Run</span>
                      <span className="text-xs font-bold text-white font-mono">{reviews.length + 8} Completed</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Engine</span>
                      <span className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#0161ff]" /> WCAG 2.1
                      </span>
                    </div>
                  </div>

                  {/* Settings & Reset Action */}
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Workspace Actions
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (confirm('Restore default factory templates? This resets all current upload records and restores sandbox mocks.')) {
                          onResetData();
                        }
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                        <span>Reset Sandbox Templates</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Restore</span>
                    </button>
                  </div>

                  {/* Account Status Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Pro License Active
                    </span>
                    <span>v2.4.0</span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Prepare Content View */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 md:py-10 relative overflow-y-auto custom-scrollbar z-10 min-h-0 w-full">
        
        <AnimatePresence mode="wait">
          {!uploadedImageSrc ? (
            
            /* Upload Screen */
            <motion.div 
              key="upload-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE_CUSTOM }}
              className="w-full max-w-2xl space-y-6 md:space-y-8 text-center my-auto"
            >
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-[#0161ff]" />
                  INTELLIGENT DESIGN INSPECTION
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-[40px] w-[700px] max-w-full mx-auto font-display font-bold text-white tracking-tight leading-[1.12]">
                  See What Your Design Is Missing.
                </h1>
                
                <p className="text-[12px] text-slate-300/90 max-w-xl mx-auto leading-relaxed font-sans font-normal">
                  Go beyond visual feedback. Critiq inspects UX, UI, accessibility, and usability to uncover precise issues and actionable improvements.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`w-full h-56 rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 cursor-pointer relative overflow-hidden border ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                
                <div className="w-12 h-12 bg-[#0a0c16] border border-white/5 rounded-2xl flex items-center justify-center mb-3 text-indigo-400 shadow-md">
                  <UploadCloud className="w-6 h-6 text-indigo-400" />
                </div>

                <h3 className="text-xs font-bold text-white font-sans">
                  Drag & drop design or press <kbd className="text-indigo-400 font-mono bg-white/5 px-1 py-0.5 rounded border border-white/10 mx-1">Cmd+V</kbd> to paste
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 mb-4 font-sans">
                  Supports PNG, JPG, or WebP screenshot formats
                </p>
                
                <Button variant="primary" size="sm">
                  Browse Design File
                </Button>
              </div>

              {/* Demo Screens */}
              <div className="space-y-3 text-left">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider px-1">
                  Or select a sample design:
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {demoScreens.map((demo) => (
                    <div
                      key={demo.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedImageSrc(demo.imageSrc);
                        setUploadedFileName(demo.name);
                      }}
                      className="p-3.5 bg-[#0b0c16]/80 hover:bg-[#121424]/80 border border-white/5 hover:border-indigo-500/30 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors block font-sans truncate">{demo.name}</span>
                          <span className="text-[9px] text-slate-500 block font-sans">{demo.badge}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-sans font-bold text-indigo-400 shrink-0 pl-2">
                        Inspect →
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          ) : (
            
            /* Preview & Review Intent Configuration Screen */
            <motion.div
              key="parameters-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: EASE_CUSTOM }}
              className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-start text-left"
            >
              
              {/* Back Link */}
              <div className="col-span-12 flex items-center justify-between pb-2 border-b border-white/5">
                <button
                  onClick={() => {
                    setUploadedImageSrc(null);
                    setUploadedFileName(null);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-sans"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Choose different design file</span>
                </button>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  Target File: <span className="text-indigo-400 font-bold">{uploadedFileName}</span>
                </span>
              </div>

              {/* Left Column: Design Image Preview */}
              <div className="col-span-12 md:col-span-5 space-y-4">
                <Card variant="glass" className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      PREVIEW VIEWPORT
                    </span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-400 font-bold">
                      READY
                    </span>
                  </div>

                  <div className="w-full relative rounded-2xl overflow-hidden border border-white/5 bg-black/60 aspect-[4/5] flex items-center justify-center p-2">
                    {uploadedImageSrc === 'mock_fintech' ? (
                      <div className="absolute inset-2 bg-gradient-to-b from-[#0e0f16] to-[#08090d] p-4 flex flex-col justify-between font-mono text-slate-400 rounded-xl">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-white font-semibold font-sans">Critiq Pay</span>
                          <span className="text-emerald-400">● Live Feed</span>
                        </div>
                        <div className="space-y-2.5 my-auto">
                          <div className="h-16 rounded-xl bg-indigo-600/10 border border-indigo-500/20 p-3 flex flex-col justify-between">
                            <span className="text-[9px] text-slate-500">Total Balance</span>
                            <span className="text-lg text-white font-bold">$12,450.80</span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-7 rounded-lg bg-white/5 flex items-center justify-between px-2 text-[9px]">
                              <span>Transfer to Alice</span>
                              <span className="text-white">-$50.00</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold mt-2 shadow-md">
                          Transfer Funds
                        </div>
                      </div>
                    ) : uploadedImageSrc === 'mock_checkout' ? (
                      <div className="absolute inset-2 bg-gradient-to-b from-[#13141c] to-[#0d0e14] p-4 flex flex-col justify-between font-mono text-slate-400 rounded-xl">
                        <div className="text-[9px] text-white font-semibold pb-1 border-b border-white/5 font-sans">
                          Cart Checkout
                        </div>
                        <div className="space-y-2 my-auto">
                          <span className="text-[8px] text-slate-500 font-sans">SHIPPING ADDRESS</span>
                          <div className="h-6 rounded bg-white/5 border border-white/10" />
                          <span className="text-[8px] text-slate-500 font-sans">PAYMENT METHOD</span>
                          <div className="h-6 rounded bg-indigo-500/10 border border-indigo-500/30" />
                        </div>
                        <div className="h-8 rounded-lg bg-[#16a34a] flex items-center justify-center text-[10px] text-white font-bold mt-2 shadow-md">
                          Pay $132.00
                        </div>
                      </div>
                    ) : (
                      <img
                        src={uploadedImageSrc}
                        alt={uploadedFileName || 'Uploaded layout'}
                        className="max-h-full max-w-full object-contain rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
                    <span className="truncate max-w-[160px] text-slate-200">{uploadedFileName}</span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => {
                        setUploadedImageSrc(null);
                        setUploadedFileName(null);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Discard
                    </Button>
                  </div>
                </Card>
              </div>

              {/* Right Column: User Intent & Optimization Strategy */}
              <div className="col-span-12 md:col-span-7 space-y-6">
                
                <Card variant="glass" className="p-6 space-y-5">
                  {/* Review Intent Input */}
                  <ReviewIntentInput
                    value={userInstruction}
                    onChange={handleInstructionChange}
                  />

                  {/* Optimization Strategy Accordion / Selector */}
                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase text-slate-300">
                        Optimization Strategy
                      </span>
                      <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded font-bold">
                        {correctionStrategy}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {(['Minimal', 'Balanced', 'Comprehensive'] as const).map((strategy) => (
                        <button
                          key={strategy}
                          type="button"
                          onClick={() => setCorrectionStrategy(strategy)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-sans ${
                            correctionStrategy === strategy
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-sm'
                              : 'bg-black/20 hover:bg-black/30 border-white/5 text-slate-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">{strategy}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">
                            {strategy === 'Minimal' ? 'Preserve design direction' : strategy === 'Balanced' ? 'UX/UI & accessibility' : 'Deeper structural audit'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start Inspection CTA */}
                  <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStartAnalysis}
                      className="w-full text-xs font-bold py-3.5"
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                      Start Cognitive Inspection
                    </Button>
                  </div>
                </Card>

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
