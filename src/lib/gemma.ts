import { GoogleGenAI } from '@google/genai';

export interface GemmaAnalysisRequest {
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
}

export interface GemmaCallResult {
  rawText: string;
  cleanedJsonText: string;
  modelUsed: string;
}

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
 * Executes a multimodal analysis call to Gemma 4 via Google GenAI SDK.
 */
export async function callGemmaMultimodal(request: GemmaAnalysisRequest): Promise<GemmaCallResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_api_key_here') {
    throw new Error('MISSING_API_KEY: GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment or .env.local.');
  }

  // Model ID: Use GEMMA_MODEL from environment, ensuring 'models/' prefix
  let rawModelName = (process.env.GEMMA_MODEL || 'gemma-4-26b-a4b-it').trim();
  const normalizedModel = rawModelName.startsWith('models/') ? rawModelName : `models/${rawModelName}`;

  console.log(`[Gemma Backend] Dispatching analysis to model: ${normalizedModel} (image size: ${(request.imageBuffer.length / 1024).toFixed(1)} KB, type: ${request.mimeType})`);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = request.imageBuffer.toString('base64');

    let response;
    try {
      response = await ai.models.generateContent({
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
    } catch (primaryErr: unknown) {
      // If models/ prefix failed or raw name is needed, retry with raw name
      const pMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      if (rawModelName !== normalizedModel && (pMsg.includes('500') || pMsg.includes('NOT_FOUND') || pMsg.includes('404'))) {
        console.warn(`[Gemma Backend] Retrying with raw model identifier: ${rawModelName}`);
        response = await ai.models.generateContent({
          model: rawModelName,
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
      } else {
        throw primaryErr;
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
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Gemma Backend Error]: ${errorMsg}`);

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

