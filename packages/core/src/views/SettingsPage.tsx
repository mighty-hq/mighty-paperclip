import React, { useState } from 'react';
import { Keyboard, Palette, Bell, Database, Shield, Zap, Monitor, Search } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useSettings } from '../db/hooks';

type SettingCategory = { id: string; name: string; icon: React.ElementType };

const settingCategories: SettingCategory[] = [
  { id: 'general', name: 'General', icon: Monitor },
  { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'storage', name: 'Storage & Data', icon: Database },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  { id: 'advanced', name: 'Advanced', icon: Zap },
];

const SettingsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { theme, scale, setTheme, setScale } = useTheme();
  const { settings, update: updateSettings } = useSettings();

  const filteredCategories = settingCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const selectedCategory = filteredCategories[selectedIndex];

  const ToggleSwitch = ({
    checked,
    onChange,
    id,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    id: string;
  }) => (
    <label className="relative inline-flex cursor-pointer items-center" data-testid={`toggle-${id}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="peer h-6 w-11 rounded-full bg-white/10 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-gray-300 after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/30"></div>
    </label>
  );

  const renderContent = () => {
    if (!selectedCategory) return null;
    switch (selectedCategory.id) {
      case 'general':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-4">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Launch on startup</div>
                  <div className="text-gray-500 text-sm">Automatically start when you log in</div>
                </div>
                <ToggleSwitch
                  checked={settings.launchOnStartup}
                  onChange={(v) => updateSettings({ launchOnStartup: v })}
                  id="startup"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-4">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Show in menu bar</div>
                  <div className="text-gray-500 text-sm">Keep icon visible in the menu bar</div>
                </div>
                <ToggleSwitch
                  checked={settings.showInMenuBar}
                  onChange={(v) => updateSettings({ showInMenuBar: v })}
                  id="menubar"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-4">
                <div>
                  <div className="font-medium text-[var(--text-primary)]">Auto-update</div>
                  <div className="text-gray-500 text-sm">Automatically download and install updates</div>
                </div>
                <ToggleSwitch
                  checked={settings.autoUpdate}
                  onChange={(v) => updateSettings({ autoUpdate: v })}
                  id="autoupdate"
                />
              </div>
            </div>
          </div>
        );
      case 'shortcuts':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {[
                { action: 'Open Command Palette', key: 'Ctrl/Cmd + K' },
                { action: 'Navigate Up/Down', key: '↑ ↓' },
                { action: 'Enter Category / Select', key: '→ or Enter' },
                { action: 'Go Back', key: '← or Backspace' },
                { action: 'Close Modal', key: 'Esc' },
              ].map((item) => (
                <div
                  key={item.action}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] p-3.5">
                  <span className="text-gray-300">{item.action}</span>
                  <kbd className="rounded border border-white/10 bg-white/5 px-3 py-1 font-mono text-gray-400 text-sm">
                    {item.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">Appearance</h3>
            <div className="space-y-5">
              <div>
                <label className="mb-3 block font-medium text-gray-300">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['dark', 'light', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTheme(t);
                        updateSettings({ theme: t });
                      }}
                      data-testid={`theme-${t}`}
                      className={`rounded-lg border px-4 py-3 font-medium text-sm transition-all ${
                        theme === t
                          ? 'border-blue-500/40 bg-blue-600/20 text-blue-400'
                          : 'border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/5'
                      }`}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-3 block font-medium text-gray-300">Interface Scale</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setScale(s);
                        updateSettings({ scale: s });
                      }}
                      data-testid={`scale-${s}`}
                      className={`rounded-lg border px-4 py-3 font-medium text-sm transition-all ${
                        scale === s
                          ? 'border-blue-500/40 bg-blue-600/20 text-blue-400'
                          : 'border-white/10 bg-white/[0.03] text-gray-400 hover:bg-white/5'
                      }`}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                      {s === 'medium' ? ' (Default)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'storage':
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-[var(--text-primary)] text-lg">Storage & Data</h3>
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-[var(--text-primary)]">Clipboard History</span>
                  <span className="text-gray-400 text-sm">~2.5 MB</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: '35%' }}></div>
                </div>
              </div>
              <div>
                <label className="mb-2 block font-medium text-gray-300">History Retention</label>
                <select
                  value={settings.historyRetention}
                  onChange={(e) => updateSettings({ historyRetention: e.target.value as any })}
                  data-testid="retention-select"
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-3 py-2.5 text-[var(--text-primary)] focus:border-blue-500/50 focus:outline-none">
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="90d">90 days</option>
                  <option value="forever">Forever</option>
                </select>
              </div>
              <button
                data-testid="clear-history-btn"
                className="w-full rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-red-400 transition-colors hover:bg-red-500/20">
                Clear All Clipboard History
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-16 text-center">
            <p className="mb-2 text-gray-400">Settings for "{selectedCategory.name}"</p>
            <p className="text-gray-500 text-sm">Coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-full flex-col" data-testid="settings-page">
      <div className="px-8 pt-8 pb-4">
        <h1 className="mb-1 font-bold text-3xl text-[var(--text-primary)]">Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">Configure your Mighty Shortcut preferences</p>
      </div>
      <div className="mx-8 mb-8 flex flex-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white/[0.03]">
        <div className="flex w-64 flex-col border-[var(--border)] border-r">
          <div className="border-[var(--border)] border-b p-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search settings..."
                data-testid="settings-search"
                className="w-full rounded-lg border border-[var(--border)] bg-white/5 py-2 pr-3 pl-9 text-[var(--text-primary)] text-sm placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {filteredCategories.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedIndex(index)}
                  data-testid={`settings-tab-${cat.id}`}
                  className={`mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all ${
                    index === selectedIndex
                      ? 'border border-blue-500/30 bg-blue-600/20 text-[var(--text-primary)]'
                      : 'border border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}>
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default SettingsPage;
