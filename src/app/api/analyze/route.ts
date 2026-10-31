import { NextRequest, NextResponse } from 'next/server';
import { buildAnalysisPrompt } from '@/lib/analysisPrompt';
import { callGemmaMultimodal } from '@/lib/gemma';
import { parseAndValidateAnalysis } from '@/lib/schemas';
import { mockDashboardAnalysis } from '@/lib/mockAnalysis';
import { AnalyzeApiErrorResponse, AnalyzeApiSuccessResponse } from '@/types/analysis';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const SUPPORTED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);

const SUPPORTED_FRAMEWORKS = [
  'next.js',
  'nextjs',
  'react',
  'next.js / react',
  'next.js app router',
  'next.js / react (app router)',
];

const SUPPORTED_STYLING = [
  'tailwind',
  'tailwind css',
  'tailwindcss',
];

/**
 * Validates image file magic bytes (file signature) to prevent MIME spoofing.
 */
export function verifyImageMagicBytes(buffer: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (buffer.length < 12) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // WebP: RIFF....WEBP (offset 0: 'RIFF', offset 8: 'WEBP')
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

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
    const rawFramework = (formData.get('framework') as string | null)?.trim() || 'Next.js / React (App Router)';
    const rawStyling = (formData.get('styling') as string | null)?.trim() || 'Tailwind CSS';
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

    // 2. Validate empty file (0 bytes)
    if (screenshotFile.size === 0) {
      return NextResponse.json(
        { error: 'Uploaded screenshot is empty (0 bytes). Please upload a valid image file.' },
        { status: 400 }
      );
    }

    // 3. Validate MIME type
    const mimeType = screenshotFile.type.toLowerCase();
    if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          error: `Unsupported image format: "${mimeType}". Only PNG, JPG, and WebP images are supported.`,
        },
        { status: 415 }
      );
    }

    // 4. Validate file size (5 MB limit)
    if (screenshotFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Screenshot exceeds the 5 MB file size limit (uploaded: ${(screenshotFile.size / (1024 * 1024)).toFixed(2)} MB).`,
        },
        { status: 413 }
      );
    }

    // 5. Convert file to buffer and verify magic bytes
    const arrayBuffer = await screenshotFile.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const verifiedFormat = verifyImageMagicBytes(imageBuffer);
    if (!verifiedFormat) {
      return NextResponse.json(
        {
          error: 'Invalid image file signature. The uploaded file does not match valid PNG, JPEG, or WebP binary headers.',
        },
        { status: 415 }
      );
    }

    // 6. Validate framework constraints (Section 8.3 MVP: Next.js App Router)
    const normalizedFramework = rawFramework.toLowerCase();
    const isFrameworkSupported = SUPPORTED_FRAMEWORKS.some((f) => normalizedFramework.includes(f));
    if (!isFrameworkSupported) {
      return NextResponse.json(
        {
          error: `Unsupported target framework: "${rawFramework}". For the MVP, Screenshot2Spec only supports React + TypeScript using Next.js App Router.`,
        },
        { status: 400 }
      );
    }

    // 7. Validate styling constraints (Section 8.3 MVP: Tailwind CSS)
    const normalizedStyling = rawStyling.toLowerCase();
    const isStylingSupported = SUPPORTED_STYLING.some((s) => normalizedStyling.includes(s));
    if (!isStylingSupported) {
      return NextResponse.json(
        {
          error: `Unsupported styling system: "${rawStyling}". For the MVP, Screenshot2Spec only supports Tailwind CSS.`,
        },
        { status: 400 }
      );
    }

    // 8. Validate instructions length
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

    // 9. Build prompt for Gemma 4
    const prompt = buildAnalysisPrompt({
      framework: rawFramework,
      styling: rawStyling,
      instructions,
    });

    // 10. Invoke Gemma 4 via Google GenAI SDK
    let callResult;
    try {
      callResult = await callGemmaMultimodal({
        imageBuffer,
        mimeType: verifiedFormat,
        prompt,
      });
    } catch (gemmaErr: unknown) {
      const msg = gemmaErr instanceof Error ? gemmaErr.message : String(gemmaErr);

      if (msg.startsWith('TIMEOUT:')) {
        return NextResponse.json(
          { error: 'AI analysis request timed out. Google AI Studio took longer than expected to process the image.' },
          { status: 504 }
        );
      }

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

      if (msg.startsWith('EMPTY_MODEL_RESPONSE')) {
        return NextResponse.json(
          { error: 'The AI model returned an empty analysis response.', details: msg },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to complete screenshot analysis with AI model.', details: msg },
        { status: 502 }
      );
    }

    // 11. Parse JSON response safely
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

    // 12. Validate against Zod schema and check component hierarchy integrity
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

    // 13. Return validated analysis conforming to shared API contract
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
