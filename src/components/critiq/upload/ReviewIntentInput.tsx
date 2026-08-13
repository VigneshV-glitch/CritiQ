/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Compass, ShieldAlert, Layout, Smartphone, CheckCircle } from 'lucide-react';
import { TextArea } from '../../ui/TextArea';

interface ReviewIntentInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const QUICK_SUGGESTIONS = [
  {
    id: 'wcag',
    label: 'WCAG Accessibility',
    prompt: 'Analyze this screen based on WCAG accessibility rules, focus indicators, and color contrast compliance.',
    icon: ShieldAlert
  },
  {
    id: 'minimal',
    label: 'Minimal Correction',
    prompt: 'Audit this screen using minimal corrections. Preserve the existing design direction and only highlight high-impact issues.',
    icon: CheckCircle
  },
  {
    id: 'ux',
    label: 'UX Heuristics',
    prompt: 'Evaluate Jakob Nielsen UX heuristics, user cognitive load, visual hierarchy, and interaction flow.',
    icon: Compass
  },
  {
    id: 'ui',
    label: 'UI Consistency',
    prompt: 'Check font scale pairing, baseline grid alignment, padding symmetry, and design system token consistency.',
    icon: Layout
  },
  {
    id: 'mobile',
    label: 'Mobile Usability',
    prompt: 'Inspect mobile touch targets (44px minimum), thumb zones, viewports, and mobile ergonomics.',
    icon: Smartphone
  },
  {
    id: 'full',
    label: 'Full Audit',
    prompt: 'Perform a comprehensive audit across UX heuristics, UI visual polish, WCAG 2.1 AA accessibility, and mobile usability.',
    icon: Sparkles
  }
];

export function ReviewIntentInput({
  value,
  onChange,
  className = ''
}: ReviewIntentInputProps) {
  return (
    <div className={`space-y-3.5 ${className}`}>
      <div className="space-y-1">
        <label className="text-xs font-sans font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          What should Critiq review?
        </label>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Tell Critiq what you want to inspect. You can describe a specific standard, usability concern, visual problem, or correction approach.
        </p>
      </div>

      <TextArea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Analyze this screen based on WCAG 2.1 AA contrast rules and check touch target sizes..."
        className="min-h-[100px] text-xs leading-relaxed bg-[#060812] border-white/10 focus:border-indigo-500/60"
      />

      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
          Quick Intent Suggestions
        </span>
        <div className="flex flex-wrap gap-2">
          {QUICK_SUGGESTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = value === item.prompt;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.prompt)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
