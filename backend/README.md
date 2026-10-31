# Screenshot2Spec — Backend Service

The standalone backend and specification engine for **Screenshot2Spec**, powered by **Gemma 4** (`models/gemma-4-26b-a4b-it`) via the Google AI Studio API.

---

## Architecture & Responsibilities

- **Member 2 (Gemma 4 API & Multimodal Backend):**
  - Image signature & magic byte verification (PNG, JPEG, WebP)
  - Google `@google/genai` SDK integration with automatic `models/` prefix normalization
  - Zod response validation & cycle-free component hierarchy enforcement
  - Resilient timeout (45s) and bounded retry logic

- **Member 3 (Specification Engine & Prompt Generator):**
  - Component tree hierarchy generator (`specificationGenerator.ts`)
  - Conservative library matching against approved catalog (`libraryCatalog.ts`)
  - 15-section master coding prompt generator (`promptGenerator.ts`)
  - Multi-artifact exporters for Markdown, JSON, and TypeScript (`exporters.ts`)

---

## Quick Start

### 1. Environment Configuration

Copy the template and set your API key:

```bash
cp .env.example .env
```

Set:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMMA_MODEL=gemma-4-26b-a4b-it
BACKEND_PORT=3001
```

### 2. Run Standalone Server

```bash
npm run dev
# or: npm start
```

Runs on `http://localhost:3001`.

### 3. Run Test Suite

```bash
# Deterministic offline unit & route handler test suite (27 tests)
npm test

# Live Gemma 4 API multimodal end-to-end test
npm run test:live
```

---

## API Contract

### `POST /api/analyze`

**Request:** `multipart/form-data`
- `screenshot` (File, Required): PNG, JPEG, or WebP (< 5 MB)
- `framework` (string, Required): "Next.js" or "React"
- `styling` (string, Required): "Tailwind CSS"
- `instructions` (string, Optional): Max 2,000 characters

**Response (200 OK):**
```json
{
  "analysis": {
    "pageType": "dashboard",
    "summary": "...",
    "layout": ["sidebar", "header", "main content"],
    "components": [ ... ],
    "design": { "colors": [...], "typography": [...], "spacing": [...] },
    "interactions": [ ... ],
    "assumptions": [ ... ]
  }
}
```
