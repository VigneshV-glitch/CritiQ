/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderType, AIStrategy } from '../types/provider';
import { AIModelDefinition, MODEL_CATALOG, getModelById } from '../types/model';
import { AnalyzeDesignRequest, AIChatRequest } from '../types/request';
import { AIChatResponse, NormalizedAIResponse } from '../types/response';
import { ProviderRegistry } from '../providers/providerRegistry';
import { AIRouter } from './router';
import { FallbackManager } from './fallback';
import { normalizeAIError } from '../types/errors';
import { generateClientAuditReport } from '../../lib/clientAuditor';

export class AIGateway {
  private static instance: AIGateway;
  private registry: ProviderRegistry;

  private constructor() {
    this.registry = ProviderRegistry.getInstance();
  }

  public static getInstance(): AIGateway {
    if (!AIGateway.instance) {
      AIGateway.instance = new AIGateway();
    }
    return AIGateway.instance;
  }

  /**
   * Universal provider-agnostic visual design audit.
   */
  public async analyzeDesign(request: AnalyzeDesignRequest): Promise<NormalizedAIResponse> {
    const route = AIRouter.route(request, this.registry.getSupportedProviderTypes());
    const primaryProvider = this.registry.getProvider(route.provider);

    if (!primaryProvider) {
      console.warn(`[AIGateway] Provider ${route.provider} not found, using client-side heuristic engine.`);
      return generateClientAuditReport(
        request.imageSrc,
        request.fileName,
        request.reviewType,
        request.userInstruction,
        request.correctionStrategy
      ) as any;
    }

    try {
      // Attempt primary routed provider
      return await primaryProvider.analyzeDesign({
        ...request,
        providerPreference: route.provider,
        modelPreference: route.model,
      });
    } catch (primaryErr: any) {
      const normalizedErr = normalizeAIError(primaryErr, route.provider, route.model);
      console.warn(`[AIGateway] ${route.provider} failed (${normalizedErr.code}): ${normalizedErr.message}`);

      // Attempt intelligent fallback if error is transient
      if (FallbackManager.shouldAttemptFallback(normalizedErr)) {
        const fallbackProviders = AIRouter.getFallbackChain(route.provider, this.registry.getSupportedProviderTypes());

        for (const fallbackType of fallbackProviders) {
          const fallbackProvider = this.registry.getProvider(fallbackType);
          if (!fallbackProvider) continue;

          try {
            console.info(`[AIGateway] Engaging resilient fallback provider: ${fallbackType}`);
            await FallbackManager.wait(500);
            return await fallbackProvider.analyzeDesign({
              ...request,
              providerPreference: fallbackType,
              modelPreference: fallbackProvider.getDefaultModel(),
            });
          } catch (fallbackErr: any) {
            console.warn(`[AIGateway] Fallback provider ${fallbackType} failed:`, fallbackErr.message);
          }
        }
      }

      // If all live APIs fail or rate limits are reached, engage reliable client-side heuristic inspection
      console.warn('[AIGateway] All remote providers exhausted. Activating high-fidelity heuristic fallback.');
      return generateClientAuditReport(
        request.imageSrc,
        request.fileName,
        request.reviewType,
        request.userInstruction,
        request.correctionStrategy
      ) as any;
    }
  }

  /**
   * Universal provider-agnostic AI assistant chat.
   */
  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const targetProviderType = request.providerPreference || 'gemini';
    const provider = this.registry.getProvider(targetProviderType) || this.registry.getProvider('gemini');

    if (!provider) {
      return {
        text: 'The AI assistant is temporarily initializing. Please try your question again.',
        provider: 'gemini',
        model: 'heuristic_fallback',
        isSimulated: true,
      };
    }

    try {
      return await provider.chat(request);
    } catch (err: any) {
      console.warn(`[AIGateway] Chat request to ${targetProviderType} failed:`, err.message);

      // Fallback to local expert response generator
      return {
        text: `Regarding "${request.findingContext?.title || 'this design consideration'}": To optimize user experience and accessibility, ensure strong visual contrast (at least 4.5:1), clear 8px grid alignment, and touch targets of at least 44x44px.`,
        provider: targetProviderType,
        model: 'heuristic_fallback',
        recommendations: [
          {
            title: 'Refine Color Tokens',
            description: 'Ensure color contrast meets WCAG 2.1 Level AA specifications across both light and dark themes.',
            category: 'UI_RULES',
            severity: 'high',
          },
          {
            title: 'Expand Touch Target',
            description: 'Add padding around the interactive element to achieve at least 44x44px physical touch area.',
            category: 'UX_RULES',
            severity: 'medium',
          },
        ],
        isSimulated: true,
      };
    }
  }

  /**
   * Tests connection for a specific provider.
   */
  public async testProviderConnection(providerType: AIProviderType) {
    const provider = this.registry.getProvider(providerType);
    if (!provider) {
      return { isValid: false, latencyMs: 0, message: `Provider ${providerType} is not registered.`, model: '' };
    }
    return provider.validateConnection();
  }

  /**
   * Returns all available models across providers.
   */
  public getCatalog(): AIModelDefinition[] {
    return MODEL_CATALOG;
  }
}
