'use client';

import React, { useState } from 'react';
import { ValidatedAnalysis } from '@/types/analysis';
import { DeveloperBlueprint } from '@/types/specification';
import { copyTextToClipboard } from '@/lib/clipboard';
import ComponentTree from './ComponentTree';
import LibraryRecommendations from './LibraryRecommendations';
import PromptPreview from './PromptPreview';
import ExportActions from './ExportActions';
import {
  LayoutDashboard,
  Layers,
  Package,
  Terminal,
  FileCode,
  CheckSquare,
  Sparkles,
  Download,
  Info,
  Palette,
  Eye,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResultsDashboardProps {
  analysis: ValidatedAnalysis;
  blueprint: DeveloperBlueprint;
  screenshotFile: File | null;
  screenshotPreviewUrl: string | null;
  onClear: () => void;
}

type TabKey =
  | 'overview'
  | 'hierarchy'
  | 'libraries'
  | 'commands'
  | 'typescript'
  | 'checklist'
  | 'prompt'
  | 'export';

export default function ResultsDashboard({
  analysis,
  blueprint,
  screenshotFile,
  screenshotPreviewUrl,
  onClear,
}: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [copiedTs, setCopiedTs] = useState(false);
  const [showScreenshotReference, setShowScreenshotReference] = useState(true);

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'hierarchy', label: 'Component Tree', icon: Layers, badge: analysis.components.length },
    { key: 'libraries', label: 'Libraries', icon: Package, badge: blueprint.libraryRecommendations.length },
    { key: 'commands', label: 'Install Commands', icon: Terminal },
    { key: 'typescript', label: 'TypeScript', icon: FileCode },
    { key: 'checklist', label: 'Checklist', icon: CheckSquare, badge: blueprint.implementationChecklist.length },
    { key: 'prompt', label: 'AI Prompt', icon: Sparkles },
    { key: 'export', label: 'Export Blueprint', icon: Download },
  ];

  const handleCopyTs = async () => {
    const success = await copyTextToClipboard(blueprint.typescriptOutline);
    if (success) {
      setCopiedTs(true);
      setTimeout(() => setCopiedTs(false), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Summary & Clear Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-semibold tracking-wide uppercase">
              Analysis Verified
            </span>
            <span className="text-xs text-slate-400">
              Page Type: <strong className="text-slate-200 capitalize">{analysis.pageType}</strong>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100">
            {analysis.summary}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label="Analyze new screenshot and reset current results"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors self-start md:self-auto shrink-0 shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Analyze New Screenshot</span>
        </button>
      </div>

      {/* Reference Screenshot Banner (Persists during results review) */}
      {screenshotPreviewUrl && (
        <div className="border border-slate-800 bg-slate-900/30 rounded-2xl p-4 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-400" aria-hidden="true" />
              <h3 className="text-xs font-semibold text-slate-300">
                Reference Screenshot ({screenshotFile?.name || 'Uploaded reference'})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowScreenshotReference(!showScreenshotReference)}
              aria-expanded={showScreenshotReference}
              aria-label={showScreenshotReference ? 'Hide reference screenshot' : 'Show reference screenshot'}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-2 py-1"
            >
              <span>{showScreenshotReference ? 'Collapse' : 'Expand'}</span>
              {showScreenshotReference ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {showScreenshotReference && (
            <div className="mt-3 max-h-64 overflow-hidden rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotPreviewUrl}
                alt={`Reference screenshot: ${screenshotFile?.name || 'Visual target'}`}
                className="max-h-60 w-auto object-contain rounded-lg shadow-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div
        role="tablist"
        aria-label="Blueprint result sections"
        className="border-b border-slate-800 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              id={`tab-${tab.key}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-indigo-500/30 text-indigo-200'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
        className="pt-2 focus:outline-none"
      >
        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Layout Regions */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Detected Layout Structure
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.layout.map((region, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-medium flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" aria-hidden="true" />
                    <span>{region}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Design System Summary */}
            <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Design System Observations
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Colors */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Observed Color Palette
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {analysis.design.colors.map((c, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                        <span
                          className="w-3.5 h-3.5 rounded-md border border-white/20 shrink-0"
                          style={{ backgroundColor: c }}
                          aria-hidden="true"
                        />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Typography Hierarchy
                  </span>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {analysis.design.typography.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400" aria-hidden="true">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacing */}
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Spacing & Density
                  </span>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {analysis.design.spacing.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-400" aria-hidden="true">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Inferred Interactions & Assumptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-200">
                    Inferred Interactions
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.interactions.map((inter, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{inter.element}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40">
                          {inter.status}
                        </span>
                      </div>
                      <p className="text-slate-400">{inter.behavior}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-400" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-200">
                    Developer Assumptions
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-slate-400">
                  {analysis.assumptions.map((assump, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-2"
                    >
                      <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{assump}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 2. Component Hierarchy Tab */}
        {activeTab === 'hierarchy' && <ComponentTree tree={blueprint.componentTree} />}

        {/* 3. Libraries Tab */}
        {activeTab === 'libraries' && (
          <LibraryRecommendations
            recommendations={blueprint.libraryRecommendations}
            installationCommands={blueprint.installationCommands}
          />
        )}

        {/* 4. Install Commands Tab */}
        {activeTab === 'commands' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Package Installation Commands
                </h3>
              </div>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
              {blueprint.installationCommands.map((cmd, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-600 select-none">$</span>
                  <span>{cmd}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400">
              Run these commands in your target Next.js repository before generating the components.
            </p>
          </div>
        )}

        {/* 5. TypeScript Tab */}
        {activeTab === 'typescript' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Proposed TypeScript Interfaces
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyTs}
                aria-label="Copy proposed TypeScript interfaces"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none"
              >
                {copiedTs ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Interfaces</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 font-mono text-xs sm:text-sm text-indigo-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
              {blueprint.typescriptOutline}
            </div>
          </div>
        )}

        {/* 6. Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-200">
                  Frontend Implementation Checklist
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Prioritized Sequence
              </span>
            </div>

            <div className="space-y-2.5">
              {blueprint.implementationChecklist.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs sm:text-sm text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-mono font-semibold shrink-0 mt-0.5" aria-hidden="true">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. AI Prompt Tab */}
        {activeTab === 'prompt' && <PromptPreview promptText={blueprint.codingAssistantPrompt} />}

        {/* 8. Export Tab */}
        {activeTab === 'export' && (
          <ExportActions analysis={analysis} blueprint={blueprint} />
        )}
      </div>
    </div>
  );
}
