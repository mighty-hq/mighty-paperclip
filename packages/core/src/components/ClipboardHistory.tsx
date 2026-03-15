import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  Clock,
  Code2,
  Link as LinkIcon,
  FileText,
  ArrowLeft,
  Trash2,
  Pin,
  ClipboardPaste,
} from 'lucide-react';
import { useClipboard } from '../db/hooks';
import { useToast } from '../hooks/use-toast';

const ClipboardHistory = ({ onBack }) => {
  const { items, add, remove, clear } = useClipboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();

  const copyToClipboard = async (content, id) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast({ title: 'Copied to clipboard', duration: 2000 });
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({ title: 'Failed to copy', variant: 'destructive', duration: 2000 });
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast({ title: 'Clipboard is empty', duration: 2000 });
        return;
      }
      const isCode = /[{}[\];=><]/.test(text) && text.includes('\n');
      const isLink = /^https?:\/\//.test(text.trim());
      add({ content: text, type: isCode ? 'code' : isLink ? 'link' : 'text', source: 'Manual paste', isPinned: false });
      toast({ title: 'Added from clipboard', duration: 2000 });
    } catch {
      toast({
        title: 'Clipboard access denied',
        description: 'Please allow clipboard access in your browser settings',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const filteredHistory = items.filter((item) => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'code':
        return <Code2 className="h-4 w-4" />;
      case 'link':
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 flex items-center gap-2 text-gray-400 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="mb-2 font-bold text-3xl text-white">Clipboard History</h1>
          <div className="flex items-center gap-3">
            <p className="flex-1 text-gray-400">Access and reuse your recently copied items</p>
            <button
              onClick={pasteFromClipboard}
              data-testid="paste-from-clipboard-btn"
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
              <ClipboardPaste className="h-4 w-4" /> Paste from Clipboard
            </button>
            {items.length > 0 && (
              <button
                onClick={() => {
                  clear();
                  toast({ title: 'History cleared', duration: 1500 });
                }}
                data-testid="clear-clipboard-btn"
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-gray-400 text-sm transition-colors hover:bg-red-500/20 hover:text-red-400">
                <Trash2 className="h-4 w-4" /> Clear All
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clipboard history..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'text', 'code', 'link'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`rounded-lg px-4 py-3 font-medium text-sm transition-colors ${
                  filterType === type
                    ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                    : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                }`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                      item.type === 'code'
                        ? 'bg-blue-500/20 text-blue-400'
                        : item.type === 'link'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {getTypeIcon(item.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className={`mb-2 text-white ${item.type === 'code' ? 'font-mono text-sm' : ''}`}>
                      {truncateContent(item.content)}
                    </div>
                    <div className="flex items-center gap-3 text-gray-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(item.timestamp)}
                      </span>
                      {item.source && <span className="rounded bg-white/5 px-2 py-0.5">{item.source}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => copyToClipboard(item.content, item.id)}
                      className="rounded-lg bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                      title="Copy to clipboard">
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-500 text-lg">No clipboard items found</p>
              <p className="mt-2 text-gray-600 text-sm">Start copying to build your history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClipboardHistory;
