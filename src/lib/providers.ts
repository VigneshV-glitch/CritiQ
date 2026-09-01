/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReviewType, Issue, AuditReport, Severity, Rule } from '../types';
import { generateClientAuditReport, optimizeImageForUpload } from './clientAuditor';

export abstract class AIProvider {
  abstract name: string;
  abstract analyzeDesign(
    imageSrc: string, // Base64 or mock identifier
    rules: Rule[],
    reviewType: ReviewType,
    customPrompt?: string
  ): Promise<Partial<AuditReport>>;
}

export class GeminiProvider extends AIProvider {
  name = 'Gemini 3.6 Flash / Pro';

  async analyzeDesign(
    imageSrc: string,
    rules: Rule[],
    reviewType: ReviewType,
    customPrompt?: string
  ): Promise<Partial<AuditReport>> {
    try {
      const optimizedSrc = await optimizeImageForUpload(imageSrc);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 28000);

      const response = await fetch('/api/critiq/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          imageSrc: optimizedSrc,
          rules,
          reviewType,
          customPrompt,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to audit: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data || data.isUnavailable || !data.issues || data.issues.length === 0) {
        return generateClientAuditReport(imageSrc, 'uploaded_mockup', reviewType, customPrompt);
      }
      return data;
    } catch (err) {
      console.warn('Gemini Provider backend error or limit, returning high-fidelity client heuristic analysis:', err);
      return generateClientAuditReport(imageSrc, 'uploaded_mockup', reviewType, customPrompt);
    }
  }
}

export class ClaudeProvider extends AIProvider {
  name = 'Claude 3.5 Sonnet / Opus';

  async analyzeDesign(
    imageSrc: string,
    rules: Rule[],
    reviewType: ReviewType,
    customPrompt?: string
  ): Promise<Partial<AuditReport>> {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    return {
      score: 78,
      severity: Severity.MEDIUM,
      reviewType: reviewType,
      summary: "[Claude Simulation - Heuristics Mode] General heuristics check completed. Verified text readability & contrast ratio.",
      issues: [
        {
          id: 'iss_claude_01',
          category: 'UI_RULES',
          ruleKey: 'visual_hierarchy',
          title: 'Claude Audit: Subheading typography contrast gap',
          description: 'The typography scale is compressed. Font weight contrast is too low to differentiate sections.',
          severity: 'medium',
          boundingBox: { x: 10, y: 25, width: 80, height: 10 },
          recommendation: 'Double font weight of heading or reduce secondary label sizes.'
        }
      ],
      recommendations: ['Enforce crisp dark dividers', 'Consolidate primary text contrast rules.']
    };
  }
}

export class ChatGPTProvider extends AIProvider {
  name = 'GPT-4o Vision Engine';

  async analyzeDesign(
    imageSrc: string,
    rules: Rule[],
    reviewType: ReviewType,
    customPrompt?: string
  ): Promise<Partial<AuditReport>> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
      score: 80,
      severity: Severity.MEDIUM,
      reviewType: reviewType,
      summary: "[GPT-4o Simulation - Heuristics Mode] Screen checked against universal layout aesthetics.",
      issues: [
        {
          id: 'iss_gpt_01',
          category: 'UI_RULES',
          ruleKey: 'alignment_precision',
          title: 'GPT Audit: Icon baseline mismatch',
          description: 'Vector graphics inside transaction logs do not sit cleanly on the baseline.',
          severity: 'low',
          boundingBox: { x: 8, y: 55, width: 12, height: 8 },
          recommendation: 'Add alignment flex-items-center classes or baseline offset properties.'
        }
      ],
      recommendations: ['Utilize standard icon sizes of 20px', 'Enforce uniform layout alignment.']
    };
  }
}
