import { useState, useCallback, useEffect } from 'react';
import * as svc from './service';
import * as localDb from './database';
import type {
  Snippet,
  Prompt,
  Category,
  ClipboardItem,
  QuickLink,
  Bookmark,
  BookmarkFolder,
  LauncherPin,
  UserSettings,
  PromptCategory,
} from '@mighty/types';

if (typeof window !== 'undefined') {
  localDb.initDatabase();
}

const listeners = new Map<string, Set<() => void>>();

function subscribe(key: string, fn: () => void) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(fn);
  return () => {
    listeners.get(key)?.delete(fn);
  };
}

function notify(key: string) {
  listeners.get(key)?.forEach((fn) => fn());
}

// ── Snippets ──────────────────────────────────────────
export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>(svc.getSnippets);

  useEffect(() => {
    const unsub = subscribe('snippets', () => setSnippets(svc.getSnippets()));
    let mounted = true;
    const runSync = () => {
      svc.syncSnippets().then((items) => {
        if (mounted) setSnippets(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const create = useCallback((data: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'sortOrder'>) => {
    const result = svc.createSnippet(data);
    notify('snippets');
    return result;
  }, []);

  const update = useCallback((id: string, data: Partial<Snippet>) => {
    const result = svc.updateSnippet(id, data);
    notify('snippets');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deleteSnippet(id);
    notify('snippets');
    return result;
  }, []);

  return { snippets, create, update, remove };
}

// ── Prompts ───────────────────────────────────────────
export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>(svc.getPrompts);

  useEffect(() => {
    const unsub = subscribe('prompts', () => setPrompts(svc.getPrompts()));
    let mounted = true;
    const runSync = () => {
      svc.syncPrompts().then((items) => {
        if (mounted) setPrompts(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const create = useCallback((data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'>) => {
    const result = svc.createPrompt(data);
    notify('prompts');
    notify('promptCategories');
    return result;
  }, []);

  const update = useCallback((id: string, data: Partial<Prompt>) => {
    const result = svc.updatePrompt(id, data);
    notify('prompts');
    notify('promptCategories');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deletePrompt(id);
    notify('prompts');
    notify('promptCategories');
    return result;
  }, []);

  return { prompts, create, update, remove };
}

// ── Categories ────────────────────────────────────────
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(svc.getCategories);

  useEffect(() => {
    const unsub = subscribe('categories', () => setCategories(svc.getCategories()));
    let mounted = true;
    const runSync = () => {
      svc.syncCategories().then((items) => {
        if (mounted) setCategories(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const create = useCallback((data: Omit<Category, 'id'>) => {
    const result = svc.createCategory(data);
    notify('categories');
    return result;
  }, []);

  const update = useCallback((id: string, data: Partial<Category>) => {
    const result = svc.updateCategory(id, data);
    notify('categories');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deleteCategory(id);
    notify('categories');
    return result;
  }, []);

  return { categories, create, update, remove };
}

// ── Prompt Categories ─────────────────────────────────
export function usePromptCategories() {
  const [categories, setCategories] = useState<PromptCategory[]>(svc.getPromptCategories);

  useEffect(() => subscribe('promptCategories', () => setCategories(svc.getPromptCategories())), []);

  return { promptCategories: categories };
}

// ── Clipboard ─────────────────────────────────────────
export function useClipboard() {
  const [items, setItems] = useState<ClipboardItem[]>(svc.getClipboard);

  useEffect(() => subscribe('clipboard', () => setItems(svc.getClipboard())), []);

  const add = useCallback((data: Omit<ClipboardItem, 'id' | 'timestamp'>) => {
    const result = svc.addClipboardItem(data);
    notify('clipboard');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deleteClipboardItem(id);
    notify('clipboard');
    return result;
  }, []);

  const clear = useCallback(() => {
    svc.clearClipboard();
    notify('clipboard');
  }, []);

  return { items, add, remove, clear };
}

// ── Quick Links ───────────────────────────────────────
export function useQuickLinks() {
  const [links, setLinks] = useState<QuickLink[]>(svc.getQuickLinks);

  useEffect(() => {
    const unsub = subscribe('quickLinks', () => setLinks(svc.getQuickLinks()));
    let mounted = true;
    const runSync = () => {
      svc.syncQuickLinks().then((items) => {
        if (mounted) setLinks(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const create = useCallback((data: Omit<QuickLink, 'id' | 'createdAt' | 'sortOrder'>) => {
    const result = svc.createQuickLink(data);
    notify('quickLinks');
    return result;
  }, []);

  const update = useCallback((id: string, data: Partial<QuickLink>) => {
    const result = svc.updateQuickLink(id, data);
    notify('quickLinks');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deleteQuickLink(id);
    notify('quickLinks');
    return result;
  }, []);

  return { links, create, update, remove };
}

// ── Bookmarks ───────────────────────────────────────
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(svc.getBookmarks);

  useEffect(() => {
    const unsub = subscribe('bookmarks', () => setBookmarks(svc.getBookmarks()));
    let mounted = true;
    const runSync = () => {
      svc.syncBookmarks().then((items) => {
        if (mounted) setBookmarks(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const create = useCallback((data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>) => {
    const result = svc.createBookmark(data);
    notify('bookmarks');
    return result;
  }, []);

  const update = useCallback((id: string, data: Partial<Bookmark>) => {
    const result = svc.updateBookmark(id, data);
    notify('bookmarks');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deleteBookmark(id);
    notify('bookmarks');
    return result;
  }, []);

  return { bookmarks, create, update, remove };
}

export function useBookmarkFolders() {
  const [folders, setFolders] = useState<BookmarkFolder[]>(svc.getBookmarkFolders);

  useEffect(() => {
    const unsub = subscribe('bookmarkFolders', () => setFolders(svc.getBookmarkFolders()));
    let mounted = true;
    const runSync = () => {
      svc.syncBookmarkFolders().then((items) => {
        if (mounted) setFolders(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const create = useCallback(
    (data: Omit<BookmarkFolder, 'id' | 'createdAt' | 'updatedAt' | 'sortOrder'> & { sortOrder?: number }) => {
      const result = svc.createBookmarkFolder(data);
      notify('bookmarkFolders');
      return result;
    },
    []
  );

  const update = useCallback((id: string, data: Partial<BookmarkFolder>) => {
    const result = svc.updateBookmarkFolder(id, data);
    notify('bookmarkFolders');
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    const result = svc.deleteBookmarkFolder(id);
    notify('bookmarkFolders');
    notify('bookmarks');
    return result;
  }, []);

  return { folders, create, update, remove };
}

// ── Launcher Pins ─────────────────────────────────────
export function useLauncherPins() {
  const [pins, setPins] = useState<LauncherPin[]>(svc.getLauncherPins);

  useEffect(() => {
    const unsub = subscribe('launcherPins', () => setPins(svc.getLauncherPins()));
    let mounted = true;
    const runSync = () => {
      svc.syncLauncherPins().then((items) => {
        if (mounted) setPins(items);
      });
    };
    runSync();
    return () => {
      mounted = false;
      unsub();
    };
  }, []);

  const pin = useCallback((commandId: string, label: string) => {
    const result = svc.pinCommand(commandId, label);
    notify('launcherPins');
    return result;
  }, []);

  const unpin = useCallback((commandId: string) => {
    const result = svc.unpinCommand(commandId);
    notify('launcherPins');
    return result;
  }, []);

  const reorder = useCallback((orderedIds: string[]) => {
    svc.reorderPins(orderedIds);
    notify('launcherPins');
  }, []);

  const isPinned = useCallback(
    (commandId: string) => {
      return pins.some((p) => p.commandId === commandId);
    },
    [pins]
  );

  return { pins, pin, unpin, reorder, isPinned };
}

// ── Settings ──────────────────────────────────────────
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(svc.getSettings);

  useEffect(() => subscribe('settings', () => setSettings(svc.getSettings())), []);

  const update = useCallback((data: Partial<UserSettings>) => {
    const result = svc.updateSettings(data);
    notify('settings');
    return result;
  }, []);

  return { settings, update };
}
