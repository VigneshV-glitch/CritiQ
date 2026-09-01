/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProvider } from './AIProvider';
import { AIProviderType } from '../types/provider';
import { GeminiProvider } from './gemini/GeminiProvider';
import { ClaudeProvider } from './claude/ClaudeProvider';
import { OpenAIProvider } from './openai/OpenAIProvider';
import { OpenRouterProvider } from './openrouter/OpenRouterProvider';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<AIProviderType, AIProvider> = new Map();

  private constructor() {
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new ClaudeProvider());
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new OpenRouterProvider());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public registerProvider(provider: AIProvider): void {
    this.providers.set(provider.providerType, provider);
  }

  public getProvider(type: AIProviderType): AIProvider | undefined {
    return this.providers.get(type);
  }

  public getAllProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  public getSupportedProviderTypes(): AIProviderType[] {
    return Array.from(this.providers.keys());
  }
}
