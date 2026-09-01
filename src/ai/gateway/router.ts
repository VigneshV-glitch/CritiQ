/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderType, AIStrategy } from '../types/provider';
import { AIModelDefinition, MODEL_CATALOG } from '../types/model';
import { AnalyzeDesignRequest } from '../types/request';

export interface RouteDecision {
  provider: AIProviderType;
  model: string;
  strategy: AIStrategy;
  reason: string;
}

export class AIRouter {
  /**
   * Evaluates the request context, intent, and strategy to choose the optimal provider and model.
   */
  public static route(request: AnalyzeDesignRequest, availableProviders: AIProviderType[] = ['gemini', 'claude', 'openai']): RouteDecision {
    const strategy = request.aiStrategy || 'BALANCED';

    // Explicit provider preference takes priority
    if (request.providerPreference && request.providerPreference !== 'custom' && availableProviders.includes(request.providerPreference)) {
      const preferredModel = request.modelPreference || MODEL_CATALOG.find(m => m.provider === request.providerPreference && m.isDefault)?.id || '';
      return {
        provider: request.providerPreference,
        model: preferredModel,
        strategy,
        reason: `User explicitly selected ${request.providerPreference} (${preferredModel}).`,
      };
    }

    // Auto / Strategy-based routing
    if (strategy === 'FAST') {
      const fastModel = MODEL_CATALOG.find(m => availableProviders.includes(m.provider) && m.recommendedFor.includes('fast_scan')) || MODEL_CATALOG[0];
      return {
        provider: fastModel.provider,
        model: fastModel.id,
        strategy,
        reason: 'Selected lowest latency vision model for quick scan.',
      };
    }

    if (strategy === 'BEST_QUALITY') {
      const reasoningModel = MODEL_CATALOG.find(m => availableProviders.includes(m.provider) && m.recommendedFor.includes('deep_reasoning')) || MODEL_CATALOG[0];
      return {
        provider: reasoningModel.provider,
        model: reasoningModel.id,
        strategy,
        reason: 'Selected highest reasoning depth model for comprehensive inspection.',
      };
    }

    // Default: BALANCED / AUTO
    const defaultModel = MODEL_CATALOG.find(m => availableProviders.includes(m.provider) && m.isDefault) || MODEL_CATALOG[0];
    return {
      provider: defaultModel.provider,
      model: defaultModel.id,
      strategy,
      reason: 'Balanced multi-modal vision routing.',
    };
  }

  /**
   * Determines the fallback sequence for resilient automated retries.
   */
  public static getFallbackChain(currentProvider: AIProviderType, availableProviders: AIProviderType[] = ['gemini', 'claude', 'openai']): AIProviderType[] {
    const defaultOrder: AIProviderType[] = ['gemini', 'claude', 'openai', 'openrouter'];
    return defaultOrder.filter(p => p !== currentProvider && availableProviders.includes(p));
  }
}
