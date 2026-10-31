'use client';

import React from 'react';
import { Sliders, CheckCircle2, AlertCircle, FileCode2, Palette, MessageSquare } from 'lucide-react';

interface ConfigurationPanelProps {
  framework: string;
  onFrameworkChange: (val: string) => void;
  styling: string;
  onStylingChange: (val: string) => void;
  instructions: string;
  onInstructionsChange: (val: string) => void;
  disabled?: boolean;
}

export default function ConfigurationPanel({
  framework,
  onFrameworkChange,
  styling,
  onStylingChange,
  instructions,
  onInstructionsChange,
  disabled = false,
}: ConfigurationPanelProps) {
  const frameworks = [
    {
      id: 'nextjs-ts',
      label: 'React + TypeScript (Next.js App Router)',
      supported: true,
      badge: 'Supported MVP',
    },
    {
      id: 'vite-react',
      label: 'React + TypeScript (Vite SPA)',
      supported: false,
      badge: 'Coming Soon',
    },
    {
      id: 'vue-ts',
      label: 'Vue 3 + TypeScript (Nuxt)',
      supported: false,
      badge: 'Coming Soon',
    },
  ];

  const stylingOptions = [
    {
      id: 'tailwind',
      label: 'Tailwind CSS',
      supported: true,
      badge: 'Default',
    },
    {
      id: 'css-modules',
      label: 'CSS Modules',
      supported: false,
      badge: 'Coming Soon',
    },
    {
      id: 'styled-components',
      label: 'Styled Components',
      supported: false,
      badge: 'Coming Soon',
    },
  ];

  return (
    <div className="border border-slate-800 bg-slate-900/40 rounded-2xl p-5 sm:p-6 space-y-6">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80">
        <Sliders className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-slate-200">
          Blueprint Configuration
        </h3>
        <span className="text-xs text-slate-500 ml-auto">Target Stack</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Framework Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Frontend Framework</span>
          </label>
          <div className="space-y-2">
            {frameworks.map((f) => (
              <button
                key={f.id}
                type="button"
                disabled={!f.supported || disabled}
                onClick={() => f.supported && onFrameworkChange(f.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  framework === f.id
                    ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200 ring-1 ring-indigo-500/30 font-medium'
                    : f.supported
                    ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    : 'border-slate-800/40 bg-slate-950/20 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    f.supported
                      ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                  }`}
                >
                  {f.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Styling Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-300">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Styling Solution</span>
          </label>
          <div className="space-y-2">
            {stylingOptions.map((s) => (
              <button
                key={s.id}
                type="button"
                disabled={!s.supported || disabled}
                onClick={() => s.supported && onStylingChange(s.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  styling === s.id
                    ? 'border-indigo-500 bg-indigo-950/30 text-indigo-200 ring-1 ring-indigo-500/30 font-medium'
                    : s.supported
                    ? 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    : 'border-slate-800/40 bg-slate-950/20 text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    s.supported
                      ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-800/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/40'
                  }`}
                >
                  {s.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Optional Development Instructions */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <label
            htmlFor="instructions-input"
            className="flex items-center gap-2 text-xs font-medium text-slate-300"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Optional Implementation Notes / Constraints</span>
          </label>
          <span className="text-[11px] text-slate-500">
            {instructions.length} / 500 characters
          </span>
        </div>
        <textarea
          id="instructions-input"
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value.slice(0, 500))}
          placeholder="E.g., Emphasize mobile-first drawer navigation, use dark slate color palette, assume mock data for table records, prioritize accessibility tags..."
          rows={3}
          disabled={disabled}
          className="w-full text-xs sm:text-sm bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none disabled:opacity-50"
        />
        <p className="text-[11px] text-slate-500">
          These instructions are passed directly into the Gemma 4 multimodal reasoning prompt to tailor your blueprint.
        </p>
      </div>
    </div>
  );
}
