import { useState, useEffect, Suspense, lazy } from 'react';
import { FormSchema } from '@openform-steps/core';
import { loadSavedDraft, getThemePreference, setThemePreference, loadSubmissions } from '../storage/storage';
import {
  Wrench,
  Layers,
  Inbox,
  BookOpen,
  Code2,
  Sun,
  Moon,
  Github,
  Shield,
  Zap,
} from 'lucide-react';

// Route-based code splitting for maximum initial page speed
const BuilderPage = lazy(() =>
  import('./BuilderPage').then((m) => ({ default: m.BuilderPage }))
);
const TemplatesPage = lazy(() =>
  import('./TemplatesPage').then((m) => ({ default: m.TemplatesPage }))
);
const ResponsesPage = lazy(() =>
  import('./ResponsesPage').then((m) => ({ default: m.ResponsesPage }))
);
const DocsPage = lazy(() =>
  import('./DocsPage').then((m) => ({ default: m.DocsPage }))
);
const ExamplesPage = lazy(() =>
  import('./ExamplesPage').then((m) => ({ default: m.ExamplesPage }))
);

export function App() {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'responses' | 'docs' | 'examples'>('builder');
  const [schema, setSchema] = useState<FormSchema>(loadSavedDraft);
  const [theme, setTheme] = useState<'light' | 'dark'>(getThemePreference);
  const [submissionsCount, setSubmissionsCount] = useState<number>(() => loadSubmissions().length);

  // Sync theme class to document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setThemePreference(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSelectTemplate = (newSchema: FormSchema) => {
    setSchema(newSchema);
    setActiveTab('builder');
  };

  const handleSubmissionRecorded = () => {
    setSubmissionsCount(loadSubmissions().length);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="font-black text-sm tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>OpenForm Steps</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900">
                    v1.0.0
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 hidden sm:block">
                  Accessible Multi-Step Form Builder & React Library
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Templates</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('responses')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'responses'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Responses</span>
              {submissionsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-600 text-white font-mono">
                  {submissionsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Docs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('examples')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'examples'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Examples</span>
            </button>
          </nav>

          {/* Right utility buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle color theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <a
              href="https://github.com/JohnSteeven/openform-steps"
              target="_blank"
              rel="noopener noreferrer"
              title="Official GitHub Repository: JohnSteeven/openform-steps"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xs"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`p-1.5 font-bold ${activeTab === 'builder' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`p-1.5 font-bold ${activeTab === 'templates' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            Templates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('responses')}
            className={`p-1.5 font-bold ${activeTab === 'responses' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            Responses ({submissionsCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`p-1.5 font-bold ${activeTab === 'docs' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            Docs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('examples')}
            className={`p-1.5 font-bold ${activeTab === 'examples' ? 'text-blue-600' : 'text-slate-500'}`}
          >
            Examples
          </button>
        </div>
      </header>

      {/* Main Content with Suspense */}
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-mono">Loading module...</p>
            </div>
          }
        >
          {activeTab === 'builder' && (
            <BuilderPage
              schema={schema}
              onSchemaChange={setSchema}
              onSubmissionRecorded={handleSubmissionRecorded}
            />
          )}
          {activeTab === 'templates' && (
            <TemplatesPage
              onSelectTemplate={handleSelectTemplate}
              onSubmissionRecorded={handleSubmissionRecorded}
            />
          )}
          {activeTab === 'responses' && <ResponsesPage currentSchema={schema} />}
          {activeTab === 'docs' && <DocsPage />}
          {activeTab === 'examples' && <ExamplesPage />}
        </Suspense>
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-4 sm:px-6 mt-16 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">OpenForm Steps</span>
            <span>•</span>
            <span>Released under the MIT Open Source License</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>100% Client-Side Privacy</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <Zap className="w-3.5 h-3.5" />
              <span>WCAG 2.2 AA Compliant</span>
            </span>
            <span>•</span>
            <a
              href="https://github.com/JohnSteeven/openform-steps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 dark:text-slate-300 hover:text-blue-600 font-medium"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
