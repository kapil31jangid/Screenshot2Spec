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
        <div className="border border-[#CBD6C9] bg-[#1C2B1B] rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#14370D] border-b border-[#CBD6C9]/40">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#FEF3B5]" aria-hidden="true" />
              <span className="text-xs font-mono font-medium text-[#FEF3B5]">
                Verified Dependency Installation Commands
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCommand(allInstallCommandsText)}
              aria-label="Copy all installation commands"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#1C2B1B] hover:text-[#14370D] bg-white hover:bg-[#F4F6F2] rounded-lg border border-[#CBD6C9] transition-colors focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none shadow-xs"
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#14370D]" aria-hidden="true" />
                  <span className="text-[#14370D] font-medium">Copied Commands</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                  <span>Copy All</span>
                </>
              )}
            </button>
          </div>
          <div className="p-4 font-mono text-xs sm:text-sm text-[#FEF3B5] space-y-1.5 overflow-x-auto">
            {installationCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center gap-2 group">
                <span className="text-[#738E6D] select-none">$</span>
                <span className="flex-1">{cmd}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(cmd, idx)}
                  aria-label={`Copy command: ${cmd}`}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#738E6D] hover:text-[#FEF3B5] transition-opacity focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-[#FEF3B5] focus:outline-none rounded"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-[#FEF3B5]" aria-hidden="true" />
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
        <div className="flex items-center justify-between pb-2 border-b border-[#CBD6C9]/60">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#14370D]" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-[#14370D]">
              Curated Frontend Recommendations
            </h3>
          </div>
          <span className="text-xs text-[#52624F]">
            {recommendations.length} Recommended
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((lib, idx) => (
            <div
              key={idx}
              className="border border-[#CBD6C9] bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#738E6D] transition-all group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-[#14370D] text-sm truncate">
                      {lib.libraryName}
                    </span>
                    <span className="font-mono text-[11px] text-[#52624F] bg-[#FAF9F1] px-2 py-0.5 rounded-md border border-[#CBD6C9]">
                      {lib.packageName}
                    </span>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      lib.isRequired
                        ? 'bg-[#FEF3B5] text-[#14370D] border-[#E5CE82]'
                        : 'bg-[#E9EFE8] text-[#52624F] border-[#CBD6C9]'
                    }`}
                  >
                    <ShieldCheck className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>{lib.isRequired ? 'Required' : 'Optional'}</span>
                  </span>
                </div>

                <p className="text-xs text-[#1C2B1B] mb-2 leading-relaxed">
                  {lib.purpose}
                </p>

                <div className="space-y-1.5 text-[11px] text-[#52624F] bg-[#FAF9F1] p-2.5 rounded-xl border border-[#CBD6C9]/80 mb-3">
                  <p>
                    <strong className="text-[#1C2B1B] font-medium">Mapped Component:</strong>{' '}
                    <code className="text-[#14370D] font-mono font-semibold">{lib.relevantComponent}</code>
                  </p>
                  <p>
                    <strong className="text-[#1C2B1B] font-medium">Reason:</strong> {lib.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#CBD6C9]/60 mt-1">
                <span className="text-[11px] font-mono text-[#52624F] truncate max-w-[200px]">
                  {lib.installationCommand}
                </span>

                {lib.docsUrl && (
                  <a
                    href={lib.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read ${lib.libraryName} documentation (opens in new tab)`}
                    className="inline-flex items-center gap-1 text-xs text-[#14370D] hover:text-[#0E2709] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none rounded"
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
