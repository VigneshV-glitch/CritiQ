/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  className?: string;
  children?: React.ReactNode;
}

export function IconButton(props: IconButtonProps) {
  const variant = props.variant || 'ghost';
  const size = props.size || 'md';
  const label = props.label;
  const className = props.className || '';
  const children = props.children;

  const baseStyles = 'inline-flex items-center justify-center transition-all cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
    outline: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white'
  };

  const sizes = {
    sm: 'w-8 h-8 min-w-[32px] min-h-[32px]',
    md: 'w-10 h-10 min-w-[40px] min-h-[40px]',
    lg: 'w-12 h-12 min-w-[48px] min-h-[48px]'
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
