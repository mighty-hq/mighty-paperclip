import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Check, Clock3, Copy, Download, Plus, Users, Wrench } from 'lucide-react';
import CategorySidebar, { CategorySidebarItem } from './shared/CategorySidebar';
import { agentGroups, AgentGroupItem } from '../data/agents';
import type { TreeNodeData } from './ui/tree';
import Tree from './ui/tree';
import CategoryEditorModal, { CategoryDraft } from './shared/CategoryEditorModal';
import AgentItemEditorModal, { AgentItemDraft } from './shared/AgentItemEditorModal';
import ItemDisplay from './shared/ItemDisplay';
import AIInputModal from './shared/AIInputModal';
import { useToast } from '../hooks/use-toast';
import { createAgentWithAI, importAgentFromUrlWithAI, improveAgentWithAI } from '../services/mighty-ai';

interface AgentsBrowserProps {
  searchQuery: string;
}

const CATEGORY_META: Record<string, { name: string; icon: string; color: string; tags: string[] }> = {
  growth: { name: 'Growth Teams', icon: 'TrendingUp', color: '#22c55e', tags: ['marketing'] },
};

const AGENTS_STORAGE_KEY = 'mighty_agents_items_v1';
const AGENT_CATEGORIES_STORAGE_KEY = 'mighty_agents_categories_v1';

type TreeGroup = 'agents' | 'cron' | 'skills';
type SelectedTreeFile = { group: TreeGroup; id: string; name: string; entry: string } | null;
type AgentCategory = { id: string; name: string; icon: string; color: string; tags: string[] };

const GROUP_LABEL: Record<TreeGroup, string> = {
  agents: 'Agent',
  cron: 'Cron job',
  skills: 'Skill',
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const humanize = (value: string) =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const cloneSeedAgents = () => JSON.parse(JSON.stringify(agentGroups)) as AgentGroupItem[];

const defaultAgentCategories: AgentCategory[] = (() => {
  const seeded = Object.entries(CATEGORY_META).map(([id, meta]) => ({
    id,
    name: meta.name,
    icon: meta.icon,
    color: meta.color,
    tags: meta.tags,
  }));
  const seen = new Set(seeded.map((cat) => cat.id));
  for (const item of agentGroups) {
    if (seen.has(item.category)) continue;
    seen.add(item.category);
    seeded.push({
      id: item.category,
      name: humanize(item.category),
      icon: 'Bot',
      color: '#3b82f6',
      tags: ['recipes'],
    });
  }
  return seeded;
})();

const makeTree = (rootId: string, rootName: string, entries: string[]): TreeNodeData[] => [
  {
    id: rootId,
    name: rootName,
    type: 'folder',
    children: entries.map((entry) => ({
      id: `${rootId}-${entry}`,
      name: `${entry}.md`,
      type: 'file',
    })),
  },
];

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

const getFrontmatter = (markdown: string) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] || '';
};

const getMetadataBlock = (markdown: string) => {
  const frontmatter = getFrontmatter(markdown);
  if (!frontmatter) return '';
  const templatesStart = frontmatter.indexOf('\ntemplates:');
  return templatesStart >= 0 ? frontmatter.slice(0, templatesStart) : frontmatter;
};

