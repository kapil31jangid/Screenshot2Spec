import { ConfidenceLevel } from './analysis';

export interface ComponentTreeNode {
  id: string;
  name: string;
  parentId: string | null;
  uiType: string;
  purpose: string;
  observedEvidence: string;
  confidence: ConfidenceLevel;
  suggestedLibraryId: string | null;
  children: ComponentTreeNode[];
}

export interface LibraryRecommendation {
  libraryId: string;
  name: string;
  packageName: string;
  category: string;
  reason: string;
  usedByComponents: string[];
  isOptional: boolean;
  docUrl: string;
  installCommand?: string;
}

export interface InstallationInstructions {
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
  commands: string[];
  notes?: string[];
}

export interface Specification {
  componentTree: ComponentTreeNode[];
  designSummary: {
    colors: string[];
    typography: string[];
    spacing: string[];
    layoutNotes: string[];
  };
  libraryRecommendations: LibraryRecommendation[];
  installationCommands: InstallationInstructions;
  suggestedFolderStructure: string;
  typescriptOutline: string;
  implementationChecklist: string[];
  codingAssistantPrompt: string;
  assumptions: string[];
}

