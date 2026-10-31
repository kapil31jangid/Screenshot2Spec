import { AnalysisResponse } from '../types/analysis';
import { APPROVED_LIBRARY_CATALOG } from './libraryCatalog';

export interface PromptGeneratorOptions {
  framework?: string;
  styling?: string;
  installationCommands?: string[];
  typescriptOutline?: string;
  suggestedFolderStructure?: string;
}

export function generateMasterCodingPrompt(
  analysis: AnalysisResponse,
  options: PromptGeneratorOptions = {}
): string {
  const framework = options.framework || 'React, TypeScript, Next.js App Router';
  const styling = options.styling || 'Tailwind CSS';

  // Component breakdown
  const componentLines = analysis.components.map((c) => {
    const parentNote = c.parentId ? ` (Parent: ${c.parentId})` : ' (Root Component)';
    const libNote = c.suggestedLibraryId && APPROVED_LIBRARY_CATALOG[c.suggestedLibraryId]
      ? ` -> Recommended Library: ${APPROVED_LIBRARY_CATALOG[c.suggestedLibraryId].name}`
      : '';
    return `- **${c.name}** (\`${c.id}\`)${parentNote}: ${c.purpose}${libNote}\n  *Observed Evidence:* ${c.observedEvidence}`;
  });

  // Collect unique libraries used
  const usedLibraries = new Map<string, string[]>();
  for (const c of analysis.components) {
    if (c.suggestedLibraryId && APPROVED_LIBRARY_CATALOG[c.suggestedLibraryId]) {
      const entry = APPROVED_LIBRARY_CATALOG[c.suggestedLibraryId];
      if (!usedLibraries.has(entry.name)) {
        usedLibraries.set(entry.name, []);
      }
      usedLibraries.get(entry.name)!.push(c.name);
    }
  }

  const libraryUsageLines = Array.from(usedLibraries.entries()).map(([libName, comps]) => {
    return `- **${libName}**: Used for \`${comps.join('`, `')}\``;
  });

  // Installation commands
  const installCommands = options.installationCommands && options.installationCommands.length > 0
    ? options.installationCommands.map(cmd => `\`\`\`bash\n${cmd}\n\`\`\``).join('\n\n')
    : `\`\`\`bash\nnpx shadcn@latest init\nnpm install lucide-react recharts\n\`\`\``;

  // Folder structure
  const folderStructure = options.suggestedFolderStructure || `src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
${analysis.components.map(c => `│   ├── ${c.name}.tsx`).join('\n')}
└── types/
    └── index.ts`;

  // TypeScript outline
  const tsOutline = options.typescriptOutline || `// TypeScript Interfaces
export interface PageData {
  summary: string;
  lastUpdated?: string;
}`;

  return `### AI Coding Implementation Prompt: Recreate UI from Screenshot

#### 1. Role & Implementation Objective
You are a senior React and TypeScript frontend engineer experienced in implementing responsive, maintainable, pixel-accurate user interfaces from visual references.
Your objective is to implement the uploaded interface screenshot for a **${analysis.pageType}** application using the designated stack. Recreate the visible design as closely as practical while following clean, maintainable component architecture.

#### 2. Reference Screenshot Usage
- Use the provided screenshot as your primary source of visual truth.
- Match visible layout proportions, spacing hierarchy, color contrast, and component positioning.
- Do not invent invisible backend APIs, fake database endpoints, or extra features not visible in the screenshot.

#### 3. Technology Stack & Preferences
- **Framework**: ${framework}
- **Styling**: ${styling}
- **Icons**: Lucide React (\`lucide-react\`)
- **Component Primitives**: shadcn/ui where applicable

#### 4. Identified Layout & Component Architecture
The interface is structured into the following primary layout regions:
${analysis.layout.map(r => `- Region: \`${r}\``).join('\n')}

Proposed component breakdown:
${componentLines.join('\n')}

#### 5. Component-Specific Library Recommendations
${libraryUsageLines.length > 0 ? libraryUsageLines.join('\n') : '- Use native Tailwind CSS and HTML5 primitives.'}

#### 6. Dependency Installation Instructions
> **Crucial Instruction**: Inspect the repository's \`package.json\` before running any installation commands. Only install packages that are not already present.

Verified installation commands:
${installCommands}

#### 7. TypeScript Interface Recommendations
Define strong TypeScript interfaces for visible data-driven components using mock data:
\`\`\`typescript
${tsOutline}
\`\`\`

#### 8. Suggested File & Folder Organization
\`\`\`text
${folderStructure}
\`\`\`

#### 9. Design & Styling Instructions
- **Color Palette**: ${analysis.design.colors.length > 0 ? analysis.design.colors.join(', ') : 'Derived from screenshot neutrals and brand accents.'}
- **Typography Scale**: ${analysis.design.typography.length > 0 ? analysis.design.typography.join('; ') : 'Inter or system-ui font scale.'}
- **Spacing & Surfaces**: ${analysis.design.spacing.length > 0 ? analysis.design.spacing.join('; ') : 'Consistent 16px/24px padding with rounded card borders.'}

#### 10. Responsive Behavior
- Desktop: Full sidebar and multi-column grid layout as depicted.
- Tablet / Mobile: Collapse sidebar into an accessible drawer/sheet; stack multi-column grid elements into a single responsive column.

#### 11. Interaction Assumptions
${analysis.interactions.map(it => `- **${it.element}** [${it.status.toUpperCase()}]: ${it.behavior}`).join('\n')}

#### 12. Accessibility Requirements
- Semantic HTML tags (\`<header>\`, \`<aside>\`, \`<main>\`, \`<nav>\`, \`<table>\`).
- Appropriate ARIA labels on icon buttons and navigation elements.
- Accessible keyboard navigation and color contrast ratios (WCAG AA).

#### 13. Implementation Sequence
1. Inspect repository and review existing dependencies.
2. Install only missing verified packages.
3. Define TypeScript models and structured mock data.
4. Build root page layout and grid scaffolding.
5. Implement reusable atomic UI components (cards, buttons, headers).
6. Implement data-driven components (charts, tables, metrics).
7. Apply responsive Tailwind styling and polish visual spacing.
8. Verify TypeScript types and execute \`npm run build\` to ensure zero errors.

#### 14. Validation & Testing Steps
- Visual fidelity check against the reference screenshot.
- Zero TypeScript compiler diagnostics.
- Ensure all hover states, tooltips, and interactive triggers behave gracefully.

#### 15. Expected Deliverables
- Fully working frontend page and component code.
- Reusable component modules with typed props.
- Strongly-typed mock datasets.
- Verification summary of build status.

#### 16. Final Guidance
Do not modify unrelated project configuration or introduce unnecessary dependencies. Prioritize fidelity to the visual reference and adherence to the recommended component architecture.`;
}

