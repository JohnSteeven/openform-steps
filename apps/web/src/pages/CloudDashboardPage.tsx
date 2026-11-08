import React, { useState, useEffect } from 'react';
import { FormSchema } from '@openform-steps/core';
import { ConfirmationDialog } from '@openform-steps/react';
import {
  CloudFormSummary,
  getCloudForms,
  createCloudForm,
  setCloudFormStatus,
  duplicateCloudForm,
  deleteCloudForm,
  getCloudSubmissions,
  CloudUser,
} from '../api/client';
import { PublishModal } from '../components/PublishModal';
import {
  Cloud,
  Plus,
  Layers,
  Inbox,
  Globe,
  Search,
  LogIn,
  Loader2,
} from 'lucide-react';
import { useToast } from '../components/Toast';

interface CloudDashboardPageProps {
  currentUser: CloudUser | null;
  onOpenAuth: () => void;
  onEditInBuilder: (schema: FormSchema) => void;
}

export const CloudDashboardPage: React.FC<CloudDashboardPageProps> = ({
  currentUser,
  onOpenAuth,
  onEditInBuilder,
}) => {
  const [forms, setForms] = useState<CloudFormSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formToPublish, setFormToPublish] = useState<CloudFormSummary | null>(null);
  const [formToDelete, setFormToDelete] = useState<CloudFormSummary | null>(null);
  const [activeSubmissionsForm, setActiveSubmissionsForm] = useState<{ id: string; title: string } | null>(null);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const { showToast } = useToast();

  const loadForms = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await getCloudForms();
      setForms(data);
    } catch (err: any) {
      showToast('Error Loading Forms', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadForms();
    } else {
      setForms([]);
    }
  }, [currentUser]);

  const handleCreateNew = async () => {
    try {
      const title = `New Cloud Form ${forms.length + 1}`;
      const created = await createCloudForm(title);
      showToast('Form Created', `Created "${title}". Loading into builder...`, 'success');
      onEditInBuilder(created.schema);
    } catch (err: any) {
      showToast('Creation Failed', err.message, 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateCloudForm(id);
      showToast('Form Duplicated', 'A copy of the form was created.', 'success');
      loadForms();
    } catch (err: any) {
      showToast('Duplicate Failed', err.message, 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!formToDelete) return;
    try {
      await deleteCloudForm(formToDelete.id);
      showToast('Form Deleted', `"${formToDelete.title}" and its submissions have been deleted.`, 'info');
      setFormToDelete(null);
      loadForms();
    } catch (err: any) {
      showToast('Delete Failed', err.message, 'error');
    }
  };

  const handleOpenSubmissions = async (form: CloudFormSummary) => {
    setActiveSubmissionsForm({ id: form.id, title: form.title });
    setLoadingSubmissions(true);
    try {
      const res = await getCloudSubmissions(form.id);
      setSubmissionsList(res.submissions);
    } catch (err: any) {
      showToast('Failed to load submissions', err.message, 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const filteredForms = forms.filter((f) => {
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return f.title.toLowerCase().includes(q) || f.id.toLowerCase().includes(q);
  });

  if (!currentUser) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-900">
            <Cloud className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            OpenForm Cloud Service (Mode B)
          </h2>
          <p className="text-xs text-slate-500 max-w-md mt-2 mb-6 leading-relaxed">
            Create an account or sign in to save forms to the cloud, publish forms with custom shareable links, enforce response limits, and collect submissions in real-time.
          </p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Create Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2 border border-blue-200 dark:border-blue-900">
            <Cloud className="w-3.5 h-3.5" />
            <span>Hosted Cloud Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Cloud Forms Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser.name}</span> ({currentUser.email})
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Cloud Form</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cloud forms by title or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
          {(['all', 'draft', 'published', 'closed', 'archived'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Forms List */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500 font-mono">Loading cloud forms...</p>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/50 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {forms.length === 0 ? 'No cloud forms created yet' : 'No matching forms found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Click "New Cloud Form" above to start designing a hosted form with live submission collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => {
            const isPublished = form.status === 'published';
            const isClosed = form.status === 'closed';

            return (
              <div
                key={form.id}
                className="flex flex-col justify-between p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isPublished
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                          : isClosed
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {form.status}
                    </span>

                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Inbox className="w-3.5 h-3.5" />
                      <span>{form.submissionsCount} responses</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1 truncate">
                    {form.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400 mb-4">ID: {form.id}</div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormToPublish(form)}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200 dark:border-blue-900"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publish & Share</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenSubmissions(form)}
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Inbox className="w-3.5 h-3.5 text-slate-400" />
                      <span>Data</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(form.id)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormToDelete(form)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-medium cursor-pointer"
                    >
                      Delete Form
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Accessible Delete Form Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={formToDelete !== null}
        title="Delete Cloud Form"
        description={`Are you sure you want to delete "${formToDelete?.title}"? All submissions associated with this cloud form will be permanently removed.`}
        confirmLabel="Delete Form"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setFormToDelete(null)}
      />

      {/* Publish & Share Modal */}
      {formToPublish && (
        <PublishModal
          isOpen={true}
          schema={{ id: formToPublish.id, title: formToPublish.title, version: '1.0.0', settings: {}, steps: [] }}
          status={formToPublish.status}
          maxSubmissions={formToPublish.maxSubmissions}
          expiresAt={formToPublish.expiresAt}
          onClose={() => setFormToPublish(null)}
          onUpdatePublishSettings={async ({ status, maxSubmissions: _max, expiresAt: _exp }) => {
            await setCloudFormStatus(formToPublish.id, status);
            loadForms();
          }}
        />
      )}

      {/* Submissions Viewer Modal */}
      {activeSubmissionsForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={() => setActiveSubmissionsForm(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Submissions: {activeSubmissionsForm.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Form ID: {activeSubmissionsForm.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmissionsForm(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingSubmissions ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading submissions...</div>
              ) : submissionsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No submissions recorded yet for this form.
                </div>
              ) : (
                submissionsList.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-700/60">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {sub.id}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <pre className="font-mono text-[11px] overflow-x-auto text-slate-700 dark:text-slate-300">
                      {JSON.stringify(sub.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
