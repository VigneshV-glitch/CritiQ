/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedFinding } from '../types/response';
import { Severity } from '../../types';
import { validateAndNormalizeBoundingBox } from '../validation/boundingBoxValidator';

export function normalizeSeverity(raw: string | undefined): Severity {
  if (!raw) return Severity.MEDIUM;
  const s = String(raw).toLowerCase().trim();
  if (s.includes('crit')) return Severity.CRITICAL;
  if (s.includes('high')) return Severity.HIGH;
  if (s.includes('med')) return Severity.MEDIUM;
  if (s.includes('low')) return Severity.LOW;
  if (s.includes('info')) return Severity.INFO;
  return Severity.MEDIUM;
}

export function normalizeConfidence(raw: any, defaultVal = 85): number {
  const num = typeof raw === 'number' ? raw : parseFloat(raw);
  if (isNaN(num)) return defaultVal;
  if (num <= 1) return Math.round(num * 100);
  return Math.min(100, Math.max(10, Math.round(num)));
}

export function validateAndNormalizeFinding(raw: any, index: number): NormalizedFinding {
  const boxValidation = validateAndNormalizeBoundingBox(raw.boundingBox, raw.locationType);

  const id = raw.id && String(raw.id).trim() ? String(raw.id) : `iss_${Date.now()}_${index + 1}`;
  const title = (raw.title && String(raw.title).trim()) || 'Interface Finding';
  const description = (raw.description && String(raw.description).trim()) || title;
  const category = (raw.category && String(raw.category).trim()) || 'UI_RULES';
  const severity = normalizeSeverity(raw.severity);
  const confidence = normalizeConfidence(raw.confidence, 88);
  const locationConfidence = normalizeConfidence(raw.locationConfidence, boxValidation.locationType === 'global' ? 100 : 85);
  const recommendation = (raw.recommendation && String(raw.recommendation).trim()) || 'Review and refine element layout spacing and contrast.';

  return {
    id,
    title,
    description,
    category,
    severity,
    confidence,
    locationConfidence,
    locationType: boxValidation.locationType,
    boundingBox: boxValidation.box,
    recommendation,
    evidence: raw.evidence ? String(raw.evidence) : undefined,
    location: raw.location ? String(raw.location) : (boxValidation.locationType === 'global' ? 'Global Canvas' : 'Screen Element'),
    ruleKey: raw.ruleKey ? String(raw.ruleKey) : (category.toLowerCase() + '_rule'),
    wcagReference: raw.wcagReference ? String(raw.wcagReference) : undefined,
    businessImpact: raw.businessImpact ? String(raw.businessImpact) : undefined,
    estimatedFixTime: raw.estimatedFixTime ? String(raw.estimatedFixTime) : undefined,
  };
}
