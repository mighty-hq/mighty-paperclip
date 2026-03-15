import React, { useEffect, useMemo, useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { ChevronRight, Pencil, Plus } from 'lucide-react';

export interface CategorySidebarItem {
  color?: string;
  count: number;
  icon?: string;
  id: string;
  name: string;
  parentId?: string | null;
  tags?: string[];
}

interface CategorySidebarProps {
  allow_nested?: boolean;
  allowNested?: boolean;
  emptyText?: string;
  items: CategorySidebarItem[];
  onChangeIcon?: (id: string) => void;
  onCreate?: () => void;
  onCreateNested?: (parentId: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRename?: (id: string) => void;
  onReorder?: (orderedIds: string[]) => void;
  onSelect: (id: string) => void;
  selectedId?: string;
  testIdPrefix?: string;
  title?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  title = 'Categories',
  items,
  selectedId,
  onSelect,
  onCreate,
  onEdit,
  onCreateNested,
  onRename,
  onChangeIcon,
  onDelete,
  onReorder,
  allowNested = false,
  allow_nested,
  emptyText = 'No categories found',
  testIdPrefix = 'category',
}) => {
  const nestedEnabled = allow_nested ?? allowNested;
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    const initialExpanded = new Set<string>();
    items.forEach((item) => {
      if (item.parentId) initialExpanded.add(item.parentId);
    });
    setExpandedIds(initialExpanded);
  }, [items]);

  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => {
      window.removeEventListener('click', closeMenu);
    };
  }, [contextMenu]);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, CategorySidebarItem[]>();
    items.forEach((item) => {
      const parentId = item.parentId && itemMap.has(item.parentId) ? item.parentId : null;
      if (!map.has(parentId)) map.set(parentId, []);
      map.get(parentId)?.push(item);
    });
    return map;
  }, [items, itemMap]);

  const rootItems = childrenByParent.get(null) || [];

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContextMenu = (event: React.MouseEvent, item: CategorySidebarItem) => {
    if (!nestedEnabled) return;
    if (!onCreateNested && !onRename && !onChangeIcon && !onDelete) return;
    event.preventDefault();
    setContextMenu({
      id: item.id,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleDragStart = (e: React.DragEvent, item: CategorySidebarItem) => {
    if (!onReorder || nestedEnabled) return;
    setDraggingId(item.id);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, item: CategorySidebarItem) => {
    if (!onReorder || nestedEnabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(item.id);
  };

  const handleDragLeave = () => setDragOverId(null);

  const handleDrop = (e: React.DragEvent, dropTargetId: string) => {
    if (!onReorder || nestedEnabled) return;
    e.preventDefault();
    setDragOverId(null);
    setDraggingId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === dropTargetId) return;
    const ids = items.map((i) => i.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(dropTargetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggedId);
    onReorder(reordered);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverId(null);
  };

  const renderItem = (item: CategorySidebarItem, depth = 0): React.ReactNode => {
    const iconRegistry = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const DynamicIcon = iconRegistry[item.icon || 'FolderOpen'] || LucideIcons.FolderOpen;
    const selected = item.id === selectedId;
    const childItems = childrenByParent.get(item.id) || [];
    const hasChildren = childItems.length > 0;
    const isExpanded = expandedIds.has(item.id);
    const canDrag = onReorder && !nestedEnabled;
    const isDragOver = dragOverId === item.id;
    const isDragging = draggingId === item.id;

    return (
      <div
        key={item.id}
        draggable={canDrag}
        onDragStart={(e) => canDrag && handleDragStart(e, item)}
        onDragOver={(e) => canDrag && handleDragOver(e, item)}
        onDragLeave={canDrag ? handleDragLeave : undefined}
        onDrop={(e) => canDrag && handleDrop(e, item.id)}
        onDragEnd={canDrag ? handleDragEnd : undefined}
        className={`mb-1 ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'rounded-lg ring-1 ring-blue-500/50' : ''}`}>
        <div
          className={`group w-full rounded-lg border ${
            selected
              ? 'border-blue-500/30 bg-blue-600/20 text-white'
              : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
          }`}
          onContextMenu={(event) => handleContextMenu(event, item)}>
          <button
            onClick={() => onSelect(item.id)}
            data-testid={`${testIdPrefix}-item-${item.id}`}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm transition-all"
            style={{ paddingLeft: nestedEnabled ? `${depth * 14 + 12}px` : undefined }}>
            <div className="flex min-w-0 items-center gap-2">
              {nestedEnabled && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    if (hasChildren) toggleExpanded(item.id);
                  }}
                  className="inline-flex h-4 w-4 items-center justify-center text-gray-500 hover:text-gray-300"
                  title={hasChildren ? (isExpanded ? 'Collapse' : 'Expand') : undefined}>
                  {hasChildren ? (
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  ) : (
                    <span className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: item.color ? `${item.color}33` : undefined }}>
                <DynamicIcon className="h-3.5 w-3.5" />
              </span>
              <span className="truncate">{item.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className={`rounded px-1.5 py-0.5 text-xs ${selected ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                {item.count}
              </span>
            </div>
          </button>

          {item.tags && item.tags.length > 0 && (
            <div className="-mt-0.5 flex flex-wrap gap-1 px-3 pb-2">
              {item.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {onEdit && !nestedEnabled && (
            <div className="-mt-0.5 px-3 pb-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => onEdit(item.id)}
                data-testid={`${testIdPrefix}-edit-${item.id}`}
                className="flex items-center gap-1 text-gray-500 text-xs hover:text-blue-300">
                <Pencil className="h-3 w-3" /> Edit
              </button>
            </div>
          )}
        </div>

        {nestedEnabled && hasChildren && isExpanded && (
          <div className="pl-1">{childItems.map((child) => renderItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const contextTarget = contextMenu ? itemMap.get(contextMenu.id) : null;

  return (
    <div className="relative flex w-64 shrink-0 flex-col border-white/10 border-r">
      <div className="flex items-center justify-between border-white/10 border-b p-3">
        <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">{title}</span>
        {onCreate && (
          <button
            onClick={onCreate}
            data-testid={`${testIdPrefix}-add-btn`}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-400"
            title="Create category">
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {nestedEnabled ? rootItems.map((item) => renderItem(item, 0)) : items.map((item) => renderItem(item, 0))}
        {items.length === 0 && <div className="py-8 text-center text-gray-500 text-sm">{emptyText}</div>}
      </div>

      {contextMenu && contextTarget && (
        <div
          className="fixed z-[12000] w-52 rounded-lg border border-white/10 bg-[#1c1c2e] p-1.5 shadow-xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}>
          {onCreateNested && (
            <button
              onClick={() => {
                onCreateNested(contextTarget.id);
                setContextMenu(null);
              }}
              className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
              Create nested folder
            </button>
          )}
          {onRename && (
            <button
              onClick={() => {
                onRename(contextTarget.id);
                setContextMenu(null);
              }}
              className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
              Rename
            </button>
          )}
          {onChangeIcon && (
            <button
              onClick={() => {
                onChangeIcon(contextTarget.id);
                setContextMenu(null);
              }}
              className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
              Change icon
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete(contextTarget.id);
                setContextMenu(null);
              }}
              className="w-full rounded px-3 py-2 text-left text-red-300 text-sm transition-colors hover:bg-red-500/10">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySidebar;
