import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { getOpenAIKey, readEnv } from '../env';

type ChatRole = 'user' | 'assistant';

export interface MightyAIChatMessage {
  content: string;
  role: ChatRole;
}

export interface AIPromptSuggestion {
  content: string;
  description: string;
  subtitle: string;
  tags: string[];
  title: string;
}

export interface AISkillSuggestion {
  content: string;
  description: string;
  subtitle: string;
  tags: string[];
  title: string;
}

export interface AIAgentSuggestion {
  author: string;
  content: string;
  sourceUrl: string;
  subtitle: string;
  summary: string;
  tags: string[];
  title: string;
}

const promptSuggestionSchema = z.object({
  title: z.string().min(3).max(120),
  subtitle: z.string().min(3).max(180),
  description: z.string().min(6).max(600),
  content: z.string().min(20).max(20000),
  tags: z.array(z.string().min(2).max(24)).max(8),
});

const skillSuggestionSchema = z.object({
  title: z.string().min(3).max(120),
  subtitle: z.string().min(3).max(180),
  description: z.string().min(6).max(600),
  content: z.string().min(20).max(50000),
  tags: z.array(z.string().min(2).max(24)).max(8),
});

const agentSuggestionSchema = z.object({
  title: z.string().min(3).max(120),
  subtitle: z.string().min(3).max(180),
  summary: z.string().min(6).max(800),
  author: z.string().min(2).max(80),
  sourceUrl: z.string().max(500),
  tags: z.array(z.string().min(2).max(24)).max(10),
  content: z.string().min(40).max(120000),
});

const getModel = async () => {
  const apiKey = await getOpenAIKey();
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY. Add it to your environment to use Mighty AI.');
  }

  const openai = createOpenAI({
    apiKey,
    baseURL: readEnv('VITE_OPENAI_BASE_URL')?.trim() || undefined,
  });

  const modelId = readEnv('VITE_OPENAI_MODEL')?.trim() || 'gpt-4o-mini';
  return openai(modelId);
};

const normalizeTags = (tags: string[]) =>
  tags
    .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
    .filter(Boolean)
    .slice(0, 8);

const scrapePage = async (url: string) => {
  const normalized = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
  const scrapeUrl = `https://r.jina.ai/http://${normalized.replace(/^https?:\/\//i, '')}`;
  const response = await fetch(scrapeUrl);
  if (!response.ok) {
    throw new Error(`Failed to import from URL (${response.status}).`);
  }
  const text = await response.text();
  return text.slice(0, 70000);
};

const systemBase =
  'You are Mighty AI, an expert assistant for building high-quality prompts, skills, and agent specs. Return concise, production-ready output.';

export const chatWithMightyAI = async (messages: MightyAIChatMessage[]) => {
  const history = messages
    .slice(-12)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n\n');

  const model = await getModel();
  const { text } = await generateText({
    model,
    system: `${systemBase} Keep answers practical and actionable.`,
    prompt: history || 'Start a helpful conversation.',
  });

  return text.trim();
};

export const createPromptWithAI = async (goal: string): Promise<AIPromptSuggestion> => {
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: promptSuggestionSchema,
    system: `${systemBase} You write exceptional reusable prompts.`,
    prompt: `Create a new prompt for this goal:\n${goal}`,
  });
  return { ...object, tags: normalizeTags(object.tags) };
};

export const improvePromptWithAI = async (input: {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  tags?: string[];
}): Promise<AIPromptSuggestion> => {
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: promptSuggestionSchema,
    system: `${systemBase} Improve clarity, structure, and instruction quality while preserving intent.`,
    prompt: `Improve this prompt:\n${JSON.stringify(input, null, 2)}`,
  });
  return { ...object, tags: normalizeTags(object.tags) };
};

export const importPromptFromUrlWithAI = async (url: string): Promise<AIPromptSuggestion> => {
  const pageText = await scrapePage(url);
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: promptSuggestionSchema,
    system: `${systemBase} Extract a strong standalone prompt from webpage content. Do not mention scraping.`,
    prompt: `Source URL: ${url}\n\nWeb content:\n${pageText}`,
  });
  return { ...object, tags: normalizeTags(object.tags) };
};

export const createSkillWithAI = async (goal: string): Promise<AISkillSuggestion> => {
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: skillSuggestionSchema,
    system: `${systemBase} Skills should include practical markdown instructions and examples.`,
    prompt: `Create a skill definition for this outcome:\n${goal}`,
  });
  return { ...object, tags: normalizeTags(object.tags) };
};

export const improveSkillWithAI = async (input: {
  title: string;
  subtitle: string;
  description: string;
  content: string;
  tags?: string[];
}): Promise<AISkillSuggestion> => {
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: skillSuggestionSchema,
    system: `${systemBase} Improve readability, outcomes, and implementation detail for the skill.`,
    prompt: `Improve this skill:\n${JSON.stringify(input, null, 2)}`,
  });
  return { ...object, tags: normalizeTags(object.tags) };
};

export const importSkillFromUrlWithAI = async (url: string): Promise<AISkillSuggestion> => {
  const pageText = await scrapePage(url);
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: skillSuggestionSchema,
    system: `${systemBase} Convert this source into a polished markdown skill.`,
    prompt: `Source URL: ${url}\n\nWeb content:\n${pageText}`,
  });
  return { ...object, tags: normalizeTags(object.tags) };
};

export const createAgentWithAI = async (goal: string): Promise<AIAgentSuggestion> => {
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: agentSuggestionSchema,
    system: `${systemBase} Agent outputs must include a valid markdown recipe with YAML frontmatter.`,
    prompt: `Create an agent-team recipe for this outcome:\n${goal}`,
  });
  return {
    ...object,
    sourceUrl: object.sourceUrl || '',
    tags: normalizeTags(object.tags),
  };
};

export const improveAgentWithAI = async (input: {
  title: string;
  subtitle: string;
  summary: string;
  author: string;
  sourceUrl: string;
  content: string;
  tags?: string[];
}): Promise<AIAgentSuggestion> => {
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: agentSuggestionSchema,
    system: `${systemBase} Improve technical depth and keep markdown/frontmatter valid.`,
    prompt: `Improve this agent recipe:\n${JSON.stringify(input, null, 2)}`,
  });
  return {
    ...object,
    sourceUrl: object.sourceUrl || input.sourceUrl || '',
    tags: normalizeTags(object.tags),
  };
};

export const importAgentFromUrlWithAI = async (url: string): Promise<AIAgentSuggestion> => {
  const pageText = await scrapePage(url);
  const model = await getModel();
  const { object } = await generateObject({
    model,
    schema: agentSuggestionSchema,
    system: `${systemBase} Convert web source into a complete agent recipe markdown with fr ontmatter.`,
    prompt: `Source URL: ${url}\n\nWeb content:\n${pageText}`,
  });
  return {
    ...object,
    sourceUrl: object.sourceUrl || url,
    tags: normalizeTags(object.tags),
  };
};
