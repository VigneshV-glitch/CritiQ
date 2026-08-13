/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold transition-all cursor-pointer rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/20 shadow-md shadow-indigo-600/20',
    secondary: 'bg-white/10 hover:bg-white/15 text-white border border-white/10',
    outline: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white border border-white/10',
    ghost: 'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
    danger: 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[32px]',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-3 text-sm gap-2 min-h-[46px]'
  };

  return (
    <button
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
