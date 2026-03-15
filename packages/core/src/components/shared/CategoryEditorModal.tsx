import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Save, X } from 'lucide-react';
import type { Category } from '../../db/schema';

export type CategoryDraft = Pick<Category, 'name' | 'icon' | 'color' | 'type'> & { tags: string[] };

interface CategoryEditorModalProps {
  initial: CategoryDraft;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: CategoryDraft) => void;
  resetKey?: string;
  title: string;
}

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  isOpen,
  title,
  initial,
  resetKey,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<CategoryDraft>(initial);
  const [tagsText, setTagsText] = useState((initial.tags || []).join(', '));

  useEffect(() => {
    if (!isOpen) return;
    setDraft(initial);
    setTagsText((initial.tags || []).join(', '));
  }, [isOpen, resetKey]);

  const canSave = useMemo(() => draft.name.trim().length > 0, [draft.name]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!canSave) return;
    onSave({ ...draft, name: draft.name.trim(), tags: parseTags(tagsText) });
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-lg rounded-xl border border-white/10 bg-[#1c1c2e] p-5"
          onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                data-testid="category-editor-name"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Category name"
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
                  data-testid="category-editor-icon"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  placeholder="FolderOpen"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={draft.color}
                    onChange={(e) => setDraft((prev) => ({ ...prev, color: e.target.value }))}
                    className="h-9 w-10 rounded border border-white/10 bg-transparent"
                  />
                  <input
                    value={draft.color}
                    onChange={(e) => setDraft((prev) => ({ ...prev, color: e.target.value }))}
                    data-testid="category-editor-color"
                    className="flex-1 rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">Tags</label>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                data-testid="category-editor-tags"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="frontend, snippets, ai"
              />
              <p className="mt-1 text-[11px] text-gray-500">Comma-separated tags (without #).</p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!canSave}
              data-testid="category-editor-save"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> Save Category
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

export default CategoryEditorModal;
