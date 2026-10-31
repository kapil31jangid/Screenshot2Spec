'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ValidatedAnalysis } from '@/types/analysis';
import { DeveloperBlueprint } from '@/types/specification';
import { generateDeveloperBlueprint } from '@/components/mockSpecAdapter';
import { mockDashboardAnalysis } from '@/lib/mockAnalysis';
import { analysisSchema } from '@/lib/schemas';

interface UseAnalysisOptions {
  framework?: string;
  styling?: string;
  instructions?: string;
}

export function useAnalysis() {
  const [analysis, setAnalysis] = useState<ValidatedAnalysis | null>(null);
  const [blueprint, setBlueprint] = useState<DeveloperBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup pending request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const analyze = useCallback(
    async (file: File, options: UseAnalysisOptions = {}) => {
      const framework = options.framework || 'nextjs-ts';
      const styling = options.styling || 'tailwind';
      const instructions = options.instructions || '';

      setError(null);

      // Cancel any active in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setIsLoading(true);
      setLoadingStep('Uploading screenshot to /api/analyze...');

      try {
        const formData = new FormData();
        formData.append('screenshot', file);
        formData.append('framework', framework);
        formData.append('styling', styling);
        if (instructions.trim()) {
          formData.append('instructions', instructions.trim());
        }

        setLoadingStep('Invoking Gemma 4 multimodal visual reasoning...');

        let fetchedAnalysis: ValidatedAnalysis | null = null;

        try {
          const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData,
            signal: abortController.signal,
          });

          if (response.ok) {
            const data = await response.json();
            if (data?.analysis) {
              const parsed = analysisSchema.safeParse(data.analysis);
              if (!parsed.success) {
                const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
                throw new Error(`API returned response violating shared schema: ${issues}`);
              }
              fetchedAnalysis = parsed.data;
            } else {
              throw new Error('API response missing "analysis" payload.');
            }
          } else if (response.status === 404) {
            console.warn('POST /api/analyze returned 404. Using shared mock analysis.');
            setLoadingStep('Backend route pending from Member 2 — using shared mock analysis...');
            await new Promise((res) => setTimeout(res, 800));
            fetchedAnalysis = mockDashboardAnalysis;
          } else {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Server responded with status ${response.status}`);
          }
        } catch (fetchErr: unknown) {
          if (fetchErr instanceof DOMException && fetchErr.name === 'AbortError') return;

          console.warn('API fetch failed, falling back to shared mock analysis:', fetchErr);
          setLoadingStep('Using shared mock analysis for testing interface...');
          await new Promise((res) => setTimeout(res, 800));
          fetchedAnalysis = mockDashboardAnalysis;
        }

        if (fetchedAnalysis) {
          setLoadingStep('Constructing component hierarchy & matching curated libraries...');
          const generatedBlueprint = generateDeveloperBlueprint(
            fetchedAnalysis,
            framework === 'nextjs-ts' ? 'React + TypeScript (Next.js App Router)' : framework,
            styling === 'tailwind' ? 'Tailwind CSS' : styling,
            instructions
          );

          setAnalysis(fetchedAnalysis);
          setBlueprint(generatedBlueprint);
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'An error occurred during analysis.';
        setError(msg);
      } finally {
        setIsLoading(false);
        setLoadingStep('');
        abortControllerRef.current = null;
      }
    },
    []
  );

  const loadDemo = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setLoadingStep('Loading demo analytics dashboard analysis...');

    setTimeout(() => {
      const demoBlueprint = generateDeveloperBlueprint(
        mockDashboardAnalysis,
        'React + TypeScript (Next.js App Router)',
        'Tailwind CSS',
        'Demo dashboard analysis with modern dark styling'
      );
      setAnalysis(mockDashboardAnalysis);
      setBlueprint(demoBlueprint);
      setIsLoading(false);
      setLoadingStep('');
    }, 600);
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setAnalysis(null);
    setBlueprint(null);
    setError(null);
    setIsLoading(false);
    setLoadingStep('');
  }, []);

  return {
    analysis,
    blueprint,
    isLoading,
    loadingStep,
    error,
    analyze,
    loadDemo,
    reset,
  };
}

