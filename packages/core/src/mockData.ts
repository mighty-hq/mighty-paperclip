// Mock data for clipboard history and snippets
// This will be replaced with actual backend data later

import type { ClipboardItem, Category, Snippet, Command, PromptCategory, Prompt } from './types';

export const mockClipboardHistory: ClipboardItem[] = [
  {
    id: '1',
    type: 'text',
    content: 'npm install react-router-dom',
    timestamp: new Date('2025-07-15T10:30:00'),
    isFavorite: false,
    category: null,
  },
  {
    id: '2',
    type: 'code',
    content: `const App = () => {
  return (
    <div className="app">
      <h1>Hello World</h1>
    </div>
  );
};`,
    language: 'javascript',
    timestamp: new Date('2025-07-15T10:25:00'),
    isFavorite: true,
    category: null,
  },
  {
    id: '3',
    type: 'link',
    content: 'https://github.com/extensions',
    timestamp: new Date('2025-07-15T10:20:00'),
    isFavorite: false,
    category: null,
  },
  {
    id: '4',
    type: 'text',
    content: 'john.doe@example.com',
    timestamp: new Date('2025-07-15T10:15:00'),
    isFavorite: false,
    category: null,
  },
  {
    id: '5',
    type: 'code',
    content: `SELECT * FROM users WHERE status = 'active' ORDER BY created_at DESC LIMIT 10;`,
    language: 'sql',
    timestamp: new Date('2025-07-15T10:10:00'),
    isFavorite: false,
    category: null,
  },
  {
    id: '6',
    type: 'text',
    content:
      'Meeting notes: Discussed Q3 roadmap, feature priorities, and team allocation. Action items: Review designs by Friday, schedule follow-up.',
    timestamp: new Date('2025-07-15T09:45:00'),
    isFavorite: true,
    category: null,
  },
  {
    id: '7',
    type: 'link',
    content: 'https://www.figma.com/design/abc123',
    timestamp: new Date('2025-07-15T09:30:00'),
    isFavorite: false,
    category: null,
  },
  {
    id: '8',
    type: 'code',
    content: `git commit -m "feat: add clipboard history feature"`,
    language: 'bash',
    timestamp: new Date('2025-07-15T09:15:00'),
    isFavorite: false,
    category: null,
  },
];

export const mockCategories: Category[] = [
  { id: 'dev', name: 'Development', icon: 'Code2', color: '#3b82f6' },
  { id: 'work', name: 'Work', icon: 'Briefcase', color: '#8b5cf6' },
  { id: 'personal', name: 'Personal', icon: 'User', color: '#10b981' },
  { id: 'snippets', name: 'Snippets', icon: 'FileText', color: '#f59e0b' },
  { id: 'links', name: 'Links', icon: 'Link', color: '#ec4899' },
];

// export const mockSnippets: Snippet[] = [
//   {
//     id: 's1',
//     title: 'React Component Template',
//     type: 'code',
//     content: `import React from 'react';

// const ComponentName = () => {
//   return (
//     <div>
//       {/* Your component code */}
//     </div>
//   );
// };

