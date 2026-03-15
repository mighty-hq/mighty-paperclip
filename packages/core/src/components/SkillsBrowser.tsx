import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Download, Plus } from 'lucide-react';
import CategorySidebar, { CategorySidebarItem } from './shared/CategorySidebar';
import { skills, SkillDefinition } from '../data/skills';
import Tree, { TreeNodeData } from './ui/tree';
import SnippetViewer from './ui/snippet';
import CategoryEditorModal, { CategoryDraft } from './shared/CategoryEditorModal';
import SkillItemEditorModal, { SkillItemDraft } from './shared/SkillItemEditorModal';
import ItemDisplay from './shared/ItemDisplay';
import AIInputModal from './shared/AIInputModal';
import { useToast } from '../hooks/use-toast';
import { createSkillWithAI, importSkillFromUrlWithAI, improveSkillWithAI } from '../services/mighty-ai';

interface SkillsBrowserProps {
  searchQuery: string;
}

const SKILL_CATEGORY_META: Record<string, { name: string; icon: string; color: string; tags: string[] }> = {
  integrations: { name: 'Integrations', icon: 'Puzzle', color: '#3b82f6', tags: ['api'] },
  workflow: { name: 'Workflow', icon: 'Sparkles', color: '#8b5cf6', tags: ['automation'] },
};

const SKILLS_STORAGE_KEY = 'mighty_skills_items_v1';
const SKILL_CATEGORIES_STORAGE_KEY = 'mighty_skill_categories_v1';

type SkillCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
  tags: string[];
};

const defaultCategories: SkillCategory[] = Object.entries(SKILL_CATEGORY_META).map(([id, meta]) => ({
  id,
  name: meta.name,
  icon: meta.icon,
  color: meta.color,
  tags: meta.tags,
}));

const cloneSeedSkills = () => JSON.parse(JSON.stringify(skills)) as SkillDefinition[];

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createSkillFromDraft = (draft: SkillItemDraft): SkillDefinition => {
  const baseId = slugify(draft.title) || `skill-${Date.now()}`;
  const id = `${baseId}-${Date.now()}`;
  const fileId = `${id}-readme`;
  return {
    id,
    title: draft.title,
    subtitle: draft.subtitle,
    category: draft.category,
    tags: draft.tags,
    description: draft.description,
    files: [
      {
        id: fileId,
        name: 'README.md',
        language: 'markdown',
        description: 'Main markdown source for this skill.',
        code: draft.content,
      },
    ],
    tree: [
      {
        id: `${id}-root`,
        name: `${baseId}-skill`,
        type: 'folder',
        children: [{ id: fileId, name: 'README.md', type: 'file' }],
      },
    ],
  };
};

const updateSkillFromDraft = (skill: SkillDefinition, draft: SkillItemDraft): SkillDefinition => {
  const files = [...skill.files];
  const primaryMarkdownFileIndex = Math.max(
    0,
    files.findIndex((file) => file.language === 'markdown')
  );
  if (files.length === 0) {
    files.push({
      id: `${skill.id}-readme`,
      name: 'README.md',
      language: 'markdown',
      description: 'Main markdown source for this skill.',
      code: draft.content,
    });
  } else {
    files[primaryMarkdownFileIndex] = {
      ...files[primaryMarkdownFileIndex],
      code: draft.content,
      language: 'markdown',
    };
  }

  return {
    ...skill,
    title: draft.title,
    subtitle: draft.subtitle,
    category: draft.category,
    tags: draft.tags,
    description: draft.description,
    files,
  };
};

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const flattenFileNodes = (nodes: TreeNodeData[]): string[] => {
  const out: string[] = [];
  for (const node of nodes) {
    if (node.type === 'file') out.push(node.id);
    if (node.children?.length) out.push(...flattenFileNodes(node.children));
  }
  return out;
};

