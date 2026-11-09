import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  FileText,
  FileImage,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Play,
  Pause,
  PlusCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { PrintQueueJob, SpoolStatus, StaffMember } from '../types';
import { loadPrintQueue, savePrintQueue, addPrintJobToQueue } from '../utils/queueStore';
import { PrintProgressBar } from './PrintProgressBar';
import { playCutePop, playCuteDing, playCuteSuccess } from '../utils/audio';

interface PrintQueueListProps {
  currentUser?: StaffMember | null;
}

export const PrintQueueList: React.FC<PrintQueueListProps> = ({ currentUser }) => {
  const [jobs, setJobs] = useState<PrintQueueJob[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  // Load jobs on mount
  useEffect(() => {
    setJobs(loadPrintQueue());
  }, []);

  // Real-time spooler simulation ticker:
  // Automatically progresses active jobs and decrements estimatedSecondsRemaining
  useEffect(() => {
    const timer = setInterval(() => {
      setJobs((prevJobs) => {
        let changed = false;
        const updated = prevJobs.map((job) => {
          if (job.status === 'completed' || job.status === 'paused') {
            return job;
          }

          changed = true;
          const nextRemaining = Math.max(0, job.estimatedSecondsRemaining - 1);
          const elapsed = job.totalEstimatedSeconds - nextRemaining;
          const calculatedProgress = Math.min(
            100,
            Math.round((elapsed / job.totalEstimatedSeconds) * 100)
          );

          // Update status based on progress
          let nextStatus: SpoolStatus = job.status;
          let nextPagesPrinted = job.pagesPrinted;

          if (calculatedProgress < 25) {
            nextStatus = 'spooling';
          } else if (calculatedProgress < 100) {
            nextStatus = 'printing';
            const pageIncrement = Math.min(
              job.pagesTotal,
              Math.floor(((calculatedProgress - 25) / 75) * job.pagesTotal)
            );
            nextPagesPrinted = pageIncrement;
          } else {
            nextStatus = 'completed';
            nextPagesPrinted = job.pagesTotal;
          }

          return {
            ...job,
            progress: calculatedProgress,
            estimatedSecondsRemaining: nextRemaining,
            status: nextStatus,
            pagesPrinted: nextPagesPrinted
          };
        });

        if (changed) {
          savePrintQueue(updated);
          return updated;
        }
        return prevJobs;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    if (filter === 'active') return job.status === 'printing' || job.status === 'spooling' || job.status === 'queued';
    if (filter === 'completed') return job.status === 'completed';
    return true;
  });

  const activeCount = jobs.filter((j) => j.status === 'printing' || j.status === 'spooling').length;
  const completedCount = jobs.filter((j) => j.status === 'completed').length;
  const totalPagesInSpool = jobs
    .filter((j) => j.status !== 'completed')
    .reduce((sum, j) => sum + (j.pagesTotal - j.pagesPrinted), 0);

  const handleTogglePause = (jobId: string) => {
    playCutePop();
    setJobs((prev) => {
      const updated: PrintQueueJob[] = prev.map((j) => {
        if (j.id === jobId) {
          const nextStatus: SpoolStatus = j.status === 'paused' ? 'printing' : 'paused';
          return { ...j, status: nextStatus };
        }
        return j;
      });
      savePrintQueue(updated);
      return updated;
    });
  };

  const handleDeleteJob = (jobId: string) => {
    playCutePop();
    setJobs((prev) => {
      const updated = prev.filter((j) => j.id !== jobId);
      savePrintQueue(updated);
      return updated;
    });
  };

  const handleClearCompleted = () => {
    playCutePop();
    setJobs((prev) => {
      const updated = prev.filter((j) => j.status !== 'completed');
      savePrintQueue(updated);
      return updated;
    });
  };

  const handleAddSampleJob = () => {
    playCuteDing();
    const sampleNames = [
      'NCDC_Surveillance_Monthly_Bulletin_Draft.pdf',
      'Duty_Travel_Allowance_Sanction_Form.pdf',
      'Clinical_Specimen_Inventory_Dispatch.docx',
      'Official_Circular_Administrative_Order_2026.pdf'
    ];
    const picked = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const uploader = currentUser ? currentUser.name : 'Dr. Stuti Kaushik';
    const desig = currentUser ? currentUser.desig : 'Assistant Director';

    const newJob = addPrintJobToQueue({
      documentName: picked,
      fileSizeFormatted: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
      pagesTotal: Math.floor(Math.random() * 5 + 2),
      uploaderName: uploader,
      uploaderDesig: desig
    });

    setJobs((prev) => [newJob, ...prev]);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header and Queue Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 font-mono text-[10px] uppercase font-bold tracking-wider border border-blue-100 dark:border-slate-700">
              <Printer className="w-3 h-3" />
              Laser Spooler Monitor
            </span>
            <span className="text-xs text-slate-400">Amit&apos;s Printer Station</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            Print Queue & Active Spool Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time visual monitoring of documents currently in memory spool or laser fusing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleAddSampleJob}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-xl border border-blue-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Simulate sending a test document into print queue"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Queue Test Doc</span>
          </button>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              title="Clear completed documents from queue list"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Spool Jobs</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
            <span>{activeCount}</span>
            {activeCount > 0 && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Pages Pending</div>
          <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
            {totalPagesInSpool}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Completed Today</div>
          <div className="text-lg font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {completedCount}
          </div>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Spooler Engine</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Laser Online · Ready</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => {
            playCutePop();
            setFilter('all');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Jobs ({jobs.length})
        </button>
        <button
          onClick={() => {
            playCutePop();
            setFilter('active');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-blue-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          In Spool ({activeCount})
        </button>
        <button
          onClick={() => {
            playCutePop();
            setFilter('completed');
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Queue Items List */}
      <div className="space-y-3.5">
        <AnimatePresence initial={false}>
          {filteredJobs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              No documents currently in this queue view. Documents sent for printing will appear here automatically with real-time spooling progress.
            </div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`p-4 rounded-xl border transition-all ${
                  job.status === 'printing'
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                    : job.status === 'completed'
                    ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Header Information for the Document */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                        {job.documentName}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{job.uploaderName} ({job.uploaderDesig})</span>
                        <span>·</span>
                        <span className="font-mono">{job.fileSizeFormatted}</span>
                        <span>·</span>
                        <span className="font-mono">{job.pagesTotal} {job.pagesTotal === 1 ? 'page' : 'pages'}</span>
                        <span>·</span>
                        <span className="font-mono">{job.submittedAt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this job */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {job.status !== 'completed' && (
                      <button
                        onClick={() => handleTogglePause(job.id)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title={job.status === 'paused' ? 'Resume job' : 'Pause job'}
                      >
                        {job.status === 'paused' ? (
                          <Play className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Pause className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Remove job from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Visual Progress Bar Component with Estimated Time Remaining */}
                <div className="pt-1">
                  <PrintProgressBar
                    progress={job.progress}
                    status={job.status}
                    estimatedSecondsRemaining={job.estimatedSecondsRemaining}
                    pagesTotal={job.pagesTotal}
                    pagesPrinted={job.pagesPrinted}
                  />
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
