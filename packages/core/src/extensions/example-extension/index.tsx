import React from 'react';
import type { PluginManifest, PluginAPI } from '../../plugins/types';
import Coomand1Showdetail from './src/coomand1_showdetail';
import Coomand3Showlist from './src/coomand3_showlist';
import Coomand4Showgrid from './src/coomand4_showgrid';
import Coomand5 from './src/coomand5_';

const Coomand1Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Coomand1Showdetail, { ...props });
const Coomand3Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Coomand3Showlist, { ...props });
const Coomand4Panel: React.ComponentType<{ api: PluginAPI }> = (props) =>
  React.createElement(Coomand4Showgrid, { ...props });
const Coomand5Panel: React.ComponentType<{ api: PluginAPI }> = (props) => React.createElement(Coomand5, { ...props });

export const exampleExtensionPlugin: PluginManifest = {
  id: 'builtin-example-extension',
  name: 'EXAMPLE EXTENSION',
  description: 'EXAMPLE EXTENSION descr',
  version: '1.0.0',
  author: '',
  icon: 'Calculator',
  enabled: true,
  commands: [
    {
      id: 'coomand1_showdetail',
      title: 'coomand1_showdetail',
      subtitle: 'coomand1_subtitile',
      icon: 'Calculator',
      mode: 'view',
      panelId: 'example-coomand1_showdetail',
      action: () => {},
    },
    {
      id: 'coomand2_runscript',
      title: 'coomand2_runscript',
      subtitle: 'coomand2_',
      icon: 'Calculator',
      mode: 'no-view',
      action: (api) => api.ui.showToast({ title: 'coomand2_runscript run', duration: 1500 }),
    },
    {
      id: 'coomand3_showlist',
      title: 'coomand3_showlist',
      subtitle: 'coomand3_',
      icon: 'Calculator',
      mode: 'view',
      panelId: 'example-coomand3_showlist',
      action: () => {},
    },
    {
      id: 'coomand4_showgrid',
      title: 'coomand4_showgrid',
      subtitle: 'coomand4_',
      icon: 'Calculator',
      mode: 'view',
      panelId: 'example-coomand4_showgrid',
      action: () => {},
    },
    {
      id: 'coomand5_',
      title: 'coomand5_',
      subtitle: 'coomand5_',
      icon: 'Calculator',
      mode: 'view',
      panelId: 'example-coomand5_',
      action: () => {},
    },
  ],
  panels: [
    { id: 'example-coomand1_showdetail', title: 'coomand1_showdetail', icon: 'Calculator', component: Coomand1Panel },
    { id: 'example-coomand3_showlist', title: 'coomand3_showlist', icon: 'Calculator', component: Coomand3Panel },
    { id: 'example-coomand4_showgrid', title: 'coomand4_showgrid', icon: 'Calculator', component: Coomand4Panel },
    { id: 'example-coomand5_', title: 'coomand5_', icon: 'Calculator', component: Coomand5Panel },
  ],
};
