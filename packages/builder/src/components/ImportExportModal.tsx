import React, { useState } from 'react';
import {
  FormSchema,
  exportFormToJson,
  importFormFromJson,
} from '@openform-steps/core';
import { X, Copy, Download, Upload, Check, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  schema: FormSchema;
  onImport: (newSchema: FormSchema) => void;
  onClose: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  schema,
  onImport,
  onClose,
}) => {
  const [mode, setMode] = useState<'export' | 'import'>('export');
  const [jsonText, setJsonText] = useState(() => exportFormToJson(schema));
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'form'}-schema.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      validateAndApply(content);
    };
    reader.readAsText(file);
  };

  const validateAndApply = (text: string) => {
    setImportError(null);
    const result = importFormFromJson(text);
    if (result.success && result.data) {
      onImport(result.data);
      onClose();
    } else {
      setImportError(result.error || 'Failed to import form schema.');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 id="import-export-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Form Configuration (JSON)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Export form schema or import an existing configuration</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 gap-4">
          <button
            type="button"
            onClick={() => {
              setMode('export');
              setJsonText(exportFormToJson(schema));
              setImportError(null);
            }}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              mode === 'export'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('import');
              setImportError(null);
            }}
            className={`py-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              mode === 'import'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Import JSON
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {mode === 'export' ? (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You can copy this JSON schema to save or use directly with the{' '}
                <code className="text-blue-600 font-mono">&lt;FormRenderer schema=&#123;schema&#125; /&gt;</code>{' '}
                React component.
              </p>
              <textarea
                readOnly
                rows={12}
                value={jsonText}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 resize-none outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Schema'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .json</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Paste a valid OpenForm Steps schema JSON below or upload a file. The schema will be automatically validated against the OpenForm specification.
              </p>

              <div>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer mb-2">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json File</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={10}
                placeholder="Paste form schema JSON here..."
                value={jsonText}
                onChange={(e) => {
                  setJsonText(e.target.value);
                  setImportError(null);
                }}
                className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 resize-none outline-none focus:ring-2 focus:ring-blue-500"
              />

              {importError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => validateAndApply(jsonText)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Validate & Load Form</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
