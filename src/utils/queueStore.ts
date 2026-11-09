import { PrintQueueJob, SpoolStatus } from '../types';

const STORAGE_KEY = 'jetprint_spool_queue';

// Initial initial seeded jobs for realistic institutional demonstration if empty
const DEFAULT_INITIAL_JOBS: PrintQueueJob[] = [
  {
    id: 'job-spool-001',
    documentName: 'Weekly_Epidemiological_Report_NCDC_Draft.pdf',
    fileSizeFormatted: '1.8 MB',
    pagesTotal: 6,
    pagesPrinted: 3,
    uploaderName: 'Dr. Bibhash Nandi',
    uploaderDesig: 'Joint Director',
    submittedAt: new Date(Date.now() - 45 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'printing',
    progress: 55,
    estimatedSecondsRemaining: 18,
    totalEstimatedSeconds: 40
  },
  {
    id: 'job-spool-002',
    documentName: 'Leave_Application_Casual_Official.pdf',
    fileSizeFormatted: '340 KB',
    pagesTotal: 2,
    pagesPrinted: 0,
    uploaderName: 'Mr. Udaiveer Singh',
    uploaderDesig: 'Assistant Research Officer',
    submittedAt: new Date(Date.now() - 15 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'spooling',
    progress: 15,
    estimatedSecondsRemaining: 32,
    totalEstimatedSeconds: 38
  },
  {
    id: 'job-spool-003',
    documentName: 'Lab_Equipment_Maintenance_Log_Nov2026.docx',
    fileSizeFormatted: '620 KB',
    pagesTotal: 4,
    pagesPrinted: 4,
    uploaderName: 'Mr. Shashi Kant Sharma',
    uploaderDesig: 'Technician',
    submittedAt: new Date(Date.now() - 120 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'completed',
    progress: 100,
    estimatedSecondsRemaining: 0,
    totalEstimatedSeconds: 30
  }
];

export function loadPrintQueue(): PrintQueueJob[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_JOBS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      savePrintQueue(DEFAULT_INITIAL_JOBS);
      return DEFAULT_INITIAL_JOBS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_INITIAL_JOBS;
  } catch {
    return DEFAULT_INITIAL_JOBS;
  }
}

export function savePrintQueue(jobs: PrintQueueJob[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    // Ignore localStorage quota errors
  }
}

export function addPrintJobToQueue(job: {
  documentName: string;
  fileSizeFormatted: string;
  pagesTotal?: number;
  uploaderName: string;
  uploaderDesig: string;
}): PrintQueueJob {
  const current = loadPrintQueue();
  const pages = job.pagesTotal || Math.max(1, Math.min(12, Math.round(Math.random() * 5 + 1)));
  const totalSeconds = Math.max(12, pages * 5 + 8);

  const newJob: PrintQueueJob = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    documentName: job.documentName,
    fileSizeFormatted: job.fileSizeFormatted,
    pagesTotal: pages,
    pagesPrinted: 0,
    uploaderName: job.uploaderName,
    uploaderDesig: job.uploaderDesig,
    submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    status: 'spooling',
    progress: 5,
    estimatedSecondsRemaining: totalSeconds,
    totalEstimatedSeconds: totalSeconds
  };

  const updated = [newJob, ...current];
  savePrintQueue(updated);
  return newJob;
}
