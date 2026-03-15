import React, { useState, useRef, useCallback } from 'react';
import {
  Upload,
  Globe,
  Trash2,
  ExternalLink,
  Check,
  X,
  FolderOpen,
  Pin,
  PinOff,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  FileUp,
} from 'lucide-react';
import { useQuickLinks, useLauncherPins } from '../db/hooks';
import { parseBookmarksHtml, ParsedBookmark } from '@mighty/utils/bookmarkParser';
import { useToast } from '../hooks/use-toast';

const QuickLinksPage: React.FC = () => {
  const { links, create, update, remove } = useQuickLinks();
  const { pin, unpin, isPinned } = useLauncherPins();
  const { toast } = useToast();

  const [parsedBookmarks, setParsedBookmarks] = useState<ParsedBookmark[]>([]);
  const [showImport, setShowImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const html = ev.target?.result as string;
        const bookmarks = parseBookmarksHtml(html);
        setParsedBookmarks(bookmarks);
        if (bookmarks.length === 0) {
          toast({
            title: 'No bookmarks found',
            description: 'The file did not contain any valid bookmarks.',
            variant: 'destructive',
            duration: 3000,
          });
        } else {
          toast({
            title: `${bookmarks.length} bookmarks found`,
            description: 'Review and select which ones to import.',
            duration: 2000,
          });
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [toast]
  );

  const toggleBookmark = (index: number) => {
    setParsedBookmarks((prev) => prev.map((b, i) => (i === index ? { ...b, selected: !b.selected } : b)));
  };

  const toggleFolder = (folder: string) => {
    setCollapsedFolders((prev) => {
      const next = new Set(prev);
      next.has(folder) ? next.delete(folder) : next.add(folder);
      return next;
    });
  };

  const selectAll = () => setParsedBookmarks((prev) => prev.map((b) => ({ ...b, selected: true })));
  const deselectAll = () => setParsedBookmarks((prev) => prev.map((b) => ({ ...b, selected: false })));

  const handleImport = () => {
    const selected = parsedBookmarks.filter((b) => b.selected);
    if (selected.length === 0) {
      toast({ title: 'No bookmarks selected', variant: 'destructive', duration: 2000 });
      return;
    }
    setImporting(true);
    const existingUrls = new Set(links.map((l) => l.url));
    let imported = 0;
    let skipped = 0;
    selected.forEach((b) => {
      if (existingUrls.has(b.url)) {
        skipped++;
        return;
      }
      create({ title: b.title, url: b.url, icon: 'Globe', isPinned: false });
      existingUrls.add(b.url);
      imported++;
    });
    toast({
      title: `Imported ${imported} links`,
      description: skipped > 0 ? `${skipped} duplicates skipped` : undefined,
      duration: 3000,
    });
    setParsedBookmarks([]);
    setShowImport(false);
    setImporting(false);
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) return;
    let url = newLink.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
    create({ title: newLink.title.trim(), url, icon: 'Globe', isPinned: false });
    toast({ title: 'Link added', description: newLink.title, duration: 2000 });
    setNewLink({ title: '', url: '' });
    setShowAddForm(false);
  };

  const handleTogglePin = (link: { id: string; title: string }) => {
    if (isPinned(link.id)) {
      unpin(link.id);
      toast({ title: 'Unpinned', duration: 1500 });
    } else {
      pin(link.id, link.title);
      toast({ title: 'Pinned to launcher', duration: 1500 });
    }
  };

  const filteredLinks = links.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group parsed bookmarks by folder
  const folderGroups = parsedBookmarks.reduce<Record<string, ParsedBookmark[]>>((acc, b) => {
    (acc[b.folder] = acc[b.folder] || []).push(b);
    return acc;
  }, {});

  const selectedCount = parsedBookmarks.filter((b) => b.selected).length;

  return (
    <div className="mx-auto max-w-5xl p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-3xl text-[var(--text-primary)]">Quick Links</h1>
          <p className="mt-1 text-[var(--text-secondary)] text-sm">
            Manage your quick links and import browser bookmarks
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="add-link-btn"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/10">
            <Plus className="h-4 w-4" /> Add Link
          </button>
          <button
            onClick={() => {
              setShowImport(!showImport);
              setParsedBookmarks([]);
            }}
            data-testid="import-bookmarks-btn"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700">
            <FileUp className="h-4 w-4" /> Import Bookmarks
          </button>
        </div>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 shrink-0 text-blue-400" />
            <input
              type="text"
              placeholder="Link title"
              value={newLink.title}
              onChange={(e) => setNewLink((p) => ({ ...p, title: e.target.value }))}
              data-testid="page-link-title"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <input
              type="text"
              placeholder="https://..."
              value={newLink.url}
              onChange={(e) => setNewLink((p) => ({ ...p, url: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
              data-testid="page-link-url"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
            />
            <button
              onClick={handleAddLink}
              data-testid="page-link-save"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Import Section */}
      {showImport && (
        <div className="mb-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          {parsedBookmarks.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
                <Upload className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-2 font-semibold text-lg text-white">Import Browser Bookmarks</h3>
              <p className="mx-auto mb-6 max-w-md text-gray-400 text-sm">
                Export your bookmarks from Chrome, Firefox, or Safari as an HTML file, then upload it here.
              </p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="upload-bookmarks-btn"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700">
                  <Upload className="h-4 w-4" /> Choose Bookmarks File
                </button>
                <p className="text-gray-500 text-xs">Supports .html bookmark exports from all major browsers</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm"
                onChange={handleFileUpload}
                className="hidden"
                data-testid="bookmarks-file-input"
              />
              <div className="mt-6 border-white/5 border-t pt-6">
                <p className="mb-3 text-gray-500 text-xs">How to export bookmarks:</p>
                <div className="flex justify-center gap-8 text-gray-400 text-xs">
                  <div>
                    <strong className="text-gray-300">Chrome:</strong> Bookmarks &gt; Bookmark Manager &gt; Export
                  </div>
                  <div>
                    <strong className="text-gray-300">Firefox:</strong> Bookmarks &gt; Manage &gt; Import/Export
                  </div>
                  <div>
                    <strong className="text-gray-300">Safari:</strong> File &gt; Export Bookmarks
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Import toolbar */}
              <div className="flex items-center justify-between border-white/10 border-b bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm text-white">
                    {selectedCount} of {parsedBookmarks.length} selected
                  </span>
                  <button onClick={selectAll} className="text-blue-400 text-xs transition-colors hover:text-blue-300">
                    Select all
                  </button>
                  <button onClick={deselectAll} className="text-gray-400 text-xs transition-colors hover:text-gray-300">
                    Deselect all
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setParsedBookmarks([]);
                    }}
                    className="px-3 py-1.5 text-gray-400 text-sm transition-colors hover:text-white">
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={importing || selectedCount === 0}
                    data-testid="confirm-import-btn"
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-1.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                    <Check className="h-4 w-4" /> Import {selectedCount} links
                  </button>
                </div>
              </div>
              {/* Bookmark list grouped by folder */}
              <div className="custom-scrollbar max-h-[400px] overflow-y-auto">
                {Object.entries(folderGroups).map(([folder, bookmarks]) => {
                  const collapsed = collapsedFolders.has(folder);
                  const folderSelected = bookmarks.filter((b) => b.selected).length;
                  return (
                    <div key={folder}>
                      <button
                        onClick={() => toggleFolder(folder)}
                        className="flex w-full items-center gap-2 border-white/5 border-b bg-white/[0.02] px-4 py-2 text-left transition-colors hover:bg-white/[0.04]">
                        {collapsed ? (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                        <FolderOpen className="h-4 w-4 text-amber-400" />
                        <span className="flex-1 font-medium text-sm text-white">{folder}</span>
                        <span className="text-gray-500 text-xs">
                          {folderSelected}/{bookmarks.length}
                        </span>
                      </button>
                      {!collapsed &&
                        bookmarks.map((bk, i) => {
                          const globalIdx = parsedBookmarks.indexOf(bk);
                          return (
                            <button
                              key={i}
                              onClick={() => toggleBookmark(globalIdx)}
                              className="flex w-full items-center gap-3 border-white/5 border-b px-4 py-2 pl-10 text-left transition-colors hover:bg-white/[0.03]">
                              <div
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${bk.selected ? 'border-blue-600 bg-blue-600' : 'border-white/20'}`}>
                                {bk.selected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <Globe className="h-4 w-4 shrink-0 text-gray-500" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm text-white">{bk.title}</div>
                                <div className="truncate text-gray-500 text-xs">{bk.url}</div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Quick Links */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="search-links-input"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500/50"
          />
        </div>
        <span className="text-gray-500 text-sm">{filteredLinks.length} links</span>
      </div>

      {filteredLinks.length > 0 ? (
        <div className="grid gap-2">
          {filteredLinks.map((link) => (
            <div
              key={link.id}
              data-testid={`link-${link.id}`}
              className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.05]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Globe className="h-4 w-4 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-sm text-white">{link.title}</div>
                <div className="truncate text-gray-500 text-xs">{link.url}</div>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                  title="Open link">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleTogglePin(link)}
                  data-testid={`pin-link-${link.id}`}
                  className={`rounded-lg p-2 transition-colors ${isPinned(link.id) ? 'text-amber-400 hover:bg-amber-500/20' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                  title={isPinned(link.id) ? 'Unpin from launcher' : 'Pin to launcher'}>
                  {isPinned(link.id) ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    remove(link.id);
                    unpin(link.id);
                    toast({ title: 'Link deleted', duration: 1500 });
                  }}
                  data-testid={`delete-link-${link.id}`}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  title="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-gray-600" />
          <p className="mb-2 text-gray-400">{searchQuery ? 'No links match your search' : 'No quick links yet'}</p>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Try a different search term' : 'Add links manually or import from your browser bookmarks'}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickLinksPage;
