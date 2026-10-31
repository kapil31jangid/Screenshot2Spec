'use client';

import React from 'react';
import { Sliders, Code2, Palette, Terminal, Sparkles } from 'lucide-react';

interface ConfigurationPanelProps {
  framework: string;
  onFrameworkChange: (val: string) => void;
  styling: string;
  onStylingChange: (val: string) => void;
  instructions: string;
  onInstructionsChange: (val: string) => void;
  disabled?: boolean;
}

const PRESET_HINTS = [
  'Use modern dark slate color palette',
  'Mobile-first responsive drawer navigation',
  'Emphasize accessibility (WCAG AA) & ARIA roles',
  'Include realistic mock data records',
];

export default function ConfigurationPanel({
  framework,
  onFrameworkChange,
  styling,
  onStylingChange,
  instructions,
  onInstructionsChange,
  disabled = false,
}: ConfigurationPanelProps) {
  const handleAddPreset = (hint: string) => {
    if (disabled) return;
    if (instructions.includes(hint)) return;
    const updated = instructions.trim()
      ? `${instructions.trim()}, ${hint.toLowerCase()}`
      : hint;
    onInstructionsChange(updated.slice(0, 500));
  };

  return (
    <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-5 space-y-4">
      {/* Target Stack Specification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Target Environment
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/80 text-xs font-mono text-zinc-200">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Next.js 15 (App Router · React 19)</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/80 text-xs font-mono text-zinc-200">
            <Palette className="w-3.5 h-3.5 text-zinc-400" />
            <span>Tailwind CSS</span>
          </div>
        </div>
      </div>

      {/* Optional Prompt Constraints */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="instructions-input"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-300"
          >
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Implementation Constraints / Context (Optional)</span>
          </label>
          <span className="text-[11px] font-mono text-zinc-500">
            {instructions.length} / 500
          </span>
        </div>

        <textarea
          id="instructions-input"
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value.slice(0, 500))}
          placeholder="e.g. Prioritize mobile responsive drawer, use slate background, generate typed mock chart series..."
          rows={2}
          disabled={disabled}
          className="w-full text-xs bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all resize-none disabled:opacity-50 font-mono leading-relaxed"
        />

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mr-1">
            Quick additions:
          </span>
          {PRESET_HINTS.map((hint, i) => (
            <button
              key={i}
              type="button"
              disabled={disabled || instructions.includes(hint)}
              onClick={() => handleAddPreset(hint)}
              className="text-[11px] px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + {hint}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
