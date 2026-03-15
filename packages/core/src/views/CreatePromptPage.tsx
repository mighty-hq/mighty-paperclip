import React, { useState } from 'react';
import { useNavigate } from '../utils/useNavigation';
import { ArrowLeft, Save } from 'lucide-react';
import { usePrompts, usePromptCategories } from '../db/hooks';
import { useToast } from '../hooks/use-toast';

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

const CreatePromptPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { create } = usePrompts();
  const { promptCategories } = usePromptCategories();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    content: '',
    tags: '',
    categoryId: '',
    icon: 'Sparkles',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in the title',
        variant: 'destructive',
        duration: 2000,
      });
      return;
    }
    create({
      title: formData.title,
      subtitle: formData.subtitle,
      description: formData.description,
      content: formData.content,
      tags: parseTags(formData.tags),
      categoryId: formData.categoryId || 'my-prompts',
      icon: formData.icon,
      isFavorite: false,
    });
    toast({ title: 'Prompt created', description: formData.title, duration: 2000 });
    navigate('/dashboard/prompts');
  };

  // Filter out meta categories
  const assignableCategories = promptCategories.filter((c) => !['all', 'favorites', 'my-prompts'].includes(c.id));

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/prompts')}
          className="mb-4 flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" /> Back to Prompts
        </button>
        <h1 className="mb-2 font-bold text-3xl text-[var(--text-primary)]">Create New Prompt</h1>
        <p className="text-[var(--text-secondary)]">Add a new AI prompt template</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-[var(--border)] bg-white/5 p-8 backdrop-blur-sm">
        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Code Review Assistant"
              data-testid="prompt-title-input"
              autoFocus
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Brief description of what this prompt does"
              data-testid="prompt-subtitle-input"
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deeper context for when to use this prompt"
              rows={3}
              data-testid="prompt-description-input"
              className="w-full resize-y rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="seo, writing, ops"
              data-testid="prompt-tags-input"
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              data-testid="prompt-category-select"
              className="w-full rounded-lg border border-[var(--border)] bg-[#1a1a2e] px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-blue-500/50 focus:outline-none">
              <option value="">My Prompts</option>
              {assignableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Prompt Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write the full prompt template here..."
              rows={10}
              data-testid="prompt-content-input"
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 font-mono text-[var(--text-primary)] text-sm placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-8 flex items-center gap-3 border-[var(--border)] border-t pt-6">
          <button
            type="submit"
            data-testid="save-prompt-btn"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
            <Save className="h-4 w-4" /> Create Prompt
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/prompts')}
            className="rounded-lg bg-white/5 px-6 py-3 text-gray-300 transition-colors hover:bg-white/10">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePromptPage;
