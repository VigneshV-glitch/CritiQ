/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

export interface InterpretedIntent {
  scope: string[];
  correctionStrategy: 'Minimal' | 'Balanced' | 'Comprehensive';
  focusSummary: string;
}

export class IntentInterpreter {
  private aiClient?: GoogleGenAI;

  constructor(aiClient?: GoogleGenAI) {
    this.aiClient = aiClient;
  }

  /**
   * Interpret natural language user instructions into a structured audit intent.
   * Leverages Gemini on the server side and falls back to a deterministic keyword mapper.
   */
  public async interpret(userInstruction?: string): Promise<InterpretedIntent> {
    const defaultIntent: InterpretedIntent = {
      scope: ['Full Audit'],
      correctionStrategy: 'Balanced',
      focusSummary: 'Performing a balanced, full-scope design review.'
    };

    if (!userInstruction || !userInstruction.trim()) {
      return defaultIntent;
    }

    const instructionText = userInstruction.trim();

    if (!this.aiClient) {
      console.log('[Intent Interpreter] No AI client. Falling back to local keyword mapping.');
      return this.localInterpret(instructionText);
    }

    try {
      const prompt = `You are an elite UX/UI Design Operations Director. Your task is to interpret a designer's natural language instructions for inspecting a mockup screen.
Map the instruction to:
1. "scope": An array of focus areas mentioned (e.g. ["Contrast", "Spacing", "Accessibility", "Typography", "Hierarchy", "Buttons", "Forms", "Layout", "Navigation", "Mobile UX", "Usability"]).
2. "correctionStrategy": Strictly one of these three strategies:
   - "Minimal": Fix problems while strictly preserving the existing visual direction and brand style. (Selected if they say "keep my theme", "don't change the look", "just fix errors", "minor changes", "minimal", etc.)
   - "Balanced": Meaningful improvements while preserving general design direction. (Selected by default unless they specify major changes or minimal edits.)
   - "Comprehensive": Deeper redesign-oriented audit. (Selected if they say "redesign", "make it look premium", "major overhaul", "comprehensive audit", "deep improvement", "unleash creativity", etc.)
3. "focusSummary": A short, elegant single-sentence summary of what Critiq will prioritize based on their request.

USER INSTRUCTION: "${instructionText}"`;

      const response = await this.aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an advanced intent analysis engine specializing in design operations. Classify the user instruction into structured JSON format.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scope: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'The extracted list of visual/usability focus areas.'
              },
              correctionStrategy: {
                type: Type.STRING,
                description: 'Must be strictly "Minimal", "Balanced", or "Comprehensive".'
              },
              focusSummary: {
                type: Type.STRING,
                description: 'A professional, senior-designer style summary of what will be inspected.'
              }
            },
            required: ['scope', 'correctionStrategy', 'focusSummary']
          }
        }
      });

      const parsed = JSON.parse((response.text || '{}').trim());
      
      // Validation & sanitization
      let strategy: 'Minimal' | 'Balanced' | 'Comprehensive' = 'Balanced';
      const rawStrategy = String(parsed.correctionStrategy || '').trim().toLowerCase();
      if (rawStrategy.startsWith('min')) {
        strategy = 'Minimal';
      } else if (rawStrategy.startsWith('comp') || rawStrategy.startsWith('deep')) {
        strategy = 'Comprehensive';
      }

      return {
        scope: Array.isArray(parsed.scope) && parsed.scope.length > 0 ? parsed.scope : ['Custom Target'],
        correctionStrategy: strategy,
        focusSummary: parsed.focusSummary || `Focusing on: ${instructionText}`
      };

    } catch (err) {
      console.warn('[Intent Interpreter] Failed with Gemini. Falling back to local keyword mapping:', err);
      return this.localInterpret(instructionText);
    }
  }

  /**
   * Deterministic local interpreter fallback using heuristic keyword indexing
   */
  private localInterpret(text: string): InterpretedIntent {
    const textLower = text.toLowerCase();
    const scope: string[] = [];

    // Analyze scope keywords
    if (textLower.includes('contrast') || textLower.includes('color') || textLower.includes('wcag') || textLower.includes('access')) {
      scope.push('Contrast & Accessibility');
    }
    if (textLower.includes('grid') || textLower.includes('align') || textLower.includes('col') || textLower.includes('spacing') || textLower.includes('gap')) {
      scope.push('Layout Alignment & Grids');
    }
    if (textLower.includes('button') || textLower.includes('touch') || textLower.includes('target') || textLower.includes('click') || textLower.includes('tap')) {
      scope.push('Physical Interaction & Touch Targets');
    }
    if (textLower.includes('typo') || textLower.includes('font') || textLower.includes('size') || textLower.includes('hierarch')) {
      scope.push('Visual Design & Typography Hierarchy');
    }
    if (textLower.includes('form') || textLower.includes('input') || textLower.includes('field') || textLower.includes('text box')) {
      scope.push('Forms & Fields UX');
    }
    if (textLower.includes('nav') || textLower.includes('header') || textLower.includes('footer') || textLower.includes('menu')) {
      scope.push('Navigation Structure');
    }

    if (scope.length === 0) {
      scope.push('Custom Workspace Request');
    }

    // Determine correction strategy
    let strategy: 'Minimal' | 'Balanced' | 'Comprehensive' = 'Balanced';
    if (
      textLower.includes('minimal') ||
      textLower.includes('keep my') ||
      textLower.includes('preserve') ||
      textLower.includes('dont change') ||
      textLower.includes('just fix') ||
      textLower.includes('minor')
    ) {
      strategy = 'Minimal';
    } else if (
      textLower.includes('comprehensive') ||
      textLower.includes('redesign') ||
      textLower.includes('overhaul') ||
      textLower.includes('major') ||
      textLower.includes('creativ') ||
      textLower.includes('deep')
    ) {
      strategy = 'Comprehensive';
    }

    // Formulate clean focus summary
    let focusSummary = '';
    if (strategy === 'Minimal') {
      focusSummary = `Focusing strictly on critical issue fixes while preserving your current visual design direction.`;
    } else if (strategy === 'Comprehensive') {
      focusSummary = `Executing a deep, redesign-oriented audit focusing on structural improvements and modern UI standards.`;
    } else {
      focusSummary = `Performing a balanced evaluation across ${scope.join(', ')} focus areas.`;
    }

    return {
      scope,
      correctionStrategy: strategy,
      focusSummary
    };
  }
}
