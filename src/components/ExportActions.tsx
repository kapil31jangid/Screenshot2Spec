'use client';

import React, { useState } from 'react';
import { ValidatedAnalysis } from '@/types/analysis';
import { DeveloperBlueprint } from '@/types/specification';
import { Download, FileJson, FileCode, FileText, Check, PackageCheck } from 'lucide-react';

interface ExportActionsProps {
  analysis: ValidatedAnalysis;
  blueprint: DeveloperBlueprint;
}

export default function ExportActions({ analysis, blueprint }: ExportActionsProps) {
  const [downloadedKey, setDownloadedKey] = useState<string | null>(null);

  const triggerDownload = (filename: string, content: string, mime: string, key: string) => {
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
  };

  const handleDownloadPrompt = () => {
    triggerDownload(
      'implementation-prompt.md',
      blueprint.codingAssistantPrompt,
      'text/markdown;charset=utf-8',
      'prompt'
    );
  };

  const handleDownloadSpec = () => {
    const markdown = `# Frontend Technical Specification: ${analysis.pageType}

## Executive Summary
${analysis.summary}

## Identified Layout Structure
${analysis.layout.map((l) => `- **${l}**`).join('\n')}

## Component Catalog
${analysis.components
  .map(
    (c) => `### ${c.name} (\`${c.uiType}\`)
- **ID:** \`${c.id}\`
- **Parent ID:** ${c.parentId ? `\`${c.parentId}\`` : 'None (Root)'}
- **Confidence:** ${c.confidence}
- **Purpose:** ${c.purpose}
- **Observed Evidence:** ${c.observedEvidence}
- **Suggested Library:** ${c.suggestedLibraryId || 'None'}
`
  )
  .join('\n')}

## Design System Tokens
- **Colors:** ${analysis.design.colors.join(', ')}
- **Typography Rules:** ${analysis.design.typography.join('; ')}
- **Spacing System:** ${analysis.design.spacing.join('; ')}

## Inferred Behaviors & Assumptions
${analysis.assumptions.map((a) => `- ${a}`).join('\n')}
`;
    triggerDownload(
      'frontend-specification.md',
      markdown,
      'text/markdown;charset=utf-8',
      'spec'
    );
  };

  const handleDownloadTypes = () => {
    triggerDownload(
      'component-types.ts',
      blueprint.typescriptOutline,
      'text/plain;charset=utf-8',
      'types'
    );
  };

  const handleDownloadDependencies = () => {
    const markdown = `# Dependencies Plan: ${analysis.pageType}

## Required Package Installation
\`\`\`bash
${blueprint.installationCommands.join('\n')}
\`\`\`

## Curated Library Catalog Breakdown
${blueprint.libraryRecommendations
  .map(
    (l) => `### ${l.libraryName} (\`${l.packageName}\`)
- **Status:** ${l.isRequired ? 'Required' : 'Optional'}
- **Relevant Component:** \`${l.relevantComponent}\`
- **Purpose:** ${l.purpose}
- **Selection Rationale:** ${l.reason}
- **Documentation:** ${l.docsUrl}
`
  )
  .join('\n')}
`;
    triggerDownload(
      'dependencies.md',
      markdown,
      'text/markdown;charset=utf-8',
      'deps'
    );
  };

  const handleDownloadTreeJson = () => {
    const jsonStr = JSON.stringify(blueprint.componentTree, null, 2);
    triggerDownload('component-tree.json', jsonStr, 'application/json', 'tree');
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
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Developer Blueprint Artifacts
          </h4>
        </div>
        <span className="text-xs text-slate-500">
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
              className="text-left border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700/80 p-4 rounded-xl transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-500 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                    {isDone ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Downloaded</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Export</span>
                      </>
                    )}
                  </span>
                </div>
                <h5 className="font-mono text-xs font-semibold text-slate-200 truncate">
                  {item.title}
                </h5>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
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
