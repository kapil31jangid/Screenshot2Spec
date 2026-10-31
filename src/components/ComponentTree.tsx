'use client';

import React from 'react';
import { ComponentTreeNode } from '../types/specification';
import { Layers, ChevronRight, Package, Eye } from 'lucide-react';

export interface ComponentTreeProps {
  tree: ComponentTreeNode[];
}

function ComponentNodeView({ node, depth = 0 }: { node: ComponentTreeNode; depth?: number }) {
  const confidenceColor =
    node.confidence === 'observed'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      : node.confidence === 'inferred'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  return (
    <div className="space-y-2">
      <div
        style={{ marginLeft: `${depth * 1.5}rem` }}
        className="p-3.5 rounded-lg border bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {depth > 0 && <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />}
            <span className="font-semibold text-slate-900 dark:text-white font-mono text-sm">
              &lt;{node.name} /&gt;
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              #{node.id}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-medium">
              {node.uiType}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium uppercase tracking-wider ${confidenceColor}`}>
              {node.confidence}
            </span>
            {node.suggestedLibraryId && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 font-medium">
                <Package className="w-3 h-3" />
                {node.suggestedLibraryId}
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
          <strong>Purpose:</strong> {node.purpose}
        </p>

        {node.observedEvidence && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
            <Eye className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <span>
              <em>Evidence:</em> {node.observedEvidence}
            </span>
          </p>
        )}
      </div>

      {node.children && node.children.length > 0 && (
        <div className="space-y-2 relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {node.children.map((child) => (
            <ComponentNodeView key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function ComponentTree({ tree }: ComponentTreeProps) {
  if (!tree || tree.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
        No components detected in hierarchy.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 text-sm font-semibold pb-2 border-b border-slate-200 dark:border-slate-800">
        <Layers className="w-4 h-4 text-blue-500" />
        <span>Component Architecture &amp; Hierarchy ({tree.length} Root Regions)</span>
      </div>
      <div className="space-y-3">
        {tree.map((rootNode) => (
          <ComponentNodeView key={rootNode.id} node={rootNode} depth={0} />
        ))}
      </div>
    </div>
  );
}
