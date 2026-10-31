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
  ImageIcon,
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
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showScreenshotReference, setShowScreenshotReference] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const tabs: { key: TabKey; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { key: 'overview', label: 'Architecture', icon: LayoutDashboard },
    { key: 'hierarchy', label: 'Component Tree', icon: Layers, badge: analysis.components.length },
    { key: 'libraries', label: 'Libraries', icon: Package, badge: blueprint.libraryRecommendations.length },
    { key: 'commands', label: 'Install Commands', icon: Terminal },
    { key: 'typescript', label: 'TypeScript Interfaces', icon: FileCode },
    { key: 'checklist', label: 'Checklist', icon: CheckSquare, badge: blueprint.implementationChecklist.length },
    { key: 'prompt', label: 'Master AI Prompt', icon: Sparkles },
    { key: 'export', label: 'Exports', icon: Download },
  ];

  const handleCopyTs = async () => {
    const success = await copyTextToClipboard(blueprint.typescriptOutline);
    if (success) {
      setCopiedTs(true);
      setTimeout(() => setCopiedTs(false), 2000);
    }
  };

  const handleCopyColor = async (hex: string) => {
    const success = await copyTextToClipboard(hex);
    if (success) {
      setCopiedColor(hex);
      setTimeout(() => setCopiedColor(null), 1500);
    }
  };

  const toggleChecklist = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Summary & Reset Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 shadow-md">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[11px] font-mono font-medium">
              Verified Specification
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Type: <strong className="text-zinc-200 capitalize font-sans">{analysis.pageType}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-mono">
              {analysis.components.length} components detected
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-zinc-100 leading-snug">
            {analysis.summary}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClear}
          aria-label="Analyze new screenshot and reset current results"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-750 rounded-md border border-zinc-700 transition-colors self-start md:self-auto shrink-0 shadow-sm focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>New Screenshot</span>
        </button>
      </div>

      {/* Reference Screenshot Dock (Collapsible) */}
      {screenshotPreviewUrl && (
        <div className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-3.5 transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
              <h3 className="text-xs font-medium text-zinc-300">
                Visual Reference: <span className="font-mono text-zinc-400">{screenshotFile?.name || 'Uploaded screenshot'}</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowScreenshotReference(!showScreenshotReference)}
              aria-expanded={showScreenshotReference}
              aria-label={showScreenshotReference ? 'Hide reference screenshot' : 'Show reference screenshot'}
              className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 focus-visible:ring-1 focus-visible:ring-zinc-400 rounded px-2 py-0.5"
            >
              <span>{showScreenshotReference ? 'Hide' : 'Show'}</span>
              {showScreenshotReference ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {showScreenshotReference && (
            <div className="mt-2.5 max-h-60 overflow-hidden rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshotPreviewUrl}
                alt={`Reference screenshot: ${screenshotFile?.name || 'Visual target'}`}
                className="max-h-56 w-auto object-contain rounded shadow"
              />
            </div>
          )}
        </div>
      )}

      {/* Segmented Navigation Tabbar */}
      <div
        role="tablist"
        aria-label="Blueprint result sections"
        className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-zinc-800 scrollbar-none"
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
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none ${
                isActive
                  ? 'bg-zinc-800 text-white font-medium shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'bg-zinc-900 text-zinc-500'
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
        className="pt-1 focus:outline-none"
      >
        {/* 1. Architecture Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Layout Regions */}
            <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Identified Layout Regions
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.layout.map((region, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 font-medium flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" aria-hidden="true" />
                    <span>{region}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Design System Observations */}
            <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Design System Observations
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Colors with 1-click copy */}
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2">
                  <span className="text-xs font-medium text-zinc-400 block font-mono">
                    Observed Color Palette
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {analysis.design.colors.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCopyColor(c)}
                        title={`Click to copy ${c}`}
                        className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1.5 rounded border border-zinc-800 text-[11px] font-mono text-zinc-300 transition-colors group"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded border border-white/20 shrink-0"
                          style={{ backgroundColor: c }}
                          aria-hidden="true"
                        />
                        <span>{copiedColor === c ? 'Copied!' : c}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2">
                  <span className="text-xs font-medium text-zinc-400 block font-mono">
                    Typography Hierarchy
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {analysis.design.typography.map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-zinc-500 font-mono" aria-hidden="true">•</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Spacing */}
                <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800 space-y-2">
                  <span className="text-xs font-medium text-zinc-400 block font-mono">
                    Spacing & Densities
                  </span>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {analysis.design.spacing.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-zinc-500 font-mono" aria-hidden="true">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Inferred Interactions & Assumptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Inferred Interactive States
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.interactions.map((inter, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-200">{inter.element}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {inter.status}
                        </span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{inter.behavior}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                    Architectural Assumptions
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-zinc-300">
                  {analysis.assumptions.map((assump, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 flex items-start gap-2.5 leading-relaxed"
                    >
                      <Info className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" aria-hidden="true" />
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
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Package Setup & Verified CLI Commands
                </h3>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 space-y-2 font-mono text-xs text-emerald-400/90 overflow-x-auto shadow-inner">
              {blueprint.installationCommands.map((cmd, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-zinc-600 select-none">$</span>
                  <span>{cmd}</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-500 font-mono">
              Execute these in your target Next.js repository root before writing code.
            </p>
          </div>
        )}

        {/* 5. TypeScript Tab */}
        {activeTab === 'typescript' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Synthesized TypeScript Contracts & Props
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCopyTs}
                aria-label="Copy proposed TypeScript interfaces"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
              >
                {copiedTs ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Interfaces</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-5 font-mono text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-inner">
              {blueprint.typescriptOutline}
            </div>
          </div>
        )}

        {/* 6. Interactive Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
                  Sequential Implementation Checklist
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {Object.values(checkedItems).filter(Boolean).length} / {blueprint.implementationChecklist.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {blueprint.implementationChecklist.map((step, idx) => {
                const isChecked = Boolean(checkedItems[idx]);
                return (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer select-none text-xs ${
                      isChecked
                        ? 'border-emerald-900/40 bg-emerald-950/20 text-zinc-400 line-through'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecklist(idx)}
                      className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 shrink-0"
                    />
                    <span className="leading-relaxed">{step}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Master AI Prompt Tab */}
        {activeTab === 'prompt' && <PromptPreview promptText={blueprint.codingAssistantPrompt} />}

        {/* 8. Export Tab */}
        {activeTab === 'export' && (
          <ExportActions analysis={analysis} blueprint={blueprint} />
        )}
      </div>
    </div>
  );
}
