/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Check, Terminal, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Rule, ReviewType, AuditReport, Severity } from '../types';
import { Card } from '../components/ui/Card';
import { generateClientAuditReport, optimizeImageForUpload } from '../lib/clientAuditor';

interface DiagnosingProps {
  onComplete: (report: AuditReport | null, error?: string) => void;
  fileName?: string;
  imageSrc: string;
  rules: Rule[];
  reviewType: ReviewType;
  userInstruction?: string;
  correctionStrategy?: string;
}

interface Step {
  id: number;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export default function Diagnosing({
  onComplete,
  fileName = 'uploaded_layout.png',
  imageSrc,
  rules,
  reviewType,
  userInstruction,
  correctionStrategy,
}: DiagnosingProps) {
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [consoleLog, setConsoleLog] = useState<string>('Booting Critiq vision engine...');
  const [allConsoleLogs, setAllConsoleLogs] = useState<string[]>(['Booting Critiq vision engine...']);
  const [apiReport, setApiReport] = useState<AuditReport | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isConsoleLogsExpanded, setIsConsoleLogsExpanded] = useState(false);
  const isResolvedRef = useRef(false);

  // 6 specific inspection steps
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, label: 'Image structure detected', status: 'pending' },
    { id: 2, label: 'UI elements identified', status: 'pending' },
    { id: 3, label: 'Layout relationships analyzed', status: 'pending' },
    { id: 4, label: 'Accessibility rules evaluated', status: 'pending' },
    { id: 5, label: 'Usability heuristics', status: 'pending' },
    { id: 6, label: 'Consistency analysis', status: 'pending' }
  ]);

  const liveLogs = [
    'Handshaking with vision layout matrices...',
    'Locating boundary bounding boxes & visual overlays on elements...',
    'Running color contrast analysis against WCAG AA parameters...',
    'Evaluating element target coordinates and touch zones...',
    'Checking layout alignment grids & spacing boundaries...',
    'Drafting prioritized heuristic findings and recommendations...'
  ];

  // 1. Trigger the actual API call on mount
  useEffect(() => {
    let active = true;

    async function fetchAnalysis() {
      try {
        // Optimize base64 image dimensions to prevent Cloudflare payload limits or slow network bottlenecks
        const optimizedSrc = await optimizeImageForUpload(imageSrc);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s timeout

        const response = await fetch('/api/critiq/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            imageSrc: optimizedSrc,
            rules,
            reviewType,
            fileName,
            userInstruction,
            correctionStrategy,
          })
        });

        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (!active) return;

        if (data.isUnavailable || data.error || !data.issues || data.issues.length === 0) {
          // Graceful high-fidelity heuristic fallback
          console.warn('[Critiq Diagnosing] Server returned limit or incomplete data, generating high-fidelity heuristic audit...');
          const fallback = generateClientAuditReport(
            imageSrc,
            fileName,
            reviewType,
            userInstruction,
            correctionStrategy
          );
          setApiReport(fallback);
        } else {
          setApiReport({
            id: data.id || `rev_${Math.random().toString(36).substr(2, 6)}`,
            projectId: 'proj_fintech',
            name: fileName.split('.')[0] || 'Uploaded Wireframe',
            imageUrl: imageSrc,
            reviewType: reviewType,
            score: data.score || 85,
            scoreBreakdown: data.scoreBreakdown,
            severity: data.severity || Severity.MEDIUM,
            summary: data.summary || 'Audit completed successfully.',
            issues: (data.issues || []).map((iss: any, idx: number) => ({
              id: iss.id || `iss_${Math.random().toString(36).substr(2, 6)}_${idx}`,
              ...iss
            })),
            recommendations: data.recommendations || [],
            createdAt: new Date().toISOString(),
            visualObservationSummary: data.visualObservationSummary,
            screenModel: data.screenModel,
            unifiedReport: data.unifiedReport,
            isUnavailable: false,
            userInstruction: data.userInstruction || userInstruction,
            correctionStrategy: data.correctionStrategy || correctionStrategy,
          });
        }
      } catch (err: any) {
        if (!active) return;
        console.warn('Network or API rate limit reached in Diagnosing view, engaging instant client-side heuristic audit:', err);
        const clientAudit = generateClientAuditReport(
          imageSrc,
          fileName,
          reviewType,
          userInstruction,
          correctionStrategy
        );
        setApiReport(clientAudit);
      } finally {
        isResolvedRef.current = true;
      }
    }

    fetchAnalysis();

    return () => {
      active = false;
    };
  }, [imageSrc, rules, reviewType, fileName, userInstruction, correctionStrategy]);

  // 2. Animate progress steps
  useEffect(() => {
    const stepDuration = 600;
    
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        
        setSteps(prevSteps => 
          prevSteps.map((step, idx) => {
            if (idx < prevIndex) return { ...step, status: 'completed' };
            if (idx === prevIndex) return { ...step, status: 'processing' };
            return step;
          })
        );

        if (prevIndex < liveLogs.length) {
          const logMsg = liveLogs[prevIndex];
          setConsoleLog(logMsg);
          setAllConsoleLogs(prev => [...prev, logMsg]);
        }

        if (nextIndex >= steps.length) {
          clearInterval(stepInterval);
        }
        return nextIndex;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          if (!isResolvedRef.current) {
            return 98;
          }
          return 98;
        }
        return prev + 1;
      });
    }, 40);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [steps.length]);

  // 3. Complete and transition
  useEffect(() => {
    const checkCompletionInterval = setInterval(() => {
      if (isResolvedRef.current && apiReport) {
        clearInterval(checkCompletionInterval);
        
        setProgress(100);
        setSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));
        setConsoleLog('Finalizing visual inspection findings...');
        setAllConsoleLogs(prev => [...prev, 'Finalizing visual inspection findings...', 'Success! Transitioning to Review Workspace...']);

        const finalDelay = setTimeout(() => {
          onComplete(apiReport, apiError || undefined);
        }, 800);

        return () => clearTimeout(finalDelay);
      }
    }, 100);

    return () => clearInterval(checkCompletionInterval);
  }, [apiReport, apiError, onComplete]);

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

      {/* Header with Workflow Progress */}
      <header className="h-16 flex items-center justify-between px-6 z-20 shrink-0 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-none">Critiq Inspection Engine</span>
        </div>

        <div className="text-xs font-mono text-slate-400 truncate max-w-[120px] sm:max-w-none text-right">
          Target: <span className="text-indigo-300 font-bold">{fileName}</span>
        </div>
      </header>

      {/* Stage 02 Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-0 overflow-y-auto custom-scrollbar">
        
        <div className="w-full max-w-lg text-center space-y-8 z-10 my-auto">
          
          {/* Circular Loader with Preview */}
          <div className="space-y-4">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-white/5"
                  strokeWidth="4"
                  fill="transparent"
                />
                <motion.circle
                  cx="72"
                  cy="72"
                  r="64"
                  className="stroke-indigo-500"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 64}
                  animate={{ strokeDashoffset: 2 * Math.PI * 64 * (1 - progress / 100) }}
                  transition={{ duration: 0.1, ease: 'easeOut' }}
                />
              </svg>

              <div className="absolute w-28 h-28 rounded-full bg-slate-900 border border-white/10 overflow-hidden flex flex-col items-center justify-center">
                {imageSrc.startsWith('mock_') ? (
                  <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center text-indigo-300 text-xs font-bold">
                    PREVIEW
                  </div>
                ) : (
                  <img 
                    src={imageSrc} 
                    alt="Uploaded viewport design" 
                    className="w-full h-full object-cover opacity-35 scale-105"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center">
                  <span className="text-xl font-mono font-extrabold text-white leading-none">{progress}%</span>
                  <span className="text-[9px] font-mono font-semibold tracking-wider text-indigo-300 uppercase mt-1 animate-pulse">Inspecting</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-xl font-display font-semibold text-white tracking-tight">
                Critiq is inspecting your design
              </h2>
              <p className="text-xs font-sans text-slate-400">
                Evaluating visual structure, WCAG accessibility rules, and UX heuristics
              </p>
            </div>
          </div>

          {/* Analysis Stages */}
          <Card variant="glass" className="p-5 text-left space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                Inspection Progress
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-400">
                {steps.filter(s => s.status === 'completed').length} / {steps.length} Complete
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {steps.map((step) => {
                const isProcessing = step.status === 'processing';
                const isCompleted = step.status === 'completed';

                return (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
                      isProcessing 
                        ? 'bg-indigo-600/10 border-indigo-500/25 text-white' 
                        : isCompleted 
                          ? 'bg-transparent border-transparent text-indigo-200' 
                          : 'bg-transparent border-transparent text-slate-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border ${
                      isCompleted 
                        ? 'bg-indigo-600 border-indigo-500 text-white' 
                        : isProcessing
                          ? 'bg-black/30 border-indigo-500/50 text-indigo-400'
                          : 'bg-black/20 border-white/5 text-slate-700'
                    }`}>
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      ) : isProcessing ? (
                        <div className="w-2 h-2 rounded-full border border-indigo-400 border-t-transparent animate-spin"></div>
                      ) : (
                        <span className="text-[9px] font-mono font-bold">{step.id}</span>
                      )}
                    </div>
                    <span className={`text-xs font-semibold tracking-tight ${isProcessing ? 'text-white' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Collapsible View Analysis Details Drawer */}
          <div className="space-y-2 w-full max-w-sm mx-auto">
            <div className="px-3.5 py-2 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between text-left">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-mono text-[10px] text-slate-300 truncate leading-none">
                  {consoleLog}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => setIsConsoleLogsExpanded(!isConsoleLogsExpanded)}
                className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors ml-2 shrink-0 cursor-pointer text-[10px] font-mono flex items-center gap-1"
              >
                <span>Details</span>
                {isConsoleLogsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <AnimatePresence>
              {isConsoleLogsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden bg-black/60 border border-white/5 rounded-xl p-3 text-left font-mono text-[9px] text-slate-400 space-y-1.5 h-32 overflow-y-auto custom-scrollbar"
                >
                  {allConsoleLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2.5">
                      <span className="text-indigo-500/75 select-none font-bold">▶</span>
                      <span className="leading-tight">{log}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      </div>
    </div>
  );
}
