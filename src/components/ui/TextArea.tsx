/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
}

export function TextArea({
  label,
  error,
  className = '',
  id,
  value,
  placeholder,
  onChange,
  ...rest
}: TextAreaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full text-left">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={`w-full bg-[#05060c] border border-white/10 focus:border-indigo-500/50 rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all font-sans resize-none leading-relaxed ${
          error ? 'border-rose-500/50' : ''
        } ${className}`}
        {...rest}
      />
      {error && (
        <p className="text-[10px] text-rose-400 font-sans">{error}</p>
      )}
    </div>
  );
}
