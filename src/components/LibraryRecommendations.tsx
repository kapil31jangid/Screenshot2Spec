'use client';

import React, { useState } from 'react';
import { LibraryRecommendation, InstallationInstructions } from '../types/specification';
import { Package, ExternalLink, Terminal, Copy, Check } from 'lucide-react';

export interface LibraryRecommendationsProps {
  recommendations: LibraryRecommendation[];
  installationCommands: InstallationInstructions;
}

export function LibraryRecommendations({
  recommendations,
  installationCommands,
}: LibraryRecommendationsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Installation Commands Block */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Dependency Installation Plan ({installationCommands.packageManager})</span>
          </div>
          <span className="text-xs text-slate-400">Verified Catalog Only</span>
        </div>

        <div className="space-y-2">
          {installationCommands.commands.map((cmd, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 bg-black/40 px-3 py-2 rounded-lg font-mono text-xs text-slate-200 group"
            >
              <span className="overflow-x-auto whitespace-pre">{cmd}</span>
              <button
                onClick={() => handleCopyCommand(cmd, idx)}
                className="shrink-0 text-slate-400 hover:text-white p-1 rounded transition"
                title="Copy command"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>

        {installationCommands.notes && (
          <ul className="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400 space-y-1">
            {installationCommands.notes.map((note, i) => (
              <li key={i}>• {note}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Recommended Packages Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Package className="w-4 h-4 text-purple-500" />
          <span>Curated Libraries ({recommendations.length} Selected)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((lib) => (
            <div
              key={lib.libraryId}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {lib.name}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {lib.packageName}
                    </span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 font-medium">
                    {lib.category}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                  {lib.reason}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="text-slate-500 dark:text-slate-400">
                  Used by: <strong className="text-slate-700 dark:text-slate-300">{lib.usedByComponents.join(', ')}</strong>
                </div>
                <a
                  href={lib.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                >
                  <span>Docs</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
