import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

function ensureEnvLoaded() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here') return;
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../../../.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/);
        for (const l of lines) {
          const trimmed = l.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
              const k = trimmed.slice(0, idx).trim();
              const v = trimmed.slice(idx + 1).trim();
              if (!process.env[k]) process.env[k] = v;
            }
          }
        }
      } catch {}
    }
  }
}

export interface GemmaAnalysisRequest {
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
  timeoutMs?: number;
}

export interface GemmaCallResult {
  rawText: string;
  cleanedJsonText: string;
  modelUsed: string;
}

const DEFAULT_TIMEOUT_MS = 45000; // 45 seconds

/**
 * Strips outer markdown code block fences (e.g. ```json ... ```)
 */
export function extractCleanJson(rawText: string): string {
  let cleaned = rawText.trim();
  // Match ```json ... ``` or ``` ... ```
  const fenceRegex = /^```(?:json)?\s*\n([\s\S]*?)\n```$/i;
  const match = cleaned.match(fenceRegex);
  if (match) {
    cleaned = match[1].trim();
  } else {
    // In case there is text before or after the code block
    const embeddedBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (embeddedBlock) {
      cleaned = embeddedBlock[1].trim();
    }
  }
  return cleaned;
}

/**
 * Executes a multimodal analysis call to Gemma 4 via Google GenAI SDK with timeout.
 */
export async function callGemmaMultimodal(request: GemmaAnalysisRequest): Promise<GemmaCallResult> {
  ensureEnvLoaded();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_api_key_here') {
    throw new Error('MISSING_API_KEY: GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment or .env.local.');
  }

  // Model ID: Use GEMMA_MODEL from environment, ensuring 'models/' prefix
  const rawModelName = (process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it').trim();
  const normalizedModel = rawModelName.startsWith('models/') ? rawModelName : `models/${rawModelName}`;
  const timeoutMs = request.timeoutMs || DEFAULT_TIMEOUT_MS;

  console.log(`[Gemma Backend] Dispatching analysis to model: ${normalizedModel} (image size: ${(request.imageBuffer.length / 1024).toFixed(1)} KB, type: ${request.mimeType}, timeout: ${timeoutMs}ms)`);

  const executeApiCall = async (): Promise<GemmaCallResult> => {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = request.imageBuffer.toString('base64');

    const makeCall = async () => {
      return await ai.models.generateContent({
        model: normalizedModel,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: request.mimeType,
                  data: base64Data,
                },
              },
              {
                text: request.prompt,
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
        },
      });
    };

    let response;
    try {
      response = await makeCall();
    } catch (firstErr: unknown) {
      const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      // Bounded retry (1 attempt) if upstream Google AI Studio returns a transient 500/503 error
      if (errMsg.includes('500') || errMsg.includes('503') || errMsg.includes('INTERNAL') || errMsg.includes('UNAVAILABLE')) {
        console.warn(`[Gemma Backend] Transient upstream failure detected: ${errMsg}. Performing bounded retry (1/1)...`);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        response = await makeCall();
      } else {
        throw firstErr;
      }
    }

    const rawText = response.text || '';
    if (!rawText.trim()) {
      throw new Error('EMPTY_MODEL_RESPONSE: The model returned an empty content response.');
    }

    const cleanedJsonText = extractCleanJson(rawText);

    return {
      rawText,
      cleanedJsonText,
      modelUsed: normalizedModel,
    };
  };

  // Promise.race for reliable timeout protection
  let timerId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      reject(new Error(`TIMEOUT: Gemma 4 analysis timed out after ${timeoutMs}ms. Google AI Studio API took too long to respond.`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([executeApiCall(), timeoutPromise]);
    if (timerId) clearTimeout(timerId);
    return result;
  } catch (err: unknown) {
    if (timerId) clearTimeout(timerId);
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Gemma Backend Error]: ${errorMsg}`);

    if (errorMsg.startsWith('TIMEOUT:')) {
      throw err;
    }
    if (errorMsg.startsWith('EMPTY_MODEL_RESPONSE:')) {
      throw err;
    }
    if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED') || errorMsg.includes('API_KEY_INVALID')) {
      throw new Error('AUTHENTICATION_ERROR: Invalid or unauthorized Google AI Studio API key.');
    }
    if (errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('QUOTA_EXCEEDED: Google AI Studio API rate limit or quota exceeded. Please try again later.');
    }
    if (errorMsg.includes('404') || errorMsg.includes('NOT_FOUND') || errorMsg.includes('model not found')) {
      throw new Error(`MODEL_UNAVAILABLE: Model "${normalizedModel}" is currently unavailable or unsupported for this API key.`);
    }

    throw new Error(`ANALYSIS_FAILED: ${errorMsg}`);
  }
}
