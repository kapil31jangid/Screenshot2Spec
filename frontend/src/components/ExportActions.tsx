'use client';

import React, { useState } from 'react';
import { ValidatedAnalysis } from '@/types/analysis';
import { DeveloperBlueprint } from '@/types/specification';
import {
  exportImplementationPromptMarkdown,
  exportFrontendSpecificationMarkdown,
  exportDependenciesMarkdown,
  exportComponentTreeJson,
  exportTypeScriptInterfaces,
} from '@/lib/exporters';
import { Download, FileJson, FileCode, FileText, Check, PackageCheck } from 'lucide-react';

interface ExportActionsProps {
  analysis: ValidatedAnalysis;
  blueprint: DeveloperBlueprint;
}

export default function ExportActions({ analysis, blueprint }: ExportActionsProps) {
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);

  const triggerDownload = (filename: string, content: string, mime: string, key: string) => {
    try {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadedKey(key);
      setTimeout(() => setDownloadedKey(null), 2000);
    } catch (err) {
      console.error('File export download failed:', err);
    }
  };

  const handleDownloadPrompt = () => {
    triggerDownload(
      'implementation-prompt.md',
      exportImplementationPromptMarkdown(blueprint),
      'text/markdown;charset=utf-8',
      'prompt'
    );
  };

  const handleDownloadSpec = () => {
    triggerDownload(
      'frontend-specification.md',
      exportFrontendSpecificationMarkdown(analysis),
      'text/markdown;charset=utf-8',
      'spec'
    );
  };

  const handleDownloadTypes = () => {
    triggerDownload(
      'component-types.ts',
      exportTypeScriptInterfaces(blueprint.typescriptOutline),
      'text/plain;charset=utf-8',
      'types'
    );
  };

  const handleDownloadDependencies = () => {
    triggerDownload(
      'dependencies.md',
      exportDependenciesMarkdown(blueprint, analysis.pageType),
      'text/markdown;charset=utf-8',
      'deps'
    );
  };

  const handleDownloadTreeJson = () => {
    triggerDownload(
      'component-tree.json',
      exportComponentTreeJson(blueprint.componentTree),
      'application/json',
      'tree'
    );
  };

  const exportItems = [
    {
      key: 'prompt',
      title: 'implementation-prompt.md',
      desc: '15-section master AI coding prompt ready for Antigravity or Cursor',
      icon: FileText,
      handler: handleDownloadPrompt,
    },
    {
      key: 'spec',
      title: 'frontend-specification.md',
      desc: 'Complete architectural specification with design tokens & regions',
      icon: FileCode,
      handler: handleDownloadSpec,
    },
    {
      key: 'types',
      title: 'component-types.ts',
      desc: 'Synthesized TypeScript props and data model interfaces',
      icon: FileCode,
      handler: handleDownloadTypes,
    },
    {
      key: 'deps',
      title: 'dependencies.md',
      desc: 'Package installation plan with catalog rationale and docs links',
      icon: PackageCheck,
      handler: handleDownloadDependencies,
    },
    {
      key: 'tree',
      title: 'component-tree.json',
      desc: 'Machine-readable, normalized component hierarchy graph',
      icon: FileJson,
      handler: handleDownloadTreeJson,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Exportable Developer Artifacts
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          5 One-Click Downloads
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exportItems.map((item) => {
          const Icon = item.icon;
          const isDone = downloadedKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={item.handler}
              aria-label={`Download ${item.title}`}
              className="text-left border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900 hover:border-zinc-700 p-4 rounded-xl transition-all flex flex-col justify-between group focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1 font-mono">
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                        <span className="text-emerald-400 font-medium">Exported</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Download</span>
                      </>
                    )}
                  </span>
                </div>
                <h4 className="font-mono text-xs font-semibold text-zinc-100 truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