const SkillsBrowser: React.FC<SkillsBrowserProps> = ({ searchQuery }) => {
  const { toast } = useToast();
  const [skillItems, setSkillItems] = useState<SkillDefinition[]>(() => {
    if (typeof window === 'undefined') return cloneSeedSkills();
    try {
      const raw = window.localStorage.getItem(SKILLS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SkillDefinition[]) : cloneSeedSkills();
    } catch {
      return cloneSeedSkills();
    }
  });
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(() => {
    if (typeof window === 'undefined') return defaultCategories;
    try {
      const raw = window.localStorage.getItem(SKILL_CATEGORIES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SkillCategory[]) : defaultCategories;
    } catch {
      return defaultCategories;
    }
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState('all-skills');
  const [selectedSkillIndex, setSelectedSkillIndex] = useState(0);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [skillEditorMode, setSkillEditorMode] = useState<'manual-create' | 'manual-edit' | 'ai-create' | 'ai-improve'>(
    'manual-create'
  );
  const [aiSkillDraft, setAiSkillDraft] = useState<SkillItemDraft | null>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const aiMenuRef = useRef<HTMLDivElement | null>(null);
  const [aiInputMode, setAiInputMode] = useState<null | 'import' | 'create'>(null);
  const [aiInputLoading, setAiInputLoading] = useState(false);
  const [aiInputError, setAiInputError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skillItems));
  }, [skillItems]);

  useEffect(() => {
    window.localStorage.setItem(SKILL_CATEGORIES_STORAGE_KEY, JSON.stringify(skillCategories));
  }, [skillCategories]);

  const categoryItems: CategorySidebarItem[] = useMemo(() => {
    const dynamic = skillCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      tags: cat.tags,
      count: skillItems.filter((skill) => skill.category === cat.id).length,
    }));
    return [
      {
        id: 'all-skills',
        name: 'All Skills',
        icon: 'Bot',
        color: '#22c55e',
        tags: ['skills'],
        count: skillItems.length,
      },
      ...dynamic,
    ];
  }, [skillCategories, skillItems]);

  const filteredSkills = useMemo(() => {
    return skillItems.filter((skill) => {
      const matchSearch =
        skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategoryId === 'all-skills' || skill.category === selectedCategoryId;
      return matchSearch && matchCategory;
    });
  }, [skillItems, searchQuery, selectedCategoryId]);

  useEffect(() => {
    if (selectedSkillIndex > filteredSkills.length - 1) {
      setSelectedSkillIndex(0);
    }
  }, [filteredSkills.length, selectedSkillIndex]);

  const selectedSkill = filteredSkills[selectedSkillIndex];

  useEffect(() => {
    if (!selectedSkill) {
      setSelectedFileId(null);
      return;
    }
    const fileIds = flattenFileNodes(selectedSkill.tree);
    if (!selectedFileId || !fileIds.includes(selectedFileId)) {
      setSelectedFileId(fileIds[0] || null);
    }
  }, [selectedSkill, selectedFileId]);

  useEffect(() => {
    if (!showAIMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!aiMenuRef.current) return;
      if (!aiMenuRef.current.contains(event.target as Node)) {
        setShowAIMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAIMenu]);

  useEffect(() => {
    setShowAIMenu(false);
    setAiInputMode(null);
    setAiInputError(null);
  }, [selectedSkill?.id]);

  const selectedFile = selectedSkill?.files.find((file) => file.id === selectedFileId);
  const editingCategory = skillCategories.find((cat) => cat.id === editingCategoryId) || null;
  const editingSkill = skillItems.find((skill) => skill.id === editingSkillId) || null;

  const categoryEditorInitial: CategoryDraft = editingCategory
    ? {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: 'skills',
        tags: editingCategory.tags,
      }
    : {
        name: '',
        icon: 'FolderOpen',
        color: '#3b82f6',
        type: 'skills',
        tags: [],
      };

  const skillEditorInitialBase: SkillItemDraft = editingSkill
    ? {
        title: editingSkill.title,
        subtitle: editingSkill.subtitle,
        description: editingSkill.description,
        category: editingSkill.category,
        tags: editingSkill.tags,
        content:
          editingSkill.files.find((file) => file.language === 'markdown')?.code || editingSkill.files[0]?.code || '',
      }
    : {
        title: '',
        subtitle: '',
        description: '',
        category: skillCategories[0]?.id || 'integrations',
        tags: [],
        content: '# Skill\n\nAdd markdown content here.',
      };
  const skillEditorInitial: SkillItemDraft = aiSkillDraft || skillEditorInitialBase;

  const handleSaveCategory = (draft: CategoryDraft) => {
    if (creatingCategory) {
      const newCategory: SkillCategory = {
        id: `${slugify(draft.name) || 'skills-cat'}-${Date.now()}`,
        name: draft.name,
        icon: draft.icon || 'FolderOpen',
        color: draft.color || '#3b82f6',
        tags: draft.tags || [],
      };
      setSkillCategories((prev) => [...prev, newCategory]);
      setSelectedCategoryId(newCategory.id);
      toast({ title: 'Category created', description: newCategory.name, duration: 1500 });
    } else if (editingCategory) {
      setSkillCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: draft.name,
                icon: draft.icon || cat.icon,
                color: draft.color || cat.color,
                tags: draft.tags || [],
              }
            : cat
        )
      );
      toast({ title: 'Category updated', description: draft.name, duration: 1500 });
    }
    setCreatingCategory(false);
    setEditingCategoryId(null);
  };

  const handleSaveSkill = (draft: SkillItemDraft) => {
    if (skillEditorMode === 'manual-create' || skillEditorMode === 'ai-create') {
      const newSkill = createSkillFromDraft(draft);
      setSkillItems((prev) => [...prev, newSkill]);
      setSelectedCategoryId(newSkill.category);
      setSelectedSkillIndex(filteredSkills.length);
      toast({ title: 'Skill created', description: newSkill.title, duration: 1500 });
    } else if (editingSkill) {
      setSkillItems((prev) =>
        prev.map((skill) => (skill.id === editingSkill.id ? updateSkillFromDraft(skill, draft) : skill))
      );
      toast({ title: 'Skill updated', description: draft.title, duration: 1500 });
    }
    setCreatingSkill(false);
    setEditingSkillId(null);
    setSkillEditorMode('manual-create');
    setAiSkillDraft(null);
  };

  const resolveSkillCategoryId = () => {
    if (selectedSkill?.category) return selectedSkill.category;
    if (selectedCategoryId !== 'all-skills') return selectedCategoryId;
    return skillCategories[0]?.id || 'integrations';
  };

  const openSkillAIPreview = (draft: SkillItemDraft, mode: 'ai-create' | 'ai-improve') => {
    setAiSkillDraft(draft);
    setSkillEditorMode(mode);
    if (mode === 'ai-create') {
      setCreatingSkill(true);
      setEditingSkillId(null);
    } else if (selectedSkill) {
      setCreatingSkill(false);
      setEditingSkillId(selectedSkill.id);
    }
  };

  const handleAISkillImportOrCreate = async (input: string) => {
    if (!input) return;
    setAiInputLoading(true);
    setAiInputError(null);
    try {
      const suggestion =
        aiInputMode === 'import' ? await importSkillFromUrlWithAI(input) : await createSkillWithAI(input);
      openSkillAIPreview(
        {
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          description: suggestion.description,
          category: resolveSkillCategoryId(),
          tags: suggestion.tags,
          content: suggestion.content,
        },
        'ai-create'
      );
      setAiInputMode(null);
      setShowAIMenu(false);
      toast({ title: 'AI draft ready', description: 'Review and save to create.', duration: 1800 });
    } catch (error) {
      setAiInputError(error instanceof Error ? error.message : 'Failed to generate AI skill.');
    } finally {
      setAiInputLoading(false);
    }
  };

  const handleAISkillImprove = async () => {
    if (!selectedSkill) return;
    setShowAIMenu(false);
    setAiInputLoading(true);
    try {
      const suggestion = await improveSkillWithAI({
        title: selectedSkill.title,
        subtitle: selectedSkill.subtitle,
        description: selectedSkill.description,
        content: selectedSkill.files.find((file) => file.language === 'markdown')?.code || '',
        tags: selectedSkill.tags,
      });
      openSkillAIPreview(
        {
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          description: suggestion.description,
          category: selectedSkill.category,
          tags: suggestion.tags,
          content: suggestion.content,
        },
        'ai-improve'
      );
      toast({ title: 'Improved draft ready', description: 'Review and save to apply.', duration: 1800 });
    } catch (error) {
      toast({
        title: 'AI improve failed',
        description: error instanceof Error ? error.message : 'Failed to improve skill.',
        variant: 'destructive',
        duration: 2200,
      });
    } finally {
      setAiInputLoading(false);
    }
  };

  return (
    <div className="flex h-full" data-testid="skills-browser">
      <CategorySidebar
        title="Categories"
        items={categoryItems}
        selectedId={selectedCategoryId}
        onSelect={(id) => {
          setSelectedCategoryId(id);
          setSelectedSkillIndex(0);
        }}
        onCreate={() => {
          setCreatingCategory(true);
          setEditingCategoryId(null);
        }}
        onEdit={(id) => {
          if (id === 'all-skills') return;
          setEditingCategoryId(id);
          setCreatingCategory(false);
        }}
        testIdPrefix="skills-cat"
      />

      <div className="flex w-80 shrink-0 flex-col border-white/10 border-r">
        <div className="flex items-center justify-between border-white/10 border-b p-3">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Skills ({filteredSkills.length})
          </span>
          <button
            onClick={() => {
              setSkillEditorMode('manual-create');
              setAiSkillDraft(null);
              setCreatingSkill(true);
              setEditingSkillId(null);
            }}
            data-testid="add-skill-btn"
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-400">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredSkills.length ? (
            filteredSkills.map((skill, idx) => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkillIndex(idx)}
                data-testid={`skills-item-${skill.id}`}
                className={`mb-1 w-full rounded-lg border p-3 text-left transition-all ${
                  idx === selectedSkillIndex
                    ? 'border-blue-500/30 bg-blue-600/15 text-white'
                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20">
                    <Bot className="h-3.5 w-3.5 text-blue-300" />
                  </div>
                  <span className="truncate font-medium text-sm">{skill.title}</span>
                </div>
                <p className="ml-8 truncate text-gray-500 text-xs">{skill.subtitle}</p>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 text-sm">No skills found</div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selectedSkill ? (
          <div className="max-w-5xl">
            <ItemDisplay
              title={selectedSkill.title}
              subtitle={selectedSkill.subtitle}
              description={<p className="text-gray-300 text-sm">{selectedSkill.description}</p>}
              tags={selectedSkill.tags}
              onEdit={() => {
                setSkillEditorMode('manual-edit');
                setAiSkillDraft(null);
                setCreatingSkill(false);
                setEditingSkillId(selectedSkill.id);
              }}
              extraActions={
                <div className="flex items-center gap-2">
                  <div className="relative" ref={aiMenuRef}>
                    <button
                      onClick={() => setShowAIMenu((prev) => !prev)}
                      data-testid="skills-ai-btn"
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
                          Import skill
                        </button>
                        <button
                          onClick={() => void handleAISkillImprove()}
                          className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                          Improve skill
                        </button>
                        <button
                          onClick={() => {
                            setAiInputMode('create');
                            setAiInputError(null);
                            setShowAIMenu(false);
                          }}
                          className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                          Create skill
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      downloadTextFile(
                        `${selectedSkill.id}.json`,
                        JSON.stringify(
                          {
                            id: selectedSkill.id,
                            title: selectedSkill.title,
                            subtitle: selectedSkill.subtitle,
                            category: selectedSkill.category,
                            tags: selectedSkill.tags,
                            files: selectedSkill.files,
                            tree: selectedSkill.tree,
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                    title="Download skill folder bundle">
                    <Download className="h-4 w-4" />
                  </button>
                  {aiInputLoading && <span className="text-violet-300 text-xs">AI working...</span>}
                </div>
              }
              className="max-w-5xl"
            />

            <div className="grid grid-cols-[280px_1fr] gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                <div className="px-2 py-1 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Skill Files
                </div>
                <Tree
                  nodes={selectedSkill.tree}
                  selectedId={selectedFileId || undefined}
                  onSelect={(node) => setSelectedFileId(node.id)}
                  defaultExpandedIds={selectedSkill.tree.map((node) => node.id)}
                />
              </div>

              <div>
                {selectedFile ? (
                  <SnippetViewer
                    title={selectedFile.name}
                    language={selectedFile.language}
                    code={selectedFile.code}
                    onDownload={() => downloadTextFile(selectedFile.name, selectedFile.code)}
                    downloadLabel="Download"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] text-gray-500 text-sm">
                    Select a file from the tree.
                  </div>
                )}
                {selectedFile && <p className="mt-2 text-gray-500 text-xs">{selectedFile.description}</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Select a skill to preview its files and snippets.
          </div>
        )}
      </div>

      <CategoryEditorModal
        isOpen={creatingCategory || Boolean(editingCategory)}
        title={creatingCategory ? 'Create Skill Category' : 'Edit Skill Category'}
        initial={categoryEditorInitial}
        resetKey={creatingCategory ? 'create-skill-category' : editingCategory?.id}
        onSave={handleSaveCategory}
        onClose={() => {
          setCreatingCategory(false);
          setEditingCategoryId(null);
        }}
      />

      <SkillItemEditorModal
        isOpen={creatingSkill || Boolean(editingSkill)}
        title={
          skillEditorMode === 'ai-create'
            ? 'AI Preview · Create Skill'
            : skillEditorMode === 'ai-improve'
              ? 'AI Preview · Improve Skill'
              : creatingSkill
                ? 'Create Skill'
                : 'Edit Skill'
        }
        categories={skillCategories.map((cat) => ({ id: cat.id, name: cat.name }))}
        initial={skillEditorInitial}
        resetKey={
          skillEditorMode.startsWith('ai')
            ? `ai-${skillEditorMode}-${editingSkill?.id || 'new'}`
            : creatingSkill
              ? 'create-skill-item'
              : editingSkill?.id
        }
        onSave={handleSaveSkill}
        onClose={() => {
          setCreatingSkill(false);
          setEditingSkillId(null);
          setSkillEditorMode('manual-create');
          setAiSkillDraft(null);
        }}
      />

      <AIInputModal
        isOpen={aiInputMode !== null}
        title={aiInputMode === 'import' ? 'Import Skill with AI' : 'Create Skill with AI'}
        description={
          aiInputMode === 'import'
            ? 'Paste a URL. Mighty AI will scrape and convert it into a skill draft.'
            : 'Describe the skill you want. Mighty AI will generate a draft for review.'
        }
        label={aiInputMode === 'import' ? 'Skill URL' : 'Desired skill outcome'}
        placeholder={
          aiInputMode === 'import'
            ? 'https://prompts.chat/prompts/...'
            : 'Create a skill that standardizes PR review with checklists and examples.'
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
        onSubmit={(value) => void handleAISkillImportOrCreate(value)}
      />
    </div>
  );
};

export default SkillsBrowser;
