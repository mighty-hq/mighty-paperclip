import React from 'react';
import type { PluginManifest, PluginAPI } from '../../plugins/types';
import Command2Showdetail from './src/command_2_showdetail';
import Command3SubmitForm from './src/command_3_submit_form';
import Command4ShowGrid from './src/command_4_show_grid';
import Command5ListDetail from './src/command_5_list_detail';
import Command7Showlist from './src/command_7_showlist';
import Command8Ai from './src/command_8_ai';

const Command2Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Command2Showdetail, { ...props });
const Command3Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Command3SubmitForm, { ...props });
const Command4Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Command4ShowGrid, { ...props });
const Command5Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Command5ListDetail, { ...props });
const Command7Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Command7Showlist, { ...props });
const Command8Panel: React.ComponentType<{ api: PluginAPI }> = (props) => React.createElement(Command8Ai, { ...props });

export const fullExtensionPlugin: PluginManifest = {
  id: 'builtin-full-extension',
  name: 'fulextension',
  description: 'fulextensionfulextensionfulextension fulextension',
  version: '1.0.0',
  author: '',
  icon: 'Puzzle',
  enabled: true,
  commands: [
    {
      id: 'command_1_blnak',
      title: 'xx1_1_blnak',
      subtitle: 'command_1_command_1_',
      icon: 'Puzzle',
      mode: 'no-view',
      action: (api) => api.ui.showToast({ title: 'command_1_blnak run', duration: 1500 }),
    },
    {
      id: 'command_2_showdetail',
      title: 'xx_2_showdetail',
      subtitle: 'command_2_showdetail2',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'full-command_2_showdetail',
      action: () => {},
    },
    {
      id: 'command_3_submit_form',
      title: 'cxxd_3_submit_form',
      subtitle: 'command_3_submit_form1',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'full-command_3_submit_form',
      action: () => {},
    },
    {
      id: 'command_4_show_grid',
      title: 'xx_4_show_grid',
      subtitle: 'command_4_show_grid11',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'full-command_4_show_grid',
      action: () => {},
    },
    {
      id: 'command_5_list_detail',
      title: 'xx_5_list_detail',
      subtitle: 'list and detail',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'full-command_5_list_detail',
      action: () => {},
    },
    {
      id: 'command_6_script',
      title: 'xx_6_script',
      subtitle: 'run sscript',
      icon: 'Puzzle',
      mode: 'no-view',
      action: async (api) => {
        const now = new Date();
        await api.clipboard.copyToClipboard(now.toLocaleDateString());
        api.ui.showToast({ title: 'Copied date to clipboard', duration: 1500 });
      },
    },
    {
      id: 'command_7_showlist',
      title: 'xx7_showlist',
      subtitle: 'it shows list',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'full-command_7_showlist',
      action: () => {},
    },
    {
      id: 'command_8_ai',
      title: 'xx_8_ai',
      subtitle: 'show ai sss',
      icon: 'Puzzle',
      mode: 'view',
      panelId: 'full-command_8_ai',
      action: () => {},
    },
  ],
  panels: [
    { id: 'full-command_2_showdetail', title: 'command_2_showdetail', icon: 'Puzzle', component: Command2Panel },
    { id: 'full-command_3_submit_form', title: 'command_3_submit_form', icon: 'Puzzle', component: Command3Panel },
    { id: 'full-command_4_show_grid', title: 'command_4_show_grid', icon: 'Puzzle', component: Command4Panel },
    { id: 'full-command_5_list_detail', title: 'command_5_list_detail', icon: 'Puzzle', component: Command5Panel },
    { id: 'full-command_7_showlist', title: 'command_7_showlist', icon: 'Puzzle', component: Command7Panel },
    { id: 'full-command_8_ai', title: 'command_8_ai', icon: 'Puzzle', component: Command8Panel },
  ],
};
