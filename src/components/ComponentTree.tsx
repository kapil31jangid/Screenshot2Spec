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
        classes: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
        icon: CheckCircle,
      };
    case 'inferred':
      return {
        label: 'Inferred',
        classes: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
        icon: Eye,
      };
    case 'unknown':
    default:
      return {
        label: 'Unknown',
        classes: 'bg-slate-800 text-slate-400 border-slate-700/50',
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
        className={`group flex items-start gap-2.5 py-2.5 px-3 rounded-xl border border-transparent hover:border-slate-800 hover:bg-slate-900/60 transition-all ${
          depth > 0 ? 'ml-4 sm:ml-6 mt-1.5' : 'mt-2'
        }`}
      >
        {/* Toggle icon or leaf spacer */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors mt-0.5"
            aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="w-5.5 h-5.5 flex items-center justify-center text-slate-600 mt-0.5">
            <Box className="w-3.5 h-3.5 text-slate-500" />
          </div>
        )}

        {/* Node Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-semibold text-slate-100 font-mono tracking-tight text-xs sm:text-sm">
              &lt;{node.name} /&gt;
            </span>

            {/* UI Type pill */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950/50 border border-indigo-800/40 text-[11px] font-medium text-indigo-300">
              <Layers className="w-3 h-3" />
              <span>{node.uiType}</span>
            </span>

            {/* Confidence badge */}
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.classes}`}
            >
              <BadgeIcon className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>

            {/* Suggested Library */}
            {node.suggestedLibraryId && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-800/40 text-[11px] font-medium text-purple-300">
                <Tag className="w-3 h-3" />
                <span>{node.suggestedLibraryId}</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 mb-1">{node.purpose}</p>

          {node.observedEvidence && (
            <p className="text-[11px] text-slate-500 italic bg-slate-950/40 px-2 py-1 rounded-md border border-slate-900 inline-block">
              Evidence: {node.observedEvidence}
            </p>
          )}
        </div>
      </div>

      {/* Recursive Children */}
      {hasChildren && isExpanded && (
        <div className="border-l border-slate-800/80 ml-3 sm:ml-5 pl-1">
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
      <div className="text-center py-12 text-slate-500 text-sm border border-slate-800/80 rounded-2xl bg-slate-950/30">
        No components detected in the analysis hierarchy.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-200">
            Detected Component Hierarchy
          </h4>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {tree.length} Root Components
        </span>
      </div>

      <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 overflow-x-auto">
        {tree.map((rootNode) => (
          <TreeNode key={rootNode.id} node={rootNode} />
        ))}
      </div>
    </div>
  );
}
