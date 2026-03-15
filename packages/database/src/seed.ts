import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '@mighty/types';

export const DEFAULT_USER_CATEGORIES = [
  // Snippets
  { name: 'Typescript', icon: 'FileCode', color: '#3178c6', type: 'snippets' as const, tags: ['default'] },
  { name: 'Cursor', icon: 'Cursor', color: '#8b5cf6', type: 'snippets' as const, tags: ['default'] },
  { name: 'CSS', icon: 'Palette', color: '#e11d48', type: 'snippets' as const, tags: ['default'] },
  // Prompts
  { name: 'Productivity', icon: 'Zap', color: '#10b981', type: 'prompts' as const, tags: ['default'] },
  { name: 'Travel', icon: 'Plane', color: '#0ea5e9', type: 'prompts' as const, tags: ['default'] },
  { name: 'Work', icon: 'Briefcase', color: '#6366f1', type: 'prompts' as const, tags: ['default'] },
  // Agents
  { name: 'Cursor', icon: 'Cursor', color: '#8b5cf6', type: 'agents' as const, tags: ['default'] },
  { name: 'Research', icon: 'Search', color: '#2563eb', type: 'agents' as const, tags: ['default'] },
  { name: 'Ideas', icon: 'Lightbulb', color: '#f59e0b', type: 'agents' as const, tags: ['default'] },
  // Skills
  { name: 'Cursor', icon: 'Cursor', color: '#8b5cf6', type: 'skills' as const, tags: ['default'] },
  { name: 'Claude', icon: 'Bot', color: '#f97316', type: 'skills' as const, tags: ['default'] },
  { name: 'Orchestration', icon: 'GitBranch', color: '#0891b2', type: 'skills' as const, tags: ['default'] },
  { name: 'Flows', icon: 'Workflow', color: '#14b8a6', type: 'skills' as const, tags: ['default'] },
  // Quick-links (pinned)
  { name: 'Favorites', icon: 'Star', color: '#eab308', type: 'pinned' as const, tags: ['default'] },
] satisfies Array<{
  name: string;
  icon: string;
  color: string;
  type: Category['type'];
  tags: string[];
}>;

export const DEFAULT_USER_SETTINGS: {
  theme: string;
  scale: string;
  launchOnStartup: boolean;
  showInMenuBar: boolean;
  autoUpdate: boolean;
  animations: boolean;
  historyRetention: string;
} = {
  theme: 'dark',
  scale: 'medium',
  launchOnStartup: false,
  showInMenuBar: true,
  autoUpdate: true,
  animations: true,
  historyRetention: '30d',
};

// Default snippets: 3–5 per category (category resolved by name at seed time)
type SnippetDraft = {
  title: string;
  description: string;
  content: string;
  type: 'Editor' | 'Terminal' | 'Note' | 'Other';
  language: string;
  categoryName: string;
  tags: string[];
  isFavorite?: boolean;
};

