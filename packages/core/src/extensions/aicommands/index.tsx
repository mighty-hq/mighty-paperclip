import React from 'react';
import manifest from './manifest.json';
import type { PluginManifest, PluginAPI } from '../../plugins/types';
import AICommandsView from './src/index';

const AICommandsPanel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(AICommandsView, { ...props });

export const aiCommandsPlugin: PluginManifest = {
  id: manifest.id,
  name: manifest.name,
  description: manifest.description,
  version: manifest.version,
  author: 'Mighty Shortcut',
  icon: 'Bot',
  enabled: true,
  commands: [
    {
      id: manifest.commands[0]?.id ?? 'builtin-aicommands-open-cheatsheet',
      title: manifest.commands[0]?.name ?? 'AI Commands Cheatsheet',
      subtitle: manifest.commands[0]?.subtitle ?? 'Developer Tools',
      icon: 'Bot',
      mode: 'view',
      panelId: 'aicommands-panel',
      action: () => {},
    },
  ],
  panels: [{ id: 'aicommands-panel', title: 'AI Commands', icon: 'Bot', component: AICommandsPanel }],
};
