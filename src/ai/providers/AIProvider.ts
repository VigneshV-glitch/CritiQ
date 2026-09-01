/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AICapability, AIProviderType, AIUsageInfo, ProviderConnectionStatus } from '../types/provider';
import { AIModelDefinition } from '../types/model';
import { AnalyzeDesignRequest, AIChatRequest } from '../types/request';
import { AIChatResponse, NormalizedAIResponse } from '../types/response';

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultModel?: string;
  timeoutMs?: number;
}

export abstract class AIProvider {
  abstract readonly providerType: AIProviderType;
  abstract readonly displayName: string;

  abstract getCapabilities(modelId?: string): AICapability;
  abstract getModels(): AIModelDefinition[];
  abstract getDefaultModel(): string;
  abstract validateConnection(): Promise<{ isValid: boolean; latencyMs: number; message: string; model: string }>;
  
  abstract analyzeDesign(request: AnalyzeDesignRequest): Promise<NormalizedAIResponse>;
  abstract chat(request: AIChatRequest): Promise<AIChatResponse>;
  
  async getUsage(): Promise<AIUsageInfo> {
    return {
      usageAvailable: false,
      provider: this.providerType,
      notes: 'Provider does not expose public client quota telemetry.',
    };
  }
}
