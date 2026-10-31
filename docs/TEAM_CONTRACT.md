# Screenshot2Spec — Team Contract & Architecture Guide

## 1. Project Purpose
Screenshot2Spec converts UI screenshots into implementation-ready AI coding blueprints using Gemma 4 via Google AI Studio API.

---

## 2. Shared API Contract

### Endpoint
`POST /api/analyze`

### Request Format
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `screenshot` (File, Required): PNG, JPG, or WebP image, max 5 MB
  - `framework` (string, Required): e.g. "Next.js", "React", "Vue", "Svelte"
  - `styling` (string, Required): e.g. "Tailwind CSS", "CSS Modules", "Styled Components"
  - `instructions` (string, Optional): User specific constraints or guidance (max 2000 chars)

### Response Format
- **Success (200 OK)**:
```json
{
  "analysis": {
    "pageType": "dashboard",
    "summary": "Analytics dashboard...",
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
      "Mobile navigation behavior is unknown"
    ]
  }
}
```

- **Error (4xx / 5xx)**:
```json
{
  "error": "User-friendly error message",
  "details": ["Optional validation or diagnostic details"]
}
```

---

## 3. File Ownership & Responsibilities

### Member 1: Frontend and UI Development
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/**` (ScreenshotUpload, ResultsDashboard, ComponentTree, LibraryRecommendations, PromptPreview, ExportActions)

### Member 2: Gemma 4 API and Backend
- `src/app/api/analyze/route.ts`
- `src/lib/gemma.ts`
- `src/lib/analysisPrompt.ts`

### Member 3: Specification, Library Mapping & Prompt Generation
- `src/lib/libraryCatalog.ts`
- `src/lib/specificationGenerator.ts`
- `src/lib/promptGenerator.ts`
- `src/lib/exporters.ts`
- `tests/**`

### Shared Contracts (Locked)
- `src/types/analysis.ts`
- `src/types/specification.ts`
- `src/lib/schemas.ts`
- `src/lib/mockAnalysis.ts`

Any modifications to shared contracts must be reviewed and agreed upon by all members.

