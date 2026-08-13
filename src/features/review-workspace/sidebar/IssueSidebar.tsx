/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useEffect } from 'react';
import { CritiqIssue } from '../../../lib/critiq-engine/types';
import { useSelectionStore, selectionActions } from '../state/selectionStore';
import { useIssueStore, issueActions } from '../state/issueStore';
import { AuditReport } from '../../../types';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  EyeOff, 
  Compass, 
  AlertTriangle, 
  Layers, 
  CheckCircle,
  Lightbulb,
  Info,
  HelpCircle,
  ShieldAlert,
  Clock,
  Target
} from 'lucide-react';

interface IssueSidebarProps {
  issues: CritiqIssue[];
  report?: AuditReport | null;
}

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

const IMPACT_ORDER: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

// Stable priority-based sorting function
export function sortIssues(issues: CritiqIssue[]): CritiqIssue[] {
  return [...issues].sort((a, b) => {
    // 1. Severity first
    const sevA = SEVERITY_ORDER[a.severity?.toString().toLowerCase()] ?? 99;
    const sevB = SEVERITY_ORDER[b.severity?.toString().toLowerCase()] ?? 99;
    if (sevA !== sevB) {
      return sevA - sevB;
    }

    // 2. User impact
    const userA = IMPACT_ORDER[a.userImpact] ?? 99;
    const userB = IMPACT_ORDER[b.userImpact] ?? 99;
    if (userA !== userB) {
      return userA - userB;
    }

    // 3. Accessibility impact
    const accessA = IMPACT_ORDER[a.accessibilityImpact] ?? 99;
    const accessB = IMPACT_ORDER[b.accessibilityImpact] ?? 99;
    if (accessA !== accessB) {
      return accessA - accessB;
    }

    // 4. Confidence (descending)
    const confA = a.confidence ?? 0;
    const confB = b.confidence ?? 0;
    if (confA !== confB) {
      return confB - confA;
    }

    // 5. Visual prominence (area of boundingBox descending)
    const areaA = a.boundingBox ? (a.boundingBox.width * a.boundingBox.height) : 0;
    const areaB = b.boundingBox ? (b.boundingBox.width * b.boundingBox.height) : 0;
    if (areaA !== areaB) {
      return areaB - areaA;
    }

    return 0; // maintain stability
  });
}

