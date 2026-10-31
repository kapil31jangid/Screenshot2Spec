'use client';

import React, { useState } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { Copy, Check, Download, Sparkles } from 'lucide-react';

interface PromptPreviewProps {
  promptText: string;
}

export default function PromptPreview({ promptText }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyTextToClipboard(promptText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([promptText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'screenshot2spec-implementation-prompt.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#CBD6C9]/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#14370D]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[#14370D]">
            Implementation-Ready AI Coding Prompt
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy AI coding implementation prompt to clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#14370D] hover:bg-[#0E2709] rounded-lg shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Copy Master Prompt</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            aria-label="Download master prompt as Markdown file"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C2B1B] hover:text-[#14370D] bg-white hover:bg-[#F4F6F2] rounded-lg border border-[#CBD6C9] transition-colors focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <div className="relative border border-[#CBD6C9] bg-[#1C2B1B] rounded-2xl overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-[#14370D] border-b border-[#CBD6C9]/40 text-[11px] text-[#FEF3B5] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" aria-hidden="true" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" aria-hidden="true" />
            <span className="ml-2 text-[#FEF3B5] font-semibold">master-implementation-prompt.md</span>
          </div>
          <span className="text-[#FEF3B5]/80">Paste into Google Antigravity, Cursor, or Codex</span>
        </div>

        <pre
          tabIndex={0}
          aria-label="Generated AI coding prompt content"
          className="p-4 sm:p-6 text-xs sm:text-sm font-mono text-[#FAF9F1] whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[540px] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#FEF3B5]"
        >
          {promptText}
        </pre>
      </div>
    </div>
  );
}
