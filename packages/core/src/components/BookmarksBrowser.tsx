import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, ExternalLink, Eye, Globe, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useBookmarkFolders, useBookmarks } from '../db/hooks';
import type { Bookmark } from '../db/schema';
import { useToast } from '../hooks/use-toast';
import CategorySidebar, { CategorySidebarItem } from './shared/CategorySidebar';
import CategoryEditorModal, { CategoryDraft } from './shared/CategoryEditorModal';
import BookmarkItemEditorModal, { BookmarkItemDraft } from './shared/BookmarkItemEditorModal';
import DataView from './shared/DataView';

interface BookmarksBrowserProps {
  searchQuery: string;
}

type SortMode = 'newest' | 'oldest' | 'title';

const ALL_BOOKMARKS_ID = 'all-bookmarks';

const openExternalUrl = (url: string) => {
  const mightyhq = (window as any).mightyhq;
  if (mightyhq?.openExternal) {
    mightyhq.openExternal(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

const toUrl = (value: string) => {
  const raw = value.trim();
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
};

const hostFromUrl = (value: string) => {
  try {
    return new URL(toUrl(value)).hostname;
  } catch {
    return value;
  }
};

const faviconUrl = (value: string) =>
  `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostFromUrl(value))}&sz=64`;

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const BookmarksBrowser: React.FC<BookmarksBrowserProps> = ({ searchQuery }) => {
  const { toast } = useToast();
  const { bookmarks, create, update, remove } = useBookmarks();
  const { folders, create: createFolder, update: updateFolder, remove: removeFolder } = useBookmarkFolders();

  const [selectedFolderId, setSelectedFolderId] = useState(ALL_BOOKMARKS_ID);
  const [selectedBookmarkId, setSelectedBookmarkId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [creatingBookmark, setCreatingBookmark] = useState(false);
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [creatingFolderParentId, setCreatingFolderParentId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [copiedBookmarkId, setCopiedBookmarkId] = useState<string | null>(null);

  const folderMap = useMemo(() => new Map(folders.map((folder) => [folder.id, folder])), [folders]);
  const selectedFolder = selectedFolderId !== ALL_BOOKMARKS_ID ? folderMap.get(selectedFolderId) : undefined;
  const editingFolder = editingFolderId ? folderMap.get(editingFolderId) : undefined;
  const editingBookmark = editingBookmarkId
    ? bookmarks.find((bookmark) => bookmark.id === editingBookmarkId)
    : undefined;

  const countForFolder = (folderId: string) => bookmarks.filter((bookmark) => bookmark.folderId === folderId).length;

  const categoryItems: CategorySidebarItem[] = useMemo(() => {
    const allItem: CategorySidebarItem = {
      id: ALL_BOOKMARKS_ID,
      name: 'All bookmarks',
      icon: 'Library',
      color: '#3b82f6',
      count: bookmarks.length,
      tags: ['all'],
      parentId: null,
    };
    const folderItems: CategorySidebarItem[] = folders
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        icon: folder.icon || 'FolderOpen',
        color: '#64748b',
        count: countForFolder(folder.id),
        tags: [],
        parentId: folder.parentId,
      }));
    return [allItem, ...folderItems];
  }, [folders, bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const scoped =
      selectedFolderId === ALL_BOOKMARKS_ID
        ? bookmarks
        : bookmarks.filter((bookmark) => bookmark.folderId === selectedFolderId);

    const searched = scoped.filter((bookmark) => {
      const q = searchQuery.toLowerCase();
      return (
        bookmark.title.toLowerCase().includes(q) ||
        bookmark.description.toLowerCase().includes(q) ||
        bookmark.url.toLowerCase().includes(q) ||
        bookmark.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });

    const sorted = [...searched];
    if (sortMode === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortMode === 'oldest') sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    else sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted;
  }, [bookmarks, selectedFolderId, searchQuery, sortMode]);

  const selectedBookmark = selectedBookmarkId
    ? bookmarks.find((bookmark) => bookmark.id === selectedBookmarkId) || null
    : null;

  useEffect(() => {
    if (!selectedBookmarkId) return;
    if (!bookmarks.some((bookmark) => bookmark.id === selectedBookmarkId)) setSelectedBookmarkId(null);
  }, [bookmarks, selectedBookmarkId]);

  useEffect(() => {
    if (selectedFolderId === ALL_BOOKMARKS_ID) return;
    if (!folders.some((folder) => folder.id === selectedFolderId)) {
      setSelectedFolderId(ALL_BOOKMARKS_ID);
      setSelectedBookmarkId(null);
    }
  }, [folders, selectedFolderId]);

  const folderEditorInitial: CategoryDraft = editingFolder
    ? {
        name: editingFolder.name,
        icon: editingFolder.icon || 'FolderOpen',
        color: '#64748b',
        type: 'bookmarks',
        tags: [],
      }
    : {
        name: '',
        icon: 'FolderOpen',
        color: '#64748b',
        type: 'bookmarks',
        tags: [],
      };

  const folderOptions = folders.map((folder) => ({ id: folder.id, name: folder.name }));

  const bookmarkEditorInitial: BookmarkItemDraft = editingBookmark
    ? {
        title: editingBookmark.title,
        url: editingBookmark.url,
        description: editingBookmark.description,
        icon: editingBookmark.icon || 'Globe',
        folderId: editingBookmark.folderId,
        tags: editingBookmark.tags || [],
        isFavorite: editingBookmark.isFavorite,
      }
    : {
        title: '',
        url: 'https://',
        description: '',
        icon: 'Globe',
        folderId: selectedFolderId === ALL_BOOKMARKS_ID ? folders[0]?.id || '' : selectedFolderId,
        tags: [],
        isFavorite: false,
      };

  const saveFolder = (draft: CategoryDraft) => {
    if (editingFolder) {
      updateFolder(editingFolder.id, {
        name: draft.name,
        icon: draft.icon || editingFolder.icon,
      });
      toast({ title: 'Folder updated', description: draft.name, duration: 1500 });
    } else {
      const created = createFolder({
        name: draft.name,
        icon: draft.icon || 'FolderOpen',
        parentId: creatingFolderParentId,
      });
      setSelectedFolderId(created.id);
      toast({ title: 'Folder created', description: draft.name, duration: 1500 });
    }
    setIsCreatingFolder(false);
    setEditingFolderId(null);
    setCreatingFolderParentId(null);
  };

  const saveBookmark = (draft: BookmarkItemDraft) => {
    const payload = {
      title: draft.title,
      url: toUrl(draft.url),
      description: draft.description,
      icon: draft.icon || 'Globe',
      folderId: draft.folderId,
      tags: draft.tags,
      isFavorite: draft.isFavorite,
    };
    if (editingBookmark) {
      update(editingBookmark.id, payload);
      setSelectedBookmarkId(editingBookmark.id);
      toast({ title: 'Bookmark updated', description: draft.title, duration: 1500 });
    } else {
      const created = create(payload);
      setSelectedBookmarkId(created.id);
      toast({ title: 'Bookmark created', description: draft.title, duration: 1500 });
    }
    setCreatingBookmark(false);
    setEditingBookmarkId(null);
  };

  const handleFolderDelete = (folderId: string) => {
    if (folderId === ALL_BOOKMARKS_ID) return;
    const target = folderMap.get(folderId);
    if (!target) return;
    const confirmed = confirm(`Delete "${target.name}"? This will also delete all nested folders and their items.`);
    if (!confirmed) return;
    removeFolder(folderId);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(ALL_BOOKMARKS_ID);
      setSelectedBookmarkId(null);
    }
    toast({ title: 'Folder deleted', description: target.name, duration: 1500 });
  };

  const handleBookmarkDelete = (bookmark: Bookmark) => {
    if (!confirm(`Delete "${bookmark.title}"?`)) return;
    remove(bookmark.id);
    if (selectedBookmarkId === bookmark.id) setSelectedBookmarkId(null);
    toast({ title: 'Bookmark deleted', description: bookmark.title, duration: 1500 });
  };

  const copyBookmarkUrl = async (bookmark: Bookmark) => {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      setCopiedBookmarkId(bookmark.id);
      toast({ title: 'Copied URL', description: bookmark.title, duration: 1500 });
      setTimeout(() => setCopiedBookmarkId(null), 1500);
    } catch {
      toast({ title: 'Copy failed', variant: 'destructive', duration: 1500 });
    }
  };

  const exportBookmarks = () => {
    downloadJson('bookmarks_export.json', {
      exportedAt: new Date().toISOString(),
      folderScope: selectedFolder?.name || 'All bookmarks',
      count: filteredBookmarks.length,
      bookmarks: filteredBookmarks,
    });
    toast({ title: 'Exported bookmarks', duration: 1500 });
  };

  const renderBookmarkActions = (bookmark: Bookmark) => (
    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        onClick={(event) => {
          event.stopPropagation();
          setSelectedBookmarkId(bookmark.id);
        }}
        className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-300"
        title="View">
        <Eye className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          setEditingBookmarkId(bookmark.id);
          setCreatingBookmark(false);
        }}
        className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-300"
        title="Edit">
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(event) => {
          event.stopPropagation();
          handleBookmarkDelete(bookmark);
        }}
        className="rounded p-1 text-gray-500 transition-colors hover:bg-red-500/15 hover:text-red-300"
        title="Delete">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );

  const renderList = (items: Bookmark[]) => (
    <div className="space-y-1.5 p-2">
      {items.map((bookmark) => (
        <button
          key={bookmark.id}
          onClick={() => setSelectedBookmarkId(bookmark.id)}
          onDoubleClick={() => openExternalUrl(bookmark.url)}
          className={`group w-full rounded-lg border px-2.5 py-2 text-left transition-colors ${
            selectedBookmarkId === bookmark.id
              ? 'border-blue-500/30 bg-blue-600/15 text-white'
              : 'border-white/5 text-gray-300 hover:bg-white/5'
          }`}>
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-24 shrink-0 items-center justify-center rounded border border-white/10 bg-gradient-to-br from-[#2b2e37] to-[#1b1f27]">
              <img src={faviconUrl(bookmark.url)} alt="" className="h-7 w-7 rounded" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-sm">{bookmark.title}</div>
              <div className="truncate text-gray-500 text-xs">{bookmark.description || hostFromUrl(bookmark.url)}</div>
            </div>
            {renderBookmarkActions(bookmark)}
          </div>
        </button>
      ))}
    </div>
  );

  const renderCard = (items: Bookmark[]) => (
    <div className="grid grid-cols-2 gap-2 p-2">
      {items.map((bookmark) => (
        <button
          key={bookmark.id}
          onClick={() => setSelectedBookmarkId(bookmark.id)}
          onDoubleClick={() => openExternalUrl(bookmark.url)}
          className={`group overflow-hidden rounded-xl border text-left transition-colors ${
            selectedBookmarkId === bookmark.id
              ? 'border-blue-500/30 bg-blue-600/15 text-white'
              : 'border-white/10 bg-white/[0.02] text-gray-300 hover:bg-white/[0.05]'
          }`}>
          <div className="flex h-24 items-center justify-center border-white/10 border-b bg-gradient-to-br from-[#2b2e37] to-[#1b1f27]">
            <img src={faviconUrl(bookmark.url)} alt="" className="h-10 w-10 rounded-lg" />
          </div>
          <div className="p-3">
            <div className="truncate font-medium text-sm">{bookmark.title}</div>
            <div className="mt-1 truncate text-gray-500 text-xs">{hostFromUrl(bookmark.url)}</div>
            <div className="mt-2">{renderBookmarkActions(bookmark)}</div>
          </div>
        </button>
      ))}
    </div>
  );

  const renderHeadlines = (items: Bookmark[]) => (
    <div className="space-y-1 p-2">
      {items.map((bookmark) => (
        <button
          key={bookmark.id}
          onClick={() => setSelectedBookmarkId(bookmark.id)}
          onDoubleClick={() => openExternalUrl(bookmark.url)}
          className={`group w-full rounded-md border px-2.5 py-2 text-left transition-colors ${
            selectedBookmarkId === bookmark.id
              ? 'border-blue-500/30 bg-blue-600/15 text-white'
              : 'border-transparent text-gray-300 hover:bg-white/5'
          }`}>
          <div className="flex items-center gap-2.5">
            <img src={faviconUrl(bookmark.url)} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
            <div className="flex-1 truncate font-medium text-sm">{bookmark.title}</div>
            {renderBookmarkActions(bookmark)}
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-full" data-testid="bookmarks-browser">
      <CategorySidebar
        title="Folders"
        items={categoryItems}
        selectedId={selectedFolderId}
        onSelect={(id) => {
          setSelectedFolderId(id);
          setSelectedBookmarkId(null);
        }}
        onCreate={() => {
          setIsCreatingFolder(true);
          setEditingFolderId(null);
          setCreatingFolderParentId(null);
        }}
        allow_nested
        onCreateNested={(parentId) => {
          if (parentId === ALL_BOOKMARKS_ID) return;
          setIsCreatingFolder(true);
          setEditingFolderId(null);
          setCreatingFolderParentId(parentId);
        }}
        onRename={(id) => {
          if (id === ALL_BOOKMARKS_ID) return;
          setIsCreatingFolder(false);
          setEditingFolderId(id);
          setCreatingFolderParentId(null);
        }}
        onChangeIcon={(id) => {
          if (id === ALL_BOOKMARKS_ID) return;
          setIsCreatingFolder(false);
          setEditingFolderId(id);
          setCreatingFolderParentId(null);
        }}
        onDelete={handleFolderDelete}
        testIdPrefix="bookmark-folder"
      />

      <div className={`flex shrink-0 flex-col border-white/10 border-r ${selectedBookmark ? 'w-[34rem]' : 'flex-1'}`}>
        <DataView
          title="Bookmarks"
          items={filteredBookmarks}
          sortValue={sortMode}
          sortOptions={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
            { value: 'title', label: 'Title A-Z' },
          ]}
          onSortChange={(value) => setSortMode(value as SortMode)}
          onExport={exportBookmarks}
          onCreate={() => {
            setCreatingBookmark(true);
            setEditingBookmarkId(null);
          }}
          createButton={
            <button
              onClick={() => {
                setCreatingBookmark(true);
                setEditingBookmarkId(null);
              }}
              data-testid="add-bookmark-btn"
              className="rounded p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-blue-400"
              title="Add bookmark">
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
          renderList={renderList}
          renderCard={renderCard}
          renderHeadlines={renderHeadlines}
          defaultViewMode="list"
          emptyState={<div className="py-14 text-center text-gray-500 text-sm">No bookmarks in this folder</div>}
        />
      </div>

      {selectedBookmark && (
        <div className="w-[28rem] flex-1 overflow-y-auto p-6">
          <div className="max-w-none">
            <div className="mb-3 flex items-start justify-between">
              <h2 className="font-semibold text-white text-xl">{selectedBookmark.title}</h2>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => {
                    setEditingBookmarkId(selectedBookmark.id);
                    setCreatingBookmark(false);
                  }}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                  title="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => copyBookmarkUrl(selectedBookmark)}
                  className={`rounded-lg p-1.5 transition-colors ${
                    copiedBookmarkId === selectedBookmark.id ? 'text-green-400' : 'text-gray-500 hover:text-white'
                  }`}
                  title="Copy URL">
                  {copiedBookmarkId === selectedBookmark.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => openExternalUrl(selectedBookmark.url)}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                  title="Open in browser">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={() => update(selectedBookmark.id, { isFavorite: !selectedBookmark.isFavorite })}
                  className={`rounded-lg p-1.5 transition-colors ${
                    selectedBookmark.isFavorite ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                  }`}
                  title="Favorite">
                  <Star className={`h-4 w-4 ${selectedBookmark.isFavorite ? 'fill-yellow-400' : ''}`} />
                </button>
                <button
                  onClick={() => handleBookmarkDelete(selectedBookmark)}
                  className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="relative inline-flex">
                <select
                  value={selectedBookmark.folderId}
                  onChange={(event) => update(selectedBookmark.id, { folderId: event.target.value })}
                  className="appearance-none rounded border border-white/10 bg-white/5 py-1.5 pr-8 pl-2.5 text-gray-200 text-sm outline-none focus:border-blue-500/50">
                  {folderOptions.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            {selectedBookmark.tags.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedBookmark.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-blue-300 text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-4">
              <p className="text-gray-300 text-sm">{selectedBookmark.description || 'No description provided.'}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-1 text-gray-500 text-xs uppercase tracking-wider">URL</div>
              <button
                onClick={() => openExternalUrl(selectedBookmark.url)}
                className="inline-flex items-center gap-1.5 break-all text-left text-blue-400 text-sm hover:text-blue-300">
                <Globe className="h-3.5 w-3.5" />
                {selectedBookmark.url}
              </button>
            </div>
          </div>
        </div>
      )}

      <CategoryEditorModal
        isOpen={isCreatingFolder || Boolean(editingFolder)}
        title={editingFolder ? 'Edit Folder' : creatingFolderParentId ? 'Create Nested Folder' : 'Create Folder'}
        initial={folderEditorInitial}
        resetKey={editingFolder?.id || `folder-${isCreatingFolder ? creatingFolderParentId || 'root' : 'none'}`}
        onSave={saveFolder}
        onClose={() => {
          setIsCreatingFolder(false);
          setEditingFolderId(null);
          setCreatingFolderParentId(null);
        }}
      />

      <BookmarkItemEditorModal
        isOpen={creatingBookmark || Boolean(editingBookmark)}
        title={editingBookmark ? 'Edit Bookmark' : 'Create Bookmark'}
        initial={bookmarkEditorInitial}
        folders={folderOptions}
        resetKey={editingBookmark?.id || `new-${selectedFolderId}`}
        onSave={saveBookmark}
        onClose={() => {
          setCreatingBookmark(false);
          setEditingBookmarkId(null);
        }}
      />
    </div>
  );
};

export default BookmarksBrowser;
