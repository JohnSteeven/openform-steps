import React, { useState, useEffect } from 'react';
import { FormSchema, FormSubmission, chunkedCsvExport, exportResponsesToJson } from '@openform-steps/core';
import { loadSubmissions, clearSubmissions } from '../storage/storage';
import {
  Trash2,
  Search,
  Inbox,
  FileSpreadsheet,
  FileCode,
  Calendar,
} from 'lucide-react';

interface ResponsesPageProps {
  currentSchema: FormSchema;
}

export const ResponsesPage: React.FC<ResponsesPageProps> = ({ currentSchema }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingProgress, setExportingProgress] = useState<number | null>(null);

  useEffect(() => {
    setSubmissions(loadSubmissions());
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to delete all locally stored responses? This cannot be undone.')) {
      clearSubmissions();
      setSubmissions([]);
    }
  };

  const handleDownloadCsv = async () => {
    if (submissions.length === 0) return;

    setExportingProgress(10);
    const csvContent = await chunkedCsvExport(currentSchema, submissions, (p) => {
      setExportingProgress(p);
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExportingProgress(null);
  };

  const handleDownloadJson = () => {
    if (submissions.length === 0) return;
    const jsonStr = exportResponsesToJson(submissions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-submissions-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = submissions.filter((sub) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    if (sub.formTitle.toLowerCase().includes(q) || sub.id.toLowerCase().includes(q)) return true;
    return Object.values(sub.data || {}).some((val) => String(val).toLowerCase().includes(q));
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Local Response Inspector
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Test submissions captured locally in your browser sandbox. Zero remote transmission.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{exportingProgress !== null ? `Exporting (${exportingProgress}%)` : 'Export CSV'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <FileCode className="w-4 h-4 text-blue-600" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search submissions by answer text, submission ID, or title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {submissions.length === 0 ? 'No test responses captured yet' : 'No matching results found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            {submissions.length === 0
              ? 'Click "Preview Form" in the builder and complete a test submission to inspect data here.'
              : 'Try searching with a different keyword or clear the search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {sub.id}
                  </span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {sub.formTitle}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Data answers key-values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(sub.data || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono truncate">
                      {key}
                    </span>
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 block break-words">
                      {Array.isArray(val)
                        ? val.join(', ')
                        : typeof val === 'boolean'
                        ? val ? 'Yes / Agreed' : 'No'
                        : val ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
