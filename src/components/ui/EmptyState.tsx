/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon = <HelpCircle className="w-8 h-8 text-slate-700" />,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`p-8 text-center bg-black/20 rounded-2xl border border-white/5 space-y-3 select-none flex flex-col items-center justify-center ${className}`}>
      <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
        {icon}
      </div>
      <div className="space-y-1 max-w-xs">
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase">{title}</h4>
        <p className="text-xs text-slate-500 font-sans leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
