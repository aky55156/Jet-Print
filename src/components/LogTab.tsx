import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, Download, Search } from 'lucide-react';
import { StaffMember, LogEntry } from '../types';
import { SCRIPT_URL, getLocalAuditLogs } from '../data/staffData';
import { playCutePop } from '../utils/audio';

interface LogTabProps {
  currentUser: StaffMember;
}

export const LogTab: React.FC<LogTabProps> = ({ currentUser }) => {
  const [serverLogs, setServerLogs] = useState<LogEntry[]>([]);
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(() => getLocalAuditLogs());
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  const fetchLogs = async () => {
    if (!currentUser || !currentUser.name.toLowerCase().includes('amit kumar yadav')) {
      return;
    }

    setLoading(true);
    setLocalLogs(getLocalAuditLogs());
    playCutePop();

    try {
      const formData = new URLSearchParams();
      formData.append('action', 'getLogs');
      formData.append('requesterName', currentUser.name);

      const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.logs)) {
        setServerLogs(data.logs);
      }
    } catch {
      // Even if remote server fails, local audit logs are still displayed
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Merge local login/print audit logs with server logs (deduplicated)
  const combinedLogs = useMemo(() => {
    const merged: LogEntry[] = [...localLogs];
    const seen = new Set(
      localLogs.map((l) => `${l.timestamp}|${l.staffName}|${l.actionDetails}`)
    );

    for (const sLog of serverLogs) {
      const key = `${sLog.timestamp}|${sLog.staffName}|${sLog.actionDetails}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(sLog);
      }
    }

    return merged;
  }, [localLogs, serverLogs]);

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return combinedLogs;
    const q = search.toLowerCase();
    return combinedLogs.filter(
      (l) =>
        l.staffName?.toLowerCase().includes(q) ||
        l.desig?.toLowerCase().includes(q) ||
        l.actionDetails?.toLowerCase().includes(q) ||
        l.timestamp?.toLowerCase().includes(q)
    );
  }, [combinedLogs, search]);

  const handleExportCSV = () => {
    playCutePop();
    const headers = ['Date & Time Stamp', 'User Name', 'Designation', 'Activity / Printed Document Name'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp || ''}"`,
      `"${l.staffName || ''}"`,
      `"${l.desig || ''}"`,
      `"${l.actionDetails || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JET_PRINT_LOGS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Admin Log Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs uppercase font-bold tracking-wider border border-slate-200 dark:border-slate-700">
                Admin Only · Amit Kumar Yadav
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              Login &amp; Printed Documents Audit Log
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Complete record of user logins and printed document names with date and time stamps.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search log entries by username, document name, date, or time..."
            className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-xs">
                <th className="py-3.5 px-4">Date &amp; Time Stamp</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Designation</th>
                <th className="py-3.5 px-4">Activity / Printed Document Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading && filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 font-medium text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Retrieving audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 font-medium text-sm">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap tabular-nums">
                      {log.timestamp}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-sm">
                      {log.staffName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 text-sm">
                      {log.desig}
                    </td>
                    <td className="py-3.5 px-4 font-medium break-all text-sm">
                      {log.actionDetails}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
