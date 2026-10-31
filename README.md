# Screenshot2Spec — From Screenshot to Implementation-Ready AI Coding Prompt

> **Tagline:** See It. Specify It. Build It.  
> **Category:** Best Use of Gemma 4  
> **AI Model:** Gemma 4 via Google AI Studio API (`gemma-4-26b-a4b-it`)

---

## 1. Overview
**Screenshot2Spec** is a multimodal AI-powered developer productivity platform that converts user interface screenshots into comprehensive, implementation-ready development blueprints.

While screenshots demonstrate visual appearance, they do not describe component architecture, required libraries, data models, responsive behavior, or implementation sequences. Screenshot2Spec bridges this gap by combining Gemma 4 multimodal vision analysis with a deterministic specification and prompt generation engine.

---

## 2. Core Architecture & Processing Flow
1. **Screenshot Upload & Input Validation:** User provides a UI screenshot (PNG, JPG, WebP $\le$ 5 MB) with framework/styling preferences.
2. **Gemma 4 Multimodal Analysis:** Analyzes layout regions, components, design tokens, interactions, and assumptions grounded strictly in visual evidence.
3. **Structured Validation with Zod:** Validates model JSON output against schema rules and checks component hierarchy integrity (no duplicate IDs, dangling parents, or circular references).
4. **Intelligent Library Recommendation:** Maps detected components to curated, approved libraries (`shadcn/ui`, `recharts`, `lucide-react`, `tanstack-table`, `react-hook-form`, `react-flow`, `motion`).
5. **Implementation-Ready AI Prompt Generation:** Assembles a complete, 16-section implementation prompt ready to paste into AI coding assistants (Google Antigravity, Cursor, Codex, Claude Code).
6. **Multi-Format Export:** Generates downloadable Markdown specifications, dependency plans, TypeScript data interfaces, and JSON component trees.

---

## 3. Technology Stack
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Model:** Gemma 4 (`gemma-4-26b-a4b-it`) via Google AI Studio API
- **AI SDK:** Official `@google/genai` SDK
- **Data Validation:** Zod
- **Icons:** Lucide React
- **Testing:** Node.js native test runner with `tsx`

---

## 4. Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Google AI Studio API key:
```env
GEMINI_API_KEY=your_actual_api_key_here
GEMMA_MODEL=gemma-4-26b-a4b-it
```

---

## 5. API Specification

### `POST /api/analyze`
Accepts `multipart/form-data`:
- `screenshot`: Image file (required, PNG/JPG/WebP, $\le$ 5 MB)
- `framework`: string (e.g. "Next.js / React")
- `styling`: string (e.g. "Tailwind CSS")
- `instructions`: string (optional, $\le$ 2000 characters)

**Success Response (200 OK):**
```json
{
  "analysis": {
    "pageType": "dashboard",
    "summary": "...",
    "layout": ["sidebar", "header", "content"],
    "components": [...],
    "design": { "colors": [...], "typography": [...], "spacing": [...] },
    "interactions": [...],
    "assumptions": [...]
  }
}
```

---

## 6. Running Tests & Production Build
```bash
# Run unit & integration test suite
npm test

# Run Next.js production build
npm run build
```
