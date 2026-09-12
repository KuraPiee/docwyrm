'use client';

import React, { useState } from 'react';
import { DocNode } from '@docwyrm/types';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  FolderPlus,
  FilePlus,
  BookOpen,
} from 'lucide-react';

interface SidebarTreeProps {
  tree: DocNode[];
  activeFilePath: string;
  onSelectDoc: (filePath: string) => void;
  onNewDoc: (parentSection?: string) => void;
  onNewSection?: () => void;
  onDeleteDoc?: (filePath: string) => void;
}

export function SidebarTree({
  tree,
  activeFilePath,
  onSelectDoc,
  onNewDoc,
  onNewSection,
  onDeleteDoc,
}: SidebarTreeProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNode = (node: DocNode, level: number = 0) => {
    const isFolder = !!(node.children && node.children.length > 0);
    const isExpanded = !collapsed[node.id];
    const isActive = node.filePath === activeFilePath;

    if (isFolder) {
      return (
        <div key={node.id} className="select-none mb-1">
          {/* Section / Chapter Header */}
          <div
            onClick={() => toggleCollapse(node.id)}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            className="group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs font-semibold text-textPrimary-light dark:text-textPrimary-dark hover:bg-subtle-light dark:hover:bg-subtle-dark cursor-pointer transition-colors"
          >
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-textMuted-light dark:text-textMuted-dark p-0.5">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
              {isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-orange-500/70 flex-shrink-0" />
              )}
              <span className="truncate tracking-tight font-bold">{node.title}</span>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNewDoc(node.filePath);
                }}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-textMuted-light dark:text-textMuted-dark hover:text-orange-500"
                title={`Add sub-page in ${node.title}`}
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Sub-pages container */}
          {isExpanded && (
            <div className="relative pl-3 space-y-0.5 mt-0.5 border-l border-border-light dark:border-border-dark ml-4">
              {node.children!.map((child) => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    // Single Document Node
    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => onSelectDoc(node.filePath)}
          style={{ paddingLeft: `${level * 8 + 6}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 text-xs rounded-md cursor-pointer transition-all duration-150 ${
            isActive
              ? 'bg-orange-500/10 dark:bg-orange-950/40 font-semibold text-orange-600 dark:text-orange-400 border border-orange-500/20'
              : 'text-textMuted-light dark:text-textMuted-dark hover:text-textPrimary-light dark:hover:text-textPrimary-dark hover:bg-subtle-light/60 dark:hover:bg-subtle-dark/60'
          }`}
        >
          <div className="flex items-center space-x-2 truncate">
            <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-orange-500' : 'opacity-60'}`} />
            <span className="truncate">{node.title}</span>
          </div>

          {!isFolder && onDeleteDoc && node.filePath !== 'index.mdx' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete "${node.title}" from the Git repository?`)) {
                  onDeleteDoc(node.filePath);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 text-textMuted-light dark:text-textMuted-dark hover:text-red-500 rounded transition-opacity"
              title="Delete page"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[280px] border-r border-border-light dark:border-border-dark bg-canvas-light dark:bg-canvas-dark flex flex-col justify-between h-[calc(100vh-80px)] select-none">
      <div className="p-3 overflow-y-auto flex-1 space-y-1">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold tracking-wider text-textMuted-light dark:text-textMuted-dark uppercase">
          <span>Table of Contents</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800">
            Git Tree
          </span>
        </div>
        {tree.map((node) => renderNode(node, 0))}
      </div>

      {/* Bottom Actions: New Section & New Page */}
      <div className="p-3 border-t border-border-light dark:border-border-dark bg-subtle-light/40 dark:bg-subtle-dark/40 flex items-center gap-2">
        {onNewSection && (
          <button
            onClick={onNewSection}
            className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium text-textPrimary-light dark:text-textPrimary-dark hover:bg-subtle-light dark:hover:bg-subtle-dark border border-border-light dark:border-border-dark transition-colors"
            title="Add a new chapter / section folder"
          >
            <FolderPlus className="w-3.5 h-3.5 text-orange-500" />
            <span>+ Section</span>
          </button>
        )}
        <button
          onClick={() => onNewDoc()}
          className="flex-1 flex items-center justify-center space-x-1 py-1.5 rounded-lg text-xs font-medium text-textPrimary-light dark:text-textPrimary-dark hover:bg-subtle-light dark:hover:bg-subtle-dark border border-border-light dark:border-border-dark transition-colors"
          title="Add a new documentation page"
        >
          <FilePlus className="w-3.5 h-3.5 text-orange-500" />
          <span>+ Sub-Page</span>
        </button>
      </div>
    </aside>
  );
}