const parseSectionList = (metadata: string, section: string, key: string) => {
  const lines = metadata.split('\n');
  const items: string[] = [];
  let inSection = false;
  let sectionIndent = 0;

  for (const line of lines) {
    const indent = (line.match(/^\s*/) || [''])[0].length;
    const trimmed = line.trim();
    if (!inSection) {
      if (trimmed === `${section}:`) {
        inSection = true;
        sectionIndent = indent;
      }
      continue;
    }
    if (trimmed.length === 0) continue;
    if (indent <= sectionIndent && !trimmed.startsWith('-')) break;
    const match = line.match(new RegExp(`^\\s*-\\s*${key}:\\s*(.+)\\s*$`));
    if (match?.[1]) items.push(match[1].replace(/^["']|["']$/g, '').trim());
  }
  return items;
};

const parseRequiredSkills = (metadata: string) => {
  const inlineMatch = metadata.match(/^\s*requiredSkills:\s*\[(.*?)\]\s*$/m);
  if (inlineMatch) {
    return inlineMatch[1]
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  const lines = metadata.split('\n');
  const skills: string[] = [];
  let inSection = false;
  let sectionIndent = 0;
  for (const line of lines) {
    const indent = (line.match(/^\s*/) || [''])[0].length;
    const trimmed = line.trim();
    if (!inSection) {
      if (trimmed === 'requiredSkills:') {
        inSection = true;
        sectionIndent = indent;
      }
      continue;
    }
    if (trimmed.length === 0) continue;
    if (indent <= sectionIndent && !trimmed.startsWith('-')) break;
    const match = line.match(/^\s*-\s*(.+)\s*$/);
    if (match?.[1]) skills.push(match[1].replace(/^["']|["']$/g, '').trim());
  }
  return skills;
};

const deriveListsFromMarkdown = (markdown: string) => {
  const metadata = getMetadataBlock(markdown);
  if (!metadata) return { agents: [] as string[], cronJobs: [] as string[], skills: [] as string[] };
  const agents = parseSectionList(metadata, 'agents', 'role');
  const cronJobs = parseSectionList(metadata, 'cronJobs', 'id');
  const skills = parseRequiredSkills(metadata);
  return { agents, cronJobs, skills };
};

const extractSectionForEntry = (markdown: string, entry: string) => {
  const lines = markdown.split('\n');
  const entryPattern = entry
    .split('-')
    .map((part) => escapeRegExp(part))
    .join('[-_\\s/]*');
  const headingRegex = new RegExp(`^#{1,6}\\s+.*${entryPattern}.*$`, 'i');

  const headingIndex = lines.findIndex((line) => headingRegex.test(line.trim()));
  if (headingIndex >= 0) {
    const nextHeadingOffset = lines.slice(headingIndex + 1).findIndex((line) => /^#{1,6}\s+/.test(line.trim()));
    const endIndex = nextHeadingOffset === -1 ? lines.length : headingIndex + 1 + nextHeadingOffset;
    return lines.slice(headingIndex, endIndex).join('\n').trim();
  }

  const tokenRegex = new RegExp(
    entry
      .split('-')
      .map((part) => escapeRegExp(part))
      .join('|'),
    'i'
  );

  const matchIndex = lines.findIndex((line) => tokenRegex.test(line));
  if (matchIndex >= 0) {
    const start = Math.max(0, matchIndex - 4);
    const end = Math.min(lines.length, matchIndex + 6);
    return lines.slice(start, end).join('\n').trim();
  }

  return '';
};

const findEntryIndex = (markdown: string, entry: string) => {
  const entryPattern = entry
    .split('-')
    .map((part) => escapeRegExp(part))
    .join('[-_\\s/]*');
  const headingRegex = new RegExp(`^#{1,6}\\s+.*${entryPattern}.*$`, 'im');
  const headingMatch = headingRegex.exec(markdown);
  if (headingMatch?.index !== undefined) return headingMatch.index;

  const tokenRegex = new RegExp(
    entry
      .split('-')
      .map((part) => escapeRegExp(part))
      .join('|'),
    'i'
  );
  const tokenMatch = tokenRegex.exec(markdown);
  return tokenMatch?.index ?? -1;
};

const AgentsBrowser: React.FC<AgentsBrowserProps> = ({ searchQuery }) => {
  const { toast } = useToast();
  const [agentItems, setAgentItems] = useState<AgentGroupItem[]>(() => {
    if (typeof window === 'undefined') return cloneSeedAgents();
    try {
      const raw = window.localStorage.getItem(AGENTS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AgentGroupItem[]) : cloneSeedAgents();
    } catch {
      return cloneSeedAgents();
    }
  });
  const [agentCategories, setAgentCategories] = useState<AgentCategory[]>(() => {
    if (typeof window === 'undefined') return defaultAgentCategories;
    try {
      const raw = window.localStorage.getItem(AGENT_CATEGORIES_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AgentCategory[]) : defaultAgentCategories;
    } catch {
      return defaultAgentCategories;
    }
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState('all-agents');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [selectedNode, setSelectedNode] = useState<SelectedTreeFile>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [agentEditorMode, setAgentEditorMode] = useState<'manual-create' | 'manual-edit' | 'ai-create' | 'ai-improve'>(
    'manual-create'
  );
  const [aiAgentDraft, setAiAgentDraft] = useState<AgentItemDraft | null>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const aiMenuRef = useRef<HTMLDivElement | null>(null);
  const [aiInputMode, setAiInputMode] = useState<null | 'import' | 'create'>(null);
  const [aiInputLoading, setAiInputLoading] = useState(false);
  const [aiInputError, setAiInputError] = useState<string | null>(null);
  const markdownRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    window.localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agentItems));
  }, [agentItems]);

  useEffect(() => {
    window.localStorage.setItem(AGENT_CATEGORIES_STORAGE_KEY, JSON.stringify(agentCategories));
  }, [agentCategories]);

  const categoryItems: CategorySidebarItem[] = useMemo(() => {
    const dynamic = agentCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      tags: cat.tags,
      count: agentItems.filter((item) => item.category === cat.id).length,
    }));
    return [
      {
        id: 'all-agents',
        name: 'All Agents',
        icon: 'Bot',
        color: '#3b82f6',
        tags: ['recipes'],
        count: agentItems.length,
      },
      ...dynamic,
    ];
  }, [agentCategories, agentItems]);

  const filteredItems = useMemo(() => {
    return agentItems.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategoryId === 'all-agents' || item.category === selectedCategoryId;
      return matchSearch && matchCategory;
    });
  }, [agentItems, searchQuery, selectedCategoryId]);

  useEffect(() => {
    if (selectedItemIndex > filteredItems.length - 1) setSelectedItemIndex(0);
  }, [filteredItems.length, selectedItemIndex]);

  const selectedItem = filteredItems[selectedItemIndex];

  const agentsTree = useMemo(
    () => (selectedItem ? makeTree(`${selectedItem.id}-agents`, 'agents', selectedItem.agents) : []),
    [selectedItem]
  );
  const cronTree = useMemo(
    () => (selectedItem ? makeTree(`${selectedItem.id}-cron`, 'cron-jobs', selectedItem.cronJobs) : []),
    [selectedItem]
  );
  const skillsTree = useMemo(
    () => (selectedItem ? makeTree(`${selectedItem.id}-skills`, 'skills', selectedItem.skills) : []),
    [selectedItem]
  );

  useEffect(() => {
    if (!selectedItem) {
      setSelectedNode(null);
      return;
    }
    const firstAgent = selectedItem.agents[0];
    if (firstAgent) {
      setSelectedNode({
        group: 'agents',
        id: `${selectedItem.id}-agents-${firstAgent}`,
        name: `${firstAgent}.md`,
        entry: firstAgent,
      });
      return;
    }
    const firstCron = selectedItem.cronJobs[0];
    if (firstCron) {
      setSelectedNode({
        group: 'cron',
        id: `${selectedItem.id}-cron-${firstCron}`,
        name: `${firstCron}.md`,
        entry: firstCron,
      });
      return;
    }
    const firstSkill = selectedItem.skills[0];
    if (firstSkill) {
      setSelectedNode({
        group: 'skills',
        id: `${selectedItem.id}-skills-${firstSkill}`,
        name: `${firstSkill}.md`,
        entry: firstSkill,
      });
      return;
    }
    setSelectedNode(null);
  }, [selectedItem?.id]);

  useEffect(() => {
    if (!selectedItem || !selectedNode || !markdownRef.current) return;
    const index = findEntryIndex(selectedItem.data, selectedNode.entry);
    if (index < 0) return;
    const textarea = markdownRef.current;
    textarea.focus();
    textarea.setSelectionRange(index, Math.min(selectedItem.data.length, index + selectedNode.entry.length));
    const lineIndex = selectedItem.data.slice(0, index).split('\n').length;
    textarea.scrollTop = Math.max(0, (lineIndex - 4) * 20);
  }, [selectedItem?.id, selectedNode?.id]);

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
  }, [selectedItem?.id]);

  const selectedLabel = selectedNode?.name ?? `${selectedItem?.id || 'recipe'}.md`;
  const editingCategory = agentCategories.find((cat) => cat.id === editingCategoryId) || null;
  const editingItem = agentItems.find((item) => item.id === editingItemId) || null;

  const categoryEditorInitial: CategoryDraft = editingCategory
    ? {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: 'agents',
        tags: editingCategory.tags,
      }
    : {
        name: '',
        icon: 'FolderOpen',
        color: '#3b82f6',
        type: 'agents',
        tags: [],
      };

  const itemEditorInitialBase: AgentItemDraft = editingItem
    ? {
        title: editingItem.title,
        subtitle: editingItem.subtitle,
        summary: editingItem.summary,
        author: editingItem.author,
        sourceUrl: editingItem.sourceUrl,
        category: editingItem.category,
        tags: editingItem.tags,
        content: editingItem.data,
      }
    : {
        title: '',
        subtitle: '',
        summary: '',
        author: 'Mighty Shortcut',
        sourceUrl: '',
        category: agentCategories[0]?.id || 'growth',
        tags: [],
        content: `---
id: new-agent-team
name: New Agent Team
version: 0.1.0
description: Team description
kind: team
cronJobs: []
requiredSkills: []
team:
  teamId: new-agent-team
agents: []
---
# New Agent Team
`,
      };
  const itemEditorInitial: AgentItemDraft = aiAgentDraft || itemEditorInitialBase;

  const handleSaveCategory = (draft: CategoryDraft) => {
    if (creatingCategory) {
      const newCategory: AgentCategory = {
        id: `${slugify(draft.name) || 'agents-cat'}-${Date.now()}`,
        name: draft.name,
        icon: draft.icon || 'FolderOpen',
        color: draft.color || '#3b82f6',
        tags: draft.tags || [],
      };
      setAgentCategories((prev) => [...prev, newCategory]);
      setSelectedCategoryId(newCategory.id);
      toast({ title: 'Category created', description: newCategory.name, duration: 1500 });
    } else if (editingCategory) {
      setAgentCategories((prev) =>
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

  const handleSaveItem = (draft: AgentItemDraft) => {
    const parsed = deriveListsFromMarkdown(draft.content);
    if (agentEditorMode === 'manual-create' || agentEditorMode === 'ai-create') {
      const id = `${slugify(draft.title) || 'agent-item'}-${Date.now()}`;
      const newItem: AgentGroupItem = {
        id,
        title: draft.title,
        subtitle: draft.subtitle,
        category: draft.category,
        tags: draft.tags,
        author: draft.author || 'Mighty Shortcut',
        sourceUrl: draft.sourceUrl || '',
        summary: draft.summary,
        agents: parsed.agents,
        cronJobs: parsed.cronJobs,
        skills: parsed.skills,
        data: draft.content,
      };
      setAgentItems((prev) => [...prev, newItem]);
      setSelectedCategoryId(newItem.category);
      setSelectedItemIndex(filteredItems.length);
      toast({ title: 'Agent item created', description: newItem.title, duration: 1500 });
    } else if (editingItem) {
      setAgentItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: draft.title,
                subtitle: draft.subtitle,
                summary: draft.summary,
                author: draft.author,
                sourceUrl: draft.sourceUrl,
                category: draft.category,
                tags: draft.tags,
                agents: parsed.agents.length ? parsed.agents : item.agents,
                cronJobs: parsed.cronJobs.length ? parsed.cronJobs : item.cronJobs,
                skills: parsed.skills.length ? parsed.skills : item.skills,
                data: draft.content,
              }
            : item
        )
      );
      toast({ title: 'Agent item updated', description: draft.title, duration: 1500 });
    }
    setCreatingItem(false);
    setEditingItemId(null);
    setAgentEditorMode('manual-create');
    setAiAgentDraft(null);
  };

  const resolveAgentCategoryId = () => {
    if (selectedItem?.category) return selectedItem.category;
    if (selectedCategoryId !== 'all-agents') return selectedCategoryId;
    return agentCategories[0]?.id || 'growth';
  };

  const openAgentAIPreview = (draft: AgentItemDraft, mode: 'ai-create' | 'ai-improve') => {
    setAiAgentDraft(draft);
    setAgentEditorMode(mode);
    if (mode === 'ai-create') {
      setCreatingItem(true);
      setEditingItemId(null);
    } else if (selectedItem) {
      setCreatingItem(false);
      setEditingItemId(selectedItem.id);
    }
  };

  const handleAIAgentImportOrCreate = async (input: string) => {
    if (!input) return;
    setAiInputLoading(true);
    setAiInputError(null);
    try {
      const suggestion =
        aiInputMode === 'import' ? await importAgentFromUrlWithAI(input) : await createAgentWithAI(input);
      openAgentAIPreview(
        {
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          summary: suggestion.summary,
          author: suggestion.author || 'Mighty Shortcut',
          sourceUrl: suggestion.sourceUrl || (aiInputMode === 'import' ? input : ''),
          category: resolveAgentCategoryId(),
          tags: suggestion.tags,
          content: suggestion.content,
        },
        'ai-create'
      );
      setAiInputMode(null);
      setShowAIMenu(false);
      toast({ title: 'AI draft ready', description: 'Review and save to create.', duration: 1800 });
    } catch (error) {
      setAiInputError(error instanceof Error ? error.message : 'Failed to generate AI agent.');
    } finally {
      setAiInputLoading(false);
    }
  };

  const handleAIAgentImprove = async () => {
    if (!selectedItem) return;
    setShowAIMenu(false);
    setAiInputLoading(true);
    try {
      const suggestion = await improveAgentWithAI({
        title: selectedItem.title,
        subtitle: selectedItem.subtitle,
        summary: selectedItem.summary,
        author: selectedItem.author,
        sourceUrl: selectedItem.sourceUrl,
        content: selectedItem.data,
        tags: selectedItem.tags,
      });
      openAgentAIPreview(
        {
          title: suggestion.title,
          subtitle: suggestion.subtitle,
          summary: suggestion.summary,
          author: suggestion.author || selectedItem.author || 'Mighty Shortcut',
          sourceUrl: suggestion.sourceUrl || selectedItem.sourceUrl || '',
          category: selectedItem.category,
          tags: suggestion.tags,
          content: suggestion.content,
        },
        'ai-improve'
      );
      toast({ title: 'Improved draft ready', description: 'Review and save to apply.', duration: 1800 });
    } catch (error) {
      toast({
        title: 'AI improve failed',
        description: error instanceof Error ? error.message : 'Failed to improve agent.',
        variant: 'destructive',
        duration: 2200,
      });
    } finally {
      setAiInputLoading(false);
    }
  };

  const copySource = async () => {
    if (!selectedItem) return;
    try {
      await navigator.clipboard.writeText(selectedItem.data);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 1500);
      toast({ title: 'Copied source', duration: 1200 });
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive', duration: 1500 });
    }
  };

  const downloadCurrentSelection = () => {
    if (!selectedItem) return;
    if (!selectedNode) {
      downloadTextFile(`${selectedItem.id}.md`, selectedItem.data);
      return;
    }
    const section = extractSectionForEntry(selectedItem.data, selectedNode.entry);
    if (section) {
      downloadTextFile(selectedNode.name, section);
      return;
    }
    downloadTextFile(`${selectedItem.id}.md`, selectedItem.data);
  };

  const downloadAgentBundle = () => {
    if (!selectedItem) return;
    downloadTextFile(
      `${selectedItem.id}.json`,
      JSON.stringify(
        {
          id: selectedItem.id,
          title: selectedItem.title,
          subtitle: selectedItem.subtitle,
          category: selectedItem.category,
          tags: selectedItem.tags,
          author: selectedItem.author,
          sourceUrl: selectedItem.sourceUrl,
          summary: selectedItem.summary,
          agents: selectedItem.agents,
          cronJobs: selectedItem.cronJobs,
          skills: selectedItem.skills,
          markdown: selectedItem.data,
        },
        null,
        2
      )
    );
  };

  return (
    <div className="flex h-full" data-testid="agents-browser">
      <CategorySidebar
        title="Categories"
        items={categoryItems}
        selectedId={selectedCategoryId}
        onSelect={(id) => {
          setSelectedCategoryId(id);
          setSelectedItemIndex(0);
        }}
        onCreate={() => {
          setCreatingCategory(true);
          setEditingCategoryId(null);
        }}
        onEdit={(id) => {
          if (id === 'all-agents') return;
          setEditingCategoryId(id);
          setCreatingCategory(false);
        }}
        testIdPrefix="agents-cat"
      />

      <div className="flex w-80 shrink-0 flex-col border-white/10 border-r">
        <div className="flex items-center justify-between border-white/10 border-b p-3">
          <span className="font-semibold text-gray-500 text-xs uppercase tracking-wider">
            Agents ({filteredItems.length})
          </span>
          <button
            onClick={() => {
              setAgentEditorMode('manual-create');
              setAiAgentDraft(null);
              setCreatingItem(true);
              setEditingItemId(null);
            }}
            data-testid="add-agent-item-btn"
            className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-400">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {filteredItems.length ? (
            filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setSelectedItemIndex(idx)}
                data-testid={`agents-item-${item.id}`}
                className={`mb-1 w-full rounded-lg border p-3 text-left transition-all ${
                  idx === selectedItemIndex
                    ? 'border-blue-500/30 bg-blue-600/15 text-white'
                    : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                <div className="mb-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/20">
                    <Bot className="h-3.5 w-3.5 text-blue-300" />
                  </div>
                  <span className="truncate font-medium text-sm">{item.title}</span>
                </div>
                <p className="ml-8 truncate text-gray-500 text-xs">{item.subtitle}</p>
              </button>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500 text-sm">No agent recipes found</div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {selectedItem ? (
          <div className="max-w-6xl">
            <ItemDisplay
              title={selectedItem.title}
              subtitle={selectedItem.subtitle}
              description={<p className="text-gray-300 text-sm">{selectedItem.summary}</p>}
              tags={selectedItem.tags}
              onEdit={() => {
                setAgentEditorMode('manual-edit');
                setAiAgentDraft(null);
                setCreatingItem(false);
                setEditingItemId(selectedItem.id);
              }}
              extraActions={
                <div className="flex items-center gap-2">
                  <div className="relative" ref={aiMenuRef}>
                    <button
                      onClick={() => setShowAIMenu((prev) => !prev)}
                      data-testid="agents-ai-btn"
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
                          Import agent
                        </button>
                        <button
                          onClick={() => void handleAIAgentImprove()}
                          className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                          Improve agent
                        </button>
                        <button
                          onClick={() => {
                            setAiInputMode('create');
                            setAiInputError(null);
                            setShowAIMenu(false);
                          }}
                          className="w-full rounded px-3 py-2 text-left text-gray-200 text-sm transition-colors hover:bg-white/10">
                          Create agent
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={downloadAgentBundle}
                    className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                    title="Download item bundle">
                    <Download className="h-4 w-4" />
                  </button>
                  {aiInputLoading && <span className="text-violet-300 text-xs">AI working...</span>}
                </div>
              }
              meta={
                <p className="text-gray-500 text-xs">
                  by {selectedItem.author} · source:{' '}
                  <a
                    href={selectedItem.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 underline hover:text-blue-300">
                    raw markdown
                  </a>
                </p>
              }
              className="max-w-6xl"
            />

            <div className="grid grid-cols-[280px_1fr] gap-3">
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    <Users className="h-3.5 w-3.5" /> agents
                  </div>
                  <Tree
                    nodes={agentsTree}
                    selectedId={selectedNode?.group === 'agents' ? selectedNode.id : undefined}
                    onSelect={(node) =>
                      setSelectedNode({
                        group: 'agents',
                        id: node.id,
                        name: node.name,
                        entry: node.name.replace(/\.md$/i, ''),
                      })
                    }
                    defaultExpandedIds={agentsTree.map((node) => node.id)}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    <Clock3 className="h-3.5 w-3.5" /> cron jobs
                  </div>
                  <Tree
                    nodes={cronTree}
                    selectedId={selectedNode?.group === 'cron' ? selectedNode.id : undefined}
                    onSelect={(node) =>
                      setSelectedNode({
                        group: 'cron',
                        id: node.id,
                        name: node.name,
                        entry: node.name.replace(/\.md$/i, ''),
                      })
                    }
                    defaultExpandedIds={cronTree.map((node) => node.id)}
                  />
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                    <Wrench className="h-3.5 w-3.5" /> skills
                  </div>
                  <Tree
                    nodes={skillsTree}
                    selectedId={selectedNode?.group === 'skills' ? selectedNode.id : undefined}
                    onSelect={(node) =>
                      setSelectedNode({
                        group: 'skills',
                        id: node.id,
                        name: node.name,
                        entry: node.name.replace(/\.md$/i, ''),
                      })
                    }
                    defaultExpandedIds={skillsTree.map((node) => node.id)}
                  />
                </div>
              </div>

              <div>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121521]">
                  <div className="flex items-center justify-between border-white/10 border-b px-3 py-2.5">
                    <div>
                      <div className="font-medium text-sm text-white">Source</div>
                      <div className="text-gray-500 text-xs">{selectedLabel}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={downloadCurrentSelection}
                        className="rounded bg-white/5 px-2.5 py-1.5 text-gray-300 text-xs hover:bg-white/10">
                        Download
                      </button>
                      <button
                        onClick={() => void copySource()}
                        className="inline-flex items-center gap-1.5 rounded bg-white/5 px-2.5 py-1.5 text-gray-300 text-xs hover:bg-white/10">
                        {copiedMarkdown ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {copiedMarkdown ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <textarea
                    ref={markdownRef}
                    readOnly
                    value={selectedItem.data}
                    className="h-[560px] w-full resize-none overflow-auto bg-[#121521] px-3 py-2 font-mono text-gray-200 text-sm outline-none"
                    data-testid="agents-source-markdown"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">Select an agent recipe.</div>
        )}
      </div>

      <CategoryEditorModal
        isOpen={creatingCategory || Boolean(editingCategory)}
        title={creatingCategory ? 'Create Agent Category' : 'Edit Agent Category'}
        initial={categoryEditorInitial}
        resetKey={creatingCategory ? 'create-agent-category' : editingCategory?.id}
        onSave={handleSaveCategory}
        onClose={() => {
          setCreatingCategory(false);
          setEditingCategoryId(null);
        }}
      />

      <AgentItemEditorModal
        isOpen={creatingItem || Boolean(editingItem)}
        title={
          agentEditorMode === 'ai-create'
            ? 'AI Preview · Create Agent'
            : agentEditorMode === 'ai-improve'
              ? 'AI Preview · Improve Agent'
              : creatingItem
                ? 'Create Agent Item'
                : 'Edit Agent Item'
        }
        categories={agentCategories.map((cat) => ({ id: cat.id, name: cat.name }))}
        initial={itemEditorInitial}
        resetKey={
          agentEditorMode.startsWith('ai')
            ? `ai-${agentEditorMode}-${editingItem?.id || 'new'}`
            : creatingItem
              ? 'create-agent-item'
              : editingItem?.id
        }
        onSave={handleSaveItem}
        onClose={() => {
          setCreatingItem(false);
          setEditingItemId(null);
          setAgentEditorMode('manual-create');
          setAiAgentDraft(null);
        }}
      />

      <AIInputModal
        isOpen={aiInputMode !== null}
        title={aiInputMode === 'import' ? 'Import Agent with AI' : 'Create Agent with AI'}
        description={
          aiInputMode === 'import'
            ? 'Paste a source URL. Mighty AI will scrape and convert it into an agent recipe draft.'
            : 'Describe the team/automation outcome. Mighty AI will generate an agent recipe draft.'
        }
        label={aiInputMode === 'import' ? 'Agent recipe URL' : 'Desired agent outcome'}
        placeholder={
          aiInputMode === 'import'
            ? 'https://raw.githubusercontent.com/.../marketing-team.md'
            : 'Create an agent team that researches competitors weekly and reports insights.'
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
        onSubmit={(value) => void handleAIAgentImportOrCreate(value)}
      />
    </div>
  );
};

export default AgentsBrowser;
