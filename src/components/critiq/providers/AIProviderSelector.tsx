/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Cpu, ChevronDown, Check, Zap, SlidersHorizontal } from 'lucide-react';
import { useAIGateway } from '../../../state/AIProviderContext';
import { AIProviderType } from '../../../ai/types/provider';

export const AIProviderSelector: React.FC = () => {
  const {
    selectedProvider,
    selectedModel,
    selectedStrategy,
    setSelectedProvider,
    setIsHubOpen,
  } = useAIGateway();

  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { id: AIProviderType | 'auto'; label: string; badge: string; icon: string }[] = [
    { id: 'auto', label: 'Auto Gateway', badge: 'Smart Router', icon: '✨' },
    { id: 'gemini', label: 'Google Gemini', badge: '3.6 Flash / Pro', icon: '♊' },
    { id: 'claude', label: 'Anthropic Claude', badge: '3.7 Sonnet', icon: '🧠' },
    { id: 'openai', label: 'OpenAI', badge: 'GPT-4o', icon: '⚡' },
    { id: 'openrouter', label: 'OpenRouter', badge: 'Multi-Model', icon: '🌐' },
  ];

  const currentOption = options.find((o) => o.id === selectedProvider) || options[0];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        id="ai-provider-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 border border-slate-700/60 transition-all text-xs font-mono shadow-sm group backdrop-blur-md"
      >
        <span className="text-sm">{currentOption.icon}</span>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-semibold text-slate-100">{currentOption.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-sans border border-indigo-500/30">
              {selectedProvider === 'auto' ? selectedStrategy : selectedModel.split('-')[0]}
            </span>
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform duration-150" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl bg-[#0e1017] border border-slate-800 shadow-2xl z-50 p-2 space-y-1 divide-y divide-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" /> AI Provider Routing
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsHubOpen(true);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3" /> Hub
              </button>
            </div>
          </div>

          <div className="py-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = selectedProvider === opt.id;
              return (
                <button
                  key={opt.id}
                  id={`ai-provider-option-${opt.id}`}
                  onClick={() => {
                    setSelectedProvider(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all ${
                    isSelected
                      ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{opt.icon}</span>
                    <div className="text-left">
                      <div className="text-slate-200 font-sans font-medium">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{opt.badge}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 px-2">
            <button
              onClick={() => {
                setIsOpen(false);
                setIsHubOpen(true);
              }}
              className="w-full py-1.5 text-center text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Configure API Keys & Models
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
