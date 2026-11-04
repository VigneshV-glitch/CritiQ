/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, EyeOff, LayoutGrid, Layers, Tag } from 'lucide-react';
import { useCanvasStore, canvasActions } from '../state/canvasStore';

export default function CanvasControls() {
  const { showBoundingBoxes, showLabels, showMarkers } = useCanvasStore();

  return (
    <div className="flex items-center gap-1 apple-hud px-2 py-1.5 rounded-full select-none shadow-xl">
      <button
        onClick={() => canvasActions.toggleMarkers()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
          showMarkers
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
        title="Toggle issue hot markers"
      >
        <Layers className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Markers</span>
      </button>

      <button
        onClick={() => canvasActions.toggleBoundingBoxes()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
          showBoundingBoxes
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
        title="Toggle highlighting box boundaries"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Boxes</span>
      </button>

      <button
        onClick={() => canvasActions.toggleLabels()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
          showLabels
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
        title="Toggle marker priority index tags"
      >
        <Tag className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Labels</span>
      </button>
    </div>
  );
}
