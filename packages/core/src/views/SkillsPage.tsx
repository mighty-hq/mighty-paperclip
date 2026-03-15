import React, { useState } from 'react';
import { Search } from 'lucide-react';
import SkillsBrowser from '../components/SkillsBrowser';

const SkillsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-full flex-col" data-testid="skills-page">
      <div className="px-8 pt-8 pb-4">
        <h1 className="mb-1 font-bold text-3xl text-[var(--text-primary)]">Skills</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Reusable skill cards with tree-based files and snippet previews
        </p>
      </div>
      <div className="px-8 pb-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            data-testid="skills-search"
            className="w-full rounded-lg border border-[var(--border)] bg-white/5 py-2 pr-3 pl-9 text-[var(--text-primary)] text-sm placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
      </div>
      <div className="mx-8 mb-8 flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white/[0.03]">
        <SkillsBrowser searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default SkillsPage;
