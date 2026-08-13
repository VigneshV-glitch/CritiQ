/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = ''
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-mono font-bold uppercase rounded-md border';

  const variants = {
    primary: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
    info: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    neutral: 'bg-white/5 text-slate-300 border-white/10'
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[8px]',
    md: 'px-2 py-0.5 text-[10px]'
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
