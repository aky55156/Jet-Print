import React from 'react';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, PauseCircle, PlayCircle, Loader2 } from 'lucide-react';
import { SpoolStatus } from '../types';

interface PrintProgressBarProps {
  progress: number; // 0 to 100
  status: SpoolStatus;
  estimatedSecondsRemaining: number;
  pagesTotal?: number;
  pagesPrinted?: number;
  className?: string;
}

export const PrintProgressBar: React.FC<PrintProgressBarProps> = ({
  progress,
  status,
  estimatedSecondsRemaining,
  pagesTotal = 1,
  pagesPrinted = 0,
  className = ''
}) => {
  const formatTimeRemaining = (seconds: number) => {
    if (status === 'completed' || seconds <= 0) {
      return 'Completed · Ready for pickup';
    }
    if (status === 'paused') {
      return 'Paused · Waiting for operator';
    }
    if (seconds < 60) {
      return `~${seconds}s remaining`;
    }
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `~${mins}m ${remainingSecs.toString().padStart(2, '0')}s remaining`;
  };

  const getBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-600 dark:bg-emerald-500';
      case 'printing':
        return 'bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600';
      case 'spooling':
        return 'bg-gradient-to-r from-sky-500 to-blue-600';
      case 'paused':
        return 'bg-amber-500';
      default:
        return 'bg-slate-400';
    }
  };

  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {/* Top Metadata Row: Status description & Estimated Time */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
          {status === 'printing' ? (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Laser Fusing (Page {Math.min(pagesTotal, pagesPrinted + 1)} of {pagesTotal})</span>
            </span>
          ) : status === 'spooling' ? (
            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Spooling to Memory Buffer</span>
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Printed Output Ready</span>
            </span>
          ) : status === 'paused' ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Job Paused</span>
            </span>
          ) : (
            <span className="text-slate-500">Queued in Buffer</span>
          )}
        </div>

        {/* Estimated Time Remaining with tabular digits */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
          <span className={status === 'printing' ? 'font-bold text-blue-600 dark:text-blue-400' : ''}>
            {formatTimeRemaining(estimatedSecondsRemaining)}
          </span>
        </div>
      </div>

      {/* Visual Progress Bar Track */}
      <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/80">
        <motion.div
          className={`h-full rounded-full transition-all duration-300 ease-out ${getBarColor()}`}
          style={{ width: `${clampedProgress}%` }}
        />
        {status === 'printing' && (
          <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Bottom Sub-row: Progress Percentage & Speed specs */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
        <span className="font-mono tabular-nums">
          {clampedProgress}% Spooled
        </span>
        <span className="text-[10px]">
          Jet Printer · High-Speed Laser
        </span>
      </div>
    </div>
  );
};
