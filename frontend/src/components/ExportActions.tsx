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
      desc: 'Master coding agent prompt with full requirements',
      icon: FileText,
      handler: handleDownloadPrompt,
    },
    {
      key: 'spec',
      title: 'frontend-specification.md',
      desc: 'Comprehensive Markdown architecture specification',
      icon: FileCode,
      handler: handleDownloadSpec,
    },
    {
      key: 'types',
      title: 'component-types.ts',
      desc: 'Generated TypeScript interfaces & prop types',
      icon: FileCode,
      handler: handleDownloadTypes,
    },
    {
      key: 'deps',
      title: 'dependencies.md',
      desc: 'Package installation commands & catalog notes',
      icon: PackageCheck,
      handler: handleDownloadDependencies,
    },
    {
      key: 'tree',
      title: 'component-tree.json',
      desc: 'Hierarchical JSON schema of detected UI nodes',
      icon: FileJson,
      handler: handleDownloadTreeJson,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#CBD6C9]/60">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-[#14370D]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[#14370D]">
            Developer Blueprint Artifacts
          </h3>
        </div>
        <span className="text-xs text-[#52624F]">
          5 Exportable Files
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
              className="text-left border border-[#CBD6C9] bg-white hover:bg-[#F4F6F2] hover:border-[#738E6D] p-4 rounded-xl transition-all flex flex-col justify-between group focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3B5] border border-[#E5CE82] flex items-center justify-center text-[#14370D] group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <span className="text-xs text-[#52624F] group-hover:text-[#14370D] transition-colors flex items-center gap-1">
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#14370D]" aria-hidden="true" />
                        <span className="text-[#14370D] font-medium">Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                        <span>Export</span>
                      </>
                    )}
                  </span>
                </div>
                <h4 className="font-mono text-xs font-semibold text-[#14370D] truncate">
                  {item.title}
                </h4>
                <p className="text-[11px] text-[#52624F] mt-1 leading-normal">
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
