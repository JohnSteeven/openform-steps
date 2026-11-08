import React, { useState, useEffect } from 'react';
import { FormSchema, FormSubmission, chunkedCsvExport, exportResponsesToJson } from '@openform-steps/core';
import { ConfirmationDialog } from '@openform-steps/react';
import { loadSubmissions, clearSubmissions } from '../storage/storage';
import {
  Trash2,
  Search,
  Inbox,
  FileSpreadsheet,
  FileCode,
  Calendar,
  X,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface ResponsesPageProps {
  currentSchema: FormSchema;
}

export const ResponsesPage: React.FC<ResponsesPageProps> = ({ currentSchema }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [exportingProgress, setExportingProgress] = useState<number | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [submissionToDelete, setSubmissionToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    setSubmissions(loadSubmissions());
  }, []);

  const handleConfirmClearAll = () => {
    clearSubmissions();
    setSubmissions([]);
    setIsClearModalOpen(false);
    showToast('Responses Cleared', 'All locally stored submissions have been removed.', 'info');
  };

  const handleConfirmDeleteSingle = () => {
    if (!submissionToDelete) return;
    const remaining = submissions.filter((s) => s.id !== submissionToDelete);
    localStorage.setItem('openform_local_submissions_v1', JSON.stringify(remaining));
    setSubmissions(remaining);
    setSubmissionToDelete(null);
    showToast('Submission Deleted', 'The selected test submission has been removed.', 'info');
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
    showToast('CSV Exported', `Generated CSV report with ${submissions.length} rows.`, 'success');
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
    showToast('JSON Exported', `Exported ${submissions.length} responses to JSON.`, 'success');
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
            onClick={() => setIsClearModalOpen(true)}
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
          placeholder="Search submissions by answer text, submission ID, or form title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Submissions List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50">
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
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
            Showing {filtered.length} of {submissions.length} total {submissions.length === 1 ? 'submission' : 'submissions'}
          </div>

          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmissionToDelete(sub.id)}
                    title="Delete submission"
                    aria-label={`Delete submission ${sub.id}`}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Key Value Answers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(sub.data || {}).map(([key, val]) => (
                  <div
                    key={key}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 text-xs"
                  >
                    <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      {key}
                    </div>
                    <div className="font-medium text-slate-800 dark:text-slate-200 break-words">
                      {typeof val === 'boolean'
                        ? val
                          ? '✓ Yes'
                          : '✗ No'
                        : Array.isArray(val)
                        ? val.join(', ') || '—'
                        : String(val ?? '—')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible Clear All Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isClearModalOpen}
        title="Clear All Test Responses"
        description="Are you sure you want to delete all locally stored submissions? This action is permanent and cannot be undone."
        confirmLabel="Erase All Data"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmClearAll}
        onCancel={() => setIsClearModalOpen(false)}
      />

      {/* Accessible Single Submission Deletion Dialog */}
      <ConfirmationDialog
        isOpen={submissionToDelete !== null}
        title="Delete Submission"
        description={`Are you sure you want to delete submission ${submissionToDelete}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDeleteSingle}
        onCancel={() => setSubmissionToDelete(null)}
      />
    </div>
  );
};
