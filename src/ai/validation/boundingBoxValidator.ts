/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NormalizedBoundingBox } from '../types/response';

export interface BoundingBoxValidationResult {
  isValid: boolean;
  box: NormalizedBoundingBox | null;
  locationType: 'element' | 'global';
  warnings: string[];
}

export function validateAndNormalizeBoundingBox(
  rawBox: any,
  locationTypeHint?: string
): BoundingBoxValidationResult {
  const warnings: string[] = [];

  // Check if explicitly or naturally global
  if (!rawBox || locationTypeHint === 'global') {
    return {
      isValid: true,
      box: null,
      locationType: 'global',
      warnings,
    };
  }

  // Parse numeric values
  let x = typeof rawBox.x === 'number' ? rawBox.x : parseFloat(rawBox.x);
  let y = typeof rawBox.y === 'number' ? rawBox.y : parseFloat(rawBox.y);
  let width = typeof rawBox.width === 'number' ? rawBox.width : parseFloat(rawBox.width || rawBox.w);
  let height = typeof rawBox.height === 'number' ? rawBox.height : parseFloat(rawBox.height || rawBox.h);

  // If missing or unparsable numbers, fall back to global
  if (isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    return {
      isValid: true,
      box: null,
      locationType: 'global',
      warnings: ['Missing valid numeric coordinate values; converted to global location.'],
    };
  }

  // Handle coordinates that were provided in 0..1 scale instead of 0..100%
  if (x <= 1 && y <= 1 && width <= 1 && height <= 1 && (width > 0 || height > 0)) {
    x *= 100;
    y *= 100;
    width *= 100;
    height *= 100;
    warnings.push('Normalized unit-scale (0..1) bounding box to percentages (0..100%).');
  }

  // Ensure positive width and height
  if (width < 0) {
    x = x + width;
    width = Math.abs(width);
  }
  if (height < 0) {
    y = y + height;
    height = Math.abs(height);
  }

  // Clamp within image bounds (0 to 100)
  x = Math.max(0, Math.min(100, x));
  y = Math.max(0, Math.min(100, y));
  width = Math.max(1, Math.min(100 - x, width));
  height = Math.max(1, Math.min(100 - y, height));

  // If dimensions cover nearly the entire screen (>95% width and height), classify as global
  if (width >= 95 && height >= 95) {
    return {
      isValid: true,
      box: null,
      locationType: 'global',
      warnings: ['Full-canvas bounding box classified as global screen finding.'],
    };
  }

  // Minimum discernible box size for visual clickability / targeting
  if (width < 1.5) width = 3;
  if (height < 1.5) height = 3;

  return {
    isValid: true,
    box: {
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      width: Number(width.toFixed(2)),
      height: Number(height.toFixed(2)),
    },
    locationType: 'element',
    warnings,
  };
}
