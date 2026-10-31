'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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

  // Sync preview URL and cleanup on unmount or file reset
  useEffect(() => {
    if (!selectedFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

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

      {/* Upload Box / Preview Area */}
      {!selectedFile ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload screenshot by clicking or dragging and dropping an image"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleTriggerUpload}
          onKeyDown={handleKeyDown}
          className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[260px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14370D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F1] ${
            isDragging
              ? 'border-[#14370D] bg-[#FEF3B5]/40 shadow-lg shadow-[#14370D]/10'
              : 'border-[#CBD6C9] bg-white hover:border-[#738E6D] hover:bg-[#F4F6F2]'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FEF3B5]/80 border border-[#E5CE82] flex items-center justify-center text-[#14370D] group-hover:scale-105 transition-transform mb-4 shadow-sm">
            <Upload className="w-8 h-8" aria-hidden="true" />
          </div>

          <h4 className="text-base sm:text-lg font-semibold text-[#14370D] mb-1">
            Drag & drop your screenshot here
          </h4>
          <p className="text-xs sm:text-sm text-[#52624F] mb-4 max-w-sm">
            or press Enter / click to browse. Supports PNG, JPEG, and WebP (up to 5 MB).
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FEF3B5]/60 border border-[#CBD6C9] text-xs text-[#1C2B1B]">
            <ImageIcon className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
            <span>Dashboard, Landing Page, Forms, or App UI</span>
          </div>
        </div>
      ) : (
        <div className="relative border border-[#CBD6C9] bg-white rounded-2xl p-4 sm:p-6 shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#CBD6C9]/60">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3B5]/80 border border-[#E5CE82] flex items-center justify-center text-[#14370D] shrink-0">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#1C2B1B] truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#52624F]">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'image'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleTriggerUpload}
                disabled={disabled}
                aria-label="Replace screenshot image"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1C2B1B] bg-white hover:bg-[#F4F6F2] hover:text-[#14370D] rounded-lg border border-[#CBD6C9] transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none shadow-xs"
                title="Replace image"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#738E6D]" aria-hidden="true" />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                aria-label="Remove selected screenshot"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800 rounded-lg border border-red-200 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-red-500 focus:outline-none"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Image Preview Container */}
          {previewUrl && (
            <div className="mt-4 relative rounded-xl overflow-hidden bg-[#FAF9F1] border border-[#CBD6C9] max-h-96 flex items-center justify-center p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt={`Preview of uploaded screenshot: ${selectedFile.name}`}
                className="max-h-80 w-auto object-contain rounded-lg shadow-sm"
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
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-800 animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
