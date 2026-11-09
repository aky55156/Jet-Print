export interface StaffMember {
  name: string;
  hindiName: string;
  desig: string;
  category?: 'director' | 'officer' | 'technical' | 'assistant' | 'attendant' | 'specialist';
}

export interface OfficialForm {
  title: string;
  url: string;
  category: 'Leave' | 'Travel' | 'Administrative' | 'Official';
  description: string;
}

export interface LogEntry {
  timestamp: string;
  staffName: string;
  desig: string;
  actionDetails: string;
}

export type SpoolStatus = 'queued' | 'spooling' | 'printing' | 'completed' | 'paused';

export interface PrintQueueJob {
  id: string;
  documentName: string;
  fileSizeFormatted: string;
  pagesTotal: number;
  pagesPrinted: number;
  uploaderName: string;
  uploaderDesig: string;
  submittedAt: string;
  status: SpoolStatus;
  progress: number; // 0 to 100
  estimatedSecondsRemaining: number;
  totalEstimatedSeconds: number;
}

export type ActiveTab = 'print' | 'forms' | 'instructions' | 'contact' | 'logs';
