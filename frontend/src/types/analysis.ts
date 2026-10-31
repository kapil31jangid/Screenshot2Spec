export type ConfidenceLevel = 'observed' | 'inferred' | 'unknown';

export interface DetectedComponent {
  id: string;
  name: string;
  parentId: string | null;
  uiType: string;
  purpose: string;
  observedEvidence: string;
  confidence: ConfidenceLevel;
  suggestedLibraryId: string | null;
}

export interface DesignSystem {
  colors: string[];
  typography: string[];
  spacing: string[];
}

export interface Interaction {
  element: string;
  behavior: string;
  status: string;
}

export interface ValidatedAnalysis {
  pageType: string;
  summary: string;
  layout: string[];
  components: DetectedComponent[];
  design: DesignSystem;
  interactions: Interaction[];
  assumptions: string[];
}

export interface AnalyzeApiResponse {
  analysis?: ValidatedAnalysis;
  error?: string;
  details?: unknown;
}

