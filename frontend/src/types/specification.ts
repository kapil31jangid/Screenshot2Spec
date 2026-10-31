import { DetectedComponent, DesignSystem } from './analysis';

export interface ComponentTreeNode extends DetectedComponent {
  children?: ComponentTreeNode[];
}

export interface LibraryRecommendation {
  libraryId: string;
  libraryName: string;
  packageName: string;
  relevantComponent: string;
  purpose: string;
  reason: string;
  isRequired: boolean;
  installationCommand: string;
  docsUrl: string;
}

export interface DeveloperBlueprint {
  componentTree: ComponentTreeNode[];
  designSummary: DesignSystem;
  libraryRecommendations: LibraryRecommendation[];
  installationCommands: string[];
  suggestedFolderStructure: string;
  typescriptOutline: string;
  implementationChecklist: string[];
  codingAssistantPrompt: string;
  assumptions: string[];
}

