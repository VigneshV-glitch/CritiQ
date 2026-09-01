/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReviewType, Rule } from '../../types';
import { AnalyzeDesignRequest } from '../types/request';

export const CRITIQ_SYSTEM_INSTRUCTION = `You are Critiq, the premier AI-powered UX/UI Design Inspection & WCAG Compliance Engine.
Your role is to rigorously analyze wireframes, mobile apps, SaaS dashboards, and landing pages to detect usability friction, design system deviations, typographic hierarchy issues, and accessibility violations.

CRITICAL DIRECTIVES:
1. Provide precise bounding box coordinates normalized strictly between 0 and 100 as percentages of the original image dimensions (x, y, width, height).
2. For screen-wide or layout-level issues (such as missing navigation landmarks, poor global density), specify locationType: "global" and boundingBox: null.
3. For specific UI components (buttons, text blocks, inputs, cards), specify locationType: "element" and supply an accurate bounding box.
4. Categorize findings into UI_RULES, UX_RULES, ACCESSIBILITY, or DESIGN_SYSTEM.
5. Provide actionable, concise recommendations and cite concrete evidence observed directly in the screenshot.
6. Return output strictly adhering to the requested JSON structure.`;

export function buildInspectionPrompt(request: AnalyzeDesignRequest): string {
  const { reviewType, fileName, userInstruction, correctionStrategy, rules } = request;

  let prompt = `Analyze this UI design screen (${fileName || 'uploaded_mockup.png'}).\n\n`;

  if (userInstruction && userInstruction.trim()) {
    prompt += `USER FOCUS INSTRUCTION: "${userInstruction.trim()}"\n\n`;
  }

  if (correctionStrategy) {
    prompt += `CORRECTION STRATEGY: ${correctionStrategy}\n\n`;
  }

  prompt += `AUDIT TYPE: ${reviewType || ReviewType.FULL_AUDIT}\n\n`;

  if (rules && rules.length > 0) {
    prompt += `ACTIVE EVALUATION RULES & WCAG CRITERIA:\n`;
    rules.slice(0, 15).forEach((rule, idx) => {
      prompt += `${idx + 1}. [${rule.category}] ${rule.title}: ${rule.description}\n`;
    });
    prompt += `\n`;
  }

  prompt += `Evaluate the interface systematically across:
- Visual Hierarchy & Typography (weight, line-height, scanning flow)
- 8px/4px Spacing Grid & Container Alignments
- WCAG 2.1 Contrast (4.5:1 text, 3:1 non-text) & Touch Targets (minimum 44x44px)
- Usability Heuristics (Fitts's Law, Hick's Law, Feedback & Affordance)
- Consistency & Cognitive Load

Return a valid JSON object matching this schema:
{
  "summary": "Concise executive overview of the visual audit",
  "score": 85,
  "scoreBreakdown": {
    "visualDesign": 85,
    "usability": 80,
    "accessibility": 90,
    "consistency": 85
  },
  "issues": [
    {
      "id": "iss_1",
      "category": "UI_RULES" | "UX_RULES" | "ACCESSIBILITY" | "DESIGN_SYSTEM",
      "ruleKey": "accessibility_contrast",
      "title": "Clear concise finding title",
      "description": "Detailed explanation of why this is an issue",
      "severity": "critical" | "high" | "medium" | "low" | "info",
      "confidence": 95,
      "locationConfidence": 90,
      "locationType": "element" | "global",
      "boundingBox": {
        "x": 10.5,
        "y": 25.0,
        "width": 35.0,
        "height": 8.0
      },
      "recommendation": "Precise recommendation on how to resolve the finding",
      "evidence": "Observed measurement or visual violation",
      "location": "Primary Header / CTA Button / Card Container"
    }
  ],
  "recommendations": [
    "Top actionable strategic takeaway 1",
    "Top actionable strategic takeaway 2"
  ]
}`;

  return prompt;
}

export function buildChatSystemInstruction(findingContext?: any): string {
  let prompt = `You are the Critiq Senior Design Assistant, an interactive conversational partner specialized in UX/UI architecture, design tokens, WCAG 2.1 compliance, and interface engineering.\n`;

  if (findingContext) {
    prompt += `\nCURRENT ACTIVE FINDING CONTEXT:
- Finding: "${findingContext.title || 'General Design Review'}"
- Category: ${findingContext.category || 'UI/UX'}
- Severity: ${findingContext.severity || 'Medium'}
- Description: ${findingContext.description || 'N/A'}
- Evidence: ${findingContext.evidence || 'N/A'}
- Recommendation: ${findingContext.recommendation || 'N/A'}
${findingContext.wcagReference ? `- WCAG Standard: ${findingContext.wcagReference}` : ''}
`;
  }

  prompt += `\nGuidelines:
1. Provide practical, high-clarity advice tailored specifically to product designers and frontend engineers.
2. If explaining CSS, Tailwind classes, or Figma token adjustments, make them clean and production-ready.
3. Keep explanations structured, friendly, and focused.
4. When relevant, offer 2-3 actionable bulleted recommendations.`;

  return prompt;
}
