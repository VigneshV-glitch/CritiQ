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
    <div className="flex items-center gap-1 apple-hud px-2 py-1.5 rounded-full select-none shadow-xl shrink-0">
      {/* Zoom Out Button */}
      <button
        onClick={() => zoomActions.zoomOut()}
        className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>
      
      {/* Reset Zoom Indicator */}
      <button
        onClick={() => zoomActions.resetZoom()}
        className="px-2.5 py-1 hover:bg-white/10 rounded-full text-[11px] font-mono font-semibold text-slate-300 hover:text-white transition-colors min-w-[48px] text-center cursor-pointer"
        title="Reset Zoom to 100%"
        aria-label="Reset Zoom"
      >
        {percentage}%
      </button>

      {/* Zoom In Button */}
      <button
        onClick={() => zoomActions.zoomIn()}
        className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-3.5 bg-white/15 mx-1" />

      {/* Fit Screen */}
      <button
        onClick={onFitScreen}
        className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Fit to Screen"
        aria-label="Fit Screen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* Reset */}
      <button
        onClick={handleResetWorkspace}
        className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
        title="Reset Viewport"
        aria-label="Reset Viewport"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {selectedIssueId && (
        <>
          <div className="w-px h-3.5 bg-white/15 mx-1" />
          <button
            onClick={() => selectionActions.selectIssue(null)}
            className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors cursor-pointer"
            title="Deselect active issue"
          >
            <XCircle className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </>
      )}
    </div>
  );
}
