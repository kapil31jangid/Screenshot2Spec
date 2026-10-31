# Screenshot2Spec — From Screenshot to Implementation-Ready AI Coding Blueprint

> **Tagline:** See It. Specify It. Build It.  
> **Category:** Best Use of Gemma 4  
> **AI Model:** Gemma 4 via Google AI Studio API (`models/gemma-4-26b-a4b-it`)

---

## 1. Overview
**Screenshot2Spec** is a multimodal AI-powered developer productivity platform that converts user interface screenshots into comprehensive, implementation-ready development blueprints and library-aware AI coding prompts.

While screenshots demonstrate visual appearance, they do not describe component architecture, required libraries, data models, responsive behavior, or implementation sequences. Screenshot2Spec bridges this gap by combining Gemma 4 multimodal vision analysis with a deterministic specification and prompt generation engine.

---

## 2. Repository Architecture

The project is structured into dedicated, decoupled services:

```
Screenshot2Spec/
├── docs/                                  # Project specifications, contracts & audits
│   ├── Screenshot2Spec.pdf                # Master build guide
│   ├── TEAM_CONTRACT.md                   # Shared API and file ownership rules
│   ├── backend-implementation-audit.md    # Backend compliance audit report
│   └── frontend-implementation-audit.md   # Frontend compliance audit report
├── frontend/                              # Frontend Next.js 15 application
│   ├── public/                            # Static assets & brand mark (logo.svg)
│   ├── src/
│   │   ├── app/                           # Next.js App Router (page.tsx, layout.tsx, globals.css)
│   │   ├── components/                    # UI components (Upload, Config, Tree, Prompt, Export)
│   │   ├── hooks/                         # React hooks (useScreenshot, useAnalysis, useClipboard)
│   │   ├── lib/                           # Schemas, mock analysis, exporters, clipboard
│   │   └── types/                         # TypeScript interfaces (analysis, specification)
│   ├── tests/                             # Frontend unit & contract tests
│   ├── package.json                       # Frontend dependencies & scripts
│   └── tsconfig.json                      # Strict TypeScript configuration
├── backend/                               # Gemma 4 backend & specification service
│   ├── src/
│   │   ├── api/analyze/route.ts           # POST /api/analyze route handler
│   │   ├── server.ts                      # Standalone HTTP server (port 3001)
│   │   ├── lib/                           # Gemma client, prompt builder, catalog, generator
│   │   └── types/                         # Analysis & specification types
│   ├── tests/                             # Backend unit, route & live integration tests
│   ├── .env.example                       # Backend environment template
│   └── package.json                       # Backend dependencies & scripts
├── .gitignore                             # Monorepo gitignore
└── README.md                              # Project documentation
```

---

## 3. Quickstart

### Frontend (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```
Runs at [http://localhost:3000](http://localhost:3000).

```bash
# Run frontend tests
npm test
```

### Backend (`backend/`)

```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# Start standalone backend server on port 3001
npm run dev     # or: npm start

# Run backend test suite (27 deterministic tests)
npm test

# Run live Gemma 4 API multimodal test
npm run test:live
```

---

## 4. Technology Stack

- **AI Model:** Google Gemma 4 (`models/gemma-4-26b-a4b-it`) via `@google/genai` SDK
- **Frontend Framework:** Next.js 15 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS
- **Data Validation:** Zod
- **Icons:** Lucide React
- **Testing:** Node.js native test runner with `tsx`

---

## 5. Team File Ownership

- **Member 1 (Frontend & UX):** `frontend/src/app/**`, `frontend/src/components/**`, `frontend/src/hooks/**`
- **Member 2 (Gemma 4 API & Backend):** `backend/src/server.ts`, `backend/src/api/analyze/route.ts`, `backend/src/lib/gemma.ts`
- **Member 3 (Specification Generator & Catalog):** `backend/src/lib/specificationGenerator.ts`, `backend/src/lib/libraryCatalog.ts`, `backend/src/lib/promptGenerator.ts`, `backend/src/lib/exporters.ts`
- **Shared Contracts:** `types/analysis.ts`, `types/specification.ts`, `lib/schemas.ts`, `docs/TEAM_CONTRACT.md`
