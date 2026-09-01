/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReviewType, Rule } from '../../types';
import { AIProviderType, AIStrategy } from './provider';

export interface InspectionContext {
  screenName?: string;
  viewportType?: 'mobile' | 'desktop' | 'tablet' | 'responsive';
  platform?: 'web' | 'ios' | 'android' | 'multiplatform';
  targetAudience?: string;
  designSystem?: string;
}

export interface AnalyzeDesignRequest {
  imageSrc: string;
  rules?: Rule[];
  reviewType?: ReviewType;
  fileName?: string;
  userInstruction?: string;
  correctionStrategy?: string;
  aiStrategy?: AIStrategy;
  providerPreference?: AIProviderType;
  modelPreference?: string;
  inspectionContext?: InspectionContext;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface AIChatRequest {
  message: string;
  history?: ChatMessage[];
  findingContext?: {
    id?: string;
    title?: string;
    description?: string;
    category?: string;
    severity?: string;
    confidence?: number;
    evidence?: string;
    recommendation?: string;
    wcagReference?: string;
    boundingBox?: { x: number; y: number; width: number; height: number } | null;
  };
  providerPreference?: AIProviderType;
  modelPreference?: string;
}
