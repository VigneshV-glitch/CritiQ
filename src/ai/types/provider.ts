/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AIProviderType = 'gemini' | 'claude' | 'openai' | 'openrouter' | 'custom';

export type AIStrategy = 'FAST' | 'BALANCED' | 'BEST_QUALITY' | 'LOW_COST' | 'CUSTOM' | 'AUTO';

export type ProviderConnectionStatus = 'connected' | 'not_connected' | 'error' | 'rate_limited' | 'unverified';

export interface AICapability {
  vision: boolean;
  structuredOutput: boolean;
  toolCalling: boolean;
  longContext: boolean;
  streaming: boolean;
  maxTokens: number;
  typicalLatencyMs: number;
}

export interface AIConnection {
  id: string;
  provider: AIProviderType;
  displayName: string;
  status: ProviderConnectionStatus;
  authType: 'server_env' | 'user_configured' | 'oauth';
  selectedModel: string;
  availableModels: string[];
  capabilities: AICapability;
  isConfigured: boolean;
  lastTestedAt?: string;
  latencyMs?: number;
  errorMessage?: string;
}

export interface AIUsageInfo {
  usageAvailable: boolean;
  provider: AIProviderType;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  periodQuotaLimit?: string;
  periodQuotaUsed?: string;
  notes?: string;
}
