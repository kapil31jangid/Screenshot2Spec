'use client';

import React, { useState } from 'react';
import { ComponentTreeNode } from '@/types/specification';
import { ConfidenceLevel } from '@/types/analysis';
import { ChevronRight, ChevronDown, Box, Layers, Tag, Eye, HelpCircle, CheckCircle2 } from 'lucide-react';

interface ComponentTreeProps {
  tree: ComponentTreeNode[];
}

function getConfidenceBadge(confidence: ConfidenceLevel) {
  switch (confidence) {
    case 'observed':
      return {
        label: 'Observed',
        classes: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
        dot: 'bg-emerald-500',
      };
    case 'inferred':
      return {
        label: 'Inferred',
        classes: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
        dot: 'bg-amber-500',
      };
    case 'unknown':
    default:
      return {
        label: 'Unknown',
        classes: 'text-zinc-400 bg-zinc-900 border-zinc-800',
        dot: 'bg-zinc-500',
      };
  }
}

function TreeNode({ node, depth = 0 }: { node: ComponentTreeNode; depth?: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const badge = getConfidenceBadge(node.confidence);

  return (
    <div className="select-none text-xs">
      <div
        className={`group flex items-start gap-2.5 py-2.5 px-3 rounded-lg border border-transparent hover:border-zinc-800 hover:bg-zinc-900/60 transition-all ${
          depth > 0 ? 'ml-3 sm:ml-6 mt-1 border-l-zinc-800' : 'mt-1'
        }`}
      >
        {/* Toggle button or leaf spacer */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} component ${node.name}`}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors mt-0.5 focus-visible:ring-1 focus-visible:ring-zinc-400 focus:outline-none"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        ) : (
          <div className="w-5.5 h-5.5 flex items-center justify-center text-zinc-600 mt-0.5" aria-hidden="true">
            <Box className="w-3.5 h-3.5 text-zinc-600" />
          </div>
        )}

        {/* Node Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-zinc-100 font-mono text-xs sm:text-sm tracking-tight break-all">
              &lt;{node.name} /&gt;
            </span>

            {/* UI Type pill */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase">
              <Layers className="w-2.5 h-2.5" aria-hidden="true" />
              <span>{node.uiType}</span>
            </span>

            {/* Confidence badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono ${badge.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              <span>{badge.label}</span>
            </span>

            {/* Suggested Library */}
            {node.suggestedLibraryId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/80 text-[10px] font-mono text-zinc-300">
                <Tag className="w-2.5 h-2.5 text-zinc-400" aria-hidden="true" />
                <span>{node.suggestedLibraryId}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-300 mb-1 leading-relaxed break-words">{node.purpose}</p>

          {node.observedEvidence && (
            <p className="text-[11px] text-zinc-500 italic bg-zinc-950/70 p-2 rounded border border-zinc-900 mt-1.5 font-mono">
              Visual Evidence: &ldquo;{node.observedEvidence}&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Recursive Children Nodes */}
      {hasChildren && isExpanded && (
        <div className="border-l border-zinc-800 ml-5 pl-1 space-y-1">
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ComponentTree({ tree }: ComponentTreeProps) {
  if (!tree || tree.length === 0) {
    return (
      <div className="p-8 text-center border border-zinc-800 rounded-xl bg-zinc-900/30 text-xs text-zinc-500 font-mono">
        No hierarchical components detected in screenshot.
      </div>
    );
  }

  return (
    <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 font-mono">
            Cycle-Free Component Hierarchy
          </h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-500">
          Zod Verified Tree
        </span>
      </div>

      <div className="space-y-1">
        {tree.map((rootNode) => (
          <TreeNode key={rootNode.id} node={rootNode} />
        ))}
      </div>
    </div>
  );
}
