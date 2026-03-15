import React, { useState, useEffect } from 'react';
import { Keyboard, Palette, Bell, Database, Shield, Zap, Monitor } from 'lucide-react';
import SidebarLayout from './layouts/SidebarLayout';

interface SettingsProps {
  onClose: () => void;
}

type SettingCategory = {
  id: string;
  name: string;
  icon: any;
};

const settingCategories: SettingCategory[] = [
  { id: 'general', name: 'General', icon: Monitor },
  { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'appearance', name: 'Appearance', icon: Palette },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'storage', name: 'Storage & Data', icon: Database },
  { id: 'privacy', name: 'Privacy & Security', icon: Shield },
  { id: 'advanced', name: 'Advanced', icon: Zap },
];

// Electron accelerator → display label (for Quick Launcher dropdown)
const LAUNCHER_SHORTCUT_OPTIONS: { value: string; label: string }[] = [
  { value: 'CommandOrControl+O', label: 'Ctrl+O (Cmd+O on Mac)' },
  { value: 'CommandOrControl+Space', label: 'Ctrl+Space (Cmd+Space on Mac)' },
  { value: 'Alt+Space', label: 'Alt+Space' },
];

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [focusedPane, setFocusedPane] = useState<'list' | 'details'>('list');
  const [launcherShortcut, setLauncherShortcutState] = useState<string>('CommandOrControl+O');
  const [launcherShortcutLoaded, setLauncherShortcutLoaded] = useState(false);

  const isElectron = typeof window !== 'undefined' && !!(window as any).mightyhq;

  useEffect(() => {
    if (isElectron && (window as any).mightyhq.getLauncherShortcut) {
      (window as any).mightyhq
        .getLauncherShortcut()
        .then((acc: string) => {
          setLauncherShortcutState(acc || 'CommandOrControl+O');
          setLauncherShortcutLoaded(true);
        })
        .catch(() => setLauncherShortcutLoaded(true));
    } else {
      setLauncherShortcutLoaded(true);
    }
  }, [isElectron]);

  const filteredCategories = settingCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = filteredCategories[selectedIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (focusedPane === 'list' && selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (focusedPane === 'list' && selectedIndex < filteredCategories.length - 1) {
            setSelectedIndex(selectedIndex + 1);
          }
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
          if (focusedPane === 'list') {
            setFocusedPane('details');
          }
          break;

        case 'Backspace':
          e.preventDefault();
          if (focusedPane === 'details') {
            setFocusedPane('list');
          } else {
            onClose();
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIndex, filteredCategories, focusedPane]);

  const renderSidebar = () => (
    <div className="p-4">
      <div className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Settings</div>
      <div className="space-y-1">
        {filteredCategories.map((category, index) => {
          const Icon = category.icon;
          const isSelected = index === selectedIndex;
          const isFocused = focusedPane === 'list' && isSelected;

          return (
            <button
              key={category.id}
              onClick={() => {
                setSelectedIndex(index);
                setFocusedPane('details');
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                isFocused
                  ? 'bg-blue-500 font-medium text-white shadow-md'
                  : isSelected
                    ? 'bg-gray-200 font-medium text-gray-900'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-gray-900 text-lg">General Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Launch on startup</div>
              <div className="text-gray-500 text-sm">Automatically start when you log in</div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Show in menu bar</div>
              <div className="text-gray-500 text-sm">Keep icon visible in the menu bar</div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Auto-update</div>
              <div className="text-gray-500 text-sm">Automatically download and install updates</div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderShortcutsSettings = () => {
    const handleLauncherShortcutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setLauncherShortcutState(value);
      if (isElectron && (window as any).mightyhq.setLauncherShortcut) {
        (window as any).mightyhq.setLauncherShortcut(value);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 font-semibold text-gray-900 text-lg">Keyboard Shortcuts</h3>

          {isElectron && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-900">Quick Launcher (global)</div>
                  <div className="text-gray-500 text-sm">
                    Opens the launcher from anywhere. Change takes effect immediately.
                  </div>
                </div>
                <select
                  value={launcherShortcutLoaded ? launcherShortcut : 'CommandOrControl+O'}
                  onChange={handleLauncherShortcutChange}
                  className="min-w-[200px] rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {LAUNCHER_SHORTCUT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-900">Open Command Palette</span>
              <kbd className="rounded border border-gray-300 bg-white px-3 py-1 font-mono text-sm">Ctrl/Cmd + K</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-900">Navigate Up</span>
              <kbd className="rounded border border-gray-300 bg-white px-3 py-1 font-mono text-sm">↑</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-900">Navigate Down</span>
              <kbd className="rounded border border-gray-300 bg-white px-3 py-1 font-mono text-sm">↓</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-900">Enter Category/Select</span>
              <kbd className="rounded border border-gray-300 bg-white px-3 py-1 font-mono text-sm">→ or Enter</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-900">Go Back</span>
              <kbd className="rounded border border-gray-300 bg-white px-3 py-1 font-mono text-sm">← or Backspace</kbd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <span className="text-gray-900">Close Modal</span>
              <kbd className="rounded border border-gray-300 bg-white px-3 py-1 font-mono text-sm">Esc</kbd>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-gray-900 text-lg">Appearance</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium text-gray-900">Theme</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option>Dark</option>
              <option>Light</option>
              <option>System</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-900">Interface Scale</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option>Small</option>
              <option>Medium (Default)</option>
              <option>Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">Animations</div>
              <div className="text-gray-500 text-sm">Enable smooth transitions and animations</div>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-4 font-semibold text-gray-900 text-lg">Storage & Data</h3>

        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-gray-900">Clipboard History</span>
              <span className="text-gray-600 text-sm">~2.5 MB</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: '35%' }}></div>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-gray-900">History Retention</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
              <option>Forever</option>
            </select>
          </div>

          <button className="w-full rounded-lg bg-red-50 px-4 py-2 text-red-600 transition-colors hover:bg-red-100">
            Clear All Clipboard History
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (!selectedCategory) return null;

    return (
      <div className="max-w-2xl p-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          {selectedCategory.id === 'general' && renderGeneralSettings()}
          {selectedCategory.id === 'shortcuts' && renderShortcutsSettings()}
          {selectedCategory.id === 'appearance' && renderAppearanceSettings()}
          {selectedCategory.id === 'storage' && renderStorageSettings()}
          {!['general', 'shortcuts', 'appearance', 'storage'].includes(selectedCategory.id) && (
            <div className="py-12 text-center">
              <p className="mb-2 text-gray-500">Settings for "{selectedCategory.name}"</p>
              <p className="text-gray-400 text-sm">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => (
    <div className="flex items-center justify-between text-gray-500 text-xs">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs">↑↓</kbd>
          navigate
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs">←→</kbd>
          switch pane
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs">↵</kbd>
          open
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs">esc</kbd>
          close
        </span>
      </div>
      <div
        className={`rounded px-2 py-1 font-medium text-xs ${
          focusedPane === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
        }`}>
        {focusedPane === 'list' ? '⚙️ Categories' : '📝 Details'}
      </div>
    </div>
  );

  return (
    <SidebarLayout
      searchPlaceholder="search settings..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      onClose={onClose}
      sidebar={renderSidebar()}
      footer={renderFooter()}>
      {renderContent()}
    </SidebarLayout>
  );
};

export default Settings;
