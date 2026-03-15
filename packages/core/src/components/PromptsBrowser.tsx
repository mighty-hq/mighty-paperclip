import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, FolderOpen, ChevronDown, Plus, ExternalLink, Play, Bot } from 'lucide-react';
import { usePrompts, useCategories } from '../db/hooks';
import type { Category, Prompt } from '../db/schema';
import { useToast } from '../hooks/use-toast';
import CategorySidebar, { CategorySidebarItem } from './shared/CategorySidebar';
import CategoryEditorModal, { CategoryDraft } from './shared/CategoryEditorModal';
import PromptEditorModal, { PromptEditorDraft } from './shared/PromptEditorModal';
import ItemDisplay from './shared/ItemDisplay';
import AIInputModal from './shared/AIInputModal';
import { createPromptWithAI, importPromptFromUrlWithAI, improvePromptWithAI } from '../services/mighty-ai';

interface PromptsBrowserProps {
  searchQuery: string;
}

const PromptsBrowser: React.FC<PromptsBrowserProps> = ({ searchQuery }) => {
  const { toast } = useToast();
  const { prompts, create, update, remove } = usePrompts();
  const { categories, create: createCategory, update: updateCategory } = useCategories();

  const promptCategories = useMemo(
    () =>
      [...categories.filter((cat) => cat.type === 'prompts')].sort(
        (a, b) =>
          ((a as Category & { sortOrder?: number }).sortOrder ?? 0) -
          ((b as Category & { sortOrder?: number }).sortOrder ?? 0)
      ),
    [categories]
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState('all-prompts');
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [showUseMenu, setShowUseMenu] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [showGeminiDialog, setShowGeminiDialog] = useState(false);
  const useMenuRef = useRef<HTMLDivElement | null>(null);
  const aiMenuRef = useRef<HTMLDivElement | null>(null);
  const [promptEditorMode, setPromptEditorMode] = useState<'edit' | 'ai-create' | 'ai-improve'>('edit');
  const [aiPromptDraft, setAiPromptDraft] = useState<PromptEditorDraft | null>(null);
  const [aiInputMode, setAiInputMode] = useState<null | 'import' | 'create'>(null);
  const [aiInputLoading, setAiInputLoading] = useState(false);
  const [aiInputError, setAiInputError] = useState<string | null>(null);
  const [deleteConfirmPromptId, setDeleteConfirmPromptId] = useState<string | null>(null);
  const [dragPromptId, setDragPromptId] = useState<string | null>(null);
  const [dropTargetPromptId, setDropTargetPromptId] = useState<string | null>(null);

  const categoryItems: CategorySidebarItem[] = useMemo(() => {
    const allItem: CategorySidebarItem = {
      id: 'all-prompts',
      name: 'All Prompts',
      icon: 'Sparkles',
      color: '#fb923c',
      count: prompts.length,
      tags: ['all'],
    };
    return [
      allItem,
      ...promptCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        count: prompts.filter((prompt) => prompt.categoryId === cat.id).length,
        tags: cat.tags,
      })),
    ];
  }, [promptCategories, prompts]);

  useEffect(() => {
    if (!categoryItems.some((item) => item.id === selectedCategoryId)) {
      setSelectedCategoryId('all-prompts');
    }
  }, [categoryItems, selectedCategoryId]);

  const filteredPrompts = useMemo(() => {
    const list = prompts.filter((p) => {
      const matchSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCat = selectedCategoryId === 'all-prompts' || p.categoryId === selectedCategoryId;
      return matchSearch && matchCat;
    });
    return [...list].sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      const orderA = (a as Prompt).sortOrder ?? 0;
      const orderB = (b as Prompt).sortOrder ?? 0;
      return orderA - orderB;
    });
  }, [prompts, searchQuery, selectedCategoryId]);

  useEffect(() => {
    if (selectedPromptIndex > filteredPrompts.length - 1) {
      setSelectedPromptIndex(0);
    }
  }, [filteredPrompts.length, selectedPromptIndex]);

  const selectedPrompt = filteredPrompts[selectedPromptIndex];
  const selectedPromptCategory = selectedPrompt
    ? promptCategories.find((cat) => cat.id === selectedPrompt.categoryId)
    : undefined;
  const promptEditorCategories = useMemo(
    () => promptCategories.map((cat) => ({ id: cat.id, name: cat.name })),
    [promptCategories]
  );

  const toggleFavorite = () => {
    if (!selectedPrompt) return;
    update(selectedPrompt.id, { isFavorite: !selectedPrompt.isFavorite });
  };

  const changeCategory = (categoryId: string) => {
    if (!selectedPrompt) return;
    update(selectedPrompt.id, { categoryId });
    setShowCatDropdown(false);
  };

  const handleInlineCreatePrompt = () => {
    if (!newItemTitle.trim()) return;
    const fallbackCategory = promptCategories[0]?.id || '';
    const categoryId = selectedCategoryId === 'all-prompts' ? fallbackCategory : selectedCategoryId;
    create({
      title: newItemTitle.trim(),
      description: '',
      subtitle: '',
      content: '',
      icon: 'Sparkles',
      categoryId,
      tags: [],
      isFavorite: false,
    });
    setNewItemTitle('');
    setAddingPrompt(false);
    toast({ title: 'Prompt created', duration: 1500 });
  };

  const saveDescription = () => {
    if (selectedPrompt) update(selectedPrompt.id, { description: descDraft });
    setEditingDesc(false);
  };

  const copyToClipboard = async () => {
    if (!selectedPrompt) return;
    const text = selectedPrompt.content || selectedPrompt.subtitle || selectedPrompt.title;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(selectedPrompt.id);
      toast({ title: 'Copied!', description: selectedPrompt.title, duration: 1500 });
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive', duration: 1500 });
    }
  };

  useEffect(() => {
    if (!showUseMenu && !showAIMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showUseMenu && useMenuRef.current && !useMenuRef.current.contains(target)) {
        setShowUseMenu(false);
      }
      if (showAIMenu && aiMenuRef.current && !aiMenuRef.current.contains(target)) {
        setShowAIMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUseMenu, showAIMenu]);

  useEffect(() => {
    setShowUseMenu(false);
    setShowAIMenu(false);
    setShowGeminiDialog(false);
    setAiInputMode(null);
    setAiInputError(null);
    setAiInputLoading(false);
  }, [selectedPrompt?.id]);

  const getPromptPayload = () => {
    if (!selectedPrompt) return '';
    if (selectedPrompt.content.trim().length > 0) return selectedPrompt.content.trim();
    return [selectedPrompt.title, selectedPrompt.subtitle, selectedPrompt.description]
      .filter(Boolean)
      .join('\n')
      .trim();
  };

  const openProviderUrl = (url: string) => {
    const mightyhq = (window as any).mightyhq;
    if (mightyhq?.openExternal) {
      mightyhq.openExternal(url);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const runUseProvider = async (provider: 'openai' | 'claude' | 'grok' | 'gemini') => {
    if (!selectedPrompt) return;
    const payload = getPromptPayload();
    if (!payload) {
      toast({ title: 'Prompt is empty', variant: 'destructive', duration: 1500 });
      return;
    }

    if (provider === 'gemini') {
      try {
        await navigator.clipboard.writeText(payload);
        setShowGeminiDialog(true);
        setShowUseMenu(false);
        toast({ title: 'Link copied to clipboard', duration: 1500 });
      } catch {
        toast({ title: 'Copy failed', variant: 'destructive', duration: 1500 });
      }
      return;
    }

    const encoded = encodeURIComponent(payload);
    const url =
      provider === 'openai'
        ? `https://chatgpt.com/?prompt=${encoded}`
        : provider === 'claude'
          ? `https://claude.ai/new?q=${encoded}`
          : `https://grok.com/chat?reasoningMode=none&q=${encoded}`;
    openProviderUrl(url);
    setShowUseMenu(false);
  };

  const resolveCategoryId = () => {
    if (selectedPrompt?.categoryId) return selectedPrompt.categoryId;
    if (selectedCategoryId !== 'all-prompts') return selectedCategoryId;
    return promptCategories[0]?.id || '';
  };

  const openAIPreview = (draft: PromptEditorDraft, mode: 'ai-create' | 'ai-improve') => {
    setAiPromptDraft(draft);
    setPromptEditorMode(mode);
    setEditingPrompt(true);
  };

  const handleAIImportOrCreate = async (input: string) => {
    if (!input) return;
    setAiInputLoading(true);
    setAiInputError(null);
    try {
      const categoryId = resolveCategoryId();
      const suggestion =
        aiInputMode === 'import' ? await importPromptFromUrlWithAI(input) : await createPromptWithAI(input);
      openAIPreview(
        {
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          description: suggestion.description,
          content: suggestion.content,
          icon: selectedPrompt?.icon || 'Sparkles',
          categoryId,
          tags: suggestion.tags,
        },
        'ai-create'
      );
      setAiInputMode(null);
      setShowAIMenu(false);
      toast({ title: 'AI draft ready', description: 'Review and save to create.', duration: 1800 });
    } catch (error) {
      setAiInputError(error instanceof Error ? error.message : 'Failed to generate AI draft.');
    } finally {
      setAiInputLoading(false);
    }
  };

  const handleAIImproveCurrentPrompt = async () => {
    if (!selectedPrompt) return;
    setShowAIMenu(false);
    setAiInputLoading(true);
    try {
      const suggestion = await improvePromptWithAI({
        title: selectedPrompt.title,
        subtitle: selectedPrompt.subtitle,
        description: selectedPrompt.description,
        content: selectedPrompt.content,
        tags: selectedPrompt.tags || [],
      });
      openAIPreview(
        {
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          description: suggestion.description,
          content: suggestion.content,
          icon: selectedPrompt.icon || 'Sparkles',
          categoryId: selectedPrompt.categoryId,
          tags: suggestion.tags,
        },
        'ai-improve'
      );
      toast({ title: 'Improved draft ready', description: 'Review and save to apply.', duration: 1800 });
    } catch (error) {
      toast({
        title: 'AI improve failed',
        description: error instanceof Error ? error.message : 'Failed to improve prompt.',
        variant: 'destructive',
        duration: 2200,
      });
    } finally {
      setAiInputLoading(false);
    }
  };

  const getCategoryName = (categoryId: string) =>
    promptCategories.find((c) => c.id === categoryId)?.name || 'Uncategorized';

  const handlePromptDragStart = (e: React.DragEvent, id: string) => {
    setDragPromptId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handlePromptDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetPromptId(id);
  };

  const handlePromptDragLeave = () => setDropTargetPromptId(null);

  const handlePromptDrop = (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    setDropTargetPromptId(null);
    setDragPromptId(null);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === dropId) return;
    const ids = filteredPrompts.map((p) => p.id);
    const fromIdx = ids.indexOf(draggedId);
    const toIdx = ids.indexOf(dropId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...ids];
    reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, draggedId);
    reordered.forEach((id, i) => update(id, { sortOrder: i }));
  };

  const handlePromptDragEnd = () => {
    setDragPromptId(null);
    setDropTargetPromptId(null);
  };

  const promptEditorInitialBase: PromptEditorDraft = selectedPrompt
    ? {
        title: selectedPrompt.title,
        subtitle: selectedPrompt.subtitle,
        description: selectedPrompt.description || '',
        content: selectedPrompt.content || '',
        icon: selectedPrompt.icon || 'Sparkles',
        categoryId: selectedPromptCategory?.id || promptCategories[0]?.id || '',
        tags: selectedPrompt.tags || [],
      }
    : {
        title: '',
        subtitle: '',
        description: '',
        content: '',
        icon: 'Sparkles',
        categoryId: promptCategories[0]?.id || '',
        tags: [],
      };
  const promptEditorInitial: PromptEditorDraft = aiPromptDraft || promptEditorInitialBase;

  const handleSaveCategory = (draft: CategoryDraft) => {
    if (creatingCategory) {
      const created = createCategory({
        name: draft.name,
        icon: draft.icon || 'FolderOpen',
        color: draft.color || '#3b82f6',
        type: 'prompts',
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

  const handleSavePrompt = (draft: PromptEditorDraft) => {
    if (promptEditorMode === 'ai-create') {
      create({
        title: draft.title,
        subtitle: draft.subtitle,
        description: draft.description,
        content: draft.content,
        icon: draft.icon,
        categoryId: draft.categoryId,
        tags: draft.tags,
        isFavorite: false,
      });
      toast({ title: 'Prompt created', description: draft.title, duration: 1500 });
    } else {
      if (!selectedPrompt) return;
      update(selectedPrompt.id, {
        title: draft.title,
        subtitle: draft.subtitle,
        description: draft.description,
        content: draft.content,
        icon: draft.icon,
        categoryId: draft.categoryId,
        tags: draft.tags,
      });
      toast({ title: 'Prompt updated', description: draft.title, duration: 1500 });
    }
    setEditingPrompt(false);
    setPromptEditorMode('edit');
    setAiPromptDraft(null);
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
        type: 'prompts',
        tags: [],
      };

  return (
    <div className="flex h-full" data-testid="prompts-browser">
      <CategorySidebar
        title="Categories"
        items={categoryItems}
        selectedId={selectedCategoryId}
        onSelect={(id) => {
          setSelectedCategoryId(id);
          setSelectedPromptIndex(0);
        }}
        onCreate={() => {
          setCreatingCategory(true);
          setEditingCategory(null);
        }}
        onEdit={(id) => {
          const category = promptCategories.find((item) => item.id === id);
          if (!category) return;
          setEditingCategory(category);
          setCreatingCategory(false);
        }}
        onReorder={(orderedIds) => {
          orderedIds
            .filter((id) => id !== 'all-prompts')
            .forEach((id, i) => {
              updateCategory(id, { sortOrder: i });
            });
        }}
        testIdPrefix="prompt-cat"
      />

      {/* Col 2: Prompts list */}
      <div className="flex w-72 shrink-0 flex-col border-white/10 border-r">
        <div className="flex items-center justify-between border-white/10 border-b p-3">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Prompts ({filteredPrompts.length})
          </span>
          <button
            onClick={() => setAddingPrompt(true)}
            data-testid="add-prompt-btn"
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-400">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {addingPrompt && (
            <div className="mb-2 flex gap-1">
              <input
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInlineCreatePrompt();
                  if (e.key === 'Escape') setAddingPrompt(false);
                }}
                placeholder="Prompt title..."
                className="flex-1 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
              />
              <button
                onClick={handleInlineCreatePrompt}
                className="rounded bg-blue-600 px-2 py-1.5 font-medium text-white text-xs">
                +
              </button>
            </div>
          )}
          {filteredPrompts.length > 0 ? (
            filteredPrompts.map((p, i) => (
              <div
                key={p.id}
                draggable
                onDragStart={(e) => handlePromptDragStart(e, p.id)}
                onDragOver={(e) => handlePromptDragOver(e, p.id)}
                onDragLeave={handlePromptDragLeave}
                onDrop={(e) => handlePromptDrop(e, p.id)}
                onDragEnd={handlePromptDragEnd}
                className={`mb-1 cursor-grab active:cursor-grabbing ${dragPromptId === p.id ? 'opacity-50' : ''} ${dropTargetPromptId === p.id ? 'rounded-lg ring-1 ring-blue-500/50' : ''}`}>
                <button
                  onClick={() => setSelectedPromptIndex(i)}
                  data-testid={`prompt-item-${p.id}`}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    i === selectedPromptIndex
                      ? 'border-blue-500/30 bg-blue-600/15 text-white'
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}>
                  <div className="mb-1 flex items-center gap-2">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ${p.icon === 'Sparkles' ? 'bg-orange-500/20' : 'bg-yellow-500/20'}`}>
                      {p.icon === 'Sparkles' ? (
                        <Sparkles className="h-3 w-3 text-orange-400" />
                      ) : (
                        <FolderOpen className="h-3 w-3 text-yellow-400" />
                      )}
                    </div>
                    <span className="truncate font-medium text-sm">{p.title}</span>
                  </div>
                  <p className="ml-8 truncate text-gray-500 text-xs">{p.subtitle}</p>
                  {(p.tags || []).length > 0 && (
                    <div className="mt-1 ml-8 flex gap-1">
                      {(p.tags || []).slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-gray-500">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 text-sm">No prompts</div>
          )}
        </div>
      </div>

      {/* Col 3: Detail */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedPrompt ? (
          <ItemDisplay
            title={selectedPrompt.title}
            subtitle={selectedPrompt.subtitle}
            onEdit={() => {
              setPromptEditorMode('edit');
              setAiPromptDraft(null);
              setEditingPrompt(true);
            }}
            onClipboardClick={copyToClipboard}
            clipboardCopied={copiedId === selectedPrompt.id}
            onBookmark={toggleFavorite}
            isBookmarked={selectedPrompt.isFavorite}
            onDelete={() => setDeleteConfirmPromptId(selectedPrompt.id)}
            extraActions={
              <div className="flex items-center gap-2">
                <div className="relative" ref={aiMenuRef}>
                  <button
                    onClick={() => setShowAIMenu((prev) => !prev)}
                    data-testid="prompt-ai-btn"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-violet-300/20 bg-violet-500 px-2.5 py-1.5 font-medium text-sm text-white transition-colors hover:bg-violet-600">
                    <Bot className="h-3.5 w-3.5" /> AI
                  </button>
                  {showAIMenu && (
                    <div className="absolute top-[calc(100%+6px)] right-0 z-30 w-56 space-y-1 rounded-lg border border-white/10 bg-[#1c1c2e] p-2 shadow-xl">
                      <button
                        onClick={() => {
                          setAiInputMode('import');
                          setAiInputError(null);
                          setShowAIMenu(false);
                        }}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Import prompt
                      </button>
                      <button
                        onClick={() => void handleAIImproveCurrentPrompt()}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Improve prompt
                      </button>
                      <button
                        onClick={() => {
                          setAiInputMode('create');
                          setAiInputError(null);
                          setShowAIMenu(false);
                        }}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Create prompt
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative" ref={useMenuRef}>
                  <button
                    onClick={() => setShowUseMenu((prev) => !prev)}
                    data-testid="use-prompt-btn"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/20 bg-emerald-500 px-2.5 py-1.5 font-medium text-sm text-white transition-colors hover:bg-emerald-600">
                    <Play className="h-3.5 w-3.5 fill-white" /> Run
                  </button>
                  {showUseMenu && (
                    <div className="absolute top-[calc(100%+6px)] right-0 z-30 w-52 space-y-1 rounded-lg border border-white/10 bg-[#1c1c2e] p-2 shadow-xl">
                      <button
                        onClick={() => void runUseProvider('openai')}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Open in OpenAI
                      </button>
                      <button
                        onClick={() => void runUseProvider('claude')}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Open in Claude
                      </button>
                      <button
                        onClick={() => void runUseProvider('grok')}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Open in Grok
                      </button>
                      <button
                        onClick={() => void runUseProvider('gemini')}
                        className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                        Use with Gemini
                      </button>
                    </div>
                  )}
                </div>

                {aiInputLoading && <span className="text-violet-300 text-xs">AI working...</span>}
              </div>
            }
            categorySelector={
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="relative">
                  <button
                    onClick={() => setShowCatDropdown(!showCatDropdown)}
                    data-testid="prompt-category-dropdown"
                    className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 transition-colors hover:bg-white/10">
                    {getCategoryName(selectedPrompt.categoryId)} <ChevronDown className="h-3 w-3" />
                  </button>
                  {showCatDropdown && (
                    <div className="absolute top-full left-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#1c1c2e] shadow-xl">
                      <div className="max-h-48 overflow-y-auto">
                        {promptCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => changeCategory(cat.id)}
                            className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                              selectedPrompt.categoryId === cat.id ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300'
                            }`}>
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
            tags={Array.from(
              new Set([...(selectedPromptCategory?.tags || []), ...((selectedPrompt.tags || []) as string[])])
            )}
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
                      setDescDraft(selectedPrompt.description || '');
                    }}
                    data-testid="prompt-description"
                    className="min-h-[2rem] cursor-pointer rounded-lg px-3 py-2 text-gray-400 text-sm transition-colors hover:bg-white/[0.03] hover:text-gray-300">
                    {selectedPrompt.description || 'Click to add a description...'}
                  </p>
                )}
              </div>
            }>
            <div className="mb-4 rounded-lg border border-white/10 bg-white/[0.03] p-5">
              <p className="text-gray-300 text-sm leading-relaxed">
                {selectedPrompt.content ||
                  `This prompt helps you ${selectedPrompt.subtitle.toLowerCase() || 'with your task'}.`}
              </p>
            </div>
          </ItemDisplay>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500">
              <Sparkles className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Select a prompt to preview</p>
            </div>
          </div>
        )}
      </div>

      <CategoryEditorModal
        isOpen={creatingCategory || Boolean(editingCategory)}
        title={creatingCategory ? 'Create Prompt Category' : 'Edit Prompt Category'}
        initial={editorInitial}
        resetKey={creatingCategory ? 'create-prompt-category' : editingCategory?.id}
        onSave={handleSaveCategory}
        onClose={() => {
          setCreatingCategory(false);
          setEditingCategory(null);
        }}
      />

      <PromptEditorModal
        isOpen={editingPrompt}
        title={
          promptEditorMode === 'ai-create'
            ? 'AI Preview · Create Prompt'
            : promptEditorMode === 'ai-improve'
              ? 'AI Preview · Improve Prompt'
              : 'Edit Prompt'
        }
        initial={promptEditorInitial}
        categories={promptEditorCategories}
        resetKey={
          promptEditorMode === 'edit' ? selectedPrompt?.id : `ai-${promptEditorMode}-${selectedPrompt?.id || 'new'}`
        }
        onSave={handleSavePrompt}
        onClose={() => {
          setEditingPrompt(false);
          setPromptEditorMode('edit');
          setAiPromptDraft(null);
        }}
      />

      <AIInputModal
        isOpen={aiInputMode !== null}
        title={aiInputMode === 'import' ? 'Import Prompt with AI' : 'Create Prompt with AI'}
        description={
          aiInputMode === 'import'
            ? 'Paste a prompt page URL. Mighty AI will scrape it and prepare a prompt draft for review.'
            : 'Describe your desired prompt outcome. Mighty AI will generate a draft for review.'
        }
        label={aiInputMode === 'import' ? 'Prompt URL' : 'Desired outcome'}
        placeholder={
          aiInputMode === 'import'
            ? 'https://prompts.chat/prompts/...'
            : 'Create a prompt that helps me research and summarize AI tooling for startups.'
        }
        inputType={aiInputMode === 'import' ? 'text' : 'textarea'}
        submitLabel={aiInputMode === 'import' ? 'Import with AI' : 'Generate with AI'}
        loading={aiInputLoading}
        error={aiInputError}
        resetKey={aiInputMode || 'none'}
        onClose={() => {
          setAiInputMode(null);
          setAiInputError(null);
          setAiInputLoading(false);
        }}
        onSubmit={(value) => void handleAIImportOrCreate(value)}
      />

      {showGeminiDialog && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1c1c2e] p-5">
            <h3 className="mb-2 font-semibold text-lg text-white">Link copied to clipboard</h3>
            <p className="mb-4 text-gray-400 text-sm">Paste the copied prompt into Gemini after opening.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowGeminiDialog(false)}
                className="flex-1 rounded bg-white/5 px-3 py-2 text-gray-200 text-sm transition-colors hover:bg-white/10">
                Close
              </button>
              <button
                onClick={() => {
                  openProviderUrl('https://gemini.google.com/app');
                  setShowGeminiDialog(false);
                }}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                <ExternalLink className="h-3.5 w-3.5" /> Open in Gemini
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmPromptId && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#1c1c2e] p-5">
            <h3 className="mb-2 font-semibold text-lg text-white">Delete prompt?</h3>
            <p className="mb-4 text-gray-400 text-sm">This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmPromptId(null)}
                className="flex-1 rounded bg-white/5 px-3 py-2 text-gray-200 text-sm transition-colors hover:bg-white/10">
                Cancel
              </button>
              <button
                onClick={() => {
                  remove(deleteConfirmPromptId);
                  setDeleteConfirmPromptId(null);
                  setSelectedPromptIndex((i) => Math.max(0, Math.min(i, filteredPrompts.length - 2)));
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

export default PromptsBrowser;
