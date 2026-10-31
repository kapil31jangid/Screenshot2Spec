import { Specification } from '../types/specification';
import { AnalysisResponse } from '../types/analysis';

/**
 * Returns the Master Implementation Prompt Markdown.
 */
export function exportPromptMarkdown(specification: Specification): string {
  return specification.codingAssistantPrompt;
}

/**
 * Returns a complete Frontend Specification Markdown document.
 */
export function exportSpecificationMarkdown(
  analysis: AnalysisResponse,
  specification: Specification
): string {
  const compRows = analysis.components
    .map(
      (c) =>
        `| \`${c.id}\` | **${c.name}** | \`${c.uiType}\` | ${c.parentId ? `\`${c.parentId}\`` : '*Root*'} | ${c.purpose} | ${c.confidence} | \`${c.suggestedLibraryId || 'none'}\` |`
    )
    .join('\n');

  const libRows = specification.libraryRecommendations
    .map(
      (lib) =>
        `| **${lib.name}** | \`${lib.packageName}\` | ${lib.category} | ${lib.usedByComponents.join(', ')} | [Docs](${lib.docUrl}) |`
    )
    .join('\n');

  return `# Frontend Technical Specification: ${analysis.pageType.toUpperCase()}

**Summary:** ${analysis.summary}

---

## 1. Layout & Architecture
- **Primary Layout Regions:** ${analysis.layout.join(', ')}

### Component Inventory
| ID | Name | UI Type | Parent | Purpose | Confidence | Library |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${compRows}

---

## 2. Design System Tokens
- **Colors:** ${analysis.design.colors.join(', ')}
- **Typography:** ${analysis.design.typography.join('; ')}
- **Spacing:** ${analysis.design.spacing.join('; ')}

---

## 3. Recommended Libraries
| Library | Package | Category | Used By Components | Documentation |
| :--- | :--- | :--- | :--- | :--- |
${libRows}

---

## 4. Implementation Checklist
${specification.implementationChecklist.map((item, idx) => `${idx + 1}. [ ] ${item}`).join('\n')}

---

## 5. Technical Assumptions
${specification.assumptions.map((ass) => `- ${ass}`).join('\n')}
`;
}

/**
 * Returns Dependency Installation Plan Markdown.
 */
export function exportDependencyPlanMarkdown(specification: Specification): string {
  const cmdBlocks = specification.installationCommands.commands
    .map((cmd) => `\`\`\`bash\n${cmd}\n\`\`\``)
    .join('\n\n');

  const libDetails = specification.libraryRecommendations
    .map(
      (lib) =>
        `### ${lib.name} (\`${lib.packageName}\`)\n- **Category:** ${lib.category}\n- **Purpose:** ${lib.reason}\n- **Doc URL:** ${lib.docUrl}\n`
    )
    .join('\n');

  return `# Dependency Installation Plan

> **Note:** Always inspect \`package.json\` before running installation commands to avoid redundant packages.

## Verified Installation Commands
${cmdBlocks}

## Library Rationale
${libDetails}
`;
}

/**
 * Returns Component Tree formatted as JSON.
 */
export function exportComponentTreeJson(specification: Specification): string {
  return JSON.stringify(specification.componentTree, null, 2);
}

/**
 * Returns generated TypeScript interfaces.
 */
export function exportTypeScriptInterfaces(specification: Specification): string {
  return specification.typescriptOutline;
}
