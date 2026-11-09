import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  FileUp,
  FileText,
  FileImage,
  FileCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Info
} from 'lucide-react';
import { StaffMember } from '../types';
import { SCRIPT_URL, recordAuditLog } from '../data/staffData';
import { OfficePrinter } from './OfficePrinter';
import { playCutePop, playCuteSuccess } from '../utils/audio';

interface PrintTabProps {
  currentUser: StaffMember;
  onSwitchUser: () => void;
}

export const PrintTab: React.FC<PrintTabProps> = ({ currentUser }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressStage, setProgressStage] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
      return <FileImage className="w-8 h-8 text-indigo-500 shrink-0" />;
    }
    if (['doc', 'docx', 'txt'].includes(ext || '')) {
      return <FileText className="w-8 h-8 text-blue-600 shrink-0" />;
    }
    return <FileCode className="w-8 h-8 text-slate-700 dark:text-slate-300 shrink-0" />;
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatusMessage(null);
    setProgress(0);
    playCutePop();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !currentUser) return;

    setIsUploading(true);
    setStatusMessage(null);
    setProgress(20);
    setProgressStage('Reading document file...');
    playCutePop();

    setTimeout(() => {
      setProgress(45);
      setProgressStage('Preparing document for printing...');
    }, 500);

    setTimeout(() => {
      setProgress(65);
      setProgressStage('Sending to Jet Printer...');
    }, 1100);

    setTimeout(() => {
      setProgress(85);
      setProgressStage('Connecting to printer station...');
    }, 1700);

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const resultStr = reader.result as string;
        const base64 = resultStr.split(',')[1];

        const formData = new URLSearchParams();
        formData.append('action', 'uploadFile');
        formData.append('fileName', selectedFile.name);
        formData.append('fileData', base64);
        formData.append('uploaderName', currentUser.name);
        formData.append('uploaderDesig', currentUser.desig);

        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        setProgress(100);
        setProgressStage('Completed.');

        // Record audit log entry with document name and timestamp for Admin Amit Kumar Yadav
        recordAuditLog(
          currentUser.name,
          currentUser.desig,
          `Printed Document: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`
        );

        setTimeout(() => {
          setIsUploading(false);
          if (data.success) {
            playCuteSuccess();

            confetti({
              particleCount: 50,
              spread: 55,
              origin: { y: 0.65 },
              colors: ['#2563eb', '#1e40af', '#10b981', '#cbd5e1']
            });

            setStatusMessage({
              type: 'success',
              text: `File uploaded successfully. Uploader: ${currentUser.name} (${currentUser.desig}). Please collect your printed document from the Jet Printer.`
            });
          } else {
            setStatusMessage({
              type: 'error',
              text: data.message || 'Printer error. Please re-submit or contact Amit Kumar Yadav.'
            });
          }
        }, 400);
      } catch (err) {
        console.error(err);
        setIsUploading(false);
        setStatusMessage({
          type: 'error',
          text: 'Upload failed due to connection error. Please try again.'
        });
      }
    };

    reader.onerror = () => {
      setIsUploading(false);
      setStatusMessage({
        type: 'error',
        text: 'Could not read the selected local file.'
      });
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setProgress(0);
    setStatusMessage(null);
    setIsUploading(false);
    playCutePop();
  };

  const printerState = isUploading
    ? 'printing'
    : isDragging
    ? 'dragging'
    : statusMessage?.type === 'success'
    ? 'success'
    : 'idle';

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Current Staff Authentication Strip (English Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-base border border-blue-200 dark:border-slate-700 shrink-0">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              {currentUser.name}
            </div>
            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              {currentUser.desig}
            </div>
          </div>
        </div>

        <div className="text-xs sm:text-sm font-mono font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 px-3 py-1 rounded-lg self-start sm:self-center shrink-0">
          Connected · Jet Printer
        </div>
      </div>

      {/* Main Print Console Card */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs">
        
        {/* Top Header inside console */}
        <div className="text-center mb-6">
          <OfficePrinter size={130} state={printerState} />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
            Jet Printer
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
            Upload your documents and collect from <strong>Jet Printer</strong>.
          </p>
        </div>

        {/* Upload Drop Zone */}
        {!isUploading && !statusMessage?.type && (
          <div className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-slate-800/80'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-slate-800/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpeg,.jpg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-100 dark:border-slate-700">
                  <FileUp className="w-7 h-7" />
                </div>
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {selectedFile ? 'Document Selected. Tap to replace or confirm below.' : 'Tap to select or drag & drop document file'}
                </div>
                <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
                  Supported formats: PDF, DOCX, DOC, TXT, JPG, PNG (Max 15MB)
                </div>
              </div>
            </div>

            {/* Selected File Details */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  {getFileIcon(selectedFile.name)}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white break-all">
                      {selectedFile.name}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-sm font-bold text-red-600 hover:text-red-700 dark:text-red-400 px-3 py-1.5 rounded-lg bg-red-50/80 dark:bg-slate-700 hover:bg-red-100 transition-colors cursor-pointer self-end sm:self-center shrink-0"
                >
                  Remove File
                </button>
              </motion.div>
            )}

            {/* Print Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="w-full py-4 px-6 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-base sm:text-lg rounded-xl shadow-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer className="w-5 h-5" />
              <span>Send to Jet Printer</span>
            </button>
          </div>
        )}

        {/* Progress Display */}
        {isUploading && (
          <div className="py-6 space-y-4">
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
                {progressStage}
              </span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{progress}%</span>
            </div>

            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <motion.div
                className="h-full bg-blue-600 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Sending document to Jet Printer. Please keep this page open.
            </p>
          </div>
        )}

        {/* Status Confirmation Display */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-4 my-2"
            >
              {statusMessage.type === 'success' ? (
                <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-900 dark:text-emerald-100 text-sm sm:text-base leading-relaxed space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 text-base sm:text-lg">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Sent to Jet Printer</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Uploader: <strong>{currentUser.name}</strong> · {currentUser.desig}
                  </p>
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-sm sm:text-base">
                    <Printer className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Please collect your printed pages from <strong>Jet Printer</strong>.</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-700 dark:text-red-300 text-sm sm:text-base flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Printing Error: </span>
                    {statusMessage.text}
                  </div>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Upload Another Document</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Point-wise Short 2-Line Duplex Note */}
      <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm sm:text-base text-slate-700 dark:text-slate-300 space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>Duplex Paper Handling:</span>
        </div>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Automatic 2-sided printing is not available on this printer.</li>
          <li>For front-and-back printing, flip and re-insert the pages manually.</li>
        </ul>
      </div>

      {/* Short Portal Instructions Summary on Print Homepage */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1.5">
        <div className="font-bold text-slate-900 dark:text-white text-sm">
          Portal Instructions:
        </div>
        <ol className="list-decimal list-inside space-y-1 pl-1">
          <li><strong>Sign In:</strong> Select username &amp; enter PIN</li>
          <li><strong>Upload:</strong> Upload the Documents</li>
          <li><strong>Collect:</strong> Collect prints from JetPrinter (flip the page if back to back Printing)</li>
          <li><strong>Official Forms -</strong> One Tab Printing</li>
        </ol>
      </div>
    </div>
  );
};