export const DEFAULT_SNIPPETS: SnippetDraft[] = [
  // Typescript
  {
    title: 'Interface template',
    description: 'Simple TypeScript interface with optional field',
    content: `interface Item {
  id: string;
  name: string;
  description?: string;
}`,
    type: 'Editor',
    language: 'typescript',
    categoryName: 'Typescript',
    tags: ['typescript', 'interface'],
  },
  {
    title: 'Async function with try/catch',
    description: 'Type-safe async function with error handling',
    content: `async function fetchData(): Promise<Data> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  }
}`,
    type: 'Editor',
    language: 'typescript',
    categoryName: 'Typescript',
    tags: ['async', 'fetch', 'error-handling'],
  },
  {
    title: 'Type-safe event handler',
    description: 'React/Svelte-style event handler typing',
    content: `const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};`,
    type: 'Editor',
    language: 'typescript',
    categoryName: 'Typescript',
    tags: ['react', 'events'],
  },
  {
    title: 'Generic helper type',
    description: 'Pick optional keys from an object type',
    content: `type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;`,
    type: 'Editor',
    language: 'typescript',
    categoryName: 'Typescript',
    tags: ['utility-types', 'generics'],
  },
  // Cursor
  {
    title: 'Cursor rules block',
    description: 'Starter for .cursorrules or project rules',
    content: `## Code style
- Use TypeScript for new files.
- Prefer named exports.
- Write short functions; extract when >20 lines.`,
    type: 'Note',
    language: 'markdown',
    categoryName: 'Cursor',
    tags: ['cursor', 'rules'],
  },
  {
    title: 'Composer prompt starter',
    description: 'Clear context for Cursor Composer',
    content: `Context: [file/folder]. Goal: [what you want]. Constraints: [tests, style, deps].`,
    type: 'Note',
    language: 'text',
    categoryName: 'Cursor',
    tags: ['cursor', 'composer'],
  },
  {
    title: '@-mention reference',
    description: 'Reference docs or code in chat',
    content: `@docs [topic] — explain using official docs
@code [path] — use this file/folder as context`,
    type: 'Note',
    language: 'text',
    categoryName: 'Cursor',
    tags: ['cursor', 'chat'],
  },
  // CSS
  {
    title: 'Flexbox center',
    description: 'Center content horizontally and vertically',
    content: `.center {
  display: flex;
  justify-content: center;
  align-items: center;
}`,
    type: 'Editor',
    language: 'css',
    categoryName: 'CSS',
    tags: ['flexbox', 'layout'],
  },
  {
    title: 'Grid two columns',
    description: 'Simple responsive two-column grid',
    content: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}`,
    type: 'Editor',
    language: 'css',
    categoryName: 'CSS',
    tags: ['grid', 'responsive'],
  },
  {
    title: 'Smooth transition',
    description: 'Reusable transition for hover/focus',
    content: `.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}`,
    type: 'Editor',
    language: 'css',
    categoryName: 'CSS',
    tags: ['transition', 'hover'],
  },
  {
    title: 'Truncate text',
    description: 'Single-line truncation with ellipsis',
    content: `.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}`,
    type: 'Editor',
    language: 'css',
    categoryName: 'CSS',
    tags: ['text', 'ellipsis'],
  },
];

// Default prompts: 3–5 per category
type PromptDraft = {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  icon: string;
  categoryName: string;
  tags: string[];
  isFavorite?: boolean;
};

export const DEFAULT_PROMPTS: PromptDraft[] = [
  // Productivity
  {
    title: 'Break down a task',
    subtitle: 'Turn a goal into steps',
    description: 'Get a clear ordered list of steps',
    content: 'Break this into 5–7 concrete steps I can do today: [your goal].',
    icon: 'ListChecks',
    categoryName: 'Productivity',
    tags: ['planning', 'tasks'],
  },
  {
    title: 'Today’s priorities',
    subtitle: 'Top 3 focus items',
    description: 'Narrow to what matters most',
    content: 'I have limited time today. Here’s my list: [list]. What are the top 3 I should do first and why?',
    icon: 'Target',
    categoryName: 'Productivity',
    tags: ['priorities', 'focus'],
  },
  {
    title: 'Meeting summary',
    subtitle: 'Notes to summary',
    description: 'Turn rough notes into a short summary',
    content:
      'Turn these meeting notes into a short summary with: 1) decisions, 2) action items and owners, 3) open questions.\n\n[paste notes]',
    icon: 'FileText',
    categoryName: 'Productivity',
    tags: ['meetings', 'summary'],
  },
  {
    title: 'Quick decision',
    subtitle: 'Pros, cons, recommendation',
    description: 'Structured decision support',
    content: 'I need to decide: [decision]. List 3 pros, 3 cons, and a clear recommendation with one sentence why.',
    icon: 'Scale',
    categoryName: 'Productivity',
    tags: ['decisions'],
  },
  // Travel
  {
    title: 'Packing list',
    subtitle: 'Trip-specific list',
    description: 'Generate a packing list for your trip',
    content:
      'Create a packing list for: [trip type, e.g. 3-day business trip / beach weekend]. Include essentials only, no obvious items.',
    icon: 'Luggage',
    categoryName: 'Travel',
    tags: ['packing', 'prep'],
  },
  {
    title: 'Trip summary',
    subtitle: 'Itinerary in one place',
    description: 'One-place overview of your plan',
    content:
      'Summarize this trip into one short overview: dates, flights, accommodation, and top 3 things to do.\n\n[paste details]',
    icon: 'MapPin',
    categoryName: 'Travel',
    tags: ['itinerary', 'summary'],
  },
  {
    title: 'Local tips',
    subtitle: 'First-time visitor tips',
    description: 'Practical tips for a destination',
    content:
      'I’m visiting [city/country] for the first time. Give me 5 practical tips: transport, money, safety, etiquette, one local app or site to use.',
    icon: 'Compass',
    categoryName: 'Travel',
    tags: ['tips', 'local'],
  },
  {
    title: 'Budget estimate',
    subtitle: 'Rough daily budget',
    description: 'Ballpark daily costs',
    content:
      'Rough daily budget for [destination] for a [backpacker/mid-range/luxury] traveler: accommodation, food, transport, activities. One number total per day.',
    icon: 'Wallet',
    categoryName: 'Travel',
    tags: ['budget', 'costs'],
  },
  // Work
  {
    title: 'Email draft',
    subtitle: 'Professional tone',
    description: 'Draft a short email from a brief brief',
    content:
      'Draft a short professional email: [purpose, e.g. request a meeting / follow up on X]. Tone: [formal/friendly]. Keep under 4 sentences.',
    icon: 'Mail',
    categoryName: 'Work',
    tags: ['email', 'draft'],
  },
  {
    title: 'Status update',
    subtitle: 'Progress in 3 bullets',
    description: 'Turn progress into a status blurb',
    content:
      'Turn this into a 3-bullet status update for [stakeholder/team]: what’s done, what’s in progress, what’s blocked or next.\n\n[your notes]',
    icon: 'BarChart2',
    categoryName: 'Work',
    tags: ['status', 'update'],
  },
  {
    title: 'Feedback template',
    subtitle: 'Constructive feedback',
    description: 'Structure feedback clearly',
    content:
      'Help me give constructive feedback on [topic]. Structure: 1) what worked, 2) one specific improvement, 3) one question for them.',
    icon: 'MessageSquare',
    categoryName: 'Work',
    tags: ['feedback', 'review'],
  },
  {
    title: 'Meeting agenda',
    subtitle: 'Short agenda from topic',
    description: 'Draft a short meeting agenda',
    content:
      'Create a 30-min meeting agenda for: [topic]. Include: goal, 3–4 discussion points, and a decision or next step.',
    icon: 'Calendar',
    categoryName: 'Work',
    tags: ['agenda', 'meetings'],
  },
];

// Default quick links (Favorites / pinned)
type QuickLinkDraft = { title: string; url: string; icon: string; isPinned?: boolean };

export const DEFAULT_QUICK_LINKS: QuickLinkDraft[] = [
  { title: 'Gmail', url: 'https://mail.google.com', icon: 'Mail', isPinned: true },
  { title: 'Google Calendar', url: 'https://calendar.google.com', icon: 'Calendar', isPinned: true },
  { title: 'Google Docs', url: 'https://docs.google.com', icon: 'FileText', isPinned: true },
  { title: 'GitHub', url: 'https://github.com', icon: 'Github', isPinned: true },
  { title: 'Notion', url: 'https://notion.so', icon: 'NotebookPen', isPinned: true },
];

function toSnakeCase<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const snake = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    out[snake] = v;
  }
  return out;
}

function categoryKey(name: string, type: string): string {
  return `${name}|${type}`;
}

export async function seedUserDefaults(supabase: SupabaseClient, userId: string) {
  const now = new Date().toISOString();

  for (const category of DEFAULT_USER_CATEGORIES) {
    await supabase.from('categories').upsert(
      toSnakeCase({
        userId,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        tags: category.tags,
        createdAt: now,
        updatedAt: now,
      }) as Record<string, unknown>,
      { onConflict: 'user_id,name,type', ignoreDuplicates: true }
    );
  }

  const { data: categoryRows } = await supabase.from('categories').select('id, name, type').eq('user_id', userId);
  const categoryById = new Map<string, string>();
  for (const row of categoryRows ?? []) {
    const rowObj = row as { id: string; name: string; type: string };
    categoryById.set(categoryKey(rowObj.name, rowObj.type), rowObj.id);
  }

  for (const s of DEFAULT_SNIPPETS) {
    const categoryId = categoryById.get(categoryKey(s.categoryName, 'snippets')) ?? null;
    await supabase.from('snippets').insert(
      toSnakeCase({
        userId,
        categoryId,
        title: s.title,
        description: s.description,
        content: s.content,
        type: s.type,
        language: s.language,
        tags: s.tags,
        isFavorite: s.isFavorite ?? false,
        usageCount: 0,
        createdAt: now,
        updatedAt: now,
      }) as Record<string, unknown>
    );
  }

  for (const p of DEFAULT_PROMPTS) {
    const categoryId = categoryById.get(categoryKey(p.categoryName, 'prompts')) ?? null;
    await supabase.from('prompts').insert(
      toSnakeCase({
        userId,
        categoryId,
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        content: p.content,
        icon: p.icon,
        tags: p.tags,
        isFavorite: p.isFavorite ?? false,
        createdAt: now,
        updatedAt: now,
      }) as Record<string, unknown>
    );
  }

  let sortOrder = 0;
  for (const q of DEFAULT_QUICK_LINKS) {
    await supabase.from('quick_links').insert(
      toSnakeCase({
        userId,
        title: q.title,
        url: q.url,
        icon: q.icon,
        isPinned: q.isPinned ?? true,
        sortOrder: sortOrder++,
        createdAt: now,
        updatedAt: now,
      }) as Record<string, unknown>
    );
  }

  await supabase.from('user_settings').upsert(
    toSnakeCase({
      userId,
      ...DEFAULT_USER_SETTINGS,
      createdAt: now,
      updatedAt: now,
    }) as Record<string, unknown>,
    { onConflict: 'user_id' }
  );
}
