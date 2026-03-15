import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Save, X } from 'lucide-react';

export interface AgentItemDraft {
  author: string;
  category: string;
  content: string;
  sourceUrl: string;
  subtitle: string;
  summary: string;
  tags: string[];
  title: string;
}

interface AgentItemEditorModalProps {
  categories: Array<{ id: string; name: string }>;
  initial: AgentItemDraft;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: AgentItemDraft) => void;
  resetKey?: string;
  title: string;
}

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

const AgentItemEditorModal: React.FC<AgentItemEditorModalProps> = ({
  isOpen,
  title,
  categories,
  initial,
  resetKey,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<AgentItemDraft>(initial);
  const [tagsText, setTagsText] = useState((initial.tags || []).join(', '));

  useEffect(() => {
    if (!isOpen) return;
    setDraft({
      ...initial,
      category: categories.some((c) => c.id === initial.category) ? initial.category : categories[0]?.id || '',
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
      summary: draft.summary.trim(),
      author: draft.author.trim(),
      sourceUrl: draft.sourceUrl.trim(),
      content: draft.content,
      tags: parseTags(tagsText),
    });
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-white/10 bg-[#1c1c2e] p-5"
          onClick={(e) => e.stopPropagation()}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Title
                </label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  data-testid="agent-editor-title"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}
                  data-testid="agent-editor-category"
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
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Subtitle
              </label>
              <input
                value={draft.subtitle}
                onChange={(e) => setDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
                data-testid="agent-editor-subtitle"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Author
                </label>
                <input
                  value={draft.author}
                  onChange={(e) => setDraft((prev) => ({ ...prev, author: e.target.value }))}
                  data-testid="agent-editor-author"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Source URL
                </label>
                <input
                  value={draft.sourceUrl}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sourceUrl: e.target.value }))}
                  data-testid="agent-editor-source"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Summary
              </label>
              <textarea
                value={draft.summary}
                onChange={(e) => setDraft((prev) => ({ ...prev, summary: e.target.value }))}
                data-testid="agent-editor-summary"
                rows={3}
                className="w-full resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">Tags</label>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                data-testid="agent-editor-tags"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="research, team, workflow"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Content (Markdown)
              </label>
              <textarea
                value={draft.content}
                onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                data-testid="agent-editor-content"
                className="h-[360px] w-full resize-none overflow-auto rounded border border-white/10 bg-[#121521] px-3 py-2 font-mono text-gray-200 text-sm outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!canSave}
              data-testid="agent-editor-save"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> Save Agent Item
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

export default AgentItemEditorModal;
