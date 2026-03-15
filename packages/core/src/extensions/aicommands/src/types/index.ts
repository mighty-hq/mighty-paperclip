export type CategoryType = 'all' | 'basic' | 'flag' | 'slash' | 'thinking' | 'settings' | 'environment';
export type BudgetType = 'max' | 'mid' | 'min';

export interface Command {
  alternative?: string;
  category: Exclude<CategoryType, 'all'>;
  deprecated?: boolean;
  description: string;
  example?: string;
  id: string;
  isNew?: boolean;
  name: string;
  tags: string[];
  usage: string;
  warning?: boolean;
}

export interface ThinkingKeyword {
  budget: BudgetType;
  description: string;
  example?: string;
  keyword: string;
  tokens: number;
}

export interface Section {
  commands?: Command[];
  description: string;
  id: string;
  thinkingKeywords?: ThinkingKeyword[];
  title: string;
}

export interface CheatsheetData {
  sections: Section[];
}
