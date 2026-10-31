'use client';

import React from 'react';
import { Specification } from '../types/specification';
import { AnalysisResponse } from '../types/analysis';
import {
  exportComponentTreeJson,
  exportDependencyPlanMarkdown,
  exportPromptMarkdown,
  exportSpecificationMarkdown,
  exportTypeScriptInterfaces,
} from '../lib/exporters';
import { Download, FileCode, FileText, FileSpreadsheet, Package } from 'lucide-react';

export interface ExportActionsProps {
  analysis: AnalysisResponse;
  specification: Specification;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function ExportActions({ analysis, specification }: ExportActionsProps) {
  const handleExportPrompt = () => {
    const md = exportPromptMarkdown(specification);
    downloadFile(md, 'AI_CODING_PROMPT.md', 'text/markdown');
  };

  const handleExportSpec = () => {
    const md = exportSpecificationMarkdown(analysis, specification);
    downloadFile(md, `${analysis.pageType.toUpperCase()}_SPECIFICATION.md`, 'text/markdown');
  };

  const handleExportDepPlan = () => {
    const md = exportDependencyPlanMarkdown(specification);
    downloadFile(md, 'DEPENDENCY_PLAN.md', 'text/markdown');
  };

  const handleExportTreeJson = () => {
    const json = exportComponentTreeJson(specification);
    downloadFile(json, 'component-tree.json', 'application/json');
  };

  const handleExportTypeScript = () => {
    const ts = exportTypeScriptInterfaces(specification);
    downloadFile(ts, 'interfaces.ts', 'text/typescript');
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
        <Download className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          Export Developer Artifacts
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={handleExportPrompt}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
        >
          <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">AI Coding Prompt</div>
            <div className="text-[11px] text-slate-500">.md format</div>
          </div>
        </button>

        <button
          onClick={handleExportSpec}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
        >
          <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Full Technical Spec</div>
            <div className="text-[11px] text-slate-500">.md format</div>
          </div>
        </button>

        <button
          onClick={handleExportDepPlan}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
        >
          <div className="p-2 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Dependency Plan</div>
            <div className="text-[11px] text-slate-500">.md format</div>
          </div>
        </button>

        <button
          onClick={handleExportTreeJson}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
        >
          <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">Component Hierarchy</div>
            <div className="text-[11px] text-slate-500">.json format</div>
          </div>
        </button>

        <button
          onClick={handleExportTypeScript}
          className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition group"
        >
          <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition">
            <FileCode className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-white">TypeScript Interfaces</div>
            <div className="text-[11px] text-slate-500">.ts format</div>
          </div>
        </button>
      </div>
    </div>
  );
}

