/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Issue, AuditReport, Severity } from '../../types';
import { AIProviderType } from './provider';

export interface NormalizedBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedFinding extends Omit<Issue, 'boundingBox'> {
  id: string;
  category: string;
  ruleKey: string;
  title: string;
  description: string;
  severity: Severity | 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number;
  locationConfidence: number;
  locationType: 'element' | 'global';
  boundingBox: NormalizedBoundingBox | null;
  recommendation: string;
  evidence?: string;
  location?: string;
  wcagReference?: string;
  estimatedFixTime?: string;
  businessImpact?: string;
}

export interface NormalizedAIResponse extends Omit<Partial<AuditReport>, 'issues'> {
  provider: AIProviderType;
  model: string;
  latencyMs: number;
  issues: NormalizedFinding[];
  summary: string;
  score: number;
  scoreBreakdown?: {
    visualDesign: number;
    usability: number;
    accessibility: number;
    consistency: number;
  };
  recommendations: string[];
  isSimulated?: boolean;
  isUnavailable?: boolean;
  visualObservationSummary?: any;
  screenModel?: any;
  unifiedReport?: any;
}

export interface AIChatResponse {
  text: string;
  provider: AIProviderType;
  model: string;
  recommendations?: Array<{
    title: string;
    description: string;
    category: string;
    severity: string;
  }>;
  isSimulated?: boolean;
}
