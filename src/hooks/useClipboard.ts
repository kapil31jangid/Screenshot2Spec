'use client';

import { useState, useCallback } from 'react';
import { copyTextToClipboard } from '@/lib/clipboard';

export function useClipboard(timeout = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = useCallback(
    async (text: string, key = 'default'): Promise<boolean> => {
      const success = await copyTextToClipboard(text);
      if (success) {
        setCopiedKey(key);
        setTimeout(() => {
          setCopiedKey((prev) => (prev === key ? null : prev));
        }, timeout);
      }
      return success;
    },
    [timeout]
  );

  const isCopied = useCallback(
    (key = 'default') => copiedKey === key,
    [copiedKey]
  );

  return { copy, isCopied, copiedKey };
}
