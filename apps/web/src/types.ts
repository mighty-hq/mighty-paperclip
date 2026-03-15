// Type definitions for the Mighty clone application

export interface ClipboardItem {
  category: string | null;
  content: string;
  id: string;
  isFavorite: boolean;
  language?: string;
  timestamp: Date;
  type: 'text' | 'code' | 'link' | 'image';
}

export interface Category {
  color: string;
  icon: string;
  id: string;
  name: string;
}

export interface Snippet {
  categoryId: string;
  content: string;
  createdAt: Date;
  id: string;
  isFavorite: boolean;
  language?: string;
  tags: string[];
  title: string;
  type: 'text' | 'code' | 'link';
  usageCount: number;
}

export interface Command {
  action: string;
  category: string;
  icon: string;
  id: string;
  subtitle: string;
  title: string;
}

export interface PromptCategory {
  count: number;
  icon: string;
  id: string;
  name: string;
}

export interface Prompt {
  categoryId: string;
  icon: string;
  id: string;
  isFavorite: boolean;
  subtitle: string;
  title: string;
}
