import { ValidatedAnalysis } from '../types/analysis';
import { DeveloperBlueprint, ComponentTreeNode } from '../types/specification';

export function exportImplementationPromptMarkdown(blueprint: DeveloperBlueprint): string {
  return blueprint.codingAssistantPrompt;
}

export function exportFrontendSpecificationMarkdown(analysis: ValidatedAnalysis): string {
  return `# Frontend Technical Specification: ${analysis.pageType}

## Executive Summary
${analysis.summary}

## Identified Layout Structure
${analysis.layout.map((l) => `- **${l}**`).join('\n')}

## Component Catalog
${analysis.components
  .map(
    (c) => `### ${c.name} (\`${c.uiType}\`)
- **ID:** \`${c.id}\`
- **Parent ID:** ${c.parentId ? `\`${c.parentId}\`` : 'None (Root)'}
- **Confidence:** ${c.confidence}
- **Purpose:** ${c.purpose}
- **Observed Evidence:** ${c.observedEvidence}
- **Suggested Library:** ${c.suggestedLibraryId || 'None'}
`
  )
  .join('\n')}

## Design System Tokens
- **Colors:** ${analysis.design.colors.join(', ')}
- **Typography Rules:** ${analysis.design.typography.join('; ')}
- **Spacing System:** ${analysis.design.spacing.join('; ')}

## Inferred Behaviors & Assumptions
${analysis.assumptions.map((a) => `- ${a}`).join('\n')}
`;
}

export function exportDependenciesMarkdown(blueprint: DeveloperBlueprint, pageType: string): string {
  return `# Dependencies Plan: ${pageType}

## Required Package Installation
\`\`\`bash
${blueprint.installationCommands.join('\n')}
\`\`\`

## Curated Library Catalog Breakdown
${blueprint.libraryRecommendations
  .map(
    (l) => `### ${l.libraryName} (\`${l.packageName}\`)
- **Status:** ${l.isRequired ? 'Required' : 'Optional'}
- **Relevant Component:** \`${l.relevantComponent}\`
- **Purpose:** ${l.purpose}
- **Selection Rationale:** ${l.reason}
- **Documentation:** ${l.docsUrl}
`
  )
  .join('\n')}
`;
}

export function exportComponentTreeJson(componentTree: ComponentTreeNode[]): string {
  return JSON.stringify(componentTree, null, 2);
}

export function exportTypeScriptInterfaces(typescriptOutline: string): string {
  return typescriptOutline;
}