export default function IssueSidebar({ issues, report }: IssueSidebarProps) {
  const { selectedIssueId } = useSelectionStore();
  const { statusMap } = useIssueStore();

  // Sort issues strictly by severity and priority metrics
  const sortedIssues = useMemo(() => {
    return sortIssues(issues);
  }, [issues]);

  // Determine currently selected issue, or auto-select highest priority
  const selectedIssue = useMemo(() => {
    if (sortedIssues.length === 0) return null;
    return sortedIssues.find((i) => i.id === selectedIssueId) || sortedIssues[0];
  }, [sortedIssues, selectedIssueId]);

  // Ensure selection state is set when active issue changes
  useEffect(() => {
    if (selectedIssue && selectedIssue.id !== selectedIssueId) {
      selectionActions.selectIssue(selectedIssue.id);
    }
  }, [selectedIssue, selectedIssueId]);

  // Index mapping inside sorted priority queue
  const currentIndex = useMemo(() => {
    if (!selectedIssue) return -1;
    return sortedIssues.findIndex((i) => i.id === selectedIssue.id);
  }, [sortedIssues, selectedIssue]);

  // Statistics calculation for dynamic Review Progress
  const stats = useMemo(() => {
    let resolvedCount = 0;
    
    // Severity-specific totals and resolved counts
    const severityStats = {
      critical: { total: 0, resolved: 0 },
      high: { total: 0, resolved: 0 },
      medium: { total: 0, resolved: 0 },
      low: { total: 0, resolved: 0 },
    };

    sortedIssues.forEach((i) => {
      const isResolved = statusMap[i.id] === 'resolved';
      if (isResolved) resolvedCount++;

      const sev = i.severity?.toString().toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
      if (severityStats[sev]) {
        severityStats[sev].total++;
        if (isResolved) severityStats[sev].resolved++;
      }
    });

    return {
      total: sortedIssues.length,
      resolvedCount,
      severityStats,
    };
  }, [sortedIssues, statusMap]);

  // Sequential Navigation controls
  const handleNext = () => {
    if (currentIndex < sortedIssues.length - 1) {
      selectionActions.selectIssue(sortedIssues[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      selectionActions.selectIssue(sortedIssues[currentIndex - 1].id);
    }
  };

  // Status transitions with auto-advance pipeline
  const handleUpdateStatus = (status: 'resolved' | 'ignored' | 'needs_review') => {
    if (!selectedIssue) return;
    
    let note = '';
    if (status === 'resolved') note = 'Audit finding reviewed & resolved.';
    else if (status === 'ignored') note = 'Issue dismissed by designer.';
    else if (status === 'needs_review') note = 'Marked as needing design attention.';

    issueActions.updateIssueStatus(selectedIssue.id, status, note);

    // Auto-advance sequentially to next finding
    if (currentIndex < sortedIssues.length - 1) {
      setTimeout(() => {
        selectionActions.selectIssue(sortedIssues[currentIndex + 1].id);
      }, 350);
    }
  };

  // Styling helper based on severity
  const getSeverityStyle = (sev: string) => {
    switch (sev.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      default: return 'bg-sky-500/10 text-sky-300 border-sky-500/20';
    }
  };

  if (!selectedIssue) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none space-y-3">
        <Compass className="w-10 h-10 text-slate-700 animate-pulse" />
        <p className="text-xs font-mono font-bold text-slate-400 uppercase">No Active Findings</p>
        <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
          Provide a mock visual screen and trigger analysis to run the multi-agent inspector audits.
        </p>
      </div>
    );
  }

  const currentStatus = statusMap[selectedIssue.id] || 'unresolved';

  // Extract variables with strict fallbacks
  const evidenceList = selectedIssue.evidence || [selectedIssue.description];
  const solutionText = selectedIssue.recommendedSolution || 'Verify layout parameters to increase general alignment and accessibility compliance.';
  const rootCause = selectedIssue.rootCause || 'Misaligned coordinate scaling or mismatched design tokens.';
  const whyItMatters = selectedIssue.whyItMatters || 'Failing to establish clear layout structure increases cognitive friction and compromises user trust.';
  const uxHeuristic = selectedIssue.uxPrinciple || 'Aesthetic-Usability Effect';
  const wcagReference = selectedIssue.accessibilityGuideline || 'WCAG 2.1 AA - 1.4.3 Contrast (Minimum)';

  const isLowLocationConfidence = selectedIssue.locationConfidence !== undefined && selectedIssue.locationConfidence < 60;

  return (
    <div className="h-full flex flex-col space-y-4 text-left select-none">
      
      {/* 1. REVIEW PROGRESS COMPONENT */}
      <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3 relative shrink-0">
        <div className="absolute top-0 inset-x-0 h-0.5 bg-indigo-500/20" />
        
        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
          <span className="text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Review Progress</span>
          </span>
          <span className="text-indigo-300">
            {stats.resolvedCount} / {stats.total} Reviewed
          </span>
        </div>

        {/* Total Progress Bar */}
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${(stats.resolvedCount / Math.max(1, stats.total)) * 100}%` }}
          />
        </div>

        {/* Severity Progress Breakdown */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-rose-400 font-bold">Critical</span>
            <span className="text-slate-300">
              {stats.severityStats.critical.resolved} / {stats.severityStats.critical.total}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-orange-400 font-bold">High</span>
            <span className="text-slate-300">
              {stats.severityStats.high.resolved} / {stats.severityStats.high.total}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-amber-400 font-bold">Medium</span>
            <span className="text-slate-300">
              {stats.severityStats.medium.resolved} / {stats.severityStats.medium.total}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-sky-400 font-bold">Low</span>
            <span className="text-slate-300">
              {stats.severityStats.low.resolved} / {stats.severityStats.low.total}
            </span>
          </div>
        </div>
      </div>

      {/* 2. INSPECTOR TITLE HEADER */}
      <div className="flex justify-between items-center bg-indigo-950/25 px-3.5 py-2 rounded-xl border border-indigo-500/10 shrink-0">
        <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
          <span>INSPECTOR FLOW</span>
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-400">
          Finding {currentIndex + 1} of {sortedIssues.length}
        </span>
      </div>

      {/* 3. SCROLLABLE INSPECTOR AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1.5 space-y-4 min-h-0">
        <div className="bg-black/30 border border-white/5 rounded-2xl p-4.5 space-y-4.5">
          
          {/* Finding Title & Severity Badge */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-[9px] font-mono font-black uppercase rounded border ${getSeverityStyle(selectedIssue.severity)}`}>
                {selectedIssue.severity}
              </span>
              <span className="bg-black/40 border border-white/5 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded">
                Inspector: {selectedIssue.confidence}%
              </span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
              {selectedIssue.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {selectedIssue.description}
            </p>
          </div>

          {/* Location details card */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold border-b border-white/5 pb-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-400" />
                <span>LOCATION SPECIFICS</span>
              </span>
              <span className="text-indigo-300 uppercase tracking-wide">
                {selectedIssue.locationType || 'element'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">Location Confidence</span>
              <div className="flex items-center gap-2">
                <span className={`font-mono text-xs font-bold ${isLowLocationConfidence ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {selectedIssue.locationConfidence ?? 85}%
                </span>
                {isLowLocationConfidence && (
                  <span className="text-[8px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1 py-0.5 rounded">
                    LOW CONFIDENCE
                  </span>
                )}
              </div>
            </div>

            {/* Visual location confidence scale */}
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${isLowLocationConfidence ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${selectedIssue.locationConfidence ?? 85}%` }}
              />
            </div>

            {isLowLocationConfidence && (
              <p className="text-[9px] text-slate-400 font-sans leading-normal leading-relaxed italic">
                Precise coordinates are fuzzy. Review the general region indicated above.
              </p>
            )}
          </div>

          {/* EXACT EVIDENCE SECTION */}
          <div className="space-y-2.5 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                EXACT EVIDENCE
              </span>
            </div>
            <ul className="space-y-2">
              {evidenceList.map((item, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-slate-300 leading-relaxed font-normal">
                  <span className="text-indigo-400 font-mono font-bold select-none text-[10px] shrink-0">[E{idx + 1}]</span>
                  <p>{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* WHY THIS MATTERS */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                WHY THIS MATTERS
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
              {whyItMatters}
            </p>
          </div>

          {/* ACTIONABLE RECOMMENDATION */}
          <div className="space-y-3.5 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                RECOMMENDATION
              </span>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 p-3.5 rounded-xl space-y-1.5">
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {solutionText}
              </p>
            </div>
          </div>

          {/* RULES & GUIDELINES REFERENCE */}
          <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 text-left">
            <div className="p-2.5 bg-black/20 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                UX HEURISTIC
              </span>
              <span className="text-[11px] text-indigo-300 font-mono block leading-snug truncate" title={uxHeuristic}>
                {uxHeuristic}
              </span>
            </div>

            <div className="p-2.5 bg-black/20 rounded-xl border border-white/5 space-y-1">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block tracking-wider">
                WCAG REFERENCE
              </span>
              <span className="text-[11px] text-sky-300 font-mono block leading-snug truncate" title={wcagReference}>
                {wcagReference}
              </span>
            </div>
          </div>

          {/* TECHNICAL EVIDENCE / DIAGNOSTIC LOG */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                TECHNICAL EVIDENCE
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-mono bg-black/40 border border-white/5 p-3 rounded-xl break-all">
              {rootCause}
            </p>
          </div>

        </div>
      </div>

      {/* 4. GUIDED ACTION WORKFLOW & NAVIGATION */}
      <div className="space-y-2 pt-3 border-t border-white/5 shrink-0">
        
        {/* Completion actions */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleUpdateStatus('resolved')}
            className={`py-2.5 px-1 rounded-xl text-[10px] font-bold font-sans border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              currentStatus === 'resolved'
                ? 'bg-emerald-600 border-emerald-400 text-white'
                : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Reviewed</span>
          </button>

          <button
            onClick={() => handleUpdateStatus('needs_review')}
            className={`py-2.5 px-1 rounded-xl text-[10px] font-bold font-sans border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              currentStatus === 'needs_review'
                ? 'bg-amber-600 border-amber-400 text-white'
                : 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-amber-400 hover:text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Attention</span>
          </button>

          <button
            onClick={() => handleUpdateStatus('ignored')}
            className={`py-2.5 px-1 rounded-xl text-[10px] font-bold font-sans border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
              currentStatus === 'ignored'
                ? 'bg-slate-700 border-slate-500 text-white'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
        </div>

        {/* Previous / Next Controls */}
        <div className="flex items-center justify-between gap-2.5 bg-black/45 p-1 rounded-xl border border-white/5">
          <button
            onClick={handlePrev}
            disabled={currentIndex <= 0}
            className="flex-1 py-2 px-3.5 flex items-center justify-center gap-1.5 bg-white/2 hover:bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="text-[11px] font-mono text-slate-400 font-bold px-2 shrink-0 select-none">
            {currentIndex + 1} / {sortedIssues.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex >= sortedIssues.length - 1}
            className="flex-1 py-2 px-3.5 flex items-center justify-center gap-1.5 bg-white/2 hover:bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-slate-300 hover:text-white disabled:opacity-20 disabled:hover:bg-transparent transition-all cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
export { selectionActions };