// export default ComponentName;`,
//     language: 'javascript',
//     categoryId: 'dev',
//     tags: ['react', 'template', 'component'],
//     isFavorite: true,
//     createdAt: new Date('2025-07-10T10:00:00'),
//     usageCount: 15
//   },
//   {
//     id: 's2',
//     title: 'Email Signature',
//     type: 'text',
//     content: `Best regards,\nJohn Doe\nSenior Software Engineer\nTech Corp Inc.\nEmail: john.doe@techcorp.com\nPhone: +1 (555) 123-4567`,
//     categoryId: 'work',
//     tags: ['email', 'signature'],
//     isFavorite: true,
//     createdAt: new Date('2025-07-08T14:00:00'),
//     usageCount: 42
//   },
//   {
//     id: 's3',
//     title: 'MongoDB Query Template',
//     type: 'code',
//     content: `db.collection.find(
//   { field: value },
//   { projection: 1 }
// ).sort({ createdAt: -1 }).limit(10);`,
//     language: 'javascript',
//     categoryId: 'dev',
//     tags: ['mongodb', 'database', 'query'],
//     isFavorite: false,
//     createdAt: new Date('2025-07-05T11:30:00'),
//     usageCount: 8
//   },
//   {
//     id: 's4',
//     title: 'Meeting Notes Template',
//     type: 'text',
//     content: `Meeting: [Topic]\nDate: [Date]\nAttendees: [Names]\n\nAgenda:\n- \n- \n\nDiscussion:\n\n\nAction Items:\n- [ ] \n- [ ] \n\nNext Steps:\n`,
//     categoryId: 'work',
//     tags: ['meeting', 'notes', 'template'],
//     isFavorite: true,
//     createdAt: new Date('2025-07-03T09:00:00'),
//     usageCount: 23
//   },
//   {
//     id: 's5',
//     title: 'CSS Flexbox Center',
//     type: 'code',
//     content: `.container {
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   min-height: 100vh;
// }`,
//     language: 'css',
//     categoryId: 'dev',
//     tags: ['css', 'flexbox', 'center'],
//     isFavorite: false,
//     createdAt: new Date('2025-06-28T16:00:00'),
//     usageCount: 12
//   },
//   {
//     id: 's6',
//     title: 'Home Address',
//     type: 'text',
//     content: '1234 Main Street, Apt 5B\nSan Francisco, CA 94102\nUnited States',
//     categoryId: 'personal',
//     tags: ['address', 'personal'],
//     isFavorite: false,
//     createdAt: new Date('2025-06-25T13:00:00'),
//     usageCount: 5
//   },
//   {
//     id: 's7',
//     title: 'API Documentation Link',
//     type: 'link',
//     content: 'https://developer.mozilla.org/en-US/docs/Web/API',
//     categoryId: 'links',
//     tags: ['documentation', 'api', 'mdn'],
//     isFavorite: true,
//     createdAt: new Date('2025-06-20T10:00:00'),
//     usageCount: 18
//   },
//   {
//     id: 's8',
//     title: 'Git Commit Template',
//     type: 'code',
//     content: `git add .
// git commit -m "type(scope): description"
// git push origin branch-name`,
//     language: 'bash',
//     categoryId: 'dev',
//     tags: ['git', 'commit', 'workflow'],
//     isFavorite: false,
//     createdAt: new Date('2025-06-15T15:30:00'),
//     usageCount: 31
//   },
//   {
//     id: 's9',
//     title: 'Lorem Ipsum',
//     type: 'text',
//     content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
//     categoryId: 'snippets',
//     tags: ['placeholder', 'text'],
//     isFavorite: false,
//     createdAt: new Date('2025-06-10T12:00:00'),
//     usageCount: 7
//   },
//   {
//     id: 's10',
//     title: 'Color Palette',
//     type: 'text',
//     content: 'Primary: #3b82f6\nSecondary: #8b5cf6\nSuccess: #10b981\nWarning: #f59e0b\nDanger: #ef4444\nBackground: #0f172a\nForeground: #f8fafc',
//     categoryId: 'dev',
//     tags: ['colors', 'design', 'palette'],
//     isFavorite: true,
//     createdAt: new Date('2025-06-05T14:30:00'),
//     usageCount: 9
//   }
// ];

export const mockCommands: Command[] = [
  {
    id: 'cmd1',
    title: 'Clipboard History',
    subtitle: 'View and search clipboard history',
    icon: 'ClipboardList',
    action: 'clipboard-history',
    category: 'clipboard',
  },
  {
    id: 'cmd2',
    title: 'My Snippets',
    subtitle: 'Browse saved snippets and presets',
    icon: 'FileText',
    action: 'snippets',
    category: 'snippets',
  },
  {
    id: 'cmd3',
    title: 'Prompts Library',
    subtitle: 'Browse and manage AI prompts',
    icon: 'Sparkles',
    action: 'prompts',
    category: 'prompts',
  },
  {
    id: 'cmd4',
    title: 'Create Snippet',
    subtitle: 'Save a new snippet or preset',
    icon: 'Plus',
    action: 'create-snippet',
    category: 'snippets',
  },
  {
    id: 'cmd5',
    title: 'Manage Categories',
    subtitle: 'Organize your collections and categories',
    icon: 'Folder',
    action: 'categories',
    category: 'organization',
  },
  {
    id: 'cmd6',
    title: 'Settings',
    subtitle: 'Configure preferences and shortcuts',
    icon: 'Settings',
    action: 'settings',
    category: 'system',
  },
];

export const mockPromptCategories: PromptCategory[] = [
  { id: 'all', name: 'All Prompts', icon: 'Sparkles', count: 78 },
  { id: 'favorites', name: 'Favorites', icon: 'Star', count: 0 },
  { id: 'my-prompts', name: 'My Prompts', icon: 'User', count: 0 },
  { id: 'analyze-data', name: 'Analyze data', icon: 'BarChart3', count: 12 },
  { id: 'automate-work', name: 'Automate work', icon: 'Zap', count: 8 },
  { id: 'build-stuff', name: 'Build stuff', icon: 'Hammer', count: 15 },
  { id: 'create-content', name: 'Create content', icon: 'Pen', count: 18 },
  { id: 'fix-optimize', name: 'Fix and optimize', icon: 'Wrench', count: 9 },
  { id: 'knowledge-base', name: 'Knowledge base', icon: 'BookOpen', count: 7 },
  { id: 'manage-files', name: 'Manage files', icon: 'FolderOpen', count: 6 },
  { id: 'setup-dev', name: 'Set up dev', icon: 'Terminal', count: 3 },
];

