'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  UploadCloud,
  ImageIcon,
  X,
  AlertCircle,
  FileCode,
  RefreshCw,
  ClipboardPaste,
  Sparkles,
} from 'lucide-react';

interface ScreenshotUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  error: string | null;
  onError: (err: string | null) => void;
  disabled?: boolean;
  onLoadSample?: () => void;
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
  onLoadSample,
}: ScreenshotUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

  // Sync preview URL and cleanup on unmount or file reset
  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setImageMeta(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Read image dimensions
    const img = new Image();
    img.onload = () => {
      setImageMeta({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  // Helper to validate selected file
  const validateAndSetFile = useCallback(
    (file: File) => {
      onError(null);

      // Check empty file (0 bytes)
      if (file.size === 0) {
        onError('The selected file is empty (0 bytes). Please upload a valid image file.');
        return;
      }

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

      onFileSelect(file);
    },
    [onError, onFileSelect]
  );

  // Global window paste listener for Ctrl+V / Cmd+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            const renamed = new File(
              [file],
              `clipboard-${Date.now()}.${file.type.split('/')[1] || 'png'}`,
              { type: file.type }
            );
            validateAndSetFile(renamed);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled, validateAndSetFile]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTriggerUpload();
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
        aria-label="Upload screenshot file"
        accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />

      {/* Upload Dropzone */}
      {!selectedFile ? (
        <div
          ref={dropzoneRef}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Drop screenshot here, click to browse, or paste with Ctrl+V"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          onKeyDown={handleKeyDown}
          className={`relative group cursor-pointer border border-dashed rounded-xl p-8 sm:p-10 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] bg-zinc-900/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 ${
            isDragging
              ? 'border-zinc-400 bg-zinc-900/80 ring-1 ring-zinc-400'
              : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {/* Subtle blueprint corner indicators */}
          <div className="absolute top-2.5 left-2.5 w-2 h-2 border-t border-l border-zinc-700/60" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 border-t border-r border-zinc-700/60" />
          <div className="absolute bottom-2.5 left-2.5 w-2 h-2 border-b border-l border-zinc-700/60" />
          <div className="absolute bottom-2.5 right-2.5 w-2 h-2 border-b border-r border-zinc-700/60" />

          <div className="w-11 h-11 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-300 mb-3.5 group-hover:scale-105 transition-transform shadow-sm">
            <UploadCloud className="w-5 h-5" aria-hidden="true" />
          </div>

          <h3 className="text-sm font-medium text-zinc-200 mb-1">
            Drop UI screenshot, or click to browse
          </h3>
          <p className="text-xs text-zinc-500 mb-4 max-w-sm">
            You can also press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">Ctrl+V</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">⌘V</kbd> anywhere to paste directly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-500">
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">PNG</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">JPEG</span>
            <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">WebP</span>
            <span className="text-zinc-600">•</span>
            <span>Max 5 MB</span>
          </div>
        </div>
      ) : (
        /* Image Preview Workbench Card */
        <div className="relative border border-zinc-800 bg-zinc-900/40 rounded-xl p-4 sm:p-5 transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                <FileCode className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mt-0.5">
                  <span>{formatFileSize(selectedFile.size)}</span>
                  {imageMeta && (
                    <>
                      <span>•</span>
                      <span>{imageMeta.width} × {imageMeta.height} px</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="uppercase">{selectedFile.type.split('/')[1] || 'image'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={disabled}
                aria-label="Replace screenshot"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md border border-zinc-700 transition-colors disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
              >
                <RefreshCw className="w-3 h-3" aria-hidden="true" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Remove selected screenshot"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-950/30 rounded-md border border-zinc-800 hover:border-red-900/50 transition-colors disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-red-500 focus:outline-none"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Image Display */}
          {previewUrl && (
            <div className="mt-3 relative rounded-lg overflow-hidden bg-black/60 border border-zinc-800 flex items-center justify-center p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`Uploaded UI screenshot: ${selectedFile.name}`}
                className="max-h-72 w-auto object-contain rounded border border-zinc-800/80 shadow-lg"
              />
            </div>
          )}
        </div>
      )}

      {/* Validation Error Banner */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/60 rounded-lg text-xs text-red-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
