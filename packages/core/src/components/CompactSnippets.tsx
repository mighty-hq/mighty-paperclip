import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronLeft, Search } from 'lucide-react';
import SnippetsBrowser from './SnippetsBrowser';

interface CompactSnippetsProps {
  onBack?: () => void;
  onClose: () => void;
}

const CompactSnippets: React.FC<CompactSnippetsProps> = ({ onClose, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (
        e.key === 'Backspace' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        if (onBack) onBack();
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onBack]);

  const modal = (
    <>
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
        <div
          className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1c1c2e] shadow-2xl backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-white/10 border-b bg-white/[0.02] px-5 py-3">
            {onBack && (
              <button
                onClick={onBack}
                data-testid="sidebar-back-btn"
                className="shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="search snippets..."
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
              />
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Shared browser component */}
          <div className="flex-1 overflow-hidden">
            <SnippetsBrowser searchQuery={searchQuery} />
          </div>

          {/* Footer */}
          <div className="shrink-0 border-white/10 border-t bg-white/[0.02] px-5 py-2.5">
            <div className="flex items-center gap-4 text-gray-500 text-xs">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">↵</kbd> select
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">⌫</kbd> back
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono">Esc</kbd> close
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default CompactSnippets;
