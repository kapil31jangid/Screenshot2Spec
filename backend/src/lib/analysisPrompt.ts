import { APPROVED_LIBRARY_IDS } from './schemas';

export interface AnalysisPromptOptions {
  framework?: string;
  styling?: string;
  instructions?: string;
}

export function buildAnalysisPrompt(options: AnalysisPromptOptions = {}): string {
  const { framework = 'Next.js / React', styling = 'Tailwind CSS', instructions } = options;

  return `You are Gemma 4, an expert multimodal software engineering model.
Your task is to analyze the provided user interface screenshot and produce a structured technical analysis for frontend developers.

TARGET STACK PREFERENCES:
- Target Framework: ${framework}
- Styling System: ${styling}
${instructions ? `- Additional User Instructions: ${instructions}` : ''}

ANALYSIS GUIDELINES:
1. Examine the visual layout, structural hierarchy, UI elements, design system patterns, and interactions.
2. Ground all component claims in visible evidence:
   - Identify visible components (headers, sidebars, grids, cards, tables, charts, buttons, dialogs, forms, etc.). Always identify at least the primary container / layout view (e.g. "MainContainer" or "PageRoot" with parentId: null).
   - Assign clean, descriptive PascalCase names (e.g. "AppSidebar", "MetricCard", "RevenueChart").
   - Assign unique hyphenated lowercase IDs (e.g. "app-sidebar", "revenue-chart", "orders-table").
   - Establish parent-child relationships using "parentId". Top-level layout regions have parentId: null. Nested components reference their parent component's id.
   - For confidence: use "observed" if clearly visible in the screenshot; "inferred" if standard UI convention suggests it; "unknown" if ambiguous.
   - For suggestedLibraryId: choose ONLY from the approved catalog or null if native styling applies:
     Approved catalog IDs: ${APPROVED_LIBRARY_IDS.join(', ')}
3. DO NOT invent invisible elements, hidden backend endpoints, or authentication logic not shown.
4. DO NOT return executable frontend source code (such as JSX or TSX).
5. Document color palette (hex codes or Tailwind color names), typography scale, and spacing observations.
6. Note explicit interactions and mark their status as "observed", "inferred", or "assumed".
7. List any technical assumptions made about responsive behavior, state, or mock data.

OUTPUT FORMAT:
Respond with a SINGLE strictly valid JSON object (enclosed in \`\`\`json ... \`\`\` or as raw JSON) adhering strictly to this schema:

{
  "pageType": "e.g. dashboard | landing_page | form | settings | e-commerce | feed | detail_view",
  "summary": "Clear, concise technical description of the interface purpose and structure",
  "layout": [
    "region-1",
    "region-2"
  ],
  "components": [
    {
      "id": "unique-kebab-id",
      "name": "PascalCaseName",
      "parentId": null,
      "uiType": "e.g. navigation | header | card | chart | table | form | button | modal",
      "purpose": "Brief functional purpose of this component",
      "observedEvidence": "Specific visual evidence observed in screenshot (e.g. 'Vertical dark sidebar with navigation icons on left')",
      "confidence": "observed",
      "suggestedLibraryId": "shadcn"
    }
  ],
  "design": {
    "colors": ["#0f172a", "#ffffff", "#3b82f6"],
    "typography": ["Inter font", "Semibold headers", "Muted small labels"],
    "spacing": ["24px container padding", "16px grid gap"]
  },
  "interactions": [
    {
      "element": "Name of interactive element",
      "behavior": "What occurs upon user interaction",
      "status": "assumed"
    }
  ],
  "assumptions": [
    "Assumption regarding state, responsiveness, or API connections"
  ]
}

Now analyze the screenshot thoroughly and generate the JSON analysis:`;
}

