/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ShieldCheck, Compass, Layout, Smartphone, CheckCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Progress } from '../../ui/Progress';
import { Badge } from '../../ui/Badge';

interface ScoreOverviewProps {
  score: number;
  scoreBreakdown?: {
    visualDesign: number;
    usability: number;
    accessibility: number;
    consistency: number;
  };
  className?: string;
}

export function ScoreOverview({
  score,
  scoreBreakdown = {
    visualDesign: Math.min(100, score + 4),
    usability: Math.min(100, score - 2),
    accessibility: Math.min(100, score - 5),
    consistency: Math.min(100, score + 2)
  },
  className = ''
}: ScoreOverviewProps) {
  const getScoreRating = (s: number) => {
    if (s >= 85) return { label: 'Excellent Design Quality', color: 'text-emerald-400', badge: 'success' as const };
    if (s >= 70) return { label: 'Good — Needs Minor Polish', color: 'text-indigo-400', badge: 'primary' as const };
    if (s >= 50) return { label: 'Moderate UX Risks Identified', color: 'text-amber-400', badge: 'warning' as const };
    return { label: 'Critical UX/UI Issues Detected', color: 'text-rose-400', badge: 'danger' as const };
  };

  const rating = getScoreRating(score);

  return (
    <Card variant="glass" className={`p-6 space-y-6 ${className}`}>
      {/* Top Banner Overall Score */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 tracking-wider block">
            Overall Design Health Index
          </span>
          <div className="flex items-center gap-3">
            <span className="text-4xl font-mono font-extrabold text-white tracking-tight">
              {score}<span className="text-slate-500 text-xl font-normal">/100</span>
            </span>
            <Badge variant={rating.badge} size="md">
              {rating.label}
            </Badge>
          </div>
        </div>

        <div className="w-full sm:w-48 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Health Index</span>
            <span className="text-indigo-300 font-bold">{score}%</span>
          </div>
          <Progress
            value={score}
            color={score >= 80 ? 'emerald' : score >= 60 ? 'indigo' : 'rose'}
            size="md"
          />
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* UX Health */}
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              UX Health
            </span>
            <span className="text-sm font-mono font-bold text-white">{scoreBreakdown.usability}%</span>
          </div>
          <Progress value={scoreBreakdown.usability} color="indigo" size="sm" />
        </div>

        {/* UI Health */}
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-indigo-400" />
              UI Polish
            </span>
            <span className="text-sm font-mono font-bold text-white">{scoreBreakdown.visualDesign}%</span>
          </div>
          <Progress value={scoreBreakdown.visualDesign} color="indigo" size="sm" />
        </div>

        {/* Accessibility Health */}
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Accessibility
            </span>
            <span className="text-sm font-mono font-bold text-white">{scoreBreakdown.accessibility}%</span>
          </div>
          <Progress value={scoreBreakdown.accessibility} color="emerald" size="sm" />
        </div>

        {/* Consistency */}
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
              Consistency
            </span>
            <span className="text-sm font-mono font-bold text-white">{scoreBreakdown.consistency}%</span>
          </div>
          <Progress value={scoreBreakdown.consistency} color="indigo" size="sm" />
        </div>
      </div>
    </Card>
  );
}
