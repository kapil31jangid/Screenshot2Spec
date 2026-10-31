import { ValidatedAnalysis, DetectedComponent } from '../types/analysis';
import { DeveloperBlueprint, ComponentTreeNode, LibraryRecommendation } from '../types/specification';

/**
 * Builds a hierarchical component tree from flat component list using parentId.
 */
export function buildComponentTree(components: DetectedComponent[]): ComponentTreeNode[] {
  if (!components || components.length === 0) return [];

  const nodeMap = new Map<string, ComponentTreeNode>();

  // Initialize nodes
  components.forEach((c) => {
    nodeMap.set(c.id, { ...c, children: [] });
  });

  const roots: ComponentTreeNode[] = [];

  // Assign children to parents
  components.forEach((c) => {
    const node = nodeMap.get(c.id)!;
    if (c.parentId && nodeMap.has(c.parentId)) {
      nodeMap.get(c.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/**
 * Generates curated library recommendations based on detected UI types and suggested library IDs.
 */
export function deriveLibraryRecommendations(components: DetectedComponent[]): LibraryRecommendation[] {
  const recommendations: LibraryRecommendation[] = [];
  const added = new Set<string>();

  components.forEach((comp) => {
    const libId = comp.suggestedLibraryId?.toLowerCase() || '';
    const uiType = comp.uiType?.toLowerCase() || '';

    if ((libId === 'shadcn' || uiType === 'card' || uiType === 'navigation' || uiType === 'modal' || uiType === 'dialog' || uiType === 'header') && !added.has('shadcn')) {
      added.add('shadcn');
      recommendations.push({
        libraryId: 'shadcn',
        libraryName: 'shadcn/ui',
        packageName: 'shadcn',
        relevantComponent: comp.name,
        purpose: 'Provides accessible, customizable UI primitives (Card, Button, Dialog, Navigation).',
        reason: `Matched for detected ${comp.uiType} element "${comp.name}".`,
        isRequired: true,
        installationCommand: 'npx shadcn@latest init && npx shadcn@latest add card button sidebar dialog',
        docsUrl: 'https://ui.shadcn.com/docs',
      });
    }

    if ((libId === 'recharts' || uiType === 'chart') && !added.has('recharts')) {
      added.add('recharts');
      recommendations.push({
        libraryId: 'recharts',
        libraryName: 'Recharts',
        packageName: 'recharts',
        relevantComponent: comp.name,
        purpose: 'Renders composable, responsive SVG charts with interactive tooltips.',
        reason: `Matched for visual data metric "${comp.name}".`,
        isRequired: true,
        installationCommand: 'npm install recharts',
        docsUrl: 'https://recharts.org',
      });
    }

    if ((libId === 'lucide-react' || libId === 'lucide' || uiType === 'icon' || comp.purpose.toLowerCase().includes('icon')) && !added.has('lucide-react')) {
      added.add('lucide-react');
      recommendations.push({
        libraryId: 'lucide-react',
        libraryName: 'Lucide React',
        packageName: 'lucide-react',
        relevantComponent: comp.name,
        purpose: 'Consistent, accessible icon set with tree-shaking support.',
        reason: `Matched for interface icon representation in "${comp.name}".`,
        isRequired: true,
        installationCommand: 'npm install lucide-react',
        docsUrl: 'https://lucide.dev',
      });
    }

    if ((libId === 'tanstack-table' || libId === 'react-table' || (uiType === 'table' && comp.purpose.toLowerCase().includes('advanced'))) && !added.has('tanstack-table')) {
      added.add('tanstack-table');
      recommendations.push({
        libraryId: 'tanstack-table',
        libraryName: 'TanStack Table',
        packageName: '@tanstack/react-table',
        relevantComponent: comp.name,
        purpose: 'Headless table logic for sorting, pagination, and data filtering.',
        reason: `Matched for complex tabular layout "${comp.name}".`,
        isRequired: false,
        installationCommand: 'npm install @tanstack/react-table',
        docsUrl: 'https://tanstack.com/table',
      });
    }
  });

  // Always include Tailwind CSS
  if (!added.has('tailwind')) {
    recommendations.unshift({
      libraryId: 'tailwind',
      libraryName: 'Tailwind CSS',
      packageName: 'tailwindcss',
      relevantComponent: 'Global Layout & Spacing',
      purpose: 'Utility-first CSS framework for rapid responsive design.',
      reason: 'Standard styling layer configured in the project foundation.',
      isRequired: true,
      installationCommand: 'Configured in target project setup.',
      docsUrl: 'https://tailwindcss.com/docs',
    });
  }

  return recommendations;
}

/**
 * Creates TypeScript interface declarations from detected data elements.
 */
export function generateTypescriptOutline(analysis: ValidatedAnalysis): string {
  const codeLines: string[] = [
    '// =========================================',
    '// Auto-Generated TypeScript Interfaces for UI',
    `// Page Type: ${analysis.pageType}`,
    '// =========================================',
    '',
  ];

  analysis.components.forEach((c) => {
    codeLines.push(`export interface ${c.name}Props {`);
    codeLines.push(`  className?: string;`);
    codeLines.push(`  /** ${c.purpose} */`);

    if (c.uiType === 'card' || c.uiType === 'metric') {
      codeLines.push(`  title?: string;`);
      codeLines.push(`  value?: string | number;`);
      codeLines.push(`  changePercentage?: number;`);
    } else if (c.uiType === 'chart') {
      codeLines.push(`  data?: Array<Record<string, unknown>>;`);
      codeLines.push(`  height?: number;`);
    } else if (c.uiType === 'table') {
      codeLines.push(`  items?: Array<Record<string, unknown>>;`);
      codeLines.push(`  isLoading?: boolean;`);
    } else if (c.uiType === 'navigation') {
      codeLines.push(`  activeRoute?: string;`);
      codeLines.push(`  onNavigate?: (route: string) => void;`);
    }

    codeLines.push('}');
    codeLines.push('');
  });

  return codeLines.join('\n');
}

/**
 * Assembles a comprehensive master coding prompt containing all 15 mandatory sections
 * specified in Section 6.2 of Screenshot2Spec.pdf.
 */
export function generateCodingAssistantPrompt(
  analysis: ValidatedAnalysis,
  framework: string,
  styling: string,
  instructions: string
): string {
  const compNames = analysis.components
    .map((c) => `- \`${c.name}\` (${c.uiType}): ${c.purpose} (Parent: ${c.parentId ? `\`${c.parentId}\`` : 'None'})`)
    .join('\n');
  const layoutRegions = analysis.layout.map((l) => `- ${l}`).join('\n');
  const assumptionsList = analysis.assumptions.map((a) => `- ${a}`).join('\n');
  const tsOutline = generateTypescriptOutline(analysis);

  return `# Master Frontend Implementation Blueprint

## 1. Role and Implementation Objective
You are a senior React and TypeScript frontend engineer experienced in implementing responsive, maintainable interfaces from visual references.
Your objective is to implement the uploaded interface screenshot using the selected technology stack (**${framework}** and **${styling}**).
Recreate the visible design as faithfully as practical while enforcing maintainable component architecture.

## 2. Reference Screenshot Instructions
Use the uploaded user interface screenshot as the primary visual reference for:
- Spatial alignment and grid layout
- Color contrast, surface elevations, and borders
- Component hierarchies and typography sizing
- Visual hierarchy of primary, secondary, and tertiary elements

## 3. Target Framework and Styling Preferences
- **Framework:** ${framework}
- **Styling Solution:** ${styling}
${instructions ? `- **Developer Instructions & Constraints:** ${instructions}` : ''}

## 4. Identified Layout and Component Architecture
### Layout Regions
${layoutRegions}

### Component Architecture Breakdown
${compNames}

## 5. Recommended Libraries for Each Component
- **Layout & Typography:** Tailwind CSS for grid, flexbox, and responsive utility styling.
- **Navigation & Interactive Primitives:** shadcn/ui for Button, Card, Sidebar, and Dialog components.
- **Analytics & Data Visualizations:** Recharts for chart containers and SVG data points.
- **Icons:** Lucide React for consistent and accessible iconography.
- **Tables & Lists:** Native HTML semantic elements unless sorting/filtering demands TanStack Table.

## 6. Dependency Installation Instructions
Before writing code, inspect \`package.json\` and install missing required packages only:
\`\`\`bash
npx shadcn@latest init
npx shadcn@latest add card button sidebar dialog
npm install lucide-react recharts
\`\`\`

## 7. TypeScript Interface Recommendations
\`\`\`typescript
${tsOutline}
\`\`\`

## 8. Suggested File and Folder Organization
\`\`\`
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
${analysis.components.map((c) => `│   ├── ${c.name}.tsx`).join('\n')}
├── types/
│   └── ${analysis.pageType}.types.ts
└── lib/
    └── utils.ts
\`\`\`

## 9. Design and Styling Instructions
- **Color Palette:** ${analysis.design.colors.join(', ')}
- **Typography Scale:** ${analysis.design.typography.join('; ')}
- **Spacing Guidelines:** ${analysis.design.spacing.join('; ')}

## 10. Responsive Behavior
- **Mobile (<768px):** Navigation collapses to sliding drawer or bottom bar; metric cards stack in a single column (1 col); charts adjust width dynamically (100%).
- **Tablet (768px - 1024px):** 2-column card grid; condensed sidebar.
- **Desktop (1024px+):** Full 4-column metric grid; fixed persistent sidebar; expanded layout.

## 11. Interaction Assumptions
${assumptionsList}

## 12. Accessibility Requirements
- All interactive controls must be keyboard operable with visible focus states (\`focus-visible:ring-2\`).
- Ensure contrast ratio >= 4.5:1 for body copy and >= 3:1 for large headings against background.
- Semantic HTML tags: \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<table>\`.
- All icon-only buttons must have descriptive \`aria-label\` attributes.

## 13. Implementation Sequence
1. Review existing repository dependencies and install verified packages.
2. Setup TypeScript interfaces and typed mock datasets for data-driven components.
3. Construct the outer responsive page layout shell (desktop and mobile).
4. Implement reusable presentation components using Tailwind CSS and recommended UI primitives.
5. Populate interactive elements (charts, tables, cards) with realistic mock data.
6. Verify keyboard accessibility and responsive viewport scaling.
7. Run type checking (\`npx tsc --noEmit\`) and production build verification.

## 14. Validation and Testing Steps
- Visual fidelity test: compare rendered components against screenshot.
- TypeScript test: execute \`npx tsc --noEmit\` with zero errors.
- Build test: execute \`npm run build\` to verify server-side rendering (SSR) compatibility.
- Responsive test: check 320px, 375px, 768px, and 1280px screen widths.

## 15. Expected Deliverables
- Working Next.js App Router page and subcomponents.
- Type-safe component definitions and props.
- Mobile-responsive layout matching the uploaded screenshot.`;
}

/**
 * Specification generator adapter that implements DeveloperBlueprint generation.
 */
export function generateDeveloperBlueprint(
  analysis: ValidatedAnalysis,
  framework = 'React + TypeScript (Next.js App Router)',
  styling = 'Tailwind CSS',
  instructions = ''
): DeveloperBlueprint {
  const tree = buildComponentTree(analysis.components);
  const libs = deriveLibraryRecommendations(analysis.components);
  const tsOutline = generateTypescriptOutline(analysis);
  const prompt = generateCodingAssistantPrompt(analysis, framework, styling, instructions);

  const installCommands = Array.from(
    new Set(libs.map((l) => l.installationCommand).filter((cmd) => cmd.startsWith('npm') || cmd.startsWith('npx')))
  );

  const folderStructure = `src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
${analysis.components.map((c) => `│   ├── ${c.name}.tsx`).join('\n')}
├── types/
│   └── ${analysis.pageType}.types.ts
└── lib/
    └── utils.ts`;

  const implementationChecklist = [
    'Install approved dependencies (Lucide React, shadcn/ui primitives, Recharts)',
    'Configure responsive grid layout for desktop (1280px+) and mobile (<768px)',
    'Implement navigation and header chrome with accessibility attributes',
    'Build reusable card and metric display widgets',
    'Wire data visualizer / chart component with typed mock datasets',
    'Add tab navigation and interaction hover states',
    'Run TypeScript compiler (`npx tsc --noEmit`) and fix prop mismatches',
  ];

  return {
    componentTree: tree,
    designSummary: analysis.design,
    libraryRecommendations: libs,
    installationCommands: installCommands,
    suggestedFolderStructure: folderStructure,
    typescriptOutline: tsOutline,
    implementationChecklist,
    codingAssistantPrompt: prompt,
    assumptions: analysis.assumptions,
  };
}
