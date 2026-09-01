/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAIGateway } from '../../../state/AIProviderContext';
import { AIProviderType, AIStrategy } from '../../../ai/types/provider';

export const AIProviderHubModal: React.FC = () => {
  const {
    isHubOpen,
    setIsHubOpen,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    selectedStrategy,
    setSelectedStrategy,
    connections,
    availableModels,
    testConnection,
    isTestingConnection,
  } = useAIGateway();

  const [activeTab, setActiveTab] = useState<'providers' | 'strategy' | 'capabilities'>('providers');
  const [testResult, setTestResult] = useState<{ provider: string; message: string; isValid: boolean } | null>(null);

  if (!isHubOpen) return null;

  const handleTest = async (provider: AIProviderType) => {
    const res = await testConnection(provider);
    setTestResult({
      provider,
      message: res.message,
      isValid: res.isValid,
    });
  };

  const providerList: { id: AIProviderType; name: string; icon: string; desc: string }[] = [
    {
      id: 'gemini',
      name: 'Google Gemini',
      icon: '♊',
      desc: 'Multimodal vision & spatial bounding boxes via Gemini 3.6 Flash / 3.7 Flash.',
    },
    {
      id: 'claude',
      name: 'Anthropic Claude',
      icon: '🧠',
      desc: 'High-precision layout reasoning and nuanced typographic critique via Claude 3.7 Sonnet.',
    },
    {
      id: 'openai',
      name: 'OpenAI',
      icon: '⚡',
      desc: 'Vision analysis and structured finding extraction via GPT-4o & GPT-4o Mini.',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      icon: '🌐',
      desc: 'Universal AI Gateway routing across global multimodal foundation models.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0d0f17] border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">AI Provider Hub & Gateway</h2>
              <p className="text-xs text-slate-400 font-mono">Provider-Agnostic Multi-Model Architecture</p>
            </div>
          </div>
          <button
            onClick={() => setIsHubOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('providers')}
            className={`py-3 px-4 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'providers'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> Providers & Models
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3 px-4 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'strategy'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> AI Routing Strategy
          </button>
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`py-3 px-4 text-xs font-mono font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'capabilities'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Capability Matrix
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'providers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Select a primary provider or use <span className="text-indigo-400 font-semibold font-mono">Auto Router</span> to let Critiq dynamically pick the optimal model.
                </div>
                <button
                  onClick={() => setSelectedProvider('auto')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 ${
                    selectedProvider === 'auto'
                      ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Dynamic Routing
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providerList.map((p) => {
                  const conn = connections[p.id];
                  const isSelected = selectedProvider === p.id;
                  const providerModels = availableModels.filter((m) => m.provider === p.id);

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-950/20 border-indigo-500/60 ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{p.icon}</span>
                          <div>
                            <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Server Connected
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedProvider(p.id)}
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Active' : 'Select'}
                        </button>
                      </div>

                      <p className="mt-2.5 text-xs text-slate-400 leading-relaxed">{p.desc}</p>

                      {/* Model Selector */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <label className="text-[11px] font-mono text-slate-400">Model:</label>
                        <select
                          value={isSelected ? selectedModel : conn.selectedModel}
                          onChange={(e) => {
                            if (isSelected) {
                              setSelectedModel(e.target.value);
                            }
                          }}
                          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-indigo-500"
                        >
                          {providerModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Test Connection Button */}
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          {conn.latencyMs ? `Latency: ${conn.latencyMs}ms` : 'Ready for audit'}
                        </span>
                        <button
                          disabled={isTestingConnection}
                          onClick={() => handleTest(p.id)}
                          className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isTestingConnection ? 'animate-spin' : ''}`} /> Test Connection
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    testResult.isValid
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {testResult.isValid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Choose the AI balancing profile that best matches your workflow:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'BALANCED' as AIStrategy,
                    title: 'Balanced',
                    badge: 'Recommended',
                    desc: 'Optimal tradeoff between inspection speed, reasoning depth, and WCAG accuracy.',
                    icon: '⚖️',
                  },
                  {
                    id: 'FAST' as AIStrategy,
                    title: 'Fast Scan',
                    badge: '< 1.2s Latency',
                    desc: 'Prioritizes rapid sub-second visual heuristics scan for wireframe iterations.',
                    icon: '⚡',
                  },
                  {
                    id: 'BEST_QUALITY' as AIStrategy,
                    title: 'Deep Reasoning',
                    badge: 'High Precision',
                    desc: 'Engages comprehensive spatial reasoning for complex multi-tier design systems.',
                    icon: '🧠',
                  },
                ].map((strat) => {
                  const isSelected = selectedStrategy === strat.id;
                  return (
                    <button
                      key={strat.id}
                      onClick={() => setSelectedStrategy(strat.id)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/40'
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-2xl mb-2">{strat.icon}</div>
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-white">{strat.title}</div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                          {strat.badge}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">{strat.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'capabilities' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                Verified provider model capability matrix for visual inspections:
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                    <tr>
                      <th className="p-3">Model</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Vision</th>
                      <th className="p-3">Structured Output</th>
                      <th className="p-3">Context Window</th>
                      <th className="p-3">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {availableModels.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-800/20">
                        <td className="p-3 font-semibold text-slate-200">{m.name}</td>
                        <td className="p-3 text-slate-400 capitalize">{m.provider}</td>
                        <td className="p-3 text-emerald-400">✓ Yes</td>
                        <td className="p-3 text-emerald-400">✓ Yes</td>
                        <td className="p-3 text-slate-300">{m.contextWindow.toLocaleString()} tokens</td>
                        <td className="p-3 text-indigo-300">{m.capabilities.typicalLatencyMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Encrypted Server-Side Credential Handling</span>
          </div>
          <button
            onClick={() => setIsHubOpen(false)}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-colors shadow-lg shadow-indigo-500/20"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
