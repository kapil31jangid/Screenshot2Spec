import { z } from 'zod';

export const confidenceSchema = z.enum(['observed', 'inferred', 'unknown']);

export const componentSchema = z.object({
  id: z.string().min(1, 'Component ID is required'),
  name: z.string().min(1, 'Component name is required'),
  parentId: z.string().nullable(),
  uiType: z.string().min(1, 'UI type is required'),
  purpose: z.string().min(1, 'Purpose is required'),
  observedEvidence: z.string().min(1, 'Observed evidence is required'),
  confidence: confidenceSchema,
  suggestedLibraryId: z.string().nullable(),
});

export const designSchema = z.object({
  colors: z.array(z.string()).default([]),
  typography: z.array(z.string()).default([]),
  spacing: z.array(z.string()).default([]),
});

export const interactionSchema = z.object({
  element: z.string().min(1, 'Element is required'),
  behavior: z.string().min(1, 'Behavior is required'),
  status: z.string().default('assumed'),
});

export const analysisSchema = z.object({
  pageType: z.string().min(1, 'Page type is required'),
  summary: z.string().min(1, 'Summary is required'),
  layout: z.array(z.string()).min(1, 'At least one layout region is required'),
  components: z.array(componentSchema).min(1, 'At least one component is required'),
  design: designSchema,
  interactions: z.array(interactionSchema).default([]),
  assumptions: z.array(z.string()).default([]),
});

export type AnalysisSchemaType = z.infer<typeof analysisSchema>;

export interface HierarchyIntegrityResult {
  isValid: boolean;
  errors: string[];
}

export function validateHierarchyIntegrity(components: z.infer<typeof componentSchema>[]): HierarchyIntegrityResult {
  const errors: string[] = [];
  const idSet = new Set<string>();

  // 1. Check duplicate component IDs
  for (const comp of components) {
    if (idSet.has(comp.id)) {
      errors.push(`Duplicate component ID detected: "${comp.id}"`);
    }
    idSet.add(comp.id);
  }

  // 2. Check unknown parent references
  for (const comp of components) {
    if (comp.parentId !== null && !idSet.has(comp.parentId)) {
      errors.push(`Component "${comp.id}" references non-existent parentId: "${comp.parentId}"`);
    }
  }

  // 3. Check for cycles in parent relationships
  const parentMap = new Map<string, string | null>();
  components.forEach((c) => parentMap.set(c.id, c.parentId));

  for (const comp of components) {
    const visited = new Set<string>();
    let curr: string | null = comp.id;

    while (curr !== null) {
      if (visited.has(curr)) {
        errors.push(`Circular hierarchy reference detected involving component "${curr}"`);
        break;
      }
      visited.add(curr);
      curr = parentMap.get(curr) || null;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

