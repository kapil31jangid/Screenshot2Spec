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

# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Build Verification

```bash
cd frontend

# Run unit and contract validation test suite
npm test

# Run strict TypeScript type check
npx tsc --noEmit

# Run production build
npm run build
```

---

## 🏗️ Repository Structure

```
Screenshot2Spec/
├── docs/                                  # Project specifications & team contracts
│   ├── Screenshot2Spec.pdf                # Master build guide
│   ├── TEAM_CONTRACT.md                   # Shared API and file ownership rules
│   └── frontend-implementation-audit.md   # Comprehensive audit & compliance report
├── frontend/                              # Complete frontend application & modules
│   ├── public/                            # Static assets & brand mark
│   │   └── logo.svg                       # Project logo
│   ├── src/
│   │   ├── app/                           # Next.js 15 App Router
│   │   │   ├── layout.tsx                 # Global HTML shell & dark theme
│   │   │   ├── globals.css                # Tailwind CSS base styles
│   │   │   └── page.tsx                   # Main landing page & orchestrator
│   │   ├── components/                    # Frontend UI components
│   │   │   ├── ScreenshotUpload.tsx       # Drag & drop upload with 5 MB & format validation
│   │   │   ├── ConfigurationPanel.tsx     # Framework, styling, and instruction selectors
│   │   │   ├── ResultsDashboard.tsx       # 8-tab blueprint dashboard with persistent preview
│   │   │   ├── ComponentTree.tsx          # Recursive component hierarchy viewer
│   │   │   ├── LibraryRecommendations.tsx # Approved library recommendations & install box
│   │   │   ├── PromptPreview.tsx          # 15-section master AI coding prompt viewer
│   │   │   ├── ExportActions.tsx          # One-click artifact downloads
│   │   │   └── mockSpecAdapter.ts         # Deterministic blueprint generator adapter
│   │   ├── hooks/                         # Custom React logic hooks
│   │   │   ├── useScreenshot.ts           # File validation, size checking & URL lifecycle
│   │   │   ├── useAnalysis.ts             # API submission, AbortController & Zod validation
│   │   │   └── useClipboard.ts            # Resilient async clipboard copy with fallback
│   │   ├── lib/                           # Core utilities & shared contracts
│   │   │   ├── schemas.ts                 # Zod analysis validation & cycle detection
│   │   │   ├── mockAnalysis.ts            # Sample dashboard data for parallel testing
│   │   │   ├── exporters.ts               # Modular export generators (.md, .ts, .json)
│   │   │   └── clipboard.ts               # Cross-browser clipboard copy helper
│   │   └── types/                         # Shared TypeScript contracts
│   │       ├── analysis.ts                # ValidatedAnalysis, DetectedComponent, DesignSystem
│   │       └── specification.ts           # DeveloperBlueprint, ComponentTreeNode, LibraryRecommendation
│   ├── tests/
│   │   └── frontend.test.mjs              # 10 automated unit & contract tests
│   ├── .env.example                       # Safe environment variable template
│   ├── .gitignore                         # Local gitignore for frontend build artifacts
│   ├── next.config.ts                     # Next.js configuration
│   ├── package.json                       # Dependencies & scripts
│   ├── postcss.config.mjs                 # PostCSS pipeline
│   ├── tailwind.config.ts                 # Tailwind CSS configuration
│   └── tsconfig.json                      # Strict TypeScript configuration
├── .gitignore                             # Root gitignore
└── README.md                              # This document
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

## 👥 Team File Ownership

- **Member 1 (Frontend & UX):** `frontend/src/app/**`, `frontend/src/components/**`, `frontend/src/hooks/**`
- **Member 2 (Gemma 4 API & Backend):** `src/app/api/analyze/route.ts` or `backend/**`
- **Member 3 (Specification Generator & Integration):** Generator modules & tests
