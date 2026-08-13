/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Edit2, Check, RotateCcw } from 'lucide-react';
import { Modal } from '../../ui/Modal';
import { TextArea } from '../../ui/TextArea';
import { Button } from '../../ui/Button';

interface ReviewIntentReminderProps {
  intent: string;
  onUpdateIntentAndReanalyze?: (newIntent: string) => void;
  className?: string;
}

export function ReviewIntentReminder({
  intent,
  onUpdateIntentAndReanalyze,
  className = ''
}: ReviewIntentReminderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedIntent, setEditedIntent] = useState(intent || '');

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdateIntentAndReanalyze && editedIntent.trim() !== intent) {
      onUpdateIntentAndReanalyze(editedIntent.trim());
    }
  };

  const displayIntent = intent && intent.trim() ? intent : 'Standard UX, UI, and WCAG accessibility inspection.';

  return (
    <>
      <div className={`p-3 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-start gap-2.5 min-w-0">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
              Review Intent
            </span>
            <p className="text-xs font-sans text-slate-300 truncate leading-snug">
              "{displayIntent}"
            </p>
          </div>
        </div>

        {onUpdateIntentAndReanalyze && (
          <button
            type="button"
            onClick={() => {
              setEditedIntent(displayIntent);
              setIsEditing(true);
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors shrink-0 text-xs flex items-center gap-1 font-sans cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Review Intent"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Updating your review instruction will allow you to re-run the inspection on this design with your new rules.
          </p>
          <TextArea
            value={editedIntent}
            onChange={(e) => setEditedIntent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              <RotateCcw className="w-3.5 h-3.5" />
              Re-run Inspection
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
