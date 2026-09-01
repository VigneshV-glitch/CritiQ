/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedAIResponse, NormalizedFinding } from '../types/response';
import { AIProviderType } from '../types/provider';
import { validateAndNormalizeFinding } from './normalizeFinding';
import { calculateReportScore } from '../../lib/scoring';
import { ScreenAnalyzer } from '../../lib/screen-understanding/screenAnalyzer';
import { CritiqEngine } from '../../lib/critiq-engine/critiqEngine';

export function normalizeRawAIResponse(
  raw: any,
  provider: AIProviderType,
  model: string,
  imageSrc: string,
  fileName = 'Uploaded Screen',
  latencyMs = 0
): NormalizedAIResponse {
  let issues: NormalizedFinding[] = [];

  const rawIssues = Array.isArray(raw?.issues)
    ? raw.issues
    : Array.isArray(raw?.findings)
    ? raw.findings
    : Array.isArray(raw?.data?.issues)
    ? raw.data.issues
    : [];

  issues = rawIssues.map((iss: any, idx: number) => validateAndNormalizeFinding(iss, idx));

  // Compute robust score based on issues
  const scoring = calculateReportScore(issues as any);

  const summary =
    raw?.summary ||
    (issues.length > 0
      ? `Completed visual inspection with ${issues.length} finding${issues.length === 1 ? '' : 's'} across UX, UI, and WCAG criteria.`
      : 'Visual inspection completed with clean design compliance across active rules.');

  const recommendations: string[] = Array.isArray(raw?.recommendations)
    ? raw.recommendations
    : issues.map((i) => i.recommendation).filter(Boolean).slice(0, 4);

  // Generate or preserve screen understanding model
  const screenModel = raw?.screenModel || ScreenAnalyzer.getSimulatedScreenModel(imageSrc, fileName);

  // Generate unified report representation for full backwards compatibility
  const critiqEngine = new CritiqEngine();
  const unifiedReport = raw?.unifiedReport || critiqEngine.compileRawReview(
    issues as any,
    screenModel,
    latencyMs,
    `rev_${Date.now()}`
  );

  return {
    id: raw?.id || `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    projectId: raw?.projectId || 'proj_fintech',
    name: fileName.split('.')[0] || 'Uploaded Wireframe',
    imageUrl: imageSrc,
    provider,
    model,
    latencyMs,
    score: typeof raw?.score === 'number' ? raw.score : scoring.score,
    scoreBreakdown: raw?.scoreBreakdown || {
      visualDesign: scoring.breakdown.visualDesign.score,
      usability: scoring.breakdown.usability.score,
      accessibility: scoring.breakdown.accessibility.score,
      consistency: scoring.breakdown.consistency.score,
    },
    issues,
    summary,
    recommendations,
    visualObservationSummary: raw?.visualObservationSummary || {
      detectedType: screenModel.classification?.screenType || 'Dashboard',
      primaryPurpose: 'Interactive User Interface Screen',
      visibleComponents: (screenModel.components || []).map((c: any) => c.type),
      mainActions: (screenModel.userFlow || []).map((f: any) => f.action),
      confidence: screenModel.classification?.confidence || 90,
    },
    screenModel,
    unifiedReport,
    isUnavailable: false,
    isSimulated: raw?.isSimulated || false,
  };
}
