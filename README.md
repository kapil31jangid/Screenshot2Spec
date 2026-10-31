# Screenshot2Spec

> **"See It. Specify It. Build It."**

Screenshot2Spec is an AI-powered developer productivity tool that converts user interface screenshots into implementation-ready frontend blueprints and library-aware AI coding prompts using **Google's Gemma 4** via Google AI Studio.

---

## 🚀 Quickstart

Ensure you have **Node.js 18+** installed:

```bash
# Clone or navigate into the repository
cd Screenshot2Spec

# Switch to the frontend feature branch
git checkout feature/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Build Verification

```bash
# Run unit and contract validation test suite
npm test

# Run strict TypeScript type check
npx tsc --noEmit

# Run production build
npm run build
```

---

## 🏗️ Architecture & Modules Overview

```
Screenshot2Spec/
├── docs/                                  # Canonical specifications & contracts
│   ├── Screenshot2Spec.pdf                # Complete Build Guide
│   ├── TEAM_CONTRACT.md                   # Shared API and file ownership contract
│   └── frontend-implementation-audit.md   # Comprehensive audit & compliance report
├── public/                                # Static assets and icons
│   └── logo.svg                           # Project logo
├── src/
│   ├── app/                               # Next.js 15 App Router
│   │   ├── layout.tsx                     # Global layout shell & metadata
│   │   ├── globals.css                    # Tailwind CSS base & custom scrollbars
│   │   └── page.tsx                       # Main landing page & workflow orchestrator
│   ├── components/                        # Frontend UI components
│   │   ├── ScreenshotUpload.tsx           # Drag & drop upload with 5 MB & format validation
│   │   ├── ConfigurationPanel.tsx         # Framework, styling, and instructions selectors
│   │   ├── ResultsDashboard.tsx           # 8-tab blueprint dashboard with persistent preview
│   │   ├── ComponentTree.tsx              # Recursive component hierarchy viewer
│   │   ├── LibraryRecommendations.tsx     # Curated frontend library recommendations & install box
│   │   ├── PromptPreview.tsx              # 15-section master AI coding prompt viewer
│   │   ├── ExportActions.tsx              # One-click artifact downloads
│   │   └── mockSpecAdapter.ts             # Deterministic blueprint generator adapter
│   ├── hooks/                             # Custom React hooks
│   │   ├── useScreenshot.ts               # File selection, format/size validation, and URL lifecycle
│   │   ├── useAnalysis.ts                 # API submission, AbortController, and schema validation
│   │   └── useClipboard.ts                # Resilient async clipboard copy with fallback
│   ├── lib/                               # Shared utilities & schemas
│   │   ├── schemas.ts                     # Zod analysis validation & hierarchy integrity checks
│   │   ├── mockAnalysis.ts                # Realistic sample dashboard data for parallel testing
│   │   ├── exporters.ts                   # Export generators (.md, .ts, .json)
│   │   └── clipboard.ts                   # Cross-browser clipboard copy helper
│   └── types/                             # Shared TypeScript contracts
│       ├── analysis.ts                    # ValidatedAnalysis, DetectedComponent, DesignSystem
│       └── specification.ts               # DeveloperBlueprint, ComponentTreeNode, LibraryRecommendation
└── tests/
    └── frontend.test.mjs                  # Automated frontend and contract test suite
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Library:** React 19
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS 3
- **Icons:** Lucide React
- **Validation:** Zod
- **AI Model:** Google Gemma 4 via Google GenAI SDK

---

## 📄 Exportable Developer Artifacts

Screenshot2Spec generates 5 developer-ready files:
1. `implementation-prompt.md` — Complete 15-section master prompt for AI coding assistants.
2. `frontend-specification.md` — Architecture specification with component hierarchy and design tokens.
3. `component-types.ts` — Auto-generated TypeScript interfaces for all detected components.
4. `dependencies.md` — Verified package installation commands and library rationales.
5. `component-tree.json` — Hierarchical component tree schema.

---

## 👥 Team File Ownership

- **Member 1 (Frontend & UX):** `src/app/page.tsx`, `src/app/globals.css`, `src/components/**`, `src/hooks/**`
- **Member 2 (Gemma 4 API & Backend):** `src/app/api/analyze/route.ts`, `src/lib/gemma.ts`, `src/lib/analysisPrompt.ts`
- **Member 3 (Specification Generator & Integration):** `src/lib/libraryCatalog.ts`, `src/lib/specificationGenerator.ts`, `src/lib/promptGenerator.ts`, `src/lib/exporters.ts`, `tests/**`
