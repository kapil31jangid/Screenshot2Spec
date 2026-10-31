'use client';

import React, { useState } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { Copy, Check, Download, Terminal, FileText } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            15-Section Master Coding Implementation Prompt
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy AI coding implementation prompt to clipboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-950 bg-white hover:bg-zinc-200 rounded-md transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-950" aria-hidden="true" />
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Download .md</span>
          </button>
        </div>
      </div>

      <div className="relative border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden shadow-inner">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-zinc-400" />
            <span>master-implementation-prompt.md</span>
          </div>
          <span>Ready for Antigravity, Cursor, Claude Code, or Copilot</span>
        </div>

        <pre
          tabIndex={0}
          aria-label="Generated AI coding prompt content"
          className="p-4 sm:p-6 text-xs font-mono text-zinc-300 whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[560px] focus:outline-none"
        >
          {promptText}
        </pre>
      </div>
    </div>
  );
}
