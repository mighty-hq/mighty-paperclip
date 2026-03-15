import React, { useState } from 'react';
import { FolderPlus, Edit, Trash2, Save, X, Search } from 'lucide-react';
import { useCategories } from '../db/hooks';
import type { Category } from '../db/schema';
import { useToast } from '../hooks/use-toast';

const CategoriesPage: React.FC = () => {
  const { toast } = useToast();
  const { categories, create, update, remove } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCategory = filteredCategories[selectedIndex];
  const displayCategory = editingCategory || selectedCategory;
  const isEditing = editingCategory !== null;

  const handleCreate = () => {
    setEditingCategory({ id: '', name: 'New Category', icon: 'Folder', color: '#3b82f6', type: 'both', tags: [] });
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!editingCategory) return;
    if (isCreating) {
      create({
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: editingCategory.type,
        tags: editingCategory.tags || [],
      });
      toast({ title: 'Category created', description: editingCategory.name, duration: 2000 });
    } else {
      update(editingCategory.id, {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        tags: editingCategory.tags || [],
      });
      toast({ title: 'Category updated', description: editingCategory.name, duration: 2000 });
    }
    setEditingCategory(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category?')) {
      remove(id);
      toast({ title: 'Category deleted', duration: 2000 });
      if (selectedIndex >= categories.length - 1) setSelectedIndex(Math.max(0, categories.length - 2));
    }
  };

  return (
    <div className="flex h-full flex-col" data-testid="categories-page">
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="mb-1 font-bold text-3xl text-[var(--text-primary)]">Categories</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage your snippet and prompt categories</p>
        </div>
        <button
          onClick={handleCreate}
          data-testid="create-category-btn"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
          <FolderPlus className="h-4 w-4" /> New Category
        </button>
      </div>
      <div className="mx-8 mb-8 flex flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white/[0.03]">
        <div className="flex w-72 flex-col border-[var(--border)] border-r">
          <div className="border-[var(--border)] border-b p-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                data-testid="categories-search"
                className="w-full rounded-lg border border-[var(--border)] bg-white/5 py-2 pr-3 pl-9 text-[var(--text-primary)] text-sm placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredCategories.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedIndex(index);
                  setEditingCategory(null);
                  setIsCreating(false);
                }}
                data-testid={`category-item-${cat.id}`}
                className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                  index === selectedIndex
                    ? 'border border-blue-500/30 bg-blue-600/20 text-[var(--text-primary)]'
                    : 'border border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }`}>
                <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
            {filteredCategories.length === 0 && (
              <div className="py-8 text-center text-gray-500 text-sm">No categories found</div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {displayCategory ? (
            <div className="max-w-lg">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-semibold text-[var(--text-primary)] text-xl">
                  {isCreating ? 'Create Category' : 'Category Details'}
                </h2>
                {!isEditing && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(displayCategory)}
                      data-testid="edit-category-btn"
                      className="rounded-lg p-2 text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)]">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(displayCategory.id)}
                      data-testid="delete-category-btn"
                      className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block font-medium text-[var(--text-secondary)] text-sm">Category Name</label>
                  <input
                    type="text"
                    value={displayCategory.name}
                    onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, name: e.target.value })}
                    disabled={!isEditing}
                    data-testid="category-name-input"
                    className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2 text-[var(--text-primary)] transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-[var(--text-secondary)] text-sm">Icon</label>
                  <input
                    type="text"
                    value={displayCategory.icon}
                    onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, icon: e.target.value })}
                    disabled={!isEditing}
                    data-testid="category-icon-input"
                    placeholder="e.g., Folder, Star, Code"
                    className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2 text-[var(--text-primary)] transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-[var(--text-secondary)] text-sm">Tags</label>
                  <input
                    type="text"
                    value={(displayCategory.tags || []).join(', ')}
                    onChange={(e) =>
                      isEditing &&
                      setEditingCategory({
                        ...displayCategory,
                        tags: e.target.value
                          .split(',')
                          .map((tag) => tag.trim().replace(/^#/, ''))
                          .filter(Boolean),
                      })
                    }
                    disabled={!isEditing}
                    data-testid="category-tags-input"
                    placeholder="frontend, ai, snippets"
                    className="w-full rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2 text-[var(--text-primary)] transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-medium text-[var(--text-secondary)] text-sm">Color</label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={displayCategory.color}
                      onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, color: e.target.value })}
                      disabled={!isEditing}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-[var(--border)] bg-transparent disabled:opacity-50"
                    />
                    <input
                      type="text"
                      value={displayCategory.color}
                      onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, color: e.target.value })}
                      disabled={!isEditing}
                      data-testid="category-color-input"
                      className="flex-1 rounded-lg border border-[var(--border)] bg-white/5 px-3 py-2 text-[var(--text-primary)] transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: displayCategory.color + '33' }}>
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: displayCategory.color }} />
                  </div>
                  <span className="font-medium text-[var(--text-primary)]">{displayCategory.name}</span>
                  <span className="text-gray-500 text-sm">Preview</span>
                </div>
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSave}
                      data-testid="save-category-btn"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700">
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingCategory(null);
                        setIsCreating(false);
                      }}
                      data-testid="cancel-category-btn"
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white/5 px-4 py-2.5 text-gray-300 transition-colors hover:bg-white/10">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FolderPlus className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <p className="text-gray-400">No categories yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
