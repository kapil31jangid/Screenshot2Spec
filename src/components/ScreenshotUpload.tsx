'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, AlertCircle, FileText, RefreshCw } from 'lucide-react';

interface ScreenshotUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error: string | null;
  onError: (err: string | null) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB limit
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export default function ScreenshotUpload({
  onFileSelect,
  selectedFile,
  error,
  onError,
  disabled = false,
}: ScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to validate selected file
  const validateAndSetFile = useCallback(
    (file: File) => {
      onError(null);

      // Check format
      const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);
      const isAllowedExt = ALLOWED_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );

      if (!isAllowedMime && !isAllowedExt) {
        onError(
          `Unsupported file format (${file.type || 'unknown'}). Please upload a PNG, JPEG, or WebP image.`
        );
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
        onError(
          `Image is too large (${sizeMb} MB). The maximum allowed size is 5 MB.`
        );
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });

      onFileSelect(file);
    },
    [onError, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileSelect(null);
    onError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTriggerUpload = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Upload Box / Preview Area */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] ${
            isDragging
              ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
              : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/70'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform mb-4 shadow-inner">
            <Upload className="w-8 h-8" />
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-1">
            Drag & drop your screenshot here
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mb-4 max-w-sm">
            or click to browse from your computer. Supports PNG, JPEG, and WebP (up to 5 MB).
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-400">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard, Landing Page, Forms, or App UI</span>
          </div>
        </div>
      ) : (
        <div className="relative border border-slate-800 bg-slate-900/60 rounded-2xl p-4 sm:p-6 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-200 truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'image'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
                title="Replace image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/50 hover:text-rose-300 rounded-lg border border-rose-800/40 transition-colors disabled:opacity-50"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Image Preview Container */}
          {previewUrl && (
            <div className="mt-4 relative rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800/80 max-h-96 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Uploaded screenshot preview"
                className="max-h-80 w-auto object-contain rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Error Banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs sm:text-sm text-rose-300 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
