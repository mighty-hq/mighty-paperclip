import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  Star,
  Code2,
  Link as LinkIcon,
  FileText,
  Plus,
  Tag,
  ArrowLeft,
  TrendingUp,
  Edit,
  Trash2,
} from 'lucide-react';
import { useSnippets, useCategories } from '../db/hooks';
import { useToast } from '../hooks/use-toast';

const SnippetsManager = ({ onBack, onCreateSnippet }) => {
  const { snippets, remove } = useSnippets();
  const { categories } = useCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();

  const copyToClipboard = async (content, id, title) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({ title: 'Copied to clipboard', description: title, duration: 2000 });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive', duration: 2000 });
    }
  };

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || snippet.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId) => categories.find((cat) => cat.id === categoryId) || categories[0];

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-bold text-3xl text-white">My Snippets</h1>
              <p className="text-gray-400">Manage and organize your saved snippets</p>
            </div>
            <button
              onClick={onCreateSnippet}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create Snippet
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-1 text-gray-400 text-sm">Total Snippets</div>
            <div className="font-bold text-2xl text-white">{snippets.length}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-1 text-gray-400 text-sm">Categories</div>
            <div className="font-bold text-2xl text-white">{categories.length}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-1 text-gray-400 text-sm">Favorites</div>
            <div className="font-bold text-2xl text-white">{snippets.filter((s) => s.isFavorite).length}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <div className="mb-1 text-gray-400 text-sm">Most Used</div>
            <div className="font-bold text-2xl text-white">
              {snippets.length > 0 ? Math.max(...snippets.map((s) => s.usageCount)) : 0}
            </div>
          </div>
        </div>

        {/* Search and Categories */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snippets by title, content, or tags..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>

          <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
              All Snippets
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
                  selectedCategory === category.id
                    ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                    : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                style={{
                  borderColor: selectedCategory === category.id ? `${category.color}50` : undefined,
                  backgroundColor: selectedCategory === category.id ? `${category.color}20` : undefined,
                }}>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Snippets Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map((snippet: any) => {
              const category = getCategoryInfo(snippet.categoryId);
              return (
                <div
                  key={snippet.id}
                  className="group rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10">
                  {/* Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex flex-1 items-start gap-3">
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${category.color}20` }}>
                        {snippet.type === 'code' ? (
                          <Code2 className="h-5 w-5" style={{ color: category.color }} />
                        ) : snippet.type === 'link' ? (
                          <LinkIcon className="h-5 w-5" style={{ color: category.color }} />
                        ) : (
                          <FileText className="h-5 w-5" style={{ color: category.color }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate font-semibold text-white">{snippet.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <span style={{ color: category.color }}>{category.name}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {snippet.usageCount} uses
                          </span>
                        </div>
                      </div>
                    </div>
                    {snippet.isFavorite && <Star className="h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400" />}
                  </div>

                  {/* Content Preview */}
                  <div
                    className={`mb-3 text-gray-300 text-sm ${
                      snippet.type === 'code' ? 'rounded-lg bg-black/30 p-3 font-mono' : ''
                    }`}>
                    {truncateContent(snippet.content)}
                  </div>

                  {/* Tags */}
                  {snippet.tags && snippet.tags.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {snippet.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="rounded bg-white/5 px-2 py-1 text-gray-400 text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between border-white/10 border-t pt-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(snippet.content, snippet.id, snippet.title)}
                        className="flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1.5 text-blue-400 text-sm transition-colors hover:bg-blue-500/30">
                        {copiedId === snippet.id ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-2 py-20 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-500 text-lg">No snippets found</p>
              <p className="mt-2 mb-4 text-gray-600 text-sm">Create your first snippet to get started</p>
              <button
                onClick={onCreateSnippet}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Snippet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnippetsManager;
