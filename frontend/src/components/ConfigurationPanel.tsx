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
    <div className="border border-[#CBD6C9] bg-white rounded-2xl p-5 sm:p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-[#CBD6C9]/60">
        <Sliders className="w-4 h-4 text-[#14370D]" />
        <h3 className="text-sm font-semibold text-[#14370D]">
          Blueprint Configuration
        </h3>
        <span className="text-xs text-[#52624F] ml-auto">Target Stack</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Framework Selector */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-medium text-[#1C2B1B]">
            <FileCode2 className="w-3.5 h-3.5 text-[#738E6D]" />
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
                    ? 'border-[#14370D] bg-[#FEF3B5]/40 text-[#14370D] ring-1 ring-[#14370D]/30 font-medium shadow-xs'
                    : f.supported
                    ? 'border-[#CBD6C9] bg-[#FAF9F1] text-[#1C2B1B] hover:border-[#738E6D] hover:bg-white'
                    : 'border-[#E5EAE3] bg-[#F5F6F3] text-[#52624F]/50 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    f.supported
                      ? 'bg-[#E9EFE8] text-[#14370D] border border-[#CBD6C9]'
                      : 'bg-[#F5F6F3] text-[#52624F]/60 border border-[#E5EAE3]'
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
          <label className="flex items-center gap-2 text-xs font-medium text-[#1C2B1B]">
            <Palette className="w-3.5 h-3.5 text-[#738E6D]" />
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
                    ? 'border-[#14370D] bg-[#FEF3B5]/40 text-[#14370D] ring-1 ring-[#14370D]/30 font-medium shadow-xs'
                    : s.supported
                    ? 'border-[#CBD6C9] bg-[#FAF9F1] text-[#1C2B1B] hover:border-[#738E6D] hover:bg-white'
                    : 'border-[#E5EAE3] bg-[#F5F6F3] text-[#52624F]/50 cursor-not-allowed opacity-60'
                }`}
              >
                <span>{s.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    s.supported
                      ? 'bg-[#E9EFE8] text-[#14370D] border border-[#CBD6C9]'
                      : 'bg-[#F5F6F3] text-[#52624F]/60 border border-[#E5EAE3]'
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
      <div className="space-y-2 pt-2 border-t border-[#CBD6C9]/60">
        <div className="flex items-center justify-between">
          <label
            htmlFor="instructions-input"
            className="flex items-center gap-2 text-xs font-medium text-[#1C2B1B]"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#738E6D]" />
            <span>Optional Implementation Notes / Constraints</span>
          </label>
          <span className="text-[11px] text-[#52624F]">
            {instructions.length} / 500 characters
          </span>
        </div>
        <textarea
          id="instructions-input"
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value.slice(0, 500))}
          placeholder="E.g., Emphasize mobile-first drawer navigation, use warm light color palette, assume mock data for table records, prioritize accessibility tags..."
          rows={3}
          disabled={disabled}
          className="w-full text-xs sm:text-sm bg-[#FAF9F1] border border-[#CBD6C9] rounded-xl p-3 text-[#1C2B1B] placeholder:text-[#52624F]/60 focus:outline-none focus:ring-1 focus:ring-[#14370D] focus:border-[#14370D] transition-all resize-none disabled:opacity-50"
        />
        <p className="text-[11px] text-[#52624F]">
          These instructions are passed directly into the Gemma 4 multimodal reasoning prompt to tailor your blueprint.
        </p>
      </div>
    </div>
  );
}

