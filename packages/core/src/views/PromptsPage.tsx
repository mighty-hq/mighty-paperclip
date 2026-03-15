import React, { useState } from 'react';
import { useNavigate } from '../utils/useNavigation';
import { Plus, Search } from 'lucide-react';
import PromptsBrowser from '../components/PromptsBrowser';

const PromptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-full flex-col" data-testid="prompts-page">
      <div className="flex items-center justify-between px-8 pt-8 pb-4">
        <div>
          <h1 className="mb-1 font-bold text-3xl text-[var(--text-primary)]">Prompts Library</h1>
          <p className="text-[var(--text-secondary)] text-sm">Browse and manage your AI prompts</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/prompts/new')}
          data-testid="create-prompt-btn"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
          <Plus className="h-4 w-4" /> New Prompt
        </button>
      </div>
      <div className="px-8 pb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            data-testid="prompts-search"
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 py-2 pr-3 pl-9 text-[var(--text-primary)] text-sm placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
      </div>
      <div className="mx-8 mb-8 flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white/[0.03]">
        <PromptsBrowser searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default PromptsPage;
