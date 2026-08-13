/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
  children: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  position = 'right',
  children
}: DrawerProps) {
  const positionStyles = {
    right: 'right-0 top-0 bottom-0 w-full max-w-sm border-l',
    left: 'left-0 top-0 bottom-0 w-full max-w-sm border-r',
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl border-t'
  };

  const initialAnimation = {
    right: { x: '100%', y: 0 },
    left: { x: '-100%', y: 0 },
    bottom: { x: 0, y: '100%' }
  };

  const animateState = {
    right: { x: 0, y: 0 },
    left: { x: 0, y: 0 },
    bottom: { x: 0, y: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={initialAnimation[position]}
            animate={animateState[position]}
            exit={initialAnimation[position]}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute bg-[#070914] border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden ${positionStyles[position]}`}
          >
            {title && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                <span className="text-xs font-mono font-bold text-slate-300 uppercase">{title}</span>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
