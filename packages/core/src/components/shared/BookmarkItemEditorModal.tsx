import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { Save, X } from 'lucide-react';

export interface BookmarkItemDraft {
  description: string;
  folderId: string;
  icon: string;
  isFavorite: boolean;
  tags: string[];
  title: string;
  url: string;
}

interface BookmarkItemEditorModalProps {
  folders: Array<{ id: string; name: string }>;
  initial: BookmarkItemDraft;
  isOpen: boolean;
  onClose: () => void;
  onSave: (draft: BookmarkItemDraft) => void;
  resetKey?: string;
  title: string;
}

const parseTags = (raw: string): string[] =>
  raw
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, ''))
    .filter(Boolean);

const BookmarkItemEditorModal: React.FC<BookmarkItemEditorModalProps> = ({
  isOpen,
  title,
  initial,
  folders,
  resetKey,
  onSave,
  onClose,
}) => {
  const [draft, setDraft] = useState<BookmarkItemDraft>(initial);
  const [tagsText, setTagsText] = useState((initial.tags || []).join(', '));

  useEffect(() => {
    if (!isOpen) return;
    const validFolder = folders.some((folder) => folder.id === initial.folderId)
      ? initial.folderId
      : folders[0]?.id || '';
    setDraft({
      ...initial,
      folderId: validFolder,
    });
    setTagsText((initial.tags || []).join(', '));
  }, [isOpen, resetKey]);

  const canSave = useMemo(() => {
    const titleOk = draft.title.trim().length > 0;
    const urlOk = /^https?:\/\//i.test(draft.url.trim());
    return titleOk && urlOk;
  }, [draft.title, draft.url]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...draft,
      title: draft.title.trim(),
      url: draft.url.trim(),
      description: draft.description.trim(),
      icon: draft.icon.trim() || 'Globe',
      tags: parseTags(tagsText),
    });
  };

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[10000] bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1c1c2e] p-5"
          onClick={(event) => event.stopPropagation()}>
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
                onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
                data-testid="bookmark-editor-title"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Bookmark title"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">URL</label>
              <input
                value={draft.url}
                onChange={(event) => setDraft((prev) => ({ ...prev, url: event.target.value }))}
                data-testid="bookmark-editor-url"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Icon
                </label>
                <input
                  value={draft.icon}
                  onChange={(event) => setDraft((prev) => ({ ...prev, icon: event.target.value }))}
                  data-testid="bookmark-editor-icon"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                  placeholder="Globe"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                  Folder
                </label>
                <select
                  value={draft.folderId}
                  onChange={(event) => setDraft((prev) => ({ ...prev, folderId: event.target.value }))}
                  data-testid="bookmark-editor-folder"
                  className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50">
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">Tags</label>
              <input
                value={tagsText}
                onChange={(event) => setTagsText(event.target.value)}
                data-testid="bookmark-editor-tags"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="reading, tools, reference"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">
                Description
              </label>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
                data-testid="bookmark-editor-description"
                rows={4}
                className="w-full resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
                placeholder="Short note about this bookmark"
              />
            </div>

            <label className="flex items-center gap-2 text-gray-300 text-sm">
              <input
                type="checkbox"
                checked={draft.isFavorite}
                onChange={(event) => setDraft((prev) => ({ ...prev, isFavorite: event.target.checked }))}
              />
              Favorite
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!canSave}
              data-testid="bookmark-editor-save"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> Save Bookmark
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

export default BookmarkItemEditorModal;
