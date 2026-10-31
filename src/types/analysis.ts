export type ConfidenceLevel = 'observed' | 'inferred' | 'unknown';

export type InteractionStatus = 'observed' | 'inferred' | 'assumed' | 'unknown';

export interface UIComponent {
  id: string;
  name: string;
  parentId: string | null;
  uiType: string;
  purpose: string;
  observedEvidence: string;
  confidence: ConfidenceLevel;
  suggestedLibraryId: string | null;
}

export interface DesignSystemSpecs {
  colors: string[];
  typography: string[];
  spacing: string[];
}

export interface UIInteraction {
  element: string;
  behavior: string;
  status: InteractionStatus;
}

export interface AnalysisResponse {
  pageType: string;
  summary: string;
  layout: string[];
  components: UIComponent[];
  design: DesignSystemSpecs;
  interactions: UIInteraction[];
  assumptions: string[];
}

export interface AnalyzeApiSuccessResponse {
  analysis: AnalysisResponse;
}

export interface AnalyzeApiErrorResponse {
  error: string;
  details?: string | string[];
}
