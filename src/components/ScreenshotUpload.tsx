'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export interface ScreenshotUploadProps {
  onAnalyze: (file: File, framework: string, styling: string, instructions?: string) => void;
  isLoading: boolean;
  onUseMock?: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export function ScreenshotUpload({ onAnalyze, isLoading, onUseMock }: ScreenshotUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [framework, setFramework] = useState<string>('Next.js / React (App Router)');
  const [styling, setStyling] = useState<string>('Tailwind CSS');
  const [instructions, setInstructions] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setErrorMsg(null);
    if (!SUPPORTED_TYPES.includes(file.type)) {
      setErrorMsg('Unsupported format. Please upload a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg(`File exceeds 5 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please select a screenshot first.');
      return;
    }
    onAnalyze(selectedFile, framework, styling, instructions);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !selectedFile && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
            : selectedFile
            ? 'border-emerald-500/50 bg-slate-50/50 dark:bg-slate-900/50'
            : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />

        {selectedFile && previewUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group max-h-72 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Screenshot Preview" className="max-h-72 object-contain" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={isLoading}
                className="absolute top-2 right-2 bg-slate-900/80 hover:bg-red-600 text-white p-1.5 rounded-full shadow transition"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-slate-900 dark:text-white">{selectedFile.name}</span>
              <span>({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-6">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-full">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-base font-medium text-slate-900 dark:text-white">
                Click to upload screenshot, or drag and drop
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Supports PNG, JPEG, WebP (up to 5 MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Target Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Target Framework
          </label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Next.js / React (App Router)">Next.js App Router (React + TS)</option>
            <option disabled value="Vue">Vue 3 (Coming Soon)</option>
            <option disabled value="Svelte">SvelteKit (Coming Soon)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Styling System
          </label>
          <select
            value={styling}
            onChange={(e) => setStyling(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="Tailwind CSS">Tailwind CSS (Recommended)</option>
            <option disabled value="CSS Modules">CSS Modules (Coming Soon)</option>
          </select>
        </div>
      </div>

      {/* Optional Instructions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Additional Guidance / Constraints <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          rows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          disabled={isLoading}
          maxLength={2000}
          placeholder="e.g. Ensure dark mode support; use slate-900 backgrounds; prefer Lucide icons..."
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
        />
        <div className="text-right text-xs text-slate-400 mt-0.5">
          {instructions.length} / 2000 chars
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {onUseMock && (
          <button
            type="button"
            onClick={onUseMock}
            disabled={isLoading}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 underline decoration-dotted transition"
          >
            Try with Sample Analytics Dashboard Mock
          </button>
        )}

        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-white shadow transition-all ${
            !selectedFile || isLoading
              ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-98'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing with Gemma 4...
            </span>
          ) : (
            'Analyze Screenshot'
          )}
        </button>
      </div>
    </form>
  );
}
