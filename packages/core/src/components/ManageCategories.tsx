import React, { useState, useEffect } from 'react';
import { FolderPlus, Edit, Trash2, Save, X } from 'lucide-react';
import { useCategories } from '../db/hooks';
import type { Category } from '@mighty/types';
import { useToast } from '../hooks/use-toast';
import SidebarLayout from './layouts/SidebarLayout';

interface ManageCategoriesProps {
  onClose: () => void;
}

const ManageCategories: React.FC<ManageCategoriesProps> = ({ onClose }) => {
  const { toast } = useToast();
  const { categories, create, update, remove } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusedPane, setFocusedPane] = useState<'list' | 'details'>('list');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredCategories = categories.filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedCategory = filteredCategories[selectedIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusedPane === 'list' && selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (focusedPane === 'list' && selectedIndex < filteredCategories.length - 1)
            setSelectedIndex(selectedIndex + 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedPane('details');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedPane('list');
          break;
        case 'Enter':
          e.preventDefault();
          if (focusedPane === 'list') setFocusedPane('details');
          break;
        case 'Backspace':
          e.preventDefault();
          if (focusedPane === 'details') setFocusedPane('list');
          else onClose();
          break;
        case 'Escape':
          e.preventDefault();
          if (editingCategory || isCreating) {
            setEditingCategory(null);
            setIsCreating(false);
          } else onClose();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredCategories.length, focusedPane, editingCategory, isCreating, onClose]);

  const handleCreateCategory = (type: Category['type']) => {
    setEditingCategory({ id: '', name: 'New Category', icon: 'Folder', color: '#3b82f6', type });
    setIsCreating(true);
    setFocusedPane('details');
  };

  const handleSaveCategory = () => {
    if (!editingCategory) return;
    if (isCreating) {
      create({
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: editingCategory.type,
      });
      toast({ title: 'Category created', description: editingCategory.name, duration: 1500 });
    } else {
      update(editingCategory.id, {
        name: editingCategory.name,
        icon: editingCategory.icon,
        color: editingCategory.color,
      });
      toast({ title: 'Category updated', description: editingCategory.name, duration: 1500 });
    }
    setEditingCategory(null);
    setIsCreating(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Delete this category?')) {
      remove(categoryId);
      toast({ title: 'Category deleted', duration: 1500 });
      if (selectedIndex >= categories.length - 1) setSelectedIndex(Math.max(0, categories.length - 2));
    }
  };

  const displayCategory = editingCategory || selectedCategory;
  const isEditing = editingCategory !== null;

  return (
    <SidebarLayout
      searchPlaceholder="search categories..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClose={onClose}
      actionButton={{ label: 'New Category', onClick: () => handleCreateCategory('snippets') }}
      sidebar={
        <div className="p-4">
          <div className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">All Categories</div>
          <div className="space-y-1">
            {filteredCategories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedIndex(i);
                  setFocusedPane('details');
                }}
                data-testid={`manage-cat-${cat.id}`}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                  focusedPane === 'list' && i === selectedIndex
                    ? 'border border-blue-500/30 bg-blue-600/20 font-medium text-white'
                    : i === selectedIndex
                      ? 'border border-white/10 bg-white/10 font-medium text-white'
                      : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                }`}>
                <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        <div className="flex items-center gap-4 text-gray-500 text-xs">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">←→</kbd> pane
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">Esc</kbd> close
          </span>
        </div>
      }>
      {displayCategory ? (
        <div className="max-w-lg p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold text-white text-xl">{isCreating ? 'Create Category' : 'Category Details'}</h2>
            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCategory(displayCategory)}
                  data-testid="edit-manage-cat-btn"
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(displayCategory.id)}
                  data-testid="delete-manage-cat-btn"
                  className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-medium text-gray-400 text-sm">Category Name</label>
              <input
                type="text"
                value={displayCategory.name}
                onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, name: e.target.value })}
                disabled={!isEditing}
                data-testid="manage-cat-name-input"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-400 text-sm">Icon</label>
              <input
                type="text"
                value={displayCategory.icon}
                onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, icon: e.target.value })}
                disabled={!isEditing}
                placeholder="e.g., Folder, Star, Code"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
            <div>
              <label className="mb-2 block font-medium text-gray-400 text-sm">Color</label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={displayCategory.color}
                  onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, color: e.target.value })}
                  disabled={!isEditing}
                  className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent disabled:opacity-50"
                />
                <input
                  type="text"
                  value={displayCategory.color}
                  onChange={(e) => isEditing && setEditingCategory({ ...displayCategory, color: e.target.value })}
                  disabled={!isEditing}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition-colors focus:border-blue-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: displayCategory.color + '33' }}>
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: displayCategory.color }} />
              </div>
              <span className="font-medium text-white">{displayCategory.name}</span>
              <span className="text-gray-500 text-sm">Preview</span>
            </div>
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCategory}
                  data-testid="save-manage-cat-btn"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-blue-700">
                  <Save className="h-4 w-4" /> Save
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCreating(false);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-300 transition-colors hover:bg-white/10">
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
    </SidebarLayout>
  );
};

export default ManageCategories;
