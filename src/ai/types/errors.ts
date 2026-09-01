/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIProviderType } from './provider';

export type AIErrorCode =
  | 'PROVIDER_NOT_CONNECTED'
  | 'INVALID_CREDENTIALS'
  | 'MODEL_UNAVAILABLE'
  | 'VISION_NOT_SUPPORTED'
  | 'STRUCTURED_OUTPUT_UNSUPPORTED'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'REQUEST_TOO_LARGE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_UNAVAILABLE'
  | 'INVALID_AI_RESPONSE'
  | 'INVALID_FINDING'
  | 'INVALID_BOUNDING_BOX'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly provider?: AIProviderType;
  public readonly model?: string;
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;
  public readonly originalError?: any;

  constructor(options: {
    message: string;
    code: AIErrorCode;
    provider?: AIProviderType;
    model?: string;
    statusCode?: number;
    isRetryable?: boolean;
    originalError?: any;
  }) {
    super(options.message);
    this.name = 'AIError';
    this.code = options.code;
    this.provider = options.provider;
    this.model = options.model;
    this.statusCode = options.statusCode;
    this.isRetryable = options.isRetryable ?? this.calculateIsRetryable(options.code, options.statusCode);
    this.originalError = options.originalError;
  }

  private calculateIsRetryable(code: AIErrorCode, statusCode?: number): boolean {
    if (statusCode === 429 || statusCode === 503 || statusCode === 504 || statusCode === 502) {
      return true;
    }
    switch (code) {
      case 'RATE_LIMITED':
      case 'PROVIDER_UNAVAILABLE':
      case 'PROVIDER_TIMEOUT':
      case 'NETWORK_ERROR':
      case 'MODEL_UNAVAILABLE':
        return true;
      default:
        return false;
    }
  }
}

export function normalizeAIError(error: any, provider?: AIProviderType, model?: string): AIError {
  if (error instanceof AIError) {
    return error;
  }

  const message = error?.message || String(error);
  const status = error?.status || error?.statusCode || error?.response?.status;

  if (status === 429 || /rate limit|quota|429|resource exhausted/i.test(message)) {
    return new AIError({
      message: `${provider ? provider.toUpperCase() : 'AI Provider'} rate limit or quota exceeded. Engaging fallback.`,
      code: 'RATE_LIMITED',
      provider,
      model,
      statusCode: 429,
      isRetryable: true,
      originalError: error,
    });
  }

  if (status === 401 || status === 403 || /unauthorized|invalid api key|forbidden|permission denied/i.test(message)) {
    return new AIError({
      message: `Invalid or missing credentials for ${provider || 'AI Provider'}.`,
      code: 'INVALID_CREDENTIALS',
      provider,
      model,
      statusCode: status || 401,
      isRetryable: false,
      originalError: error,
    });
  }

  if (status === 503 || status === 502 || /unavailable|overloaded|high demand|503|service unavailable/i.test(message)) {
    return new AIError({
      message: `${provider ? provider.toUpperCase() : 'AI Model'} is currently experiencing high demand.`,
      code: 'PROVIDER_UNAVAILABLE',
      provider,
      model,
      statusCode: 503,
      isRetryable: true,
      originalError: error,
    });
  }

  if (/timeout|abort|deadline exceeded/i.test(message)) {
    return new AIError({
      message: 'Request timed out waiting for AI provider response.',
      code: 'PROVIDER_TIMEOUT',
      provider,
      model,
      statusCode: 504,
      isRetryable: true,
      originalError: error,
    });
  }

  return new AIError({
    message: message || 'An unexpected error occurred during AI analysis.',
    code: 'UNKNOWN_ERROR',
    provider,
    model,
    statusCode: status,
    isRetryable: false,
    originalError: error,
  });
}
