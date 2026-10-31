'use client';

import React, { useState } from 'react';
import { AnalysisResponse } from '../types/analysis';
import { Specification } from '../types/specification';
import { ComponentTree } from './ComponentTree';
import { LibraryRecommendations } from './LibraryRecommendations';
import { PromptPreview } from './PromptPreview';
import { ExportActions } from './ExportActions';
import {
  Layers,
  Sparkles,
  Package,
  FileCode,
  CheckSquare,
  LayoutDashboard,
  Palette,
  Workflow,
  HelpCircle,
} from 'lucide-react';

export interface ResultsDashboardProps {
  analysis: AnalysisResponse;
  specification: Specification;
  onClear?: () => void;
}

type TabType = 'overview' | 'tree' | 'libraries' | 'prompt' | 'typescript' | 'checklist';

export function ResultsDashboard({ analysis, specification, onClear }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {analysis.pageType}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Gemma 4 Vision Blueprint
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {analysis.summary}
            </h2>
          </div>
        </div>

        {/* Layout Regions Pill List */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 font-medium">Layout Regions:</span>
          {analysis.layout.map((region, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono"
            >
              {region}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'tree'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Component Tree ({analysis.components.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('libraries')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'libraries'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Libraries &amp; Commands</span>
        </button>

        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'prompt'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>AI Implementation Prompt</span>
        </button>

        <button
          onClick={() => setActiveTab('typescript')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'typescript'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>TypeScript Outline</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 -mb-px ${
            activeTab === 'checklist'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Checklist</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Design Tokens */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>Design System Observations</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Color Palette:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {analysis.design.colors.map((color, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {color}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Typography:</span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                  {analysis.design.typography.map((font, i) => (
                    <li key={i}>{font}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">Spacing &amp; Surfaces:</span>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                  {analysis.design.spacing.map((sp, i) => (
                    <li key={i}>{sp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interactions & Assumptions */}
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Workflow className="w-4 h-4 text-blue-500" />
                <span>Interactions ({analysis.interactions.length})</span>
              </div>

              <div className="space-y-2">
                {analysis.interactions.map((it, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 dark:text-slate-200">{it.element}</strong>
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {it.status}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">{it.behavior}</p>
                  </div>
                ))}
              </div>

              {analysis.assumptions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Technical Assumptions:</span>
                  </div>
                  <ul className="text-xs text-slate-500 space-y-0.5 list-disc list-inside">
                    {analysis.assumptions.map((ass, i) => (
                      <li key={i}>{ass}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <ExportActions analysis={analysis} specification={specification} />
        </div>
      )}

      {activeTab === 'tree' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <ComponentTree tree={specification.componentTree} />
        </div>
      )}

      {activeTab === 'libraries' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <LibraryRecommendations
            recommendations={specification.libraryRecommendations}
            installationCommands={specification.installationCommands}
          />
        </div>
      )}

      {activeTab === 'prompt' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <PromptPreview promptText={specification.codingAssistantPrompt} onClear={onClear} />
        </div>
      )}

      {activeTab === 'typescript' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <FileCode className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Generated TypeScript Models &amp; Props
            </h3>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
            {specification.typescriptOutline}
          </pre>
        </div>
      )}

      {activeTab === 'checklist' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <CheckSquare className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Frontend Implementation Checklist
            </h3>
          </div>
          <div className="space-y-2">
            {specification.implementationChecklist.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs"
              >
                <input
                  type="checkbox"
                  id={`chk-${idx}`}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor={`chk-${idx}`} className="text-slate-700 dark:text-slate-300 font-medium">
                  {step}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

