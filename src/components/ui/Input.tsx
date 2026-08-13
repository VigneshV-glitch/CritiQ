/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
}

export function Input(props: InputProps) {
  const label = props.label;
  const error = props.error;
  const className = props.className || '';
  const id = props.id;

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-[#05060c] border border-white/10 focus:border-indigo-500/50 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-sans ${
          error ? 'border-rose-500/50' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-rose-400 font-sans">{error}</p>
      )}
    </div>
  );
}
