import React, { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Tab {
  count?: number;
  id: string;
  label: string;
}

interface TabsLayoutProps {
  activeTab: string;

  // Content
  children: ReactNode;

  // Header action
  headerAction?: {
    label: string;
    onClick: () => void;
  };
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onTabChange: (tabId: string) => void;

  // Search
  searchPlaceholder?: string;
  searchValue: string;

  // Stats (optional)
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  subtitle?: string;

  // Tabs
  tabs: Tab[];
  title: string;
}

const TabsLayout: React.FC<TabsLayoutProps> = ({
  title,
  subtitle,
  onBack,
  tabs,
  activeTab,
  onTabChange,
  headerAction,
  stats,
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  children,
}) => {
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
              <h1 className="mb-2 font-bold text-3xl text-white">{title}</h1>
              {subtitle && <p className="text-gray-400">{subtitle}</p>}
            </div>
            {headerAction && (
              <button
                onClick={headerAction.onClick}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                {headerAction.label}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && stats.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="mb-1 text-gray-400 text-sm">{stat.label}</div>
                <div className="font-bold text-2xl text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-blue-500/50 focus:outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="custom-scrollbar mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
                  : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
              }`}>
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  );
};

export default TabsLayout;
