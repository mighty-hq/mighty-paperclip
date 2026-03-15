import React, { useState } from 'react';
import { useNavigate } from '../utils/useNavigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useSnippets, useCategories } from '../db/hooks';
import { useToast } from '../hooks/use-toast';
import CodeBlockEditor from '../components/ui/code-block-editor';

const SNIPPET_TYPES = ['Editor', 'Terminal', 'Browser', 'Email', 'Note', 'Other'] as const;

const CreateSnippetPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { create } = useSnippets();
  const { categories } = useCategories();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'Editor' as (typeof SNIPPET_TYPES)[number],
    language: '',
    categoryId: '',
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in title and content',
        variant: 'destructive',
        duration: 2000,
      });
      return;
    }
    create({
      title: formData.title,
      content: formData.content,
      type: formData.type,
      language: formData.language,
      categoryId: formData.categoryId || categories[0]?.id || '',
      description: '',
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      isFavorite: false,
    });
    toast({ title: 'Snippet created', description: formData.title, duration: 2000 });
    navigate('/dashboard/snippets');
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard/snippets')}
          className="mb-4 flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
          <ArrowLeft className="h-4 w-4" /> Back to Snippets
        </button>
        <h1 className="mb-2 font-bold text-3xl text-[var(--text-primary)]">Create New Snippet</h1>
        <p className="text-[var(--text-secondary)]">Add a new code snippet or text template</p>
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
              placeholder="e.g., React Component Template"
              data-testid="snippet-title-input"
              autoFocus
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Type</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SNIPPET_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  data-testid={`snippet-type-${type.toLowerCase()}`}
                  className={`rounded-lg px-3 py-2.5 font-medium text-sm transition-colors ${
                    formData.type === type
                      ? 'border-2 border-blue-500/50 bg-blue-500/20 text-blue-400'
                      : 'border-2 border-[var(--border)] bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}>
                  {type}
                </button>
              ))}
            </div>
          </div>
          {(formData.type === 'Editor' || formData.type === 'Terminal') && (
            <div>
              <label className="mb-2 block font-medium text-gray-300 text-sm">Language</label>
              <input
                type="text"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                placeholder="e.g., javascript, python, css, bash"
                data-testid="snippet-language-input"
                className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
              />
            </div>
          )}
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              data-testid="snippet-category-select"
              className="w-full rounded-lg border border-[var(--border)] bg-[#1a1a2e] px-4 py-3 text-[var(--text-primary)] transition-colors focus:border-blue-500/50 focus:outline-none">
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Content *</label>
            <CodeBlockEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              language={formData.language || formData.type}
              placeholder="Enter your snippet content..."
              textareaTestId="snippet-content-input"
              className="h-[360px]"
            />
          </div>
          <div>
            <label className="mb-2 block font-medium text-gray-300 text-sm">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., react, component, template"
              data-testid="snippet-tags-input"
              className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-4 py-3 text-[var(--text-primary)] placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-8 flex items-center gap-3 border-[var(--border)] border-t pt-6">
          <button
            type="submit"
            data-testid="save-snippet-btn"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
            <Save className="h-4 w-4" /> Create Snippet
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard/snippets')}
            className="rounded-lg bg-white/5 px-6 py-3 text-gray-300 transition-colors hover:bg-white/10">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSnippetPage;
