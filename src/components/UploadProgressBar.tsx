'use client';

import type { UploadProgress } from '@/hooks/useLetterActions';

export default function UploadProgressBar({ progress }: { progress: UploadProgress }) {
  const pct = Math.min(100, Math.max(5, progress.pct));
  return (
    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1.5 text-[11px]">
      <div className="flex items-center justify-between font-semibold text-emerald-900">
        <span className="truncate pr-2">{progress.msg}</span>
        <span className="font-mono shrink-0">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-600 transition-all duration-200 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
