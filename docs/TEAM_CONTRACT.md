# Screenshot2Spec — Team Contract & Architecture

Tagline: **"See It. Specify It. Build It."**

## 1. Project Purpose
Screenshot2Spec transforms user interface screenshots into implementation-ready frontend blueprints and library-aware AI coding prompts using Google Gemma 4.

## 2. Shared API Contract

### Endpoint
`POST /api/analyze`

### Request Type
`multipart/form-data`

### Request Fields
- `screenshot`: File (PNG, JPEG, WebP, max 5MB) — **Required**
- `framework`: String (e.g. `"React + TypeScript using Next.js App Router"`) — **Required**
- `styling`: String (e.g. `"Tailwind CSS"`) — **Required**
- `instructions`: String (optional user notes/constraints) — **Optional**

### Response on Success (200 OK)
```json
{
  "analysis": {
    "pageType": "dashboard",
    "summary": "Analytics dashboard with sidebar and revenue metrics",
    "layout": ["sidebar", "header", "main content"],
    "components": [
      {
        "id": "sidebar",
        "name": "AppSidebar",
        "parentId": null,
        "uiType": "navigation",
        "purpose": "Display navigation links",
        "observedEvidence": "Left vertical navigation region",
        "confidence": "observed",
        "suggestedLibraryId": "shadcn"
      }
    ],
    "design": {
      "colors": ["#ffffff", "#172554"],
      "typography": ["Bold headings", "Muted secondary labels"],
      "spacing": ["Consistent card gaps"]
    },
    "interactions": [
      {
        "element": "Sidebar links",
        "behavior": "Navigate between pages",
        "status": "assumed"
      }
    ],
    "assumptions": [
      "Mobile navigation behavior is unknown",
      "The chart data source cannot be determined"
    ]
  }
}
```

## 3. Team File Ownership

### Member 1: Frontend and User Experience (`feature/frontend`)
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/**`

### Member 2: Gemma 4 API and Backend (`feature/gemma-api`)
- `src/app/api/analyze/route.ts`
- `src/lib/gemma.ts`
- `src/lib/analysisPrompt.ts`

### Member 3: Specification Generator & Exporters (`feature/spec-generator`)
- `src/lib/libraryCatalog.ts`
- `src/lib/specificationGenerator.ts`
- `src/lib/promptGenerator.ts`
- `src/lib/exporters.ts`
- `tests/**`

### Shared Contracts (Immutable without team consensus)
- `src/types/analysis.ts`
- `src/types/specification.ts`
- `src/lib/schemas.ts`
- `src/lib/mockAnalysis.ts`
- `docs/TEAM_CONTRACT.md`

