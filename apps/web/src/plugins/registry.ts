// Plugin registry — manages installed plugins and their lifecycle

import type { PluginManifest, PluginAPI, PluginCommand, PluginPanel } from './types';
import { builtinPlugins } from '@mighty/core/extensions';
import { storageGetItem, storageSetItem } from '@mighty/utils';

const PLUGIN_SETTINGS_KEY = 'cf_plugin_settings';
const PLUGIN_STATES_KEY = 'cf_plugin_states';

// Load plugin enabled states from localStorage
function loadPluginStates(): Record<string, boolean> {
  try {
    const raw = storageGetItem(PLUGIN_STATES_KEY);
    if (!raw) return {};
    return raw as Record<string, boolean>;
  } catch {
    return {};
  }
}

function savePluginStates(states: Record<string, boolean>): void {
  storageSetItem(PLUGIN_STATES_KEY, JSON.stringify(states));
}

// Load plugin settings from localStorage
function loadAllPluginSettings(): Record<string, Record<string, any>> {
  try {
    const raw = storageGetItem(PLUGIN_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllPluginSettings(settings: Record<string, Record<string, any>>): void {
  storageSetItem(PLUGIN_SETTINGS_KEY, JSON.stringify(settings));
}

class PluginRegistry {
  private plugins: Map<string, PluginManifest> = new Map();
  private states: Record<string, boolean>;
  private settings: Record<string, Record<string, any>>;

  constructor() {
    this.states = loadPluginStates();
    this.settings = loadAllPluginSettings();
    // Register all built-in plugins
    builtinPlugins.forEach((p) => this.register(p));
  }

  register(manifest: PluginManifest): void {
    // Apply saved enabled state, default to manifest value
    if (this.states[manifest.id] !== undefined) {
      manifest.enabled = this.states[manifest.id];
    }
    // Initialize default settings
    if (manifest.settings && !this.settings[manifest.id]) {
      this.settings[manifest.id] = {};
      manifest.settings.forEach((s) => {
        this.settings[manifest.id][s.key] = s.default;
      });
      saveAllPluginSettings(this.settings);
    }
    this.plugins.set(manifest.id, manifest);
  }

  getAll(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  getEnabled(): PluginManifest[] {
    return this.getAll().filter((p) => p.enabled);
  }

  get(id: string): PluginManifest | undefined {
    return this.plugins.get(id);
  }

  enable(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = true;
      this.states[id] = true;
      savePluginStates(this.states);
    }
  }

  disable(id: string): void {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.enabled = false;
      this.states[id] = false;
      savePluginStates(this.states);
    }
  }

  toggle(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;
    plugin.enabled ? this.disable(id) : this.enable(id);
    return plugin.enabled;
  }

  // Get all commands from enabled plugins
  getCommands(): (PluginCommand & { pluginId: string })[] {
    const cmds: (PluginCommand & { pluginId: string })[] = [];
    this.getEnabled().forEach((p) => {
      p.commands?.forEach((c) => cmds.push({ ...c, pluginId: p.id }));
    });
    return cmds;
  }

  getCommand(pluginId: string, commandId: string): (PluginCommand & { pluginId: string }) | undefined {
    const plugin = this.plugins.get(pluginId);
    if (!plugin?.commands) return undefined;
    const cmd = plugin.commands.find((c) => c.id === commandId);
    return cmd ? { ...cmd, pluginId } : undefined;
  }

  findPanelForCommand(
    pluginId: string,
    commandId: string
  ): (PluginPanel & { pluginId: string; pluginName: string }) | undefined {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return undefined;
    const cmd = plugin.commands?.find((c) => c.id === commandId);
    const panelId = cmd?.panelId;
    if (!panelId || !plugin.panels) return undefined;
    const panel = plugin.panels.find((p) => p.id === panelId);
    return panel ? { ...panel, pluginId, pluginName: plugin.name } : undefined;
  }

  // Get all panels from enabled plugins
  getPanels(): (PluginPanel & { pluginId: string; pluginName: string })[] {
    const panels: (PluginPanel & { pluginId: string; pluginName: string })[] = [];
    this.getEnabled().forEach((p) => {
      p.panels?.forEach((panel) => panels.push({ ...panel, pluginId: p.id, pluginName: p.name }));
    });
    return panels;
  }

  // Plugin settings
  getPluginSetting(pluginId: string, key: string): any {
    return this.settings[pluginId]?.[key];
  }

  setPluginSetting(pluginId: string, key: string, value: any): void {
    if (!this.settings[pluginId]) this.settings[pluginId] = {};
    this.settings[pluginId][key] = value;
    saveAllPluginSettings(this.settings);
  }
}

export const registry = new PluginRegistry();
