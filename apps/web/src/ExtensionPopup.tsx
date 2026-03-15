import { useState, useEffect } from 'react';
import './App.css';
import { Toaster } from '@mighty/core/components/ui/sonner';
import CommandPalette from '@mighty/core/components/CommandPalette';
import Home from '@mighty/core/components/Home';
import ClipboardHistory from '@mighty/core/components/ClipboardHistory';
import SnippetsManager from '@mighty/core/components/SnippetsManager';
import CompactSnippets from '@mighty/core/components/CompactSnippets';
import CreateSnippetModal from '@mighty/core/components/CreateSnippetModal';
import PromptsLibrary from '@mighty/core/components/PromptsLibrary';
import ManageCategories from '@mighty/core/components/ManageCategories';
import Settings from '@mighty/core/components/Settings';

type ViewType = 'home' | 'clipboard' | 'snippets';

interface ExtensionPopupProps {
  onClose?: () => void;
}

function ExtensionPopup({ onClose }: ExtensionPopupProps) {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isCreateSnippetOpen, setIsCreateSnippetOpen] = useState(false);
  const [isPromptsOpen, setIsPromptsOpen] = useState(false);
  const [isCompactSnippetsOpen, setIsCompactSnippetsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [navigationStack, setNavigationStack] = useState<ViewType[]>(['home']);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen(true);
        return;
      }

      // Backspace for back navigation
      if (e.key === 'Backspace') {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }

        e.preventDefault();
        handleBackNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    navigationStack,
    isPromptsOpen,
    isCompactSnippetsOpen,
    isCategoriesOpen,
    isSettingsOpen,
    isCreateSnippetOpen,
    isCommandOpen,
  ]);

  const handleBackNavigation = () => {
    // Close any open modals first
    if (isPromptsOpen) {
      setIsPromptsOpen(false);
      return;
    }
    if (isCompactSnippetsOpen) {
      setIsCompactSnippetsOpen(false);
      return;
    }
    if (isCategoriesOpen) {
      setIsCategoriesOpen(false);
      return;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return;
    }
    if (isCreateSnippetOpen) {
      setIsCreateSnippetOpen(false);
      return;
    }
    if (isCommandOpen) {
      setIsCommandOpen(false);
      return;
    }

    // Navigate back through the stack
    if (navigationStack.length > 1) {
      const newStack = [...navigationStack];
      newStack.pop();
      const previousView = newStack[newStack.length - 1];
      setNavigationStack(newStack);
      setCurrentView(previousView);
    }
  };

  const navigateTo = (view: ViewType) => {
    setNavigationStack([...navigationStack, view]);
    setCurrentView(view);
  };

  const handleCommandSelect = (action: string) => {
    if (action.startsWith('plugin:') || action.startsWith('dev-ext:')) {
      window.open(`${window.location.origin}/dashboard/extensions`, '_blank');
      return;
    }
    switch (action) {
      case 'clipboard':
      case 'clipboard-history':
        navigateTo('clipboard');
        break;
      case 'snippets':
        setIsCompactSnippetsOpen(true);
        break;
      case 'prompts':
        setIsPromptsOpen(true);
        break;
      case 'skills':
        window.open(`${window.location.origin}/dashboard/skills`, '_blank');
        break;
      case 'agents':
        window.open(`${window.location.origin}/dashboard/agents`, '_blank');
        break;
      case 'bookmarks':
        window.open(`${window.location.origin}/dashboard/bookmarks`, '_blank');
        break;
      case 'create-snippet':
        setIsCreateSnippetOpen(true);
        break;
      case 'categories':
        setIsCategoriesOpen(true);
        break;
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'extensions':
        window.open(`${window.location.origin}/dashboard/extensions`, '_blank');
        break;
      default:
        break;
    }
  };

  const handleSaveSnippet = (snippet: any) => {
    console.log('Saving snippet:', snippet);
    setIsCreateSnippetOpen(false);
    navigateTo('snippets');
  };

  const handleBackToHome = () => {
    setNavigationStack(['home']);
    setCurrentView('home');
  };

  const renderView = () => {
    switch (currentView) {
      case 'clipboard':
        return <ClipboardHistory onBack={handleBackToHome} />;
      case 'snippets':
        return <SnippetsManager onBack={handleBackToHome} onCreateSnippet={() => setIsCreateSnippetOpen(true)} />;
      default:
        return <Home onOpenCommand={() => setIsCommandOpen(true)} />;
    }
  };

  return (
    <div className="App">
      {renderView()}

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onCommandSelect={handleCommandSelect}
      />

      <CreateSnippetModal
        isOpen={isCreateSnippetOpen}
        onClose={() => setIsCreateSnippetOpen(false)}
        onSave={handleSaveSnippet}
      />

      {isPromptsOpen && <PromptsLibrary onClose={() => setIsPromptsOpen(false)} />}

      {isCompactSnippetsOpen && <CompactSnippets onClose={() => setIsCompactSnippetsOpen(false)} />}

      {isCategoriesOpen && <ManageCategories onClose={() => setIsCategoriesOpen(false)} />}

      {isSettingsOpen && <Settings onClose={() => setIsSettingsOpen(false)} />}

      <Toaster />
    </div>
  );
}

export default ExtensionPopup;
