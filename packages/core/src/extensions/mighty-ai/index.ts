import type { PluginManifest } from '../../plugins/types';
import { MightyAIPanel } from './MightyAIPanel';
import manifest from './manifest.json';

export const mightyAiPlugin: PluginManifest = {
  id: manifest.id,
  name: manifest.name,
  description: manifest.description,
  version: manifest.version,
  author: 'Mighty Shortcut',
  icon: 'Bot',
  enabled: true,
  commands: [
    {
      id: manifest.commands[0]?.id ?? 'mighty-ai-open-chat',
      title: manifest.commands[0]?.name ?? 'Mighty AI',
      subtitle: manifest.commands[0]?.subtitle ?? 'AI Assistant',
      icon: 'Bot',
      mode: 'view',
      panelId: 'mighty-ai-panel',
      action: () => {},
    },
  ],
  panels: [{ id: 'mighty-ai-panel', title: 'Mighty AI', icon: 'Bot', component: MightyAIPanel }],
};
