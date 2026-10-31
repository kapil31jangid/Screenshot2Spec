'use client';

import React, { useState } from 'react';
import { ComponentTreeNode } from '@/types/specification';
import { ConfidenceLevel } from '@/types/analysis';
import { ChevronRight, ChevronDown, Box, Layers, Tag, Eye, HelpCircle, CheckCircle } from 'lucide-react';

interface ComponentTreeProps {
  tree: ComponentTreeNode[];
}

function getConfidenceBadge(confidence: ConfidenceLevel) {
  switch (confidence) {
    case 'observed':
      return {
        label: 'Observed',
        classes: 'bg-[#FEF3B5] text-[#14370D] border-[#E5CE82]',
        icon: CheckCircle,
      };
    case 'inferred':
      return {
        label: 'Inferred',
        classes: 'bg-[#FFF9E6] text-[#785E12] border-[#E5CE82]',
        icon: Eye,
      };
    case 'unknown':
    default:
      return {
        label: 'Unknown',
        classes: 'bg-[#F5F6F3] text-[#52624F] border-[#E5EAE3]',
        icon: HelpCircle,
      };
  }
}

function TreeNode({ node, depth = 0 }: { node: ComponentTreeNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const badge = getConfidenceBadge(node.confidence);
  const BadgeIcon = badge.icon;

  return (
    <div className="select-none text-xs sm:text-sm">
      <div
        className={`group flex items-start gap-2.5 py-2.5 px-3 rounded-xl border border-transparent hover:border-[#CBD6C9] hover:bg-[#F4F6F2] transition-all ${
          depth > 0 ? 'ml-3 sm:ml-6 mt-1.5' : 'mt-2'
        }`}
      >
        {/* Toggle button or leaf spacer */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} component ${node.name}`}
            className="p-1 rounded-md text-[#52624F] hover:text-[#14370D] hover:bg-[#E9EFE8] transition-colors mt-0.5 focus-visible:ring-2 focus-visible:ring-[#14370D] focus:outline-none"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        ) : (
          <div className="w-5.5 h-5.5 flex items-center justify-center text-[#738E6D] mt-0.5" aria-hidden="true">
            <Box className="w-3.5 h-3.5 text-[#738E6D]" />
          </div>
        )}

        {/* Node Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-[#14370D] font-mono tracking-tight text-xs sm:text-sm break-all">
              &lt;{node.name} /&gt;
            </span>

            {/* UI Type pill */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E9EFE8] border border-[#CBD6C9] text-[11px] font-medium text-[#14370D]">
              <Layers className="w-3 h-3 text-[#738E6D]" aria-hidden="true" />
              <span>{node.uiType}</span>
            </span>

            {/* Confidence badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.classes}`}
            >
              <BadgeIcon className="w-3 h-3" aria-hidden="true" />
              <span>{badge.label}</span>
            </span>

            {/* Suggested Library */}
            {node.suggestedLibraryId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FEF3B5]/60 border border-[#CBD6C9] text-[11px] font-medium text-[#14370D]">
                <Tag className="w-3 h-3 text-[#738E6D]" aria-hidden="true" />
                <span>{node.suggestedLibraryId}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-[#1C2B1B] mb-1 leading-relaxed break-words">{node.purpose}</p>

          {node.observedEvidence && (
            <p className="text-[11px] text-[#52624F] italic bg-[#FAF9F1] px-2 py-1 rounded-md border border-[#CBD6C9]/80 inline-block break-words">
              Evidence: {node.observedEvidence}
            </p>
          )}
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-[#CBD6C9] ml-3 sm:ml-5 pl-1">
          {node.children!.map((child) => (
            <TreeNode key={`${child.id}-${depth + 1}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComponentTree({ tree }: ComponentTreeProps) {
  if (!tree || tree.length === 0) {
    return (
      <div className="text-center py-12 text-[#52624F] text-sm border border-[#CBD6C9] rounded-2xl bg-white shadow-sm">
        No components detected in the analysis hierarchy.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#CBD6C9]/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#14370D]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[#14370D]">
            Detected Component Hierarchy
          </h3>
        </div>
        <span className="text-xs text-[#52624F] font-mono">
          {tree.length} Root Components
        </span>
      </div>

      <div className="bg-white border border-[#CBD6C9] rounded-2xl p-4 sm:p-5 overflow-x-auto shadow-sm">
        {tree.map((rootNode) => (
          <TreeNode key={`${rootNode.id}-0`} node={rootNode} />
        ))}
      </div>
    </div>
  );
}
