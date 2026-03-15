import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Save, X } from 'lucide-react';

export interface PromptEditorCategoryOption {
  id: string;
  name: string;
}

export interface PromptEditorDraft {
  categoryId: string;
  content: string;
  description: string;
  icon: string;
  subtitle: string;
  tags: string[];
  title: string;
}

interface PromptEditorModalProps {
  categories: PromptEditorCategoryOption[];
  initial: PromptEditorDraft;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: PromptEditorDraft) => void;
  resetKey?: string;
  title: string;
}

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

const PromptEditorModal: React.FC<PromptEditorModalProps> = ({
  isOpen,
  title,
  initial,
  categories,
  resetKey,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<PromptEditorDraft>(initial);
  const [tagsText, setTagsText] = useState((initial.tags || []).join(', '));

  const getValidCategoryId = (categoryId: string) => {
    if (categories.some((cat) => cat.id === categoryId)) return categoryId;
    return categories[0]?.id || '';
  };

  useEffect(() => {
    if (!isOpen) return;
    setDraft({
      ...initial,
      categoryId: getValidCategoryId(initial.categoryId),
    });
    setTagsText((initial.tags || []).join(', '));
  }, [isOpen, resetKey]);

  const canSave = useMemo(() => draft.title.trim().length > 0, [draft.title]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim(),
      description: draft.description.trim(),
      content: draft.content,
      icon: draft.icon.trim() || 'Sparkles',
      tags: parseTags(tagsText),
    });
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1c1c2e] p-5"
          onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">Title</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                data-testid="prompt-editor-title"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Prompt title"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Subtitle
              </label>
              <input
                value={draft.subtitle}
                onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
                data-testid="prompt-editor-subtitle"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Short context shown in list"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Icon
                </label>
                <input
                  value={draft.icon}
                  onChange={(e) => setDraft((prev) => ({ ...prev, icon: e.target.value }))}
                  data-testid="prompt-editor-icon"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  placeholder="Sparkles"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={draft.categoryId}
                  onChange={(e) => setDraft((prev) => ({ ...prev, categoryId: e.target.value }))}
                  data-testid="prompt-editor-category"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50">
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">Tags</label>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                data-testid="prompt-editor-tags"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="seo, workflow, writing"
              />
              <p className="mt-1 text-[11px] text-gray-500">Comma-separated tags (without #).</p>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                data-testid="prompt-editor-description"
                rows={3}
                className="w-full resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Explain what this prompt is for"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Prompt Content
              </label>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                data-testid="prompt-editor-content"
                rows={8}
                className="w-full resize-y rounded border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Prompt body"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!canSave}
              data-testid="prompt-editor-save"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> Save Prompt
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-300 text-sm transition-colors hover:bg-white/10">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default PromptEditorModal;
