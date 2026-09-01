/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AICapability, AIProviderType } from './provider';

export interface AIModelDefinition {
  id: string;
  name: string;
  provider: AIProviderType;
  description: string;
  capabilities: AICapability;
  isDefault?: boolean;
  recommendedFor: ('vision_audit' | 'chat' | 'fast_scan' | 'deep_reasoning')[];
  contextWindow: number;
}

export const MODEL_CATALOG: AIModelDefinition[] = [
  // Google Gemini Models
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'gemini',
    description: 'High-speed multimodal flagship for rapid visual UI inspection and spatial heuristic extraction.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1200,
    },
    isDefault: true,
    recommendedFor: ['vision_audit', 'fast_scan', 'chat'],
    contextWindow: 1000000,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    provider: 'gemini',
    description: 'Advanced reasoning hybrid model with deep visual comprehension for complex multi-screen flows.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1800,
    },
    recommendedFor: ['vision_audit', 'deep_reasoning', 'chat'],
    contextWindow: 1000000,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Complex multimodal reasoning model for comprehensive WCAG accessibility compliance auditing.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 2600,
    },
    recommendedFor: ['deep_reasoning', 'vision_audit'],
    contextWindow: 2000000,
  },

  // Anthropic Claude Models
  {
    id: 'claude-3-7-sonnet-20250219',
    name: 'Claude 3.7 Sonnet',
    provider: 'claude',
    description: 'State-of-the-art hybrid reasoning model with superior UI layout analysis and visual design critique.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 2100,
    },
    isDefault: true,
    recommendedFor: ['vision_audit', 'deep_reasoning', 'chat'],
    contextWindow: 200000,
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    description: 'Industry benchmark vision model for nuanced typographic, spatial, and cognitive friction audits.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1900,
    },
    recommendedFor: ['vision_audit', 'chat'],
    contextWindow: 200000,
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    description: 'Ultra-fast, cost-efficient model for immediate quick-scan validation.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: false,
      longContext: true,
      streaming: true,
      maxTokens: 4096,
      typicalLatencyMs: 900,
    },
    recommendedFor: ['fast_scan'],
    contextWindow: 200000,
  },

  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Flagship multimodal model with native spatial vision and structured JSON outputs.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 4096,
      typicalLatencyMs: 1600,
    },
    isDefault: true,
    recommendedFor: ['vision_audit', 'chat'],
    contextWindow: 128000,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast, lightweight vision model for rapid heuristics analysis.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 4096,
      typicalLatencyMs: 1000,
    },
    recommendedFor: ['fast_scan'],
    contextWindow: 128000,
  },

  // OpenRouter / Universal Multi-Model Gateway
  {
    id: 'openrouter/auto',
    name: 'OpenRouter Auto Router',
    provider: 'openrouter',
    description: 'Universal fallback proxy routing across 100+ global vision models.',
    capabilities: {
      vision: true,
      structuredOutput: true,
      toolCalling: true,
      longContext: true,
      streaming: true,
      maxTokens: 8192,
      typicalLatencyMs: 1800,
    },
    isDefault: true,
    recommendedFor: ['vision_audit', 'chat'],
    contextWindow: 128000,
  },
];

export function getModelsForProvider(provider: AIProviderType): AIModelDefinition[] {
  return MODEL_CATALOG.filter((m) => m.provider === provider);
}

export function getModelById(modelId: string): AIModelDefinition | undefined {
  return MODEL_CATALOG.find((m) => m.id === modelId);
}

export function getDefaultModelForProvider(provider: AIProviderType): string {
  const defaultModel = MODEL_CATALOG.find((m) => m.provider === provider && m.isDefault);
  return defaultModel ? defaultModel.id : MODEL_CATALOG.find((m) => m.provider === provider)?.id || '';
}
