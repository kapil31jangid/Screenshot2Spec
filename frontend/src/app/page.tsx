'use client';

import React, { useState, useEffect } from 'react';
import ScreenshotUpload from '@/components/ScreenshotUpload';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import ResultsDashboard from '@/components/ResultsDashboard';
import { useScreenshot } from '@/hooks/useScreenshot';
import { useAnalysis } from '@/hooks/useAnalysis';
import {
  Code2,
  Terminal,
  Layers,
  Cpu,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Github,
  PlayCircle,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [framework, setFramework] = useState('nextjs-ts');
  const [styling, setStyling] = useState('tailwind');
  const [instructions, setInstructions] = useState('');

  const {
    file,
    previewUrl,
    error: uploadError,
    setError: setUploadError,
    selectFile,
    clearFile,
  } = useScreenshot();

  const {
    analysis,
    blueprint,
    isLoading,
    loadingStep,
    error: apiError,
    analyze,
    loadDemo,
    reset: resetAnalysis,
  } = useAnalysis();

  const handleAnalyzeClick = async () => {
    if (!file) {
      setUploadError('Please select or paste a screenshot before generating a specification.');
      return;
    }

    await analyze(file, {
      framework,
      styling,
      instructions,
    });
  };

  const handleClearAll = () => {
    clearFile();
    resetAnalysis();
    setInstructions('');
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to trigger analysis
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (file && !isLoading && !analysis) {
          e.preventDefault();
          handleAnalyzeClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, isLoading, analysis, framework, styling, instructions]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800">
      {/* Top Engineering Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-200 shadow-sm">
              <Code2 className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-sm tracking-tight text-white">
                Screenshot2Spec
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                gemma-4-26b-a4b-it
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!analysis && (
              <button
                type="button"
                onClick={loadDemo}
                aria-label="Load demo analytics dashboard"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-md border border-zinc-800 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
              >
                <PlayCircle className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                <span>Load Sample UI</span>
              </button>
            )}

            <a
              href="https://github.com/kapil31jangid/Screenshot2Spec"
              target="_blank"
              rel="noreferrer"
              aria-label="View repository on GitHub"
              className="p-1.5 text-zinc-400 hover:text-white rounded-md hover:bg-zinc-900 transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!analysis || !blueprint ? (
          <div className="space-y-8 max-w-3xl mx-auto">
            {/* Minimal Technical Hero */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400">
                <Terminal className="w-3 h-3 text-zinc-400" />
                <span>Multimodal Vision → Production Blueprint Engine</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
                From UI Screenshot to Developer Blueprint
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Deconstruct any web interface into component hierarchies, Tailwind styles, TypeScript prop contracts, and library-aware AI coding prompts using Google Gemma 4.
              </p>

              {/* Technical Capabilities Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                  <Cpu className="w-3 h-3 text-zinc-500" />
                  Gemma 4 Vision
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                  <Layers className="w-3 h-3 text-zinc-500" />
                  Recursive Tree
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                  <ShieldCheck className="w-3 h-3 text-zinc-500" />
                  Strict Zod Validation
                </span>
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800/80">
                  <Code2 className="w-3 h-3 text-zinc-500" />
                  15-Section AI Prompt
                </span>
              </div>
            </div>

            {/* Workbench Form Card */}
            <div className="border border-zinc-800 bg-zinc-900/20 rounded-2xl p-5 sm:p-7 space-y-6 shadow-xl backdrop-blur-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    1. Screenshot Input
                  </h2>
                  <span className="text-[11px] text-zinc-500">
                    Paste with Ctrl+V / ⌘V or drag file
                  </span>
                </div>
                <ScreenshotUpload
                  onFileSelect={selectFile}
                  selectedFile={file}
                  error={uploadError}
                  onError={setUploadError}
                  disabled={isLoading}
                  onLoadSample={loadDemo}
                />
              </div>

              <div className="space-y-2 pt-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  2. Blueprint Parameters
                </h2>
                <ConfigurationPanel
                  framework={framework}
                  onFrameworkChange={setFramework}
                  styling={styling}
                  onStylingChange={setStyling}
                  instructions={instructions}
                  onInstructionsChange={setInstructions}
                  disabled={isLoading}
                />
              </div>

              {/* API / Network Error Alert */}
              {apiError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="font-semibold text-red-200">Analysis Request Failed</p>
                    <p className="leading-relaxed opacity-90">{apiError}</p>
                  </div>
                </div>
              )}

              {/* Action Button & Loading Status */}
              <div className="pt-2 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyzeClick}
                  disabled={!file || isLoading}
                  aria-label="Analyze screenshot with Gemma 4 model"
                  className={`w-full sm:w-auto min-w-[240px] px-6 py-2.5 rounded-lg font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none shadow-sm ${
                    !file || isLoading
                      ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                      : 'bg-white text-zinc-950 hover:bg-zinc-200 hover:shadow active:scale-[0.99]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-400" aria-hidden="true" />
                      <span>Synthesizing Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Specification</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-700 text-[10px] font-mono font-semibold">
                        ⌘⏎
                      </kbd>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>

                {isLoading && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="text-xs font-mono text-zinc-400 flex items-center gap-2 py-1 px-3 rounded-full bg-zinc-900 border border-zinc-800"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
                    <span>{loadingStep}</span>
                  </div>
                )}

                {!file && !isLoading && (
                  <p className="text-[11px] font-mono text-zinc-500">
                    Select or paste a screenshot, or click &ldquo;Load Sample UI&rdquo; above.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ResultsDashboard
            analysis={analysis}
            blueprint={blueprint}
            screenshotFile={file}
            screenshotPreviewUrl={previewUrl}
            onClear={handleClearAll}
          />
        )}
      </main>

      {/* Clean Technical Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-5 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-zinc-400">Screenshot2Spec</span>
            <span>—</span>
            <span>Open Source (MIT) · Powered by Google Gemma 4</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <a
              href="https://github.com/kapil31jangid/Screenshot2Spec"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <span className="font-mono text-zinc-500 text-[11px]">
              models/gemma-4-26b-a4b-it
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
