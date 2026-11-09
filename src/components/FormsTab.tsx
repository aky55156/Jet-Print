import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText,
  ExternalLink,
  Printer,
  Search,
  CheckCircle2,
  FolderOpen,
  Plus,
  X,
  Trash2,
  Copy,
  Check
} from 'lucide-react';
import { StaffMember, OfficialForm } from '../types';
import { officialFormsList } from '../data/formsData';
import { SCRIPT_URL, recordAuditLog } from '../data/staffData';
import { playCutePop, playCuteDing } from '../utils/audio';

interface FormsTabProps {
  currentUser: StaffMember | null;
  onRequireLogin: () => void;
}

const CUSTOM_FORMS_STORAGE_KEY = 'jetprint_custom_forms';

export const FormsTab: React.FC<FormsTabProps> = ({ currentUser, onRequireLogin }) => {
  const [search, setSearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [printingStatus, setPrintingStatus] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});

  // Custom forms added via the UI
  const [customForms, setCustomForms] = useState<OfficialForm[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newUrl, setNewUrl] = useState<string>('');
  const [newCategory, setNewCategory] = useState<OfficialForm['category']>('Official');
  const [newDesc, setNewDesc] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);

  useEffect(() => {
    // 1. Load any locally saved custom forms immediately
    try {
      const saved = localStorage.getItem(CUSTOM_FORMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCustomForms(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }

    // 2. Also fetch shared forms from Google Apps Script / Google Sheet if configured
    const fetchRemoteForms = async () => {
      try {
        const formData = new URLSearchParams();
        formData.append('action', 'getForms');
        const res = await fetch(SCRIPT_URL, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data && data.success && Array.isArray(data.forms)) {
          setCustomForms(data.forms);
          localStorage.setItem(CUSTOM_FORMS_STORAGE_KEY, JSON.stringify(data.forms));
        }
      } catch {
        // Fallback silently to built-in + localStorage forms
      }
    };

    fetchRemoteForms();
  }, []);

  const saveCustomForms = (updated: OfficialForm[]) => {
    setCustomForms(updated);
    try {
      localStorage.setItem(CUSTOM_FORMS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  };

  const allForms = useMemo(() => {
    const existingTitles = new Set(officialFormsList.map((f) => f.title.toLowerCase()));
    const uniqueCustom = customForms.filter((f) => !existingTitles.has(f.title.toLowerCase()));
    return [...officialFormsList, ...uniqueCustom];
  }, [customForms]);

  const categories = ['All', 'Leave', 'Travel', 'Administrative', 'Official'];

  const filteredForms = useMemo(() => {
    return allForms.filter((form) => {
      const matchesCategory = categoryFilter === 'All' || form.category === categoryFilter;
      const matchesSearch =
        form.title.toLowerCase().includes(search.toLowerCase()) ||
        form.description.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allForms, search, categoryFilter]);

  const handleAddFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Please enter the form title.');
      return;
    }
    if (!newUrl.trim() || !newUrl.startsWith('http')) {
      setFormError('Please enter a valid Google Drive URL (starting with https://).');
      return;
    }

    const newFormObj: OfficialForm = {
      title: newTitle.trim(),
      url: newUrl.trim(),
      category: newCategory,
      description: newDesc.trim() || 'Official Form'
    };

    const updated = [...customForms, newFormObj];
    saveCustomForms(updated);
    playCuteDing();

    // Also send to Google Apps Script (if 'addForm' is enabled in Google Sheet)
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'addForm');
      formData.append('title', newFormObj.title);
      formData.append('url', newFormObj.url);
      formData.append('category', newFormObj.category);
      formData.append('description', newFormObj.description);
      fetch(SCRIPT_URL, { method: 'POST', body: formData }).catch(() => {});
    } catch {
      // ignore network error
    }

    setNewTitle('');
    setNewUrl('');
    setNewCategory('Official');
    setNewDesc('');
    setFormError('');
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomForm = (titleToRemove: string) => {
    playCutePop();
    const updated = customForms.filter((f) => f.title !== titleToRemove);
    saveCustomForms(updated);
  };

  const handleCopyCodeSnippet = () => {
    const snippet = `{
  title: "${newTitle.trim() || 'New Form Name'}",
  url: "${newUrl.trim() || 'https://drive.google.com/file/d/YOUR_FILE_ID/view'}",
  category: "${newCategory}",
  description: "${newDesc.trim() || 'Official Form'}"
}`;
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  const handlePrintDriveForm = async (form: OfficialForm) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    const key = form.title;
    setPrintingStatus((prev) => ({ ...prev, [key]: 'sending' }));
    playCutePop();

    let fileId = '';
    if (form.url.includes('id=')) {
      const match = form.url.match(/id=([^&]+)/);
      if (match) fileId = match[1];
    } else if (form.url.includes('/d/')) {
      const match = form.url.match(/\/d\/([^/]+)/);
      if (match) fileId = match[1];
    }

    // Record audit log entry with form name and timestamp for Admin Amit Kumar Yadav
    recordAuditLog(currentUser.name, currentUser.desig, `Printed Form: ${form.title}`);

    try {
      const formData = new URLSearchParams();
      formData.append('action', 'printDriveForm');
      formData.append('fileId', fileId);
      formData.append('formTitle', form.title);
      formData.append('uploaderName', currentUser.name);
      formData.append('uploaderDesig', currentUser.desig);

      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        playCuteDing();
        setPrintingStatus((prev) => ({ ...prev, [key]: 'success' }));
        setTimeout(() => {
          setPrintingStatus((prev) => ({ ...prev, [key]: 'idle' }));
        }, 4000);
      } else {
        setPrintingStatus((prev) => ({ ...prev, [key]: 'error' }));
        alert('Print request failed: ' + (data.message || 'Could not print document.'));
        setTimeout(() => {
          setPrintingStatus((prev) => ({ ...prev, [key]: 'idle' }));
        }, 4000);
      }
    } catch {
      setPrintingStatus((prev) => ({ ...prev, [key]: 'error' }));
      alert('Network error while sending form to Jet Printer.');
      setTimeout(() => {
        setPrintingStatus((prev) => ({ ...prev, [key]: 'idle' }));
      }, 4000);
    }
  };

  const isAmit = currentUser?.name?.toLowerCase().includes('amit kumar yadav');

  const getCleanViewUrl = (rawUrl: string) => {
    if (rawUrl.includes('uc?export=download')) {
      return rawUrl.replace('uc?export=download&id=', 'open?id=');
    }
    return rawUrl;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-slate-700 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Forms
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mt-0.5">
                View &amp; download official forms or send them directly to Jet Printer
              </p>
            </div>
          </div>

          {isAmit && (
            <button
              onClick={() => {
                playCutePop();
                setIsAddModalOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Form</span>
            </button>
          )}
        </div>

        {/* Left-Aligned Category Tabs & Search Bar */}
        <div className="mt-5 space-y-3">
          {/* Category Tabs on Left Side (Wrap on mobile so none are hidden) */}
          <div className="flex flex-wrap items-center justify-start gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  playCutePop();
                  setCategoryFilter(cat);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search forms by number, keyword, leave type, or title..."
              className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Numbered Forms Column List (Matching jetprint.in style) */}
      <div className="flex flex-col gap-3.5">
        {filteredForms.map((form, idx) => {
          const status = printingStatus[form.title] || 'idle';
          const docNumber = idx + 1;
          const isCustom = customForms.some((cf) => cf.title === form.title);

          return (
            <motion.div
              key={`${form.title}-${idx}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-blue-700 text-white font-mono text-sm font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {docNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                      {docNumber}. {form.title}
                    </h3>
                    <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {form.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {form.description}
                  </p>
                  {status === 'success' && (
                    <div className="mt-2.5 p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Sent to Jet Printer. Please collect your printout.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Full width side-by-side on mobile, inline on desktop */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <a
                  href={getCleanViewUrl(form.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 lg:flex-initial py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>View / Download</span>
                </a>

                <button
                  onClick={() => handlePrintDriveForm(form)}
                  disabled={status === 'sending'}
                  className="flex-1 lg:flex-initial py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-60 cursor-pointer whitespace-nowrap"
                >
                  {status === 'sending' ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4 shrink-0" />
                      <span>Send to Jet Print</span>
                    </>
                  )}
                </button>

                {isCustom && isAmit && (
                  <button
                    onClick={() => handleDeleteCustomForm(form.title)}
                    title="Remove custom form"
                    className="p-2.5 text-slate-500 hover:text-red-600 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
            No official forms matched your query &quot;{search}&quot;.
          </p>
        </div>
      )}

      {/* Add New Form Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl my-auto"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Add New Official Form</span>
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-600 dark:text-red-300 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Form Title *
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Medical Reimbursement Form"
                    className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Google Drive Link (URL) *
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/.../view"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Make sure the file in Google Drive has sharing set to &quot;Anyone with the link&quot;.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as OfficialForm['category'])}
                    className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Leave">Leave</option>
                    <option value="Travel">Travel</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Official">Official</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="e.g. Official form for medical claim submission"
                    className="w-full px-3.5 py-2.5 text-sm sm:text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Save &amp; Add to Forms List
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCodeSnippet}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Copied Code Snippet!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Code for formsData.ts</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
