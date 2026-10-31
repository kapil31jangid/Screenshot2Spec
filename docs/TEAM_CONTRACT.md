# Screenshot2Spec — Team Contract & Architecture Guide

Tagline: **"See It. Specify It. Build It."**

---

## 1. Project Purpose
Screenshot2Spec converts UI screenshots into implementation-ready frontend blueprints and library-aware AI coding prompts using **Google Gemma 4** via Google AI Studio API.

---

## 2. Shared API Contract

### Endpoint
`POST /api/analyze`

### Request Format
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `screenshot` (File, Required): PNG, JPEG, or WebP image, max 5 MB
  - `framework` (string, Required): e.g. "Next.js / React (App Router)"
  - `styling` (string, Required): e.g. "Tailwind CSS"
  - `instructions` (string, Optional): User-specific constraints or guidance (max 2,000 chars)

### Response Format

#### Success (200 OK):
```json
{
  "analysis": {
    "pageType": "dashboard",
    "summary": "Analytics dashboard with sidebar and revenue metrics",
    "layout": ["sidebar", "header", "main content"],
    "components": [
      {
        "id": "app-sidebar",
        "name": "AppSidebar",
        "parentId": null,
        "uiType": "navigation",
        "purpose": "Primary site navigation",
        "observedEvidence": "Vertical navigation on left side",
        "confidence": "observed",
        "suggestedLibraryId": "shadcn"
      }
    ],
    "design": {
      "colors": ["#0f172a", "#ffffff"],
      "typography": ["Inter", "Bold headings"],
      "spacing": ["24px padding", "16px gap"]
    },
    "interactions": [
      {
        "element": "Sidebar links",
        "behavior": "Navigate between routes",
        "status": "assumed"
      }
    ],
    "assumptions": [
      "Mobile navigation behavior is unknown",
      "The chart data source cannot be determined from screenshot alone"
    ]
  }
}
```

#### Error (4xx / 5xx):
```json
{
  "error": "User-friendly error message",
  "details": ["Optional validation or diagnostic details"]
}
```

---

## 3. Directory Structure & File Ownership

Screenshot2Spec is partitioned into dedicated frontend and backend services:

### Member 1: Frontend & User Experience (`frontend/`)
- `frontend/src/app/**` (page, layout, styles)
- `frontend/src/components/**` (ScreenshotUpload, ConfigurationPanel, ResultsDashboard, ComponentTree, LibraryRecommendations, PromptPreview, ExportActions)
- `frontend/src/hooks/**` (useScreenshot, useAnalysis, useClipboard)
- `frontend/tests/frontend.test.mjs`

### Member 2: Gemma 4 API & Backend (`backend/`)
- `backend/src/server.ts` (standalone server)
- `backend/src/api/analyze/route.ts` (API route handler)
- `backend/src/lib/gemma.ts` (Google GenAI SDK client)
- `backend/src/lib/analysisPrompt.ts` (Gemma 4 vision analysis prompt)

### Member 3: Specification, Library Catalog & Exporters (`backend/` & shared)
- `backend/src/lib/libraryCatalog.ts`
- `backend/src/lib/specificationGenerator.ts`
- `backend/src/lib/promptGenerator.ts`
- `backend/src/lib/exporters.ts`
- `backend/tests/**`

### Shared Contracts (Immutable without team consensus)
- `types/analysis.ts`
- `types/specification.ts`
- `lib/schemas.ts`
- `lib/mockAnalysis.ts`
- `docs/TEAM_CONTRACT.md`
