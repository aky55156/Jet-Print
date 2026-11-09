import React from 'react';
import { KeyRound, FileUp, Printer, FileText } from 'lucide-react';
import { OfficePrinter } from './OfficePrinter';

export const InstructionsTab: React.FC = () => {
  const instructions = [
    {
      num: '1',
      icon: KeyRound,
      title: 'Sign In:',
      text: 'Select your name and enter your 4-digit PIN to access the portal.'
    },
    {
      num: '2',
      icon: FileUp,
      title: 'Upload Personal Documents:',
      text: 'Upload any document file (PDF, Word, TXT, or Image) to dispatch it for printing.'
    },
    {
      num: '3',
      icon: FileText,
      title: 'Use Prefilled Forms for Daily Work:',
      text: 'Use prefilled forms to quickly print daily official documents like Leave Applications, Joining Reports, Dispatch Slips, Vehicle Indents / Requisitions, and administrative formats from the Forms tab.'
    },
    {
      num: '4',
      icon: Printer,
      title: 'Collect from Jet Printer:',
      text: 'Collect your printed documents directly from the Jet Printer (connected to Amit’s PC). For two-sided prints, manually invert pages at the tray.'
    }
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <OfficePrinter size={90} state="idle" />
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Instructions
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-0.5">
              Simple guidelines to upload files and print daily official forms on the Jet Printer.
            </p>
          </div>
        </div>

        {/* Point-wise Instructions */}
        <div className="space-y-3">
          {instructions.map((item) => {
            return (
              <div
                key={item.num}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {item.num}
                </div>
                <div className="text-sm sm:text-base leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                    {item.title}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {item.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
