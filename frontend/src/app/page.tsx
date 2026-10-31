'use client';

import React, { useState } from 'react';
import ScreenshotUpload from '@/components/ScreenshotUpload';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import ResultsDashboard from '@/components/ResultsDashboard';
import { useScreenshot } from '@/hooks/useScreenshot';
import { useAnalysis } from '@/hooks/useAnalysis';
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
  // Preferences state
  const [framework, setFramework] = useState('nextjs-ts');
  const [styling, setStyling] = useState('tailwind');
  const [instructions, setInstructions] = useState('');

  // Screenshot upload hook
  const {
    file,
    previewUrl,
    error: uploadError,
    setError: setUploadError,
    selectFile,
    clearFile,
  } = useScreenshot();

  // Analysis and blueprint hook
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
      setUploadError('Please upload a user interface screenshot before analyzing.');
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

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F1] text-[#1C2B1B] selection:bg-[#FEF3B5] selection:text-[#14370D]">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#CBD6C9]/70 bg-[#FAF9F1]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#14370D] flex items-center justify-center text-white shadow-md shadow-[#14370D]/15">
              <Code2 className="w-5 h-5 text-[#FEF3B5]" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-[#14370D]">
                  Screenshot2Spec
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEF3B5] text-[#14370D] border border-[#E5CE82] font-semibold">
                  Gemma 4 Hackathon
                </span>
              </div>
              <p className="text-[11px] text-[#52624F] font-medium">
                See It. Specify It. Build It.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!analysis && (
              <button
                type="button"
                onClick={loadDemo}
                aria-label="Load demo analytics dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C2B1B] hover:text-[#14370D] bg-white hover:bg-[#F4F6F2] rounded-lg border border-[#CBD6C9] shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                <span>Load Sample Dashboard</span>
              </button>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#E9EFE8] text-[#14370D] border border-[#CBD6C9] font-mono font-medium">
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
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E9EFE8] border border-[#CBD6C9] text-xs font-semibold text-[#14370D]">
                <Sparkles className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                <span>AI-Powered Frontend Blueprint Generator</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#14370D] tracking-tight leading-tight">
                See It. Specify It. Build It.
              </h1>

              <p className="text-sm sm:text-base text-[#52624F] max-w-2xl mx-auto leading-relaxed">
                Transform any website or application screenshot into an implementation-ready frontend architecture, verified library recommendations, and library-aware AI coding prompts using Google Gemma 4.
              </p>

              {/* Value proposition badges */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD6C9] text-xs text-[#1C2B1B] shadow-sm">
                  <Cpu className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                  <span>Gemma 4 Multimodal Reasoning</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD6C9] text-xs text-[#1C2B1B] shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                  <span>Recursive Component Tree</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#CBD6C9] text-xs text-[#1C2B1B] shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                  <span>Curated Library Catalog</span>
                </div>
              </div>
            </div>

            {/* Upload & Configuration Form */}
            <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD6C9]/80 shadow-[0_8px_30px_rgb(20,55,13,0.06)]">
              <div className="space-y-2">
                <h2 className="text-base font-semibold text-[#14370D] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#14370D] text-white flex items-center justify-center text-xs font-bold" aria-hidden="true">1</span>
                  <span>Upload Screenshot</span>
                </h2>
                <ScreenshotUpload
                  onFileSelect={selectFile}
                  selectedFile={file}
                  error={uploadError}
                  onError={setUploadError}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2 pt-4">
                <h2 className="text-base font-semibold text-[#14370D] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#14370D] text-white flex items-center justify-center text-xs font-bold" aria-hidden="true">2</span>
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
                  className="flex items-center gap-2 p-4 bg-[#FDF2F2] border border-[#F5C2C7] rounded-2xl text-xs sm:text-sm text-[#842029]"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 text-[#842029]" aria-hidden="true" />
                  <span>{apiError}</span>
                </div>
              )}

              {/* Action Button & Loading Status */}
              <div className="pt-4 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleAnalyzeClick}
                  disabled={!file || isLoading}
                  aria-label="Analyze screenshot with Gemma 4 model"
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none ${
                    !file || isLoading
                      ? 'bg-[#E9EFE8] text-[#52624F]/50 cursor-not-allowed border border-[#CBD6C9]'
                      : 'bg-[#14370D] hover:bg-[#0E2709] text-white shadow-[#14370D]/20 hover:shadow-[#14370D]/30 hover:scale-[1.01]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                      <span>Generating Blueprint...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-[#FEF3B5]" aria-hidden="true" />
                      <span>Analyze Screenshot with Gemma 4</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>

                {isLoading && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-xs text-[#14370D] font-mono flex items-center gap-1.5 font-medium"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#738E6D] animate-ping" aria-hidden="true" />
                    <span>{loadingStep}</span>
                  </p>
                )}

                {!file && !isLoading && (
                  <p className="text-xs text-[#52624F]">
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
            onClear={handleClearAll}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#CBD6C9]/70 bg-[#FAF9F1] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#52624F]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#14370D]">Screenshot2Spec</span>
            <span>—</span>
            <span>Gemma 4 Developer Productivity Hackathon Project</span>
          </div>
          <div>
            <span>Built by Member 1 (Frontend & UX) on branch </span>
            <code className="text-[#14370D] font-mono font-medium">feature/frontend</code>
          </div>
        </div>
      </footer>
    </div>
  );
}
