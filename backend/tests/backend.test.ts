import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analysisSchema,
  parseAndValidateAnalysis,
  validateHierarchyIntegrity,
  APPROVED_LIBRARY_IDS,
} from '../src/lib/schemas';
import { mockDashboardAnalysis } from '../src/lib/mockAnalysis';
import {
  buildComponentTree,
  deriveLibraryRecommendations,
  generateInstallationCommands,
  generateSpecification,
  generateTypescriptOutline,
} from '../src/lib/specificationGenerator';
import { matchComponentToLibrary } from '../src/lib/libraryCatalog';
import {
  exportComponentTreeJson,
  exportDependencyPlanMarkdown,
  exportPromptMarkdown,
  exportSpecificationMarkdown,
  exportTypeScriptInterfaces,
} from '../src/lib/exporters';
import { buildAnalysisPrompt } from '../src/lib/analysisPrompt';
import { extractCleanJson } from '../src/lib/gemma';

describe('Screenshot2Spec Backend & Specification Engine', () => {
  describe('Zod Schemas & Mock Analysis', () => {
    it('validates mockDashboardAnalysis without errors', () => {
      const validation = parseAndValidateAnalysis(mockDashboardAnalysis);
      assert.equal(validation.success, true, 'Mock analysis must be valid');
      assert.ok(validation.data);
      assert.equal(validation.data.pageType, 'dashboard');
    });

    it('rejects analysis with missing required fields', () => {
      const invalid = { summary: 'Missing pageType and components' };
      const validation = parseAndValidateAnalysis(invalid);
      assert.equal(validation.success, false);
      assert.ok(validation.errors && validation.errors.length > 0);
    });

    it('rejects unsupported library IDs', () => {
      const invalidWithFakeLib = {
        ...mockDashboardAnalysis,
        components: [
          {
            ...mockDashboardAnalysis.components[0],
            suggestedLibraryId: 'completely-invented-package-123',
          },
        ],
      };
      const validation = parseAndValidateAnalysis(invalidWithFakeLib);
      assert.equal(validation.success, false);
      assert.ok(
        validation.errors?.some((e) => e.includes('approved library catalog')),
        'Should report non-approved library ID'
      );
    });
  });

  describe('Component Hierarchy Integrity Checks', () => {
    it('detects duplicate component IDs', () => {
      const duplicateComponents = [
        {
          id: 'card-1',
          name: 'MetricCardOne',
          parentId: null,
          uiType: 'card',
          purpose: 'Show metric',
          observedEvidence: 'Top left card',
          confidence: 'observed' as const,
          suggestedLibraryId: 'shadcn',
        },
        {
          id: 'card-1',
          name: 'MetricCardTwo',
          parentId: null,
          uiType: 'card',
          purpose: 'Show another metric',
          observedEvidence: 'Top right card',
          confidence: 'observed' as const,
          suggestedLibraryId: 'shadcn',
        },
      ];

      const result = validateHierarchyIntegrity(duplicateComponents);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.code === 'DUPLICATE_ID'));
    });

    it('detects unknown parentId references', () => {
      const danglingParent = [
        {
          id: 'card-1',
          name: 'MetricCard',
          parentId: 'non-existent-parent',
          uiType: 'card',
          purpose: 'Show metric',
          observedEvidence: 'Card in grid',
          confidence: 'observed' as const,
          suggestedLibraryId: 'shadcn',
        },
      ];

      const result = validateHierarchyIntegrity(danglingParent);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.some((e) => e.code === 'UNKNOWN_PARENT'));
    });

    it('detects circular parent references (self-parent and indirect cycle)', () => {
      const selfParent = [
        {
          id: 'node-a',
          name: 'NodeA',
          parentId: 'node-a',
          uiType: 'card',
          purpose: 'Cycle test',
          observedEvidence: 'Cycle test',
          confidence: 'observed' as const,
          suggestedLibraryId: null,
        },
      ];

      const selfResult = validateHierarchyIntegrity(selfParent);
      assert.equal(selfResult.isValid, false);
      assert.ok(selfResult.errors.some((e) => e.code === 'CIRCULAR_HIERARCHY'));

      const indirectCycle = [
        {
          id: 'node-1',
          name: 'NodeOne',
          parentId: 'node-2',
          uiType: 'container',
          purpose: 'Test',
          observedEvidence: 'Test',
          confidence: 'observed' as const,
          suggestedLibraryId: null,
        },
        {
          id: 'node-2',
          name: 'NodeTwo',
          parentId: 'node-1',
          uiType: 'container',
          purpose: 'Test',
          observedEvidence: 'Test',
          confidence: 'observed' as const,
          suggestedLibraryId: null,
        },
      ];

      const indirectResult = validateHierarchyIntegrity(indirectCycle);
      assert.equal(indirectResult.isValid, false);
      assert.ok(indirectResult.errors.some((e) => e.code === 'CIRCULAR_HIERARCHY'));
    });
  });

  describe('Library Matching and Catalog', () => {
    it('matches known UI types conservatively to approved libraries', () => {
      assert.equal(matchComponentToLibrary('chart', 'revenue line chart'), 'recharts');
      assert.equal(matchComponentToLibrary('icon', 'menu indicator icon'), 'lucide-react');
      assert.equal(matchComponentToLibrary('sidebar', 'app navigation links'), 'shadcn');
      assert.equal(matchComponentToLibrary('table', 'interactive searchable data table with sorting'), 'tanstack-table');
      assert.equal(matchComponentToLibrary('form', 'user registration form with input validation'), 'react-hook-form');
      assert.equal(matchComponentToLibrary('workflow', 'interactive node diagram editor'), 'react-flow');
    });

    it('deduplicates package installation commands', () => {
      const recs = deriveLibraryRecommendations(mockDashboardAnalysis.components);
      const install = generateInstallationCommands(recs);

      assert.ok(install.commands.length > 0);
      assert.ok(install.commands.some((c) => c.includes('npx shadcn@latest')));
      assert.ok(install.commands.some((c) => c.includes('npm install')));

      // Check deduplication
      const allTokens = install.commands.join(' ').split(/\s+/);
      const rechartsCount = allTokens.filter((t) => t === 'recharts').length;
      assert.equal(rechartsCount, 1, 'recharts package should only be installed once');
    });
  });

  describe('Specification & Master Coding Prompt Generation', () => {
    it('generates a full specification tree and prompt', () => {
      const spec = generateSpecification(mockDashboardAnalysis);

      assert.ok(spec.componentTree.length > 0, 'Component tree should contain root nodes');
      const metricsGrid = spec.componentTree.find((n) => n.id === 'metrics-grid');
      assert.ok(metricsGrid, 'Metrics grid should be in tree');
      assert.ok(metricsGrid.children.length >= 2, 'Metrics grid should have child cards nested');

      // Check prompt sections
      const prompt = spec.codingAssistantPrompt;
      assert.ok(prompt.includes('Role & Implementation Objective'));
      assert.ok(prompt.includes('Reference Screenshot Usage'));
      assert.ok(prompt.includes('Technology Stack & Preferences'));
      assert.ok(prompt.includes('Identified Layout & Component Architecture'));
      assert.ok(prompt.includes('Component-Specific Library Recommendations'));
      assert.ok(prompt.includes('Dependency Installation Instructions'));
      assert.ok(prompt.includes('TypeScript Interface Recommendations'));
      assert.ok(prompt.includes('Suggested File & Folder Organization'));
      assert.ok(prompt.includes('Design & Styling Instructions'));
      assert.ok(prompt.includes('Responsive Behavior'));
      assert.ok(prompt.includes('Interaction Assumptions'));
      assert.ok(prompt.includes('Accessibility Requirements'));
      assert.ok(prompt.includes('Implementation Sequence'));
      assert.ok(prompt.includes('Validation & Testing Steps'));
      assert.ok(prompt.includes('Expected Deliverables'));
      assert.ok(prompt.includes('Final Guidance'));
    });

    it('produces valid TypeScript outline', () => {
      const tsOutline = generateTypescriptOutline(mockDashboardAnalysis);
      assert.ok(tsOutline.includes('export interface DashboardState'));
      assert.ok(tsOutline.includes('export interface RevenueChartProps'));
      assert.ok(tsOutline.includes('export interface RecentOrdersTableRow'));
    });
  });

  describe('Exporters', () => {
    it('exports Markdown, JSON, and TypeScript properly', () => {
      const spec = generateSpecification(mockDashboardAnalysis);

      const promptMd = exportPromptMarkdown(spec);
      assert.ok(promptMd.startsWith('### AI Coding Implementation Prompt'));

      const specMd = exportSpecificationMarkdown(mockDashboardAnalysis, spec);
      assert.ok(specMd.includes('# Frontend Technical Specification: DASHBOARD'));
      assert.ok(specMd.includes('Component Inventory'));

      const depMd = exportDependencyPlanMarkdown(spec);
      assert.ok(depMd.includes('# Dependency Installation Plan'));
      assert.ok(depMd.includes('npx shadcn@latest'));

      const treeJson = exportComponentTreeJson(spec);
      const parsedTree = JSON.parse(treeJson);
      assert.ok(Array.isArray(parsedTree));

      const tsCode = exportTypeScriptInterfaces(spec);
      assert.ok(tsCode.includes('interface'));
    });
  });

  describe('Prompt Builder and JSON Sanitizer', () => {
    it('builds a customized analysis prompt with options', () => {
      const prompt = buildAnalysisPrompt({
        framework: 'Next.js App Router',
        styling: 'Tailwind CSS',
        instructions: 'Use dark theme with slate backgrounds',
      });
      assert.ok(prompt.includes('Next.js App Router'));
      assert.ok(prompt.includes('Use dark theme with slate backgrounds'));
      assert.ok(prompt.includes('Approved catalog IDs:'));
    });

    it('extracts raw JSON when wrapped in markdown fences or plain', () => {
      const fenced = '```json\n{"pageType": "dashboard"}\n```';
      assert.equal(extractCleanJson(fenced), '{"pageType": "dashboard"}');

      const plain = '{"pageType": "dashboard"}';
      assert.equal(extractCleanJson(plain), '{"pageType": "dashboard"}');

      const withPreamble = 'Here is the analysis:\n```json\n{"pageType": "dashboard"}\n```\nHope it helps!';
      assert.equal(extractCleanJson(withPreamble), '{"pageType": "dashboard"}');
    });
  });
});
