'use client';

import React, { useState } from 'react';
import { ScreenshotUpload } from '@/components/ScreenshotUpload';
import { ResultsDashboard } from '@/components/ResultsDashboard';
import { AnalysisResponse } from '@/types/analysis';
import { Specification } from '@/types/specification';
import { generateSpecification } from '@/lib/specificationGenerator';
import { mockDashboardAnalysis } from '@/lib/mockAnalysis';
import { analyzeScreenshot } from '@/lib/api';
import { Sparkles, Terminal, Code2, Cpu, CheckCircle } from 'lucide-react';

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [specification, setSpecification] = useState<Specification | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleAnalyze = async (
    file: File,
    framework: string,
    styling: string,
    instructions?: string
  ) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const result = await analyzeScreenshot({
        screenshot: file,
        framework,
        styling,
        instructions,
      });

      const spec = generateSpecification(result);
      setAnalysis(result);
      setSpecification(spec);
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const msg = err instanceof Error ? err.message : 'Screenshot analysis failed.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseMock = () => {
    setIsLoading(true);
    setApiError(null);
    setTimeout(() => {
      const spec = generateSpecification(mockDashboardAnalysis);
      setAnalysis(mockDashboardAnalysis);
      setSpecification(spec);
      setIsLoading(false);
    }, 400);
  };

  const handleClear = () => {
    setAnalysis(null);
    setSpecification(null);
    setApiError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">
                Screenshot2Spec
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                Gemma 4
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500 hidden md:inline">Google AI Studio Hackathon</span>
            <span className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              v1.0 MVP
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5" />
            <span>Multimodal Vision &bull; Deterministic Blueprint Engine</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            See It. Specify It. Build It.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Transform UI screenshots into comprehensive, implementation-ready AI coding prompts, component hierarchies, and curated library recommendations.
          </p>
        </section>

        {/* Error Banner */}
        {apiError && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm space-y-1">
            <div className="font-semibold flex items-center gap-2">
              <span>Analysis Failed</span>
            </div>
            <p className="text-xs whitespace-pre-wrap">{apiError}</p>
          </div>
        )}

        {/* Upload or Results */}
        {!analysis || !specification ? (
          <div className="space-y-10">
            <ScreenshotUpload
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              onUseMock={handleUseMock}
            />

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800 text-sm">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Multimodal UI Vision</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gemma 4 identifies layout bounds, cards, charts, forms, and color palettes grounded strictly in visible screenshot evidence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                  <Code2 className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Curated Library Mapping</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically pairs detected components with approved packages like shadcn/ui, Recharts, and Lucide without inventing dependencies.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <Terminal className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">AI-Ready Master Prompts</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generates 16-section implementation instructions ready to paste into Google Antigravity, Cursor, or Claude Code.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ResultsDashboard
            analysis={analysis}
            specification={specification}
            onClear={handleClear}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Screenshot2Spec &bull; Built with Google Gemma 4, Next.js &amp; Tailwind CSS &bull; 2026</p>
      </footer>
    </div>
  );
}
