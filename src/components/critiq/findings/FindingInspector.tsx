/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert, 
  Sparkles, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Target
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Issue, Severity } from '../../../types';

export type IssueStatus = 'pending' | 'reviewed' | 'attention' | 'dismissed';

interface FindingInspectorProps {
  issue: Issue;
  currentIndex: number;
  totalIssues: number;
  status: IssueStatus;
  onUpdateStatus: (issueId: string, status: IssueStatus) => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  className?: string;
}

export function FindingInspector({
  issue,
  currentIndex,
  totalIssues,
  status,
  onUpdateStatus,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  className = ''
}: FindingInspectorProps) {
  const [showTechnicalEvidence, setShowTechnicalEvidence] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Badge variant="danger">CRITICAL</Badge>;
      case 'high':
        return <Badge variant="warning">HIGH</Badge>;
      case 'medium':
        return <Badge variant="primary">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="info">LOW</Badge>;
      default:
        return <Badge variant="neutral">INFO</Badge>;
    }
  };

  const confidence = issue.confidence || 88;
  const locationConfidence = issue.locationConfidence || 92;

  const handleMarkReviewed = () => {
    onUpdateStatus(issue.id, 'reviewed');
    if (hasNext) {
      onNext();
    }
  };

  const handleNeedsAttention = () => {
    onUpdateStatus(issue.id, 'attention');
    if (hasNext) {
      onNext();
    }
  };

  const handleDismiss = () => {
    onUpdateStatus(issue.id, 'dismissed');
    if (hasNext) {
      onNext();
    }
  };

  return (
    <Card variant="glass" className={`p-5 flex flex-col gap-4 ${className}`}>
      {/* Header index & severity */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">
            Finding {String(currentIndex + 1).padStart(2, '0')} of {String(totalIssues).padStart(2, '0')}
          </span>
          {status !== 'pending' && (
            <Badge
              variant={
                status === 'reviewed' ? 'success' : status === 'attention' ? 'warning' : 'neutral'
              }
              size="sm"
            >
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
        {getSeverityBadge(issue.severity)}
      </div>

      {/* Title */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-white font-sans leading-snug">
          {issue.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed font-sans">
          {issue.description}
        </p>
      </div>

      {/* Confidence Metrics */}
      <div className="grid grid-cols-2 gap-2 bg-black/30 rounded-xl p-3 border border-white/5 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Finding Confidence</span>
          <span className="text-sm font-bold text-indigo-300">{confidence}%</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Location Precision</span>
          <span className="text-sm font-bold text-indigo-300">
            {issue.locationType === 'global' ? 'Global Screen' : `${locationConfidence}%`}
          </span>
        </div>
      </div>

      {/* Why This Matters */}
      <div className="space-y-1 bg-white/2 rounded-xl p-3 border border-white/5">
        <span className="text-[10px] font-mono font-bold uppercase text-amber-400/90 flex items-center gap-1.5">
          <Info className="w-3 h-3" />
          Why This Matters
        </span>
        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          {issue.description}
        </p>
      </div>

      {/* Recommendation */}
      <div className="space-y-1 bg-indigo-500/5 rounded-xl p-3 border border-indigo-500/20">
        <span className="text-[10px] font-mono font-bold uppercase text-indigo-300 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          Recommendation
        </span>
        <p className="text-xs text-indigo-100 font-sans leading-relaxed">
          {issue.recommendation}
        </p>
      </div>

      {/* WCAG Reference if available */}
      {issue.ruleKey?.toLowerCase().includes('wcag') && (
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono bg-black/20 p-2.5 rounded-lg border border-white/5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>WCAG Guideline: <strong className="text-slate-200">{issue.ruleKey}</strong></span>
        </div>
      )}

      {/* Technical Evidence Accordion */}
      <div className="border-t border-white/5 pt-2">
        <button
          type="button"
          onClick={() => setShowTechnicalEvidence(!showTechnicalEvidence)}
          className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-white py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            Technical Evidence
          </span>
          {showTechnicalEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTechnicalEvidence && (
          <div className="mt-2 p-3 bg-black/40 rounded-xl border border-white/5 text-[10px] font-mono text-slate-400 space-y-1.5">
            <div>
              <span className="text-slate-500">Bounding Box:</span>{' '}
              {issue.boundingBox
                ? `x:${issue.boundingBox.x}%, y:${issue.boundingBox.y}%, w:${issue.boundingBox.width}%, h:${issue.boundingBox.height}%`
                : 'Global Issue (No Box)'}
            </div>
            <div>
              <span className="text-slate-500">Category:</span> {issue.category}
            </div>
            <div>
              <span className="text-slate-500">Rule Key:</span> {issue.ruleKey}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
        <Button
          variant="primary"
          size="sm"
          onClick={handleMarkReviewed}
          className="w-full text-xs"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Reviewed
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNeedsAttention}
          className="w-full text-xs"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          Attention
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDismiss}
          className="w-full text-xs text-slate-400 hover:text-white"
        >
          <XCircle className="w-3.5 h-3.5" />
          Dismiss
        </Button>
      </div>

      {/* Sequential Navigation */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="text-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <span className="text-[10px] font-mono text-slate-500">
          {currentIndex + 1} / {totalIssues}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!hasNext}
          onClick={onNext}
          className="text-xs"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
