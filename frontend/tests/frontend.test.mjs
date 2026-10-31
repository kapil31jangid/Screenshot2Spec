import test from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';

// Import schemas and validator
import {
  analysisSchema,
  confidenceSchema,
  validateHierarchyIntegrity,
} from '../src/lib/schemas.ts';

import { mockDashboardAnalysis } from '../src/lib/mockAnalysis.ts';

import {
  buildComponentTree,
  deriveLibraryRecommendations,
  generateCodingAssistantPrompt,
  generateTypescriptOutline,
  generateDeveloperBlueprint,
} from '../src/components/mockSpecAdapter.ts';

import {
  exportImplementationPromptMarkdown,
  exportFrontendSpecificationMarkdown,
  exportDependenciesMarkdown,
  exportComponentTreeJson,
  exportTypeScriptInterfaces,
} from '../src/lib/exporters.ts';

// -------------------------------------------------------------
// 1. File Validation Rules Test
// -------------------------------------------------------------
test('File Validation Logic: Validates format and size rules', () => {
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

  const validateFile = (file) => {
    if (file.size === 0) return { valid: false, error: 'Empty file' };
    if (file.size > MAX_FILE_SIZE_BYTES) return { valid: false, error: 'File too large' };
    const extMatch = ALLOWED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));
    const mimeMatch = ALLOWED_MIME_TYPES.includes(file.type);
    if (!extMatch && !mimeMatch) return { valid: false, error: 'Unsupported format' };
    return { valid: true, error: null };
  };

  // Valid PNG
  assert.equal(validateFile({ name: 'dashboard.png', type: 'image/png', size: 1024 * 500 }).valid, true);
  // Valid WebP
  assert.equal(validateFile({ name: 'mockup.webp', type: 'image/webp', size: 1024 * 1024 }).valid, true);
  // Valid JPEG
  assert.equal(validateFile({ name: 'shot.jpg', type: 'image/jpeg', size: 1024 * 200 }).valid, true);

  // Reject 0-byte file
  const emptyRes = validateFile({ name: 'empty.png', type: 'image/png', size: 0 });
  assert.equal(emptyRes.valid, false);
  assert.equal(emptyRes.error, 'Empty file');

  // Reject file > 5MB
  const largeRes = validateFile({ name: 'huge.png', type: 'image/png', size: 6 * 1024 * 1024 });
  assert.equal(largeRes.valid, false);
  assert.equal(largeRes.error, 'File too large');

  // Reject unsupported format
  const badFormatRes = validateFile({ name: 'document.pdf', type: 'application/pdf', size: 1024 });
  assert.equal(badFormatRes.valid, false);
  assert.equal(badFormatRes.error, 'Unsupported format');
});

// -------------------------------------------------------------
// 2. Zod Shared Schema Validation Test
// -------------------------------------------------------------
test('Zod Schema: Validates shared mock analysis against contract', () => {
  const parseResult = analysisSchema.safeParse(mockDashboardAnalysis);
  assert.equal(parseResult.success, true);
  if (parseResult.success) {
    assert.equal(parseResult.data.pageType, 'dashboard');
    assert.ok(parseResult.data.components.length >= 4);
    assert.ok(parseResult.data.layout.length >= 3);
  }
});

test('Zod Schema: Rejects invalid or incomplete analysis payload', () => {
  const invalidPayload = {
    pageType: 'dashboard',
    // Missing summary
    layout: [], // layout must have at least 1 item
    components: [], // must have at least 1 component
  };

  const parseResult = analysisSchema.safeParse(invalidPayload);
  assert.equal(parseResult.success, false);
});

test('Hierarchy Integrity: Detects duplicate component IDs', () => {
  const components = [
    {
      id: 'sidebar',
      name: 'Sidebar',
      parentId: null,
      uiType: 'navigation',
      purpose: 'Nav',
      observedEvidence: 'Sidebar',
      confidence: 'observed',
      suggestedLibraryId: 'shadcn',
    },
    {
      id: 'sidebar', // Duplicate ID!
      name: 'DuplicateSidebar',
      parentId: null,
      uiType: 'navigation',
      purpose: 'Nav duplicate',
      observedEvidence: 'Sidebar',
      confidence: 'observed',
      suggestedLibraryId: 'shadcn',
    },
  ];

  const integrity = validateHierarchyIntegrity(components);
  assert.equal(integrity.isValid, false);
  assert.ok(integrity.errors.some((e) => e.includes('Duplicate component ID')));
});

test('Hierarchy Integrity: Detects non-existent parentId reference', () => {
  const components = [
    {
      id: 'chart',
      name: 'RevenueChart',
      parentId: 'non-existent-parent',
      uiType: 'chart',
      purpose: 'Chart',
      observedEvidence: 'Chart',
      confidence: 'observed',
      suggestedLibraryId: 'recharts',
    },
  ];

  const integrity = validateHierarchyIntegrity(components);
  assert.equal(integrity.isValid, false);
  assert.ok(integrity.errors.some((e) => e.includes('references non-existent parentId')));
});