export const mockPrompts: Prompt[] = [
  {
    id: 'p1',
    title: 'Read this knowledge base. Brief me as the new CEO.',
    subtitle: 'Read /desktop-commander-demo/knowledge-management/day-1-ceo-...',
    icon: 'Sparkles',
    categoryId: 'knowledge-base',
    isFavorite: false,
  },
  {
    id: 'p2',
    title: 'Research competitor, update knowledge base',
    subtitle: "Research Anthropic's latest moves and update the competitors...",
    icon: 'Sparkles',
    categoryId: 'knowledge-base',
    isFavorite: false,
  },
  {
    id: 'p3',
    title: 'Draft investor memo',
    subtitle: 'Draft a one-page investor memo for Q4 and save it to the kno...',
    icon: 'Sparkles',
    categoryId: 'create-content',
    isFavorite: false,
  },
  {
    id: 'p4',
    title: 'Organize Folder by File Type',
    subtitle: 'Sort files into category folders based on type and content',
    icon: 'FolderOpen',
    categoryId: 'manage-files',
    isFavorite: false,
  },
  {
    id: 'p5',
    title: 'Convert PDF to DOC',
    subtitle: 'Convert PDF documents to editable Word format',
    icon: 'FolderOpen',
    categoryId: 'manage-files',
    isFavorite: false,
  },
  {
    id: 'p6',
    title: 'Convert EDOC to DOC',
    subtitle: 'Convert EDOC files to standard Word format',
    icon: 'FolderOpen',
    categoryId: 'manage-files',
    isFavorite: false,
  },
  {
    id: 'p7',
    title: 'Convert CSV to XLS',
    subtitle: 'Convert CSV spreadsheets to Excel format',
    icon: 'FolderOpen',
    categoryId: 'manage-files',
    isFavorite: false,
  },
  {
    id: 'p8',
    title: 'Generate Unit Tests',
    subtitle: 'Automatically generate unit tests for your code',
    icon: 'Sparkles',
    categoryId: 'build-stuff',
    isFavorite: false,
  },
  {
    id: 'p9',
    title: 'Code Review Assistant',
    subtitle: 'Get AI-powered code review suggestions',
    icon: 'Sparkles',
    categoryId: 'build-stuff',
    isFavorite: false,
  },
  {
    id: 'p10',
    title: 'Debug Error Messages',
    subtitle: 'Analyze and fix error messages in your code',
    icon: 'Sparkles',
    categoryId: 'fix-optimize',
    isFavorite: false,
  },
  {
    id: 'p11',
    title: 'Optimize SQL Queries',
    subtitle: 'Improve database query performance',
    icon: 'Sparkles',
    categoryId: 'fix-optimize',
    isFavorite: false,
  },
  {
    id: 'p12',
    title: 'Create Social Media Posts',
    subtitle: 'Generate engaging content for social platforms',
    icon: 'Sparkles',
    categoryId: 'create-content',
    isFavorite: false,
  },
  {
    id: 'p13',
    title: 'Write Blog Post Outline',
    subtitle: 'Create structured outlines for blog articles',
    icon: 'Sparkles',
    categoryId: 'create-content',
    isFavorite: false,
  },
  {
    id: 'p14',
    title: 'Analyze Sales Data',
    subtitle: 'Extract insights from sales metrics and trends',
    icon: 'Sparkles',
    categoryId: 'analyze-data',
    isFavorite: false,
  },
  {
    id: 'p15',
    title: 'Customer Feedback Analysis',
    subtitle: 'Summarize and categorize customer feedback',
    icon: 'Sparkles',
    categoryId: 'analyze-data',
    isFavorite: false,
  },
  {
    id: 'p16',
    title: 'Email Auto-responder',
    subtitle: 'Set up automated email responses',
    icon: 'Sparkles',
    categoryId: 'automate-work',
    isFavorite: false,
  },
  {
    id: 'p17',
    title: 'Meeting Notes Generator',
    subtitle: 'Automatically generate meeting summaries',
    icon: 'Sparkles',
    categoryId: 'automate-work',
    isFavorite: false,
  },
  {
    id: 'p18',
    title: 'Setup React Project',
    subtitle: 'Initialize a new React project with best practices',
    icon: 'Sparkles',
    categoryId: 'setup-dev',
    isFavorite: false,
  },
];
