'use client';

import React, { useState } from 'react';
import { LibraryRecommendation } from '@/types/specification';
import { copyTextToClipboard } from '@/lib/clipboard';
import { Package, ExternalLink, Terminal, Copy, Check, ShieldCheck } from 'lucide-react';

interface LibraryRecommendationsProps {
  recommendations: LibraryRecommendation[];
  installationCommands: string[];
}

export default function LibraryRecommendations({
  recommendations,
  installationCommands,
}: LibraryRecommendationsProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyCommand = async (cmd: string, index?: number) => {
    const success = await copyTextToClipboard(cmd);
    if (!success) return;

    if (typeof index === 'number') {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const allInstallCommandsText = installationCommands.join('\n');

  return (
    <div className="space-y-6">
      {/* Quick Install Terminal Box */}
      {installationCommands.length > 0 && (
        <div className="border border-slate-800 bg-slate-950/80 rounded-2xl overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span className="text-xs font-mono font-medium text-slate-300">
                Verified Dependency Installation Commands
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCommand(allInstallCommandsText)}
              aria-label="Copy all installation commands"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400">Copied Commands</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 font-mono text-xs sm:text-sm text-emerald-300/90 space-y-1.5 overflow-x-auto">
            {installationCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <span className="text-slate-600 select-none">$</span>
                <span className="flex-1">{cmd}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(cmd, idx)}
                  aria-label={`Copy command: ${cmd}`}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-200 transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none rounded"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Library Catalog Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-400" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-slate-200">
              Curated Frontend Recommendations
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {recommendations.length} Recommended
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((lib, idx) => (
            <div
              key={idx}
              className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-slate-200 text-sm truncate">
                      {lib.libraryName}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800">
                      {lib.packageName}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      lib.isRequired
                        ? 'bg-indigo-950/50 text-indigo-300 border-indigo-800/40'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/40'
                    }`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>{lib.isRequired ? 'Required' : 'Optional'}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                  {lib.purpose}
                </p>

                <div className="space-y-1.5 text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-900 mb-3">
                  <p>
                    <strong className="text-slate-300 font-medium">Mapped Component:</strong>{' '}
                    <code className="text-indigo-300 font-mono">{lib.relevantComponent}</code>
                  </p>
                  <p>
                    <strong className="text-slate-300 font-medium">Reason:</strong> {lib.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
                <span className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                  {lib.installationCommand}
                </span>

                {lib.docsUrl && (
                  <a
                    href={lib.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read ${lib.libraryName} documentation (opens in new tab)`}
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus:outline-none rounded"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
