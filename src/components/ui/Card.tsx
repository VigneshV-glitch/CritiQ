/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'interactive';
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  variant = 'default',
  className = '',
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl border transition-all';

  const variants = {
    default: 'bg-slate-900/40 border-white/5 shadow-lg',
    glass: 'bg-[#0b0c16]/50 border-white/5 backdrop-blur-md shadow-2xl',
    interactive: 'bg-black/25 border-white/5 hover:bg-black/45 hover:border-white/10 cursor-pointer shadow-md'
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
