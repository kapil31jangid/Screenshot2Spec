import { AnalysisResponse, AnalyzeApiErrorResponse, AnalyzeApiSuccessResponse } from '../types/analysis';

export interface AnalyzeRequestOptions {
  screenshot: File;
  framework?: string;
  styling?: string;
  instructions?: string;
  mock?: boolean;
}

/**
 * Client-side helper for uploading a screenshot to the backend analysis endpoint.
 */
export async function analyzeScreenshot(options: AnalyzeRequestOptions): Promise<AnalysisResponse> {
  const { screenshot, framework = 'Next.js / React', styling = 'Tailwind CSS', instructions, mock } = options;

  const formData = new FormData();
  formData.append('screenshot', screenshot);
  formData.append('framework', framework);
  formData.append('styling', styling);
  if (instructions && instructions.trim()) {
    formData.append('instructions', instructions.trim());
  }

  const endpoint = mock ? '/api/analyze?mock=true' : '/api/analyze';

  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    const errorData = data as AnalyzeApiErrorResponse;
    const detailMsg = Array.isArray(errorData.details)
      ? errorData.details.join('\n')
      : errorData.details || '';
    throw new Error(detailMsg ? `${errorData.error}: ${detailMsg}` : errorData.error || 'Failed to analyze screenshot');
  }

  return (data as AnalyzeApiSuccessResponse).analysis;
}

