import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Download, LayoutGrid, List, Newspaper } from 'lucide-react';

export type DataViewMode = 'list' | 'card' | 'headlines';

export interface DataViewSortOption {
  label: string;
  value: string;
}

interface DataViewProps<T> {
  createButton?: ReactNode;
  defaultViewMode?: DataViewMode;
  emptyState?: ReactNode;
  items: T[];
  onCreate?: () => void;
  onExport: () => void;
  onSortChange: (value: string) => void;
  onViewModeChange?: (mode: DataViewMode) => void;
  renderCard: (items: T[]) => ReactNode;
  renderHeadlines: (items: T[]) => ReactNode;
  renderList: (items: T[]) => ReactNode;
  sortOptions: DataViewSortOption[];
  sortValue: string;
  title: string;
}

const modeIcon = (mode: DataViewMode) => {
  if (mode === 'card') return <LayoutGrid className="h-3.5 w-3.5" />;
  if (mode === 'headlines') return <Newspaper className="h-3.5 w-3.5" />;
  return <List className="h-3.5 w-3.5" />;
};

function DataView<T>({
  title,
  items,
  defaultViewMode = 'list',
  sortOptions,
  sortValue,
  onSortChange,
  onExport,
  onCreate,
  createButton,
  emptyState,
  onViewModeChange,
  renderList,
  renderCard,
  renderHeadlines,
}: DataViewProps<T>) {
  const [viewMode, setViewMode] = useState<DataViewMode>(defaultViewMode);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);

  useEffect(() => {
    const closeMenus = () => {
      setShowSortMenu(false);
      setShowViewMenu(false);
    };
    window.addEventListener('click', closeMenus);
    return () => window.removeEventListener('click', closeMenus);
  }, []);

  const applyViewMode = (mode: DataViewMode) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const content = useMemo(() => {
    if (!items.length)
      return emptyState || <div className="py-14 text-center text-gray-500 text-sm">No results found</div>;
    if (viewMode === 'card') return renderCard(items);
    if (viewMode === 'headlines') return renderHeadlines(items);
    return renderList(items);
  }, [items, emptyState, viewMode, renderList, renderCard, renderHeadlines]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-white/10 border-b p-3">
        <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
          {title} ({items.length})
        </span>
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowSortMenu((prev) => !prev);
                setShowViewMenu(false);
              }}
              className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-white/10">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort
            </button>
            {showSortMenu && (
              <div className="absolute top-[calc(100%+6px)] right-0 z-30 w-40 rounded-lg border border-white/10 bg-[#1c1c2e] p-1.5 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortMenu(false);
                    }}
                    className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                      sortValue === option.value ? 'bg-blue-500/15 text-blue-300' : 'text-gray-300 hover:bg-white/10'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={(event) => {
                event.stopPropagation();
                setShowViewMenu((prev) => !prev);
                setShowSortMenu(false);
              }}
              className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-white/10">
              {modeIcon(viewMode)}
              {viewMode === 'list' ? 'List' : viewMode === 'card' ? 'Cards' : 'Headlines'}
            </button>
            {showViewMenu && (
              <div className="absolute top-[calc(100%+6px)] right-0 z-30 w-36 rounded-lg border border-white/10 bg-[#1c1c2e] p-1.5 shadow-xl">
                {(['list', 'card', 'headlines'] as DataViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      applyViewMode(mode);
                      setShowViewMenu(false);
                    }}
                    className={`w-full rounded px-2 py-1.5 text-left text-xs transition-colors ${
                      viewMode === mode ? 'bg-blue-500/15 text-blue-300' : 'text-gray-300 hover:bg-white/10'
                    }`}>
                    {mode === 'list' ? 'List' : mode === 'card' ? 'Cards' : 'Headlines'}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-white/10">
            <Download className="h-3.5 w-3.5" /> Export
          </button>

          {createButton ||
            (onCreate && (
              <button
                onClick={onCreate}
                className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-1 text-gray-300 text-xs hover:bg-white/10">
                + Add
              </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">{content}</div>
    </div>
  );
}

export default DataView;
