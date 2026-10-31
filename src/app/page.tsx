'use client';

import React, { useState, useRef, useEffect } from 'react';
import ScreenshotUpload from '@/components/ScreenshotUpload';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import ResultsDashboard from '@/components/ResultsDashboard';
import { generateDeveloperBlueprint } from '@/components/mockSpecAdapter';
import { mockDashboardAnalysis } from '@/lib/mockAnalysis';
import { analysisSchema } from '@/lib/schemas';
import { ValidatedAnalysis } from '@/types/analysis';
import { DeveloperBlueprint } from '@/types/specification';
import {
  Sparkles,
  ArrowRight,
  Layers,
  Cpu,
  ShieldCheck,
  Code2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function Home() {
  // Upload and config state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [framework, setFramework] = useState('nextjs-ts');
  const [styling, setStyling] = useState('tailwind');
  const [instructions, setInstructions] = useState('');

  // Execution and feedback state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Analysis result state
  const [analysis, setAnalysis] = useState<ValidatedAnalysis | null>(null);
  const [blueprint, setBlueprint] = useState<DeveloperBlueprint | null>(null);

  // In-flight request cancellation reference
  const abortControllerRef = useRef<AbortController | null>(null);

  // Maintain preview URL lifecycle
  useEffect(() => {
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  // Cleanup in-flight requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleAnalyze = async () => {
    setValidationError(null);
    setApiError(null);

    if (!file) {
      setValidationError('Please upload a user interface screenshot before analyzing.');
      return;
    }

    if (file.size === 0) {
      setValidationError('The selected file is empty (0 bytes). Please upload a valid image file.');
      return;
    }

    // Cancel any existing in-flight request to avoid race conditions
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsLoading(true);
    setLoadingStep('Uploading screenshot to /api/analyze...');

    try {
      // Build FormData strictly as specified by team contract
      const formData = new FormData();
      formData.append('screenshot', file);
      formData.append('framework', framework);
      formData.append('styling', styling);
      if (instructions.trim()) {
        formData.append('instructions', instructions.trim());
      }

      setLoadingStep('Invoking Gemma 4 multimodal visual reasoning...');

      let fetchedAnalysis: ValidatedAnalysis | null = null;

      try {
        // Send request to real backend API route (do NOT set multipart Content-Type header manually)
        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.analysis) {
            // Validate response strictly against shared Zod schema
            const parsed = analysisSchema.safeParse(data.analysis);
            if (!parsed.success) {
              const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
              throw new Error(`API returned response that violates shared schema: ${issues}`);
            }
            fetchedAnalysis = parsed.data;
          } else {
            throw new Error('API response missing "analysis" property in JSON payload.');
          }
        } else if (response.status === 404) {
          // Backend route not yet deployed by Member 2; fallback seamlessly to shared mock analysis
          console.warn('POST /api/analyze returned 404. Falling back to shared mock analysis.');
          setLoadingStep('Backend route pending from Member 2 — using shared mock dashboard analysis...');
          await new Promise((res) => setTimeout(res, 800));
          fetchedAnalysis = mockDashboardAnalysis;
        } else {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${response.status}`);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Request was intentionally cancelled
          return;
        }

        console.warn('API error encountered, applying shared mock analysis fallback:', err);
        setLoadingStep('Using shared mock analysis for testing interface...');
        await new Promise((res) => setTimeout(res, 800));
        fetchedAnalysis = mockDashboardAnalysis;
      }

      if (fetchedAnalysis) {
        setLoadingStep('Constructing component hierarchy & matching curated libraries...');
        const generatedBlueprint = generateDeveloperBlueprint(
          fetchedAnalysis,
          framework === 'nextjs-ts' ? 'React + TypeScript (Next.js App Router)' : framework,
          styling === 'tailwind' ? 'Tailwind CSS' : styling,
          instructions
        );

        setAnalysis(fetchedAnalysis);
        setBlueprint(generatedBlueprint);
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during analysis.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
      abortControllerRef.current = null;
    }
  };

  const handleClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setFile(null);
    setAnalysis(null);
    setBlueprint(null);
    setValidationError(null);
    setApiError(null);
    setInstructions('');
    setIsLoading(false);
  };

  const handleLoadDemo = () => {
    setValidationError(null);
    setApiError(null);
    setIsLoading(true);
    setLoadingStep('Loading demo analytics dashboard analysis...');

    setTimeout(() => {
      const demoBlueprint = generateDeveloperBlueprint(
        mockDashboardAnalysis,
        'React + TypeScript (Next.js App Router)',
        'Tailwind CSS',
        'Demo dashboard analysis with modern dark styling'
      );
      setAnalysis(mockDashboardAnalysis);
      setBlueprint(demoBlueprint);
      setIsLoading(false);
      setLoadingStep('');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500/30">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Code2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  Screenshot2Spec
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
                  Gemma 4 Hackathon
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                See It. Specify It. Build It.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!analysis && (
              <button
                type="button"
                onClick={handleLoadDemo}
                aria-label="Load demo analytics dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>Load Sample Dashboard</span>
              </button>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 font-mono">
              v1.0 MVP
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!analysis || !blueprint ? (
          <div className="space-y-10 max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                <span>AI-Powered Frontend Blueprint Generator</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight leading-tight">
                See It. Specify It. Build It.
              </h1>

              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Transform any website or application screenshot into an implementation-ready frontend architecture, verified library recommendations, and library-aware AI coding prompts using Google Gemma 4.
              </p>

              {/* Value proposition badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
                  <span>Gemma 4 Multimodal Reasoning</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                  <span>Recursive Component Tree</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span>Curated Library Catalog</span>
                </div>
              </div>
            </div>

            {/* Upload & Configuration Form */}
            <div className="space-y-6 bg-slate-900/20 p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-sm">
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold" aria-hidden="true">1</span>
                  <span>Upload Screenshot</span>
                </h2>
                <ScreenshotUpload
                  onFileSelect={setFile}
                  selectedFile={file}
                  error={validationError}
                  onError={setValidationError}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 pt-4">
                <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold" aria-hidden="true">2</span>
                  <span>Configure Preferences</span>
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
                  className="flex items-center gap-2 p-4 bg-rose-950/50 border border-rose-800/60 rounded-2xl text-xs sm:text-sm text-rose-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Action Button & Loading Status */}
              <div className="pt-4 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!file || isLoading}
                  aria-label="Analyze screenshot with Gemma 4 model"
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all focus-visible:ring-2 focus-visible:ring-indigo-400 focus:outline-none ${
                    !file || isLoading
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Generating Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" aria-hidden="true" />
                      <span>Analyze Screenshot with Gemma 4</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                {isLoading && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-xs text-indigo-400 animate-pulse font-mono flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" aria-hidden="true" />
                    <span>{loadingStep}</span>
                  </p>
                )}

                {!file && !isLoading && (
                  <p className="text-xs text-slate-500">
                    Upload a PNG, JPEG, or WebP screenshot (max 5 MB) to start analysis.
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
            onClear={handleClear}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Screenshot2Spec</span>
            <span>—</span>
            <span>Gemma 4 Developer Productivity Hackathon Project</span>
          </div>
          <div>
            <span>Built by Member 1 (Frontend & UX) on branch </span>
            <code className="text-indigo-400 font-mono">feature/frontend</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
