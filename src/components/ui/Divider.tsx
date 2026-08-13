/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export function Divider({ className = '' }: { className?: string }) {
  return <div className={`w-full h-px bg-white/5 my-2 ${className}`} />;
}
