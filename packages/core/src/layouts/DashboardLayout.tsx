'use client';
import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from '../utils/useNavigation';
import {
  Command,
  LayoutDashboard,
  ClipboardList,
  FileText,
  Sparkles,
  Brain,
  Bot,
  Folder,
  Globe,
  Bookmark,
  Puzzle,
  Settings as SettingsIcon,
  LogOut,
  Zap,
} from 'lucide-react';
import { ThemeProvider } from '../ThemeContext';
import { DevExtensionsProvider } from '../contexts/DevExtensionsContext';
import CommandPalette from '../components/CommandPalette';
import CompactSnippets from '../components/CompactSnippets';
import PromptsLibrary from '../components/PromptsLibrary';
import ManageCategories from '../components/ManageCategories';
import Settings from '../components/Settings';
import CreateSnippetModal from '../components/CreateSnippetModal';
import ExtensionPanelOverlay from '../components/ExtensionPanelOverlay';
import { registry } from '../plugins/registry';
import type { PluginPanel } from '../plugins/types';
import { auth, signOut } from '@mighty/core/auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isSnippetsOpen, setIsSnippetsOpen] = useState(false);
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateSnippetOpen, setIsCreateSnippetOpen] = useState(false);
  const [extensionPanel, setExtensionPanel] = useState<(PluginPanel & { pluginId: string; pluginName: string }) | null>(
    null
  );
  const isElectron = Boolean((window as any).mightyhq?.isElectron);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
        return;
      }
      if (!(window as any).mightyhq?.isElectron && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeLauncherOverlays = () => {
    setIsCommandOpen(false);
    setIsSnippetsOpen(false);
    setIsPromptsOpen(false);
    setIsCategoriesOpen(false);
    setIsSettingsOpen(false);
    setIsCreateSnippetOpen(false);
    setExtensionPanel(null);
  };

  const handleCommandSelect = (action: string) => {
    closeLauncherOverlays();
    if (action.startsWith('plugin:')) {
      const [, pluginId, commandId] = action.split(':');
      const panel = registry.findPanelForCommand(pluginId, commandId);
      if (panel) {
        setExtensionPanel(panel);
        return;
      }
    }
    if (action.startsWith('dev-ext:')) {
      navigate('/dashboard/extensions');
      return;
    }
    switch (action) {
      case 'clipboard':
      case 'clipboard-history':
        navigate('/dashboard/clipboard');
        break;
      case 'snippets':
        setIsSnippetsOpen(true);
        break;
      case 'prompts':
        setIsPromptsOpen(true);
        break;
      case 'skills':
        navigate('/dashboard/skills');
        break;
      case 'agents':
        navigate('/dashboard/agents');
        break;
      case 'bookmarks':
        navigate('/dashboard/bookmarks');
        break;
      case 'create-snippet':
      case 'createSnippet':
        setIsCreateSnippetOpen(true);
        break;
      case 'categories':
        navigate('/dashboard/categories');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      case 'extensions':
        navigate('/dashboard/extensions');
        break;
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clipboard History', href: '/dashboard/clipboard', icon: ClipboardList },
    { name: 'My Snippets', href: '/dashboard/snippets', icon: FileText },
    { name: 'Prompts Library', href: '/dashboard/prompts', icon: Sparkles },
    { name: 'Skills', href: '/dashboard/skills', icon: Brain },
    { name: 'Agents', href: '/dashboard/agents', icon: Bot },
    { name: 'Categories', href: '/dashboard/categories', icon: Folder },
    { name: 'Quick Links', href: '/dashboard/quick-links', icon: Globe },
    { name: 'Bookmarks', href: '/dashboard/bookmarks', icon: Bookmark },
    { name: 'Extensions', href: '/dashboard/extensions', icon: Puzzle },
    { name: 'Settings', href: '/dashboard/settings', icon: SettingsIcon },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-primary)]">
      <aside className="flex w-64 flex-col border-[var(--border)] border-r bg-[var(--bg-sidebar)] backdrop-blur-xl">
        <div className="border-[var(--border)] border-b p-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-[var(--text-primary)] text-xl">
            <Command className="h-6 w-6" />
            Mighty Shortcut
          </Link>
        </div>

        <div className="px-4 pt-4">
          <button
            onClick={() => setIsCommandOpen(true)}
            data-testid="open-extension-btn"
            className="group flex w-full items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-600/10 px-4 py-2.5 text-blue-400 transition-all hover:bg-blue-600/20 hover:text-blue-300">
            <Zap className="h-4 w-4" />
            <span className="flex-1 text-left font-medium text-sm">Quick Launcher</span>
            <kbd className="rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[10px] text-blue-500/70 group-hover:text-blue-400">
              {isElectron ? 'Ctrl+K' : 'Ctrl+O'}
            </kbd>
          </button>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  data-testid={`nav-${item.href.split('/').pop()}`}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                  }`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-[var(--border)] border-t p-4">
          <button
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
            data-testid="sign-out-btn"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]">
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <ThemeProvider>
          <DevExtensionsProvider>{children}</DevExtensionsProvider>
        </ThemeProvider>
      </main>

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onCommandSelect={handleCommandSelect}
      />

      {isSnippetsOpen && (
        <CompactSnippets
          onClose={() => setIsSnippetsOpen(false)}
          onBack={() => {
            setIsSnippetsOpen(false);
            setIsCommandOpen(true);
          }}
        />
      )}

      {isPromptsOpen && (
        <PromptsLibrary
          onClose={() => setIsPromptsOpen(false)}
          onBack={() => {
            setIsPromptsOpen(false);
            setIsCommandOpen(true);
          }}
        />
      )}

      {isCategoriesOpen && <ManageCategories onClose={() => setIsCategoriesOpen(false)} />}

      {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}

      <CreateSnippetModal
        isOpen={isCreateSnippetOpen}
        onClose={() => setIsCreateSnippetOpen(false)}
        onSave={(snippet: any) => {
          console.log('Created snippet:', snippet);
          setIsCreateSnippetOpen(false);
        }}
      />

      {extensionPanel && (
        <ExtensionPanelOverlay
          panel={extensionPanel}
          variant="launcher"
          onClose={() => {
            setExtensionPanel(null);
            setIsCommandOpen(true);
          }}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
