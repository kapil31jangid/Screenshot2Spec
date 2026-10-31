import { NextRequest, NextResponse } from 'next/server';
import { buildAnalysisPrompt } from '@/lib/analysisPrompt';
import { callGemmaMultimodal } from '@/lib/gemma';
import { parseAndValidateAnalysis } from '@/lib/schemas';
import { mockDashboardAnalysis } from '@/lib/mockAnalysis';
import { AnalyzeApiErrorResponse, AnalyzeApiSuccessResponse } from '@/types/analysis';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeApiSuccessResponse | AnalyzeApiErrorResponse>> {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Invalid content type. Expected multipart/form-data.' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const screenshotFile = formData.get('screenshot') as File | null;
    const framework = (formData.get('framework') as string | null)?.trim() || 'Next.js / React';
    const styling = (formData.get('styling') as string | null)?.trim() || 'Tailwind CSS';
    const instructions = (formData.get('instructions') as string | null)?.trim() || undefined;

    // Check optional demo / mock query param or env flag for testing
    const url = new URL(req.url);
    const useMock = url.searchParams.get('mock') === 'true' || process.env.USE_MOCK_GEMMA === 'true';

    // 1. Validate file presence
    if (!screenshotFile) {
      return NextResponse.json(
        { error: 'Screenshot file is required.' },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    const mimeType = screenshotFile.type.toLowerCase();
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: `Unsupported image format: "${mimeType}". Only PNG, JPG, and WebP images are supported.`,
        },
        { status: 415 }
      );
    }

    // 3. Validate file size
    if (screenshotFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Screenshot exceeds the 5 MB file size limit (uploaded: ${(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 413 }
      );
    }

    // 4. Validate instructions length
    if (instructions && instructions.length > 2000) {
      return NextResponse.json(
        { error: 'Instructions exceed maximum allowed limit of 2,000 characters.' },
        { status: 400 }
      );
    }

    // If mock mode is explicitly requested, return realistic mock analysis
    if (useMock) {
      console.log('[API /api/analyze] Serving mock analysis response.');
      return NextResponse.json({ analysis: mockDashboardAnalysis }, { status: 200 });
    }

    // 5. Convert file to buffer
    const arrayBuffer = await screenshotFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // 6. Build prompt for Gemma 4
    const prompt = buildAnalysisPrompt({
      framework,
      styling,
      instructions,
    });

    // 7. Invoke Gemma 4 via Google GenAI SDK
    let callResult;
    try {
      callResult = await callGemmaMultimodal({
        imageBuffer,
        mimeType,
        prompt,
      });
    } catch (gemmaErr: unknown) {
      const msg = gemmaErr instanceof Error ? gemmaErr.message : String(gemmaErr);

      if (msg.startsWith('MISSING_API_KEY')) {
        return NextResponse.json(
          {
            error: 'Google AI Studio API key is not configured on the server.',
            details: 'Please configure GEMINI_API_KEY in your server environment variables or .env.local file.',
          },
          { status: 500 }
        );
      }

      if (msg.startsWith('AUTHENTICATION_ERROR')) {
        return NextResponse.json(
          { error: 'Invalid Google AI Studio API key or unauthorized access.' },
          { status: 401 }
        );
      }

      if (msg.startsWith('QUOTA_EXCEEDED')) {
        return NextResponse.json(
          { error: 'Google AI Studio API quota exceeded. Please try again in a few moments.' },
          { status: 429 }
        );
      }

      if (msg.startsWith('MODEL_UNAVAILABLE')) {
        return NextResponse.json(
          { error: 'The requested Gemma 4 model is currently unavailable or unsupported for this account.' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to complete screenshot analysis with AI model.', details: msg },
        { status: 502 }
      );
    }

    // 8. Parse JSON response safely
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(callResult.cleanedJsonText);
    } catch (parseErr: unknown) {
      console.error('[API /api/analyze] Malformed JSON from model:', callResult.cleanedJsonText);
      return NextResponse.json(
        {
          error: 'Model response could not be parsed as valid JSON.',
          details: parseErr instanceof Error ? parseErr.message : 'JSON syntax error',
        },
        { status: 502 }
      );
    }

    // 9. Normalize minimal/empty layout & components if model returned empty arrays
    if (parsedJson && typeof parsedJson === 'object') {
      const obj = parsedJson as Record<string, unknown>;
      if (!Array.isArray(obj.layout) || obj.layout.length === 0) {
        obj.layout = ['main-content'];
      }
      if (!Array.isArray(obj.components) || obj.components.length === 0) {
        obj.components = [
          {
            id: 'page-root',
            name: 'PageRoot',
            parentId: null,
            uiType: 'container',
            purpose: 'Root layout container',
            observedEvidence: 'Base screen or viewport layout',
            confidence: 'observed',
            suggestedLibraryId: 'tailwind',
          },
        ];
      }
    }

    // 10. Validate against Zod schema and check component hierarchy integrity
    const validationResult = parseAndValidateAnalysis(parsedJson);
    if (!validationResult.success || !validationResult.data) {
      console.error('[API /api/analyze] Validation failed:', validationResult.errors);
      return NextResponse.json(
        {
          error: 'Model analysis failed data contract validation.',
          details: validationResult.errors || ['Schema validation error'],
        },
        { status: 422 }
      );
    }

    // 10. Return validated analysis conforming to shared API contract
    return NextResponse.json(
      {
        analysis: validationResult.data,
      },
      { status: 200 }
    );
  } catch (unexpectedError: unknown) {
    const errorMsg = unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError);
    console.error('[API /api/analyze] Unexpected server error:', errorMsg);
    return NextResponse.json(
      {
        error: 'An unexpected internal server error occurred while processing the screenshot.',
      },
      { status: 500 }
    );
  }
}

