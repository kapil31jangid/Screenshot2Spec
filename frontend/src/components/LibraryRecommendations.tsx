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
    <div className="space-y-5">
      {/* Quick Install Terminal Box */}
      {installationCommands.length > 0 && (
        <div className="border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden shadow-inner">
          <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
              <span className="text-xs font-mono text-zinc-300">
                Verified Dependency Commands
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCommand(allInstallCommandsText)}
              aria-label="Copy all installation commands"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                  <span className="text-emerald-400 font-mono">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  <span className="font-mono">Copy All</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 font-mono text-xs text-emerald-400/90 space-y-1.5 overflow-x-auto">
            {installationCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <span className="text-zinc-600 select-none">$</span>
                <span className="flex-1">{cmd}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(cmd, idx)}
                  aria-label={`Copy command: ${cmd}`}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-zinc-200 transition-opacity focus-visible:opacity-100 rounded"
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
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-zinc-400" aria-hidden="true" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
              Curated Ecosystem Matches
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {recommendations.length} Approved Packages
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div
              key={rec.libraryId}
              className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-zinc-100">
                    {rec.packageName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {rec.libraryName}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {rec.purpose}
                </p>

                {rec.reason && (
                  <p className="text-[11px] text-zinc-500 italic bg-zinc-950 p-2 rounded border border-zinc-900 font-mono">
                    Why: &ldquo;{rec.reason}&rdquo;
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                <code className="text-[11px] text-zinc-400 truncate max-w-[240px]">
                  {rec.installationCommand}
                </code>
                {rec.docsUrl && (
                  <a
                    href={rec.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors"
                  >
                    <span>Docs</span>
                    <ExternalLink className="w-3 h-3" />
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
