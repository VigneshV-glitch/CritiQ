/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'emerald' | 'amber' | 'rose';
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'indigo',
  className = ''
}: ProgressProps) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  const sizes = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5'
  };

  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500'
  };

  return (
    <div className={`w-full bg-white/5 rounded-full overflow-hidden ${sizes[size]} ${className}`}>
      <div
        className={`h-full transition-all duration-500 ${colors[color]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
