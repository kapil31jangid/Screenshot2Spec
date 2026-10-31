'use client';

import { useState, useEffect, useCallback } from 'react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export function useScreenshot() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Manage preview object URL lifecycle safely
  useEffect(() => {
    if (!file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const selectFile = useCallback((newFile: File | null) => {
    setError(null);
    if (!newFile) {
      setFile(null);
      return;
    }

    // 1. Check for empty files (0 bytes)
    if (newFile.size === 0) {
      setError('The selected file is empty (0 bytes). Please upload a valid image file.');
      return;
    }

    // 2. Validate MIME type & file extension
    const isMimeValid = ALLOWED_MIME_TYPES.includes(newFile.type);
    const isExtValid = ALLOWED_EXTENSIONS.some((ext) =>
      newFile.name.toLowerCase().endsWith(ext)
    );

    if (!isMimeValid && !isExtValid) {
      setError(
        `Unsupported file format (${newFile.type || 'unknown'}). Please upload a PNG, JPEG, or WebP image.`
      );
      return;
    }

    // 3. Enforce 5 MB maximum file size limit
    if (newFile.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (newFile.size / (1024 * 1024)).toFixed(2);
      setError(`Image is too large (${sizeMb} MB). The maximum allowed size is 5 MB.`);
      return;
    }

    setFile(newFile);
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    previewUrl,
    error,
    setError,
    selectFile,
    clearFile,
  };
}
