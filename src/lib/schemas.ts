import { z } from 'zod';

export const APPROVED_LIBRARY_IDS = [
  'tailwind',
  'native-html',
  'shadcn',
  'lucide-react',
  'recharts',
  'tanstack-table',
  'react-hook-form',
  'react-flow',
  'motion',
] as const;

export const confidenceSchema = z.enum(['observed', 'inferred', 'unknown']);
export const interactionStatusSchema = z.enum(['observed', 'inferred', 'assumed', 'unknown']);

export const uiComponentSchema = z.object({
  id: z
    .string()
    .min(1, 'Component ID is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Component ID must be alphanumeric and can contain hyphens or underscores'),
  name: z
    .string()
    .min(1, 'Component name is required')
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, 'Component name must be a valid PascalCase identifier'),
  parentId: z.string().nullable(),
  uiType: z.string().min(1, 'UI type is required'),
  purpose: z.string().min(1, 'Component purpose is required'),
  observedEvidence: z.string().min(1, 'Observed visual evidence is required'),
  confidence: confidenceSchema,
  suggestedLibraryId: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || (APPROVED_LIBRARY_IDS as readonly string[]).includes(val.toLowerCase()),
      { message: 'Library is not in the approved library catalog' }
    ),
});

export const designSystemSchema = z.object({
  colors: z.array(z.string()).default([]),
  typography: z.array(z.string()).default([]),
  spacing: z.array(z.string()).default([]),
});

export const uiInteractionSchema = z.object({
  element: z.string().min(1, 'Interaction element is required'),
  behavior: z.string().min(1, 'Interaction behavior description is required'),
  status: interactionStatusSchema.default('assumed'),
});

export const analysisSchema = z.object({
  pageType: z.string().min(1, 'Page type is required'),
  summary: z.string().min(1, 'Summary is required'),
  layout: z.array(z.string()).default(['main-content']),
  components: z.array(uiComponentSchema).default([]),
  design: designSystemSchema.default({ colors: [], typography: [], spacing: [] }),
  interactions: z.array(uiInteractionSchema).default([]),
  assumptions: z.array(z.string()).default([]),
});

export type ValidatedAnalysis = z.infer<typeof analysisSchema>;

export interface HierarchyValidationError {
  code: 'DUPLICATE_ID' | 'UNKNOWN_PARENT' | 'CIRCULAR_HIERARCHY';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Validates component hierarchy integrity:
 * 1. Component IDs are unique.
 * 2. Each parentId is either null or references an existing component.
 * 3. Component hierarchy contains no cycles.
 */
export function validateHierarchyIntegrity(components: z.infer<typeof uiComponentSchema>[]): {
  isValid: boolean;
  errors: HierarchyValidationError[];
} {
  const errors: HierarchyValidationError[] = [];
  const idMap = new Map<string, (typeof components)[0]>();

  // 1. Unique IDs
  for (const comp of components) {
    if (idMap.has(comp.id)) {
      errors.push({
        code: 'DUPLICATE_ID',
        message: `Duplicate component id detected: "${comp.id}"`,
        details: { id: comp.id, name: comp.name },
      });
    } else {
      idMap.set(comp.id, comp);
    }
  }

  // 2. Parent references
  for (const comp of components) {
    if (comp.parentId !== null) {
      if (!idMap.has(comp.parentId)) {
        errors.push({
          code: 'UNKNOWN_PARENT',
          message: `Component "${comp.id}" references non-existent parentId "${comp.parentId}"`,
          details: { id: comp.id, parentId: comp.parentId },
        });
      } else if (comp.parentId === comp.id) {
        errors.push({
          code: 'CIRCULAR_HIERARCHY',
          message: `Component "${comp.id}" cannot be its own parent`,
          details: { id: comp.id },
        });
      }
    }
  }

  // 3. Cycle detection (traverse ancestors up to root)
  for (const comp of components) {
    const visited = new Set<string>([comp.id]);
    let currentParentId = comp.parentId;

    while (currentParentId !== null) {
      if (visited.has(currentParentId)) {
        errors.push({
          code: 'CIRCULAR_HIERARCHY',
          message: `Circular parent relationship detected for component "${comp.id}" involving "${currentParentId}"`,
          details: { cycleStartId: comp.id, cycleAt: currentParentId },
        });
        break;
      }
      visited.add(currentParentId);
      const parent = idMap.get(currentParentId);
      currentParentId = parent ? parent.parentId : null;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Full parser and validator for Gemma JSON output.
 */
export function parseAndValidateAnalysis(rawJson: unknown): {
  success: boolean;
  data?: ValidatedAnalysis;
  errors?: string[];
} {
  const result = analysisSchema.safeParse(rawJson);
  if (!result.success) {
    const issues = result.error.issues.map((iss) => `${iss.path.join('.')}: ${iss.message}`);
    return { success: false, errors: issues };
  }

  const hierarchyCheck = validateHierarchyIntegrity(result.data.components);
  if (!hierarchyCheck.isValid) {
    return {
      success: false,
      errors: hierarchyCheck.errors.map((e) => `${e.code}: ${e.message}`),
    };
  }

  return { success: true, data: result.data };
}
