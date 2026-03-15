import React, { useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { registry } from '../plugins/registry';
import type { PluginAPI, PluginPanel } from '../plugins/types';
import { useSnippets, usePrompts, useClipboard, useQuickLinks } from '../db/hooks';
import { useToast } from '../hooks/use-toast';

interface ExtensionPanelOverlayProps {
  onClose: () => void;
  panel: PluginPanel & { pluginId: string; pluginName: string };
  /** When 'launcher', show a compact centered panel (like desktop launcher) instead of full-screen */
  variant?: 'fullscreen' | 'launcher';
}

/**
 * Renders a single extension panel with its own data hooks so that
 * DashboardLayout does not need to subscribe to snippets/prompts/clipboard/quickLinks.
 * This avoids duplicate hook usage that can break Snippets/Prompts modals.
 */
const ExtensionPanelOverlay: React.FC<ExtensionPanelOverlayProps> = ({ panel, onClose, variant = 'fullscreen' }) => {
  const { snippets, create: createSnippet, update: updateSnippet, remove: removeSnippet } = useSnippets();
  const { prompts, create: createPrompt, update: updatePrompt, remove: removePrompt } = usePrompts();
  const { items: clipboardItems, add: addClipboard } = useClipboard();
  const { links: quickLinks, create: createLink, remove: removeLink } = useQuickLinks();
  const { toast } = useToast();

  const createPluginAPI = useCallback(
    (pluginId: string): PluginAPI => ({
      snippets: { getAll: () => snippets, create: createSnippet, update: updateSnippet, remove: removeSnippet },
      prompts: { getAll: () => prompts, create: createPrompt, update: updatePrompt, remove: removePrompt },
      clipboard: {
        getHistory: () => clipboardItems,
        add: addClipboard,
        copyToClipboard: (text) => navigator.clipboard.writeText(text),
      },
      quickLinks: { getAll: () => quickLinks, create: createLink, remove: removeLink },
      ui: { showToast: (opts) => toast(opts as any), closeLauncher: onClose },
      getPluginSetting: (key) => registry.getPluginSetting(pluginId, key),
      setPluginSetting: (key, value) => registry.setPluginSetting(pluginId, key, value),
    }),
    [
      snippets,
      prompts,
      clipboardItems,
      quickLinks,
      createSnippet,
      updateSnippet,
      removeSnippet,
      createPrompt,
      updatePrompt,
      removePrompt,
      addClipboard,
      createLink,
      removeLink,
      toast,
      onClose,
    ]
  );

  const PanelComponent = panel.component;
  const pluginAPI = createPluginAPI(panel.pluginId);

  const isLauncher = variant === 'launcher';

  return (
    <div
      className={`fixed z-[100] overflow-auto ${isLauncher ? 'inset-0 flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm' : 'inset-0 bg-[var(--bg-primary)]'}`}
      onClick={
        isLauncher
          ? (e) => {
              e.target === e.currentTarget && onClose();
            }
          : undefined
      }>
      <div
        className={
          isLauncher
            ? 'mx-4 flex max-h-[min(640px,80vh)] w-full max-w-[680px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#1e1e1e]/95 shadow-2xl backdrop-blur-xl'
            : 'mx-auto max-w-5xl p-6'
        }
        onClick={isLauncher ? (e) => e.stopPropagation() : undefined}>
        <div className={isLauncher ? 'flex shrink-0 items-center gap-2 border-white/10 border-b px-4 py-2.5' : ''}>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 text-[var(--text-secondary)] text-sm transition-colors hover:text-[var(--text-primary)]">
            <ChevronRight className="h-4 w-4 rotate-180" /> Back
          </button>
          {isLauncher && <span className="truncate font-medium text-[var(--text-primary)] text-sm">{panel.title}</span>}
        </div>
        {!isLauncher && <h2 className="mb-6 font-bold text-2xl text-[var(--text-primary)]">{panel.title}</h2>}
        <div className={isLauncher ? 'min-h-0 flex-1 overflow-y-auto p-4' : ''}>
          <div className={isLauncher ? '' : 'overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]'}>
            <PanelComponent api={pluginAPI} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPanelOverlay;