// -------------------------------------------------------------
// 3. Component Tree Generator Test
// -------------------------------------------------------------
test('Component Tree: Constructs hierarchical tree from parentId relations', () => {
  const sampleComponents = [
    {
      id: 'page',
      name: 'DashboardPage',
      parentId: null,
      uiType: 'layout',
      purpose: 'Root container',
      observedEvidence: 'Full viewport',
      confidence: 'observed',
      suggestedLibraryId: null,
    },
    {
      id: 'grid',
      name: 'MetricsGrid',
      parentId: 'page',
      uiType: 'grid',
      purpose: 'Metric container',
      observedEvidence: 'Grid area',
      confidence: 'observed',
      suggestedLibraryId: null,
    },
    {
      id: 'card-1',
      name: 'MetricCard',
      parentId: 'grid',
      uiType: 'card',
      purpose: 'Display metric',
      observedEvidence: 'Metric box',
      confidence: 'observed',
      suggestedLibraryId: 'shadcn',
    },
  ];

  const tree = buildComponentTree(sampleComponents);
  assert.equal(tree.length, 1);
  assert.equal(tree[0].id, 'page');
  assert.equal(tree[0].children.length, 1);
  assert.equal(tree[0].children[0].id, 'grid');
  assert.equal(tree[0].children[0].children.length, 1);
  assert.equal(tree[0].children[0].children[0].id, 'card-1');
});

test('Component Tree: Safely handles empty component list', () => {
  const tree = buildComponentTree([]);
  assert.deepEqual(tree, []);
});

// -------------------------------------------------------------
// 4. Library Recommendation Engine Test
// -------------------------------------------------------------
test('Library Matcher: Correctly matches detected components with curated catalog', () => {
  const recommendations = deriveLibraryRecommendations(mockDashboardAnalysis.components);

  // Must include Tailwind CSS
  assert.ok(recommendations.some((r) => r.libraryId === 'tailwind'));
  // Must include shadcn/ui for navigation/cards
  assert.ok(recommendations.some((r) => r.libraryId === 'shadcn'));
  // Must include Recharts for revenue bar chart
  assert.ok(recommendations.some((r) => r.libraryId === 'recharts'));

  // Ensure no duplicate library IDs exist in recommendations
  const libIds = recommendations.map((r) => r.libraryId);
  const uniqueLibIds = new Set(libIds);
  assert.equal(libIds.length, uniqueLibIds.size);
});

// -------------------------------------------------------------
// 5. AI Coding Implementation Prompt Completeness Test
// -------------------------------------------------------------
test('AI Prompt Generator: Implements all 15 mandatory sections from Section 6.2', () => {
  const prompt = generateCodingAssistantPrompt(
    mockDashboardAnalysis,
    'React + TypeScript (Next.js App Router)',
    'Tailwind CSS',
    'Follow accessible dark mode palette'
  );

  const mandatorySections = [
    '## 1. Role and Implementation Objective',
    '## 2. Reference Screenshot Instructions',
    '## 3. Target Framework and Styling Preferences',
    '## 4. Identified Layout and Component Architecture',
    '## 5. Recommended Libraries for Each Component',
    '## 6. Dependency Installation Instructions',
    '## 7. TypeScript Interface Recommendations',
    '## 8. Suggested File and Folder Organization',
    '## 9. Design and Styling Instructions',
    '## 10. Responsive Behavior',
    '## 11. Interaction Assumptions',
    '## 12. Accessibility Requirements',
    '## 13. Implementation Sequence',
    '## 14. Validation and Testing Steps',
    '## 15. Expected Deliverables',
  ];

  mandatorySections.forEach((sectionHeader) => {
    assert.ok(
      prompt.includes(sectionHeader),
      `Generated master prompt is missing mandatory section: "${sectionHeader}"`
    );
  });
});

// -------------------------------------------------------------
// 6. Developer Blueprint Artifact Exporters Test
// -------------------------------------------------------------
test('Blueprint Exporters: Generates valid Markdown, JSON, and TypeScript artifacts', () => {
  const blueprint = generateDeveloperBlueprint(
    mockDashboardAnalysis,
    'React + TypeScript (Next.js App Router)',
    'Tailwind CSS'
  );

  // 1. Implementation Prompt Export
  const promptMd = exportImplementationPromptMarkdown(blueprint);
  assert.ok(promptMd.length > 200);
  assert.ok(promptMd.includes('Role and Implementation Objective'));

  // 2. Frontend Specification Export
  const specMd = exportFrontendSpecificationMarkdown(mockDashboardAnalysis);
  assert.ok(specMd.includes('Frontend Technical Specification'));
  assert.ok(specMd.includes('Component Catalog'));
  assert.ok(specMd.includes('AppSidebar'));

  // 3. Dependencies Plan Export
  const depsMd = exportDependenciesMarkdown(blueprint, mockDashboardAnalysis.pageType);
  assert.ok(depsMd.includes('Dependencies Plan'));
  assert.ok(depsMd.includes('Curated Library Catalog Breakdown'));

  // 4. Component Tree JSON Export
  const treeJsonStr = exportComponentTreeJson(blueprint.componentTree);
  assert.doesNotThrow(() => {
    const parsed = JSON.parse(treeJsonStr);
    assert.ok(Array.isArray(parsed));
  });

  // 5. TypeScript Interfaces Export
  const tsInterfaces = exportTypeScriptInterfaces(blueprint.typescriptOutline);
  assert.ok(tsInterfaces.includes('export interface AppSidebarProps'));
  assert.ok(tsInterfaces.includes('export interface RevenueBarChartProps'));
});

