import React, { useMemo, useState } from 'react';
import { ChevronRight, FileText, Folder } from 'lucide-react';

export type TreeNodeData = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNodeData[];
};

interface TreeProps {
  defaultExpandedIds?: string[];
  nodes: TreeNodeData[];
  onSelect: (node: TreeNodeData) => void;
  selectedId?: string;
}

const TreeItem: React.FC<{
  node: TreeNodeData;
  depth: number;
  expanded: Set<string>;
  selectedId?: string;
  toggle: (id: string) => void;
  onSelect: (node: TreeNodeData) => void;
}> = ({ node, depth, expanded, selectedId, toggle, onSelect }) => {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expanded.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) toggle(node.id);
          if (node.type === 'file') onSelect(node);
        }}
        className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
          isSelected ? 'bg-blue-600/20 text-white' : 'text-gray-300 hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 14 + 8}px` }}>
        {hasChildren ? (
          <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        ) : (
          <span className="w-3.5" />
        )}
        {node.type === 'folder' ? (
          <Folder className="h-4 w-4 text-amber-300" />
        ) : (
          <FileText className="h-4 w-4 text-blue-300" />
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selectedId={selectedId}
              toggle={toggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Tree: React.FC<TreeProps> = ({ nodes, selectedId, onSelect, defaultExpandedIds = [] }) => {
  const initial = useMemo(() => new Set(defaultExpandedIds), [defaultExpandedIds]);
  const [expanded, setExpanded] = useState<Set<string>>(initial);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-0.5">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          selectedId={selectedId}
          toggle={toggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default Tree;
