import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Code2, FileText, Link as LinkIcon } from 'lucide-react';
import { useCategories, useSnippets } from '../db/hooks';
import { useToast } from '../hooks/use-toast';
import CodeBlockEditor from './ui/code-block-editor';

const CreateSnippetModal = ({ isOpen, onClose, onSave }) => {
  const { categories } = useCategories();
  const { create } = useSnippets();
  const [formData, setFormData] = useState<any>({
    title: '',
    content: '',
    type: 'Editor' as const,
    language: '',
    categoryId: '',
    tags: '',
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
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
    const typeMap: Record<string, string> = { text: 'Note', code: 'Editor', link: 'Browser' };
    create({
      title: formData.title,
      description: '',
      content: formData.content,
      type: (typeMap[formData.type] || 'Note') as any,
      language: formData.language || '',
      categoryId: formData.categoryId || categories[0]?.id || '',
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      isFavorite: false,
    });
    toast({ title: 'Snippet created', description: formData.title, duration: 2000 });
    onSave(null);
    setFormData({ title: '', content: '', type: 'Editor' as any, language: '', categoryId: '', tags: '' });
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fade-in fixed inset-0 z-[9999] animate-in bg-black/60 backdrop-blur-sm duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="slide-in-from-bottom-4 fixed top-1/2 left-1/2 z-[9999] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 animate-in duration-300">
        <div className="mx-4 max-h-[85vh] overflow-hidden overflow-y-auto rounded-xl border border-white/10 bg-[#1e1e1e]/95 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-white/10 border-b px-6 py-4">
            <h2 className="font-bold text-white text-xl">Create New Snippet</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-2 block font-medium text-gray-300 text-sm">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., React Component Template"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block font-medium text-gray-300 text-sm">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {['text', 'code', 'link'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
                        formData.type === type
                          ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                          : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}>
                      {type === 'code' && <Code2 className="h-4 w-4" />}
                      {type === 'text' && <FileText className="h-4 w-4" />}
                      {type === 'link' && <LinkIcon className="h-4 w-4" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language (for code) */}
              {formData.type === 'code' && (
                <div>
                  <label className="mb-2 block font-medium text-gray-300 text-sm">Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="e.g., javascript, python, css"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="mb-2 block font-medium text-gray-300 text-sm">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition-colors focus:border-blue-500/50 focus:outline-none">
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block font-medium text-gray-300 text-sm">Content *</label>
                <CodeBlockEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  language={formData.language || formData.type}
                  placeholder="Enter your snippet content..."
                  className="h-[300px]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="mb-2 block font-medium text-gray-300 text-sm">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., react, component, template"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3 border-white/10 border-t pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-white/5 px-4 py-2 text-gray-300 transition-colors hover:bg-white/10">
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                Create Snippet
              </button>
            </div>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
};

export default CreateSnippetModal;
