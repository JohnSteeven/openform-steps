import React, { useState } from 'react';
import { FormSchema } from '@openform-steps/core';
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Code,
  Calendar,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useToast } from './Toast';

interface PublishModalProps {
  isOpen: boolean;
  schema: FormSchema;
  status: 'draft' | 'published' | 'closed' | 'archived';
  maxSubmissions?: number | null;
  expiresAt?: string | null;
  onClose: () => void;
  onUpdatePublishSettings: (settings: {
    status: 'draft' | 'published' | 'closed' | 'archived';
    maxSubmissions?: number | null;
    expiresAt?: string | null;
  }) => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  schema,
  status: initialStatus,
  maxSubmissions: initialMax,
  expiresAt: initialExpiry,
  onClose,
  onUpdatePublishSettings,
}) => {
  const [status, setStatus] = useState(initialStatus);
  const [maxSubmissions, setMaxSubmissions] = useState<string>(initialMax ? String(initialMax) : '');
  const [expiresAt, setExpiresAt] = useState<string>(initialExpiry ? initialExpiry.substring(0, 10) : '');
  const [activeTab, setActiveTab] = useState<'share' | 'embed'>('share');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/?form=${schema.id}`;

  const iframeCode = `<iframe
  src="${publicUrl}"
  width="100%"
  height="700px"
  frameborder="0"
  title="${schema.title}"
  style="border-radius: 16px; border: 1px solid #e2e8f0;"
></iframe>`;

  const reactSnippet = `import { FormRenderer } from '@openform-steps/react';

// Render form in your React application
<FormRenderer
  schema={formSchema}
  onSubmit={async (data) => {
    await fetch('${window.location.origin}/api/public/forms/${schema.id}/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  }}
/>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showToast('Link Copied', 'Public form link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    showToast('Code Copied', 'Embed snippet copied to clipboard.', 'success');
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleSave = () => {
    onUpdatePublishSettings({
      status,
      maxSubmissions: maxSubmissions ? parseInt(maxSubmissions, 10) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    showToast('Settings Saved', `Form is now ${status.toUpperCase()}.`, 'success');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 id="publish-modal-title" className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Publish & Share Form
            </h2>
            <p className="text-xs text-slate-500">
              Manage live form availability, response quotas, and embed codes.
            </p>
          </div>
        </div>

        {/* Status Switcher Bar */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 mb-6">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Publication Lifecycle Status
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['draft', 'published', 'closed', 'archived'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer border ${
                  status === s
                    ? s === 'published'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : s === 'closed'
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {status === 'published' && '✓ Form is live and accessible to visitors via public link or embed.'}
            {status === 'draft' && '🔒 Form is private to you and cannot accept public submissions.'}
            {status === 'closed' && '⛔ Form display shows "Closed" and rejects new submissions.'}
            {status === 'archived' && '📦 Form is archived and hidden from public views.'}
          </p>
        </div>

        {/* Tab switcher: Share Link vs Embed Code */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'share'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Public URL</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'embed'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Embed Snippet</span>
          </button>
        </div>

        {/* Tab 1: Share Link */}
        {activeTab === 'share' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer"
                  title="Open live public form in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Constraints: Max submissions & Expiry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Response Quota Limit</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500 (blank for unlimited)"
                  value={maxSubmissions}
                  onChange={(e) => setMaxSubmissions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Automatically closes form when this count is reached.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Expiration Date</span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Rejects submissions submitted after 23:59 on this date.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Embed Code */}
        {activeTab === 'embed' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  HTML Iframe Embed Code
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyEmbed(iframeCode)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Code</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={4}
                value={iframeCode}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  React Component Integration
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyEmbed(reactSnippet)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy React Code</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={6}
                value={reactSnippet}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none"
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
};
