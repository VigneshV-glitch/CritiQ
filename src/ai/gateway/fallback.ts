/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderType } from '../types/provider';
import { AIError } from '../types/errors';

export interface FallbackOptions {
  maxRetries: number;
  retryDelayMs: number;
  fallbackProviders: AIProviderType[];
}

export class FallbackManager {
  private static defaultOptions: FallbackOptions = {
    maxRetries: 2,
    retryDelayMs: 800,
    fallbackProviders: ['gemini', 'claude', 'openai'],
  };

  public static shouldAttemptFallback(error: any): boolean {
    if (error instanceof AIError) {
      return error.isRetryable;
    }
    const msg = String(error?.message || error).toLowerCase();
    return msg.includes('429') || msg.includes('503') || msg.includes('timeout') || msg.includes('quota') || msg.includes('rate limit') || msg.includes('unavailable');
  }

  public static async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
