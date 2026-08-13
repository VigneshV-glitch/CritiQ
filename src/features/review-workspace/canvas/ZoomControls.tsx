/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, XCircle, Move } from 'lucide-react';
import { useZoomStore, zoomActions } from '../state/zoomStore';
import { useSelectionStore, selectionActions } from '../state/selectionStore';
import { canvasActions } from '../state/canvasStore';

interface ZoomControlsProps {
  onFitScreen: () => void;
}

export default function ZoomControls({ onFitScreen }: ZoomControlsProps) {
  const { scale } = useZoomStore();
  const { selectedIssueId } = useSelectionStore();
  const percentage = Math.round(scale * 100);

  const handleResetWorkspace = () => {
    zoomActions.resetZoom();
    canvasActions.resetPan();
    selectionActions.selectIssue(null);
  };

  return (
    <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/5 shadow-2xl shrink-0 select-none">
      
      {/* Zoom Out Button */}
      <button
        onClick={() => zoomActions.zoomOut()}
        className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      
      {/* Reset Zoom Indicator */}
      <button
        onClick={() => zoomActions.resetZoom()}
        className="px-2 py-1 hover:bg-white/10 rounded-xl text-[11px] font-mono font-bold text-slate-300 hover:text-indigo-400 transition-colors min-w-[46px] text-center cursor-pointer"
        title="Reset Zoom to 100%"
        aria-label="Reset Zoom"
      >
        {percentage}%
      </button>

      {/* Zoom In Button */}
      <button
        onClick={() => zoomActions.zoomIn()}
        className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Fit screen button */}
      <button
        onClick={onFitScreen}
        className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        title="Fit canvas viewport to screen"
        aria-label="Fit to Screen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold font-mono hidden md:inline">FIT</span>
      </button>

      {/* Reset Pan button */}
      <button
        onClick={() => canvasActions.resetPan()}
        className="p-1.5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Reset workspace panning to 0,0"
        aria-label="Reset pan"
      >
        <Move className="w-3.5 h-3.5" />
      </button>

      {selectedIssueId && (
        <>
          <div className="w-px h-4 bg-white/10 mx-1" />
          
          {/* Clear selection button */}
          <button
            onClick={() => selectionActions.selectIssue(null)}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/25 rounded-xl text-rose-300 hover:text-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
            title="Deselect active issue"
            aria-label="Clear selection"
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-bold font-mono hidden md:inline">CLEAR</span>
          </button>
        </>
      )}

      <div className="w-px h-4 bg-white/10 mx-1" />

      {/* Master reset button */}
      <button
        onClick={handleResetWorkspace}
        className="p-1.5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
        title="Reset zoom, pan, and selections"
        aria-label="Reset workspace"
      >
        <RotateCcw className="w-3.2 h-3.2" />
      </button>

    </div>
  );
}
