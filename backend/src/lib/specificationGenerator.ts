import { AnalysisResponse, UIComponent } from '../types/analysis';
import { ComponentTreeNode, LibraryRecommendation, Specification } from '../types/specification';
import { APPROVED_LIBRARY_CATALOG } from './libraryCatalog';
import { generateMasterCodingPrompt } from './promptGenerator';

/**
 * Builds a hierarchical tree from a flat array of UI components.
 */
export function buildComponentTree(components: UIComponent[]): ComponentTreeNode[] {
  const nodeMap = new Map<string, ComponentTreeNode>();

  // 1. Initialize nodes
  for (const comp of components) {
    nodeMap.set(comp.id, {
      ...comp,
      children: [],
    });
  }

  const rootNodes: ComponentTreeNode[] = [];

  // 2. Link children to parents
  for (const comp of components) {
    const node = nodeMap.get(comp.id)!;
    if (comp.parentId && nodeMap.has(comp.parentId)) {
      nodeMap.get(comp.parentId)!.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  return rootNodes;
}

/**
 * Derives library recommendations from detected components.
 */
export function deriveLibraryRecommendations(components: UIComponent[]): LibraryRecommendation[] {
  const map = new Map<string, { entry: typeof APPROVED_LIBRARY_CATALOG[string]; comps: string[] }>();

  for (const comp of components) {
    const libId = comp.suggestedLibraryId?.toLowerCase();
    if (libId && APPROVED_LIBRARY_CATALOG[libId]) {
      const entry = APPROVED_LIBRARY_CATALOG[libId];
      if (!map.has(libId)) {
        map.set(libId, { entry, comps: [] });
      }
      map.get(libId)!.comps.push(comp.name);
    }
  }

  const recommendations: LibraryRecommendation[] = [];
  for (const [libId, { entry, comps }] of map.entries()) {
    recommendations.push({
      libraryId: libId,
      name: entry.name,
      packageName: entry.packageName,
      category: entry.category,
      reason: `${entry.recommendedUseCases} (Required for: ${comps.join(', ')})`,
      usedByComponents: Array.from(new Set(comps)),
      isOptional: false,
      docUrl: entry.docUrl,
      installCommand: entry.installCommand || undefined,
    });
  }

  return recommendations;
}

/**
 * Formats package installation commands.
 */
export function generateInstallationCommands(recommendations: LibraryRecommendation[]): {
  packageManager: 'npm';
  commands: string[];
  notes: string[];
} {
  const npmPackages = new Set<string>();
  const shadcnComponents = new Set<string>();

  for (const rec of recommendations) {
    if (rec.libraryId === 'shadcn') {
      shadcnComponents.add('card');
      shadcnComponents.add('button');
      for (const comp of rec.usedByComponents) {
        const cLower = comp.toLowerCase();
        if (cLower.includes('sidebar')) shadcnComponents.add('sidebar');
        if (cLower.includes('dialog') || cLower.includes('modal')) shadcnComponents.add('dialog');
        if (cLower.includes('select')) shadcnComponents.add('select');
        if (cLower.includes('tab')) shadcnComponents.add('tabs');
        if (cLower.includes('table')) shadcnComponents.add('table');
        if (cLower.includes('badge')) shadcnComponents.add('badge');
      }
    } else if (rec.libraryId === 'lucide-react') {
      npmPackages.add('lucide-react');
    } else if (rec.libraryId === 'recharts') {
      npmPackages.add('recharts');
    } else if (rec.libraryId === 'tanstack-table') {
      npmPackages.add('@tanstack/react-table');
    } else if (rec.libraryId === 'react-hook-form') {
      npmPackages.add('react-hook-form');
      npmPackages.add('zod');
      npmPackages.add('@hookform/resolvers');
    } else if (rec.libraryId === 'react-flow') {
      npmPackages.add('@xyflow/react');
    } else if (rec.libraryId === 'motion') {
      npmPackages.add('motion');
    }
  }

  const commands: string[] = [];
  if (shadcnComponents.size > 0) {
    commands.push('npx shadcn@latest init -d');
    commands.push(`npx shadcn@latest add ${Array.from(shadcnComponents).join(' ')}`);
  }
  if (npmPackages.size > 0) {
    commands.push(`npm install ${Array.from(npmPackages).join(' ')}`);
  }

  return {
    packageManager: 'npm',
    commands,
    notes: [
      'Inspect package.json prior to installation to avoid duplicate packages.',
      'All listed libraries are verified against the approved catalog.',
    ],
  };
}

/**
 * Generates TypeScript interface models for components.
 */
export function generateTypescriptOutline(analysis: AnalysisResponse): string {
  const lines: string[] = [
    '// Auto-generated TypeScript data interfaces for detected components',
    '',
    `export interface ${capitalize(analysis.pageType)}State {`,
    '  isLoading: boolean;',
    '  error?: string | null;',
    '}',
    '',
  ];

  for (const comp of analysis.components) {
    const typeLower = comp.uiType.toLowerCase();
    if (typeLower.includes('card') || typeLower.includes('metric')) {
      lines.push(`export interface ${comp.name}Props {`);
      lines.push('  title: string;');
      lines.push('  value: string | number;');
      lines.push('  changeDelta?: string;');
      lines.push('  icon?: React.ReactNode;');
      lines.push('}\n');
    } else if (typeLower.includes('chart')) {
      lines.push(`export interface ${comp.name}DataPoint {`);
      lines.push('  name: string;');
      lines.push('  value: number;');
      lines.push('  secondaryValue?: number;');
      lines.push('}\n');
      lines.push(`export interface ${comp.name}Props {`);
      lines.push(`  data: ${comp.name}DataPoint[];`);
      lines.push('}\n');
    } else if (typeLower.includes('table')) {
      lines.push(`export interface ${comp.name}Row {`);
      lines.push('  id: string;');
      lines.push('  title: string;');
      lines.push('  status: "active" | "pending" | "completed";');
      lines.push('  date: string;');
      lines.push('  amount?: string;');
      lines.push('}\n');
      lines.push(`export interface ${comp.name}Props {`);
      lines.push(`  rows: ${comp.name}Row[];`);
      lines.push('}\n');
    } else {
      lines.push(`export interface ${comp.name}Props {`);
      lines.push('  className?: string;');
      lines.push('  children?: React.ReactNode;');
      lines.push('}\n');
    }
  }

  return lines.join('\n');
}

/**
 * Builds suggested folder structure.
 */
export function generateSuggestedFolderStructure(components: UIComponent[]): string {
  const componentFiles = components.map((c) => `│   ├── ${c.name}.tsx`).join('\n');
  return `src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
${componentFiles}
├── types/
│   └── index.ts
└── lib/
    └── utils.ts`;
}

function capitalize(s: string): string {
  if (!s) return 'Page';
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Main specification generator orchestrator.
 */
export function generateSpecification(analysis: AnalysisResponse): Specification {
  const componentTree = buildComponentTree(analysis.components);
  const libraryRecommendations = deriveLibraryRecommendations(analysis.components);
  const installationCommands = generateInstallationCommands(libraryRecommendations);
  const typescriptOutline = generateTypescriptOutline(analysis);
  const suggestedFolderStructure = generateSuggestedFolderStructure(analysis.components);

  const implementationChecklist = [
    'Initialize or verify Next.js App Router and Tailwind CSS setup.',
    ...installationCommands.commands.map((cmd) => `Execute: ${cmd}`),
    'Create suggested TypeScript interfaces and mock datasets.',
    'Scaffold parent layout container and responsive grid wrappers.',
    ...analysis.components.map((c) => `Implement component: ${c.name} (${c.uiType})`),
    'Apply design tokens (colors, typography, spacing).',
    'Verify responsiveness across desktop, tablet, and mobile breakpoints.',
    'Run TypeScript compiler check (tsc --noEmit) and build verification.',
  ];

  const codingAssistantPrompt = generateMasterCodingPrompt(analysis, {
    installationCommands: installationCommands.commands,
    typescriptOutline,
    suggestedFolderStructure,
  });

  return {
    componentTree,
    designSummary: {
      colors: analysis.design.colors,
      typography: analysis.design.typography,
      spacing: analysis.design.spacing,
      layoutNotes: analysis.layout,
    },
    libraryRecommendations,
    installationCommands,
    suggestedFolderStructure,
    typescriptOutline,
    implementationChecklist,
    codingAssistantPrompt,
    assumptions: analysis.assumptions,
  };
}

