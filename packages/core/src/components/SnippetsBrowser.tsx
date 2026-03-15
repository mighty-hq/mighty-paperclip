import React, { useEffect, useMemo, useState } from 'react';
import {
  Code2,
  FileText as FileTextIcon,
  Link as LinkIcon,
  Copy,
  Check,
  TrendingUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useSnippets, useCategories } from '../db/hooks';
import type { Category, Snippet } from '../db/schema';
import { useToast } from '../hooks/use-toast';
import CategorySidebar, { CategorySidebarItem } from './shared/CategorySidebar';
import CategoryEditorModal, { CategoryDraft } from './shared/CategoryEditorModal';
import ItemDisplay from './shared/ItemDisplay';

interface SnippetsBrowserProps {
  searchQuery: string;
}

const SnippetsBrowser: React.FC<SnippetsBrowserProps> = ({ searchQuery }) => {
  const { toast } = useToast();
  const { snippets, create, update, remove } = useSnippets();
  const { categories, create: createCategory, update: updateCategory } = useCategories();

  const snippetCategories = useMemo(
    () =>
      [...categories.filter((cat) => cat.type === 'snippets')].sort(
        (a, b) =>
          ((a as Category & { sortOrder?: number }).sortOrder ?? 0) -
          ((b as Category & { sortOrder?: number }).sortOrder ?? 0)
      ),
    [categories]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState('all-snippets');
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [addingSnippet, setAddingSnippet] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmSnippetId, setDeleteConfirmSnippetId] = useState<string | null>(null);
  const [dragSnippetId, setDragSnippetId] = useState<string | null>(null);
  const [dropTargetSnippetId, setDropTargetSnippetId] = useState<string | null>(null);

  const categoryItems: CategorySidebarItem[] = useMemo(() => {
    const allItem: CategorySidebarItem = {
      id: 'all-snippets',
      name: 'All Snippets',
      icon: 'FileText',
      color: '#3b82f6',
      count: snippets.length,
      tags: ['all'],
    };
    return [
      allItem,
      ...snippetCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        count: snippets.filter((snippet) => snippet.categoryId === cat.id).length,
        tags: cat.tags,
      })),
    ];
  }, [snippetCategories, snippets]);

  useEffect(() => {
    if (!categoryItems.some((item) => item.id === selectedCategoryId)) {
      setSelectedCategoryId('all-snippets');
    }
  }, [categoryItems, selectedCategoryId]);

  const filteredSnippets = useMemo(() => {
    const list = snippets.filter((s) => {
      const matchSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategoryId === 'all-snippets' || s.categoryId === selectedCategoryId;
      return matchSearch && matchCat;
    });
    // Favorites first, then by sortOrder, then usageCount desc
    return [...list].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      const orderA = (a as Snippet).sortOrder ?? 0;
      const orderB = (b as Snippet).sortOrder ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return (b.usageCount ?? 0) - (a.usageCount ?? 0);
    });
  }, [snippets, searchQuery, selectedCategoryId]);

  useEffect(() => {
    if (selectedSnippetIndex > filteredSnippets.length - 1) {
      setSelectedSnippetIndex(0);
    }
  }, [filteredSnippets.length, selectedSnippetIndex]);

  const selectedSnippet = filteredSnippets[selectedSnippetIndex];
  const selectedSnippetCategory = selectedSnippet
    ? snippetCategories.find((cat) => cat.id === selectedSnippet.categoryId)
    : undefined;

  const copyToClipboard = async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.content);
      setCopiedId(snippet.id);
      toast({ title: 'Copied!', description: snippet.title, duration: 1500 });
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive', duration: 1500 });
    }
  };

  const toggleFavorite = (snippet: Snippet) => update(snippet.id, { isFavorite: !snippet.isFavorite });

  const changeCategory = (snippet: Snippet, categoryId: string) => {
    update(snippet.id, { categoryId });
    setShowCatDropdown(false);
  };

  const handleInlineCreateSnippet = () => {
    if (!newItemTitle.trim()) return;
    const fallbackCategory = snippetCategories[0]?.id || '';
    const categoryId = selectedCategoryId === 'all-snippets' ? fallbackCategory : selectedCategoryId;
    create({
      title: newItemTitle.trim(),
      description: '',
      content: '',
      type: 'Editor',
      language: '',
      categoryId,
      tags: [],
      isFavorite: false,
    });
    setNewItemTitle('');
    setAddingSnippet(false);
    toast({ title: 'Snippet created', duration: 1500 });
  };

  const saveDescription = () => {
    if (selectedSnippet) update(selectedSnippet.id, { description: descDraft });
    setEditingDesc(false);
  };

  const handleSaveCategory = (draft: CategoryDraft) => {
    if (creatingCategory) {
      const created = createCategory({
        name: draft.name,
        icon: draft.icon || 'FolderOpen',
        color: draft.color || '#3b82f6',
        type: 'snippets',
        tags: draft.tags,
      });
      setSelectedCategoryId(created.id);
      toast({ title: 'Category created', description: created.name, duration: 1500 });
    } else if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: draft.name,
        icon: draft.icon,
        color: draft.color,
        tags: draft.tags,
      });
      toast({ title: 'Category updated', description: draft.name, duration: 1500 });
    }
    setCreatingCategory(false);
    setEditingCategory(null);
  };

  const getTypeIcon = (type: string) => {
    if (type === 'Editor' || type === 'code') return <Code2 className="h-4 w-4" />;
    if (type === 'Browser' || type === 'link') return <LinkIcon className="h-4 w-4" />;
    return <FileTextIcon className="h-4 w-4" />;
  };

  const getCategoryName = (categoryId: string) =>
    snippetCategories.find((c) => c.id === categoryId)?.name || 'Uncategorized';

  const handleSnippetDragStart = (e: React.DragEvent, id: string) => {
    setDragSnippetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSnippetDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetSnippetId(id);
  };

  const handleSnippetDragLeave = () => setDropTargetSnippetId(null);

  const handleSnippetDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    setDropTargetSnippetId(null);
    setDragSnippetId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === dropId) return;
    const ids = filteredSnippets.map((s) => s.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(dropId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggedId);
    reordered.forEach((id, i) => update(id, { sortOrder: i }));
  };

  const handleSnippetDragEnd = () => {
    setDragSnippetId(null);
    setDropTargetSnippetId(null);
  };

  const editorInitial: CategoryDraft = editingCategory
    ? {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: editingCategory.type,
        tags: editingCategory.tags || [],
      }
    : {
        name: '',
        icon: 'FolderOpen',
        color: '#3b82f6',
        type: 'snippets',
        tags: [],
      };

  return (
    <div className="flex h-full" data-testid="snippets-browser">
      <CategorySidebar
        title="Categories"
        items={categoryItems}
        selectedId={selectedCategoryId}
        onSelect={(id) => {
          setSelectedCategoryId(id);
          setSelectedSnippetIndex(0);
        }}
        onCreate={() => {
          setCreatingCategory(true);
          setEditingCategory(null);
        }}
        onEdit={(id) => {
          const category = snippetCategories.find((item) => item.id === id);
          if (!category) return;
          setEditingCategory(category);
          setCreatingCategory(false);
        }}
        onReorder={(orderedIds) => {
          orderedIds
            .filter((id) => id !== 'all-snippets')
            .forEach((id, i) => {
              updateCategory(id, { sortOrder: i });
            });
        }}
        testIdPrefix="snippet-cat"
      />

      {/* Col 2: Snippets list */}
      <div className="flex w-72 shrink-0 flex-col border-white/10 border-r">
        <div className="flex items-center justify-between border-white/10 border-b p-3">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Snippets ({filteredSnippets.length})
          </span>
          <button
            onClick={() => setAddingSnippet(true)}
            data-testid="add-snippet-btn"
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-400">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {addingSnippet && (
            <div className="mb-2 flex gap-1">
              <input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInlineCreateSnippet();
                  if (e.key === 'Escape') setAddingSnippet(false);
                }}
                placeholder="Snippet title..."
                className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
              />
              <button
                onClick={handleInlineCreateSnippet}
                className="rounded bg-blue-600 px-2 py-1.5 font-medium text-white text-xs">
                +
              </button>
            </div>
          )}
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map((s, i) => (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => handleSnippetDragStart(e, s.id)}
                onDragOver={(e) => handleSnippetDragOver(e, s.id)}
                onDragLeave={handleSnippetDragLeave}
                onDrop={(e) => handleSnippetDrop(e, s.id)}
                onDragEnd={handleSnippetDragEnd}
                className={`mb-1 cursor-grab active:cursor-grabbing ${dragSnippetId === s.id ? 'opacity-50' : ''} ${dropTargetSnippetId === s.id ? 'rounded-lg ring-1 ring-blue-500/50' : ''}`}>
                <button
                  onClick={() => setSelectedSnippetIndex(i)}
                  data-testid={`snippet-item-${s.id}`}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    i === selectedSnippetIndex
                      ? 'border-blue-500/30 bg-blue-600/15 text-white'
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/5">
                      {getTypeIcon(s.type)}
                    </div>
                    <span className="truncate font-medium text-sm">{s.title}</span>
                  </div>
                  {s.tags.length > 0 && (
                    <div className="ml-7 flex gap-1">
                      {s.tags.slice(0, 2).map((t, j) => (
                        <span key={j} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 text-sm">No snippets</div>
          )}
        </div>
      </div>

      {/* Col 3: Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSnippet ? (
          <ItemDisplay
            title={selectedSnippet.title}
            onClipboardClick={() => copyToClipboard(selectedSnippet)}
            clipboardCopied={copiedId === selectedSnippet.id}
            onBookmark={() => toggleFavorite(selectedSnippet)}
            isBookmarked={selectedSnippet.isFavorite}
            onDelete={() => setDeleteConfirmSnippetId(selectedSnippet.id)}
            meta={
              <div className="flex flex-wrap items-center gap-2 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {selectedSnippet.usageCount} uses
                </span>
                {selectedSnippet.language && (
                  <span className="rounded bg-white/5 px-2 py-0.5">{selectedSnippet.language}</span>
                )}
                <span className="rounded bg-white/5 px-2 py-0.5">{selectedSnippet.type}</span>
                <div className="relative">
                  <button
                    onClick={() => setShowCatDropdown(!showCatDropdown)}
                    data-testid="snippet-category-dropdown"
                    className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 transition-colors hover:bg-white/10">
                    {getCategoryName(selectedSnippet.categoryId)} <ChevronDown className="h-3 w-3" />
                  </button>
                  {showCatDropdown && (
                    <div className="absolute top-full left-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#1c1c2e] shadow-xl">
                      <div className="max-h-48 overflow-y-auto">
                        {snippetCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => changeCategory(selectedSnippet, cat.id)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                              selectedSnippet.categoryId === cat.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
                            }`}>
                            <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <div className="border-white/10 border-t p-2">
                        <button
                          onClick={() => {
                            setCreatingCategory(true);
                            setEditingCategory(null);
                            setShowCatDropdown(false);
                          }}
                          className="w-full rounded bg-white/5 px-3 py-1.5 font-medium text-white text-xs transition-colors hover:bg-white/10">
                          Create category
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            }
            tags={Array.from(new Set([...(selectedSnippetCategory?.tags || []), ...selectedSnippet.tags]))}
            description={
              <div>
                {editingDesc ? (
                  <textarea
                    value={descDraft}
                    onChange={(e) => setDescDraft(e.target.value)}
                    autoFocus
                    rows={2}
                    onBlur={saveDescription}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveDescription();
                      }
                      if (e.key === 'Escape') setEditingDesc(false);
                    }}
                    className="w-full resize-none rounded-lg border border-blue-500/50 bg-white/5 px-3 py-2 text-gray-300 text-sm placeholder-gray-500 outline-none"
                  />
                ) : (
                  <p
                    onClick={() => {
                      setEditingDesc(true);
                      setDescDraft(selectedSnippet.description || '');
                    }}
                    data-testid="snippet-description"
                    className="min-h-[2rem] cursor-pointer rounded-lg px-3 py-2 text-gray-400 text-sm transition-colors hover:bg-white/[0.03] hover:text-gray-300">
                    {selectedSnippet.description || 'Click to add a description...'}
                  </p>
                )}
              </div>
            }>
            <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <pre className="whitespace-pre-wrap break-words font-mono text-gray-300 text-sm">
                {selectedSnippet.content || 'No content yet.'}
              </pre>
            </div>

            <button
              onClick={() => copyToClipboard(selectedSnippet)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white transition-colors hover:bg-blue-700">
              {copiedId === selectedSnippet.id ? (
                <>
                  <Check className="h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy to Clipboard
                </>
              )}
            </button>
          </ItemDisplay>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <FileTextIcon className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Select a snippet to preview</p>
            </div>
          </div>
        )}
      </div>

      <CategoryEditorModal
        isOpen={creatingCategory || Boolean(editingCategory)}
        title={creatingCategory ? 'Create Snippet Category' : 'Edit Snippet Category'}
        initial={editorInitial}
        resetKey={creatingCategory ? 'create-snippet-category' : editingCategory?.id}
        onSave={handleSaveCategory}
        onClose={() => {
          setCreatingCategory(false);
          setEditingCategory(null);
        }}
      />

      {deleteConfirmSnippetId && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1c1c2e] p-5">
            <h3 className="mb-2 font-semibold text-lg text-white">Delete snippet?</h3>
            <p className="mb-4 text-gray-400 text-sm">This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmSnippetId(null)}
                className="flex-1 rounded bg-white/5 px-3 py-2 text-gray-200 text-sm transition-colors hover:bg-white/10">
                Cancel
              </button>
              <button
                onClick={() => {
                  remove(deleteConfirmSnippetId);
                  setDeleteConfirmSnippetId(null);
                  setSelectedSnippetIndex((i) => Math.max(0, Math.min(i, filteredSnippets.length - 2)));
                  toast({ title: 'Deleted', duration: 1500 });
                }}
                className="flex-1 rounded bg-red-600 px-3 py-2 text-sm text-white transition-colors hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnippetsBrowser;
