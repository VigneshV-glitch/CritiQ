/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from '../AIProvider';
import { AIProviderType, AICapability } from '../../types/provider';
import { AIModelDefinition, getModelsForProvider, getDefaultModelForProvider } from '../../types/model';
import { AnalyzeDesignRequest, AIChatRequest } from '../../types/request';
import { AIChatResponse, NormalizedAIResponse } from '../../types/response';
import { normalizeRawAIResponse } from '../../normalization/normalizeResponse';
import { normalizeAIError } from '../../types/errors';

export class OpenRouterProvider extends AIProvider {
  readonly providerType: AIProviderType = 'openrouter';
  readonly displayName = 'OpenRouter Gateway';

  getCapabilities(modelId?: string): AICapability {
    const models = this.getModels();
    const target = models.find((m) => m.id === modelId) || models[0];
    return target.capabilities;
  }

  getModels(): AIModelDefinition[] {
    return getModelsForProvider('openrouter');
  }

  getDefaultModel(): string {
    return getDefaultModelForProvider('openrouter');
  }

  async validateConnection(): Promise<{ isValid: boolean; latencyMs: number; message: string; model: string }> {
    const start = Date.now();
    try {
      const res = await fetch('/api/ai/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'openrouter' }),
      });
      const data = await res.json();
      return {
        isValid: Boolean(data.valid || data.status === 'active'),
        latencyMs: Date.now() - start,
        message: data.message || 'OpenRouter connection active.',
        model: data.model || this.getDefaultModel(),
      };
    } catch (e: any) {
      return {
        isValid: false,
        latencyMs: Date.now() - start,
        message: e.message || 'Failed connecting to OpenRouter.',
        model: this.getDefaultModel(),
      };
    }
  }

  async analyzeDesign(request: AnalyzeDesignRequest): Promise<NormalizedAIResponse> {
    const startTime = Date.now();
    const model = request.modelPreference || this.getDefaultModel();

    try {
      const response = await fetch('/api/critiq/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          provider: 'openrouter',
          model,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw normalizeAIError(errJson.message || `HTTP ${response.status}`, 'openrouter', model);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      return normalizeRawAIResponse(data, 'openrouter', model, request.imageSrc, request.fileName, latencyMs);
    } catch (err: any) {
      throw normalizeAIError(err, 'openrouter', model);
    }
  }

  async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const model = request.modelPreference || this.getDefaultModel();
    try {
      const response = await fetch('/api/critiq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          provider: 'openrouter',
          model,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw normalizeAIError(errJson.message || `HTTP ${response.status}`, 'openrouter', model);
      }

      const data = await response.json();
      return {
        text: data.text || 'No response generated.',
        provider: 'openrouter',
        model,
        recommendations: data.recommendations,
        isSimulated: data.isSimulated || false,
      };
    } catch (err: any) {
      throw normalizeAIError(err, 'openrouter', model);
    }
  }
}
