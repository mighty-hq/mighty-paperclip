import React, { useState, useEffect } from 'react';
import { useNavigate } from '../utils/useNavigation';
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Globe,
  Lock,
  Upload,
  Code,
  Puzzle,
  FolderOpen,
  Copy,
  ExternalLink,
  Bell,
  GripVertical,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const DEV_EXTENSION_PATHS_KEY = 'mightyhq_dev_extension_paths';

declare global {
  interface Window {
    mightyhq?: {
      showOpenDialog: (opts: { properties: string[] }) => Promise<{ canceled: boolean; filePaths: string[] }>;
      createExtensionFolder: (payload: {
        parentPath: string;
        manifest: any;
      }) => Promise<{ path: string | null; error: string | null }>;
      getDefaultExtensionsPath: () => Promise<string | null>;
    };
  }
}

const ICON_OPTIONS = [
  'Puzzle',
  'Calculator',
  'Palette',
  'Type',
  'Globe',
  'Code',
  'FileText',
  'Search',
  'Terminal',
  'Zap',
  'Star',
  'Hash',
  'Shield',
  'Clock',
  'Download',
  'Upload',
  'Mail',
  'Image',
  'Music',
  'Video',
  'Database',
  'Cpu',
  'Wifi',
  'Key',
];

const ACTION_TYPES = [
  { value: 'copy', label: 'Copy to Clipboard', icon: Copy },
  { value: 'open-url', label: 'Open URL', icon: ExternalLink },
  { value: 'toast', label: 'Show Notification', icon: Bell },
];

const WIDGET_TYPES = [
  { value: 'input', label: 'Text Input' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'select', label: 'Dropdown Select' },
  { value: 'button', label: 'Action Button' },
  { value: 'label', label: 'Label / Text' },
  { value: 'divider', label: 'Divider' },
];

interface WidgetAction {
  source?: string;
  type: string;
  value?: string;
}

interface PanelWidget {
  action?: WidgetAction;
  id?: string;
  label?: string;
  options?: string[];
  placeholder?: string;
  rows?: number;
  type: string;
}

interface ExtCommand {
  action?: { type: string; value: string };
  description: string;
  mode: string;
  name: string;
  panel?: { widgets: PanelWidget[] };
  title: string;
}

interface FormData {
  author: string;
  commands: ExtCommand[];
  description: string;
  icon: string;
  name: string;
  title: string;
  version: string;
  visibility: string;
}

const CreateExtensionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [parentPath, setParentPath] = useState('');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');
  const [importMode, setImportMode] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importError, setImportError] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    title: '',
    description: '',
    icon: 'Puzzle',
    author: 'Me',
    version: '1.0.0',
    visibility: 'private',
    commands: [],
  });

  const steps = ['Choose folder', 'Basic Info', 'Commands', 'Review'];

  useEffect(() => {
    if (typeof window !== 'undefined' && window.mightyhq?.getDefaultExtensionsPath) {
      window.mightyhq.getDefaultExtensionsPath().then((p) => {
        if (p) setParentPath(p);
      });
    }
  }, []);

  // ── Helpers ─────────────────────────────────────────
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const updateField = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const addCommand = () => {
    setForm((prev) => ({
      ...prev,
      commands: [
        ...prev.commands,
        {
          name: `command-${prev.commands.length + 1}`,
          title: '',
          description: '',
          mode: 'no-view',
          action: { type: 'toast', value: '' },
        },
      ],
    }));
  };

  const updateCommand = (idx: number, field: string, value: any) => {
    setForm((prev) => {
      const cmds = [...prev.commands];
      cmds[idx] = { ...cmds[idx], [field]: value };
      if (field === 'title') {
        cmds[idx].name = slugify(value);
      }
      if (field === 'mode') {
        if (value === 'view') {
          cmds[idx].panel = { widgets: [] };
          delete cmds[idx].action;
        } else {
          cmds[idx].action = { type: 'toast', value: '' };
          delete cmds[idx].panel;
        }
      }
      return { ...prev, commands: cmds };
    });
  };

  const removeCommand = (idx: number) => {
    setForm((prev) => ({ ...prev, commands: prev.commands.filter((_, i) => i !== idx) }));
  };

  const updateCommandAction = (cmdIdx: number, field: string, value: string) => {
    setForm((prev) => {
      const cmds = [...prev.commands];
      cmds[cmdIdx] = { ...cmds[cmdIdx], action: { ...cmds[cmdIdx].action!, [field]: value } };
      return { ...prev, commands: cmds };
    });
  };

  // ── Panel Widget Management ─────────────────────────
  const addWidget = (cmdIdx: number, type: string) => {
    setForm((prev) => {
      const cmds = [...prev.commands];
      const cmd = cmds[cmdIdx];
      const widgets = cmd.panel?.widgets || [];
      const newWidget: PanelWidget = { type };
      if (['input', 'textarea', 'select'].includes(type)) {
        newWidget.id = `field-${widgets.length + 1}`;
        newWidget.label = '';
        newWidget.placeholder = '';
      }
      if (type === 'textarea') newWidget.rows = 3;
      if (type === 'select') newWidget.options = ['Option 1', 'Option 2'];
      if (type === 'button') {
        newWidget.label = 'Run';
        newWidget.action = { type: 'copy', source: '' };
      }
      if (type === 'label') newWidget.label = 'Some text';
      cmds[cmdIdx] = { ...cmd, panel: { widgets: [...widgets, newWidget] } };
      return { ...prev, commands: cmds };
    });
  };

  const updateWidget = (cmdIdx: number, wIdx: number, updates: Partial<PanelWidget>) => {
    setForm((prev) => {
      const cmds = [...prev.commands];
      const widgets = [...(cmds[cmdIdx].panel?.widgets || [])];
      widgets[wIdx] = { ...widgets[wIdx], ...updates };
      cmds[cmdIdx] = { ...cmds[cmdIdx], panel: { widgets } };
      return { ...prev, commands: cmds };
    });
  };

  const removeWidget = (cmdIdx: number, wIdx: number) => {
    setForm((prev) => {
      const cmds = [...prev.commands];
      const widgets = (cmds[cmdIdx].panel?.widgets || []).filter((_, i) => i !== wIdx);
      cmds[cmdIdx] = { ...cmds[cmdIdx], panel: { widgets } };
      return { ...prev, commands: cmds };
    });
  };

  // ── Import ──────────────────────────────────────────
  const handleImport = () => {
    try {
      setImportError('');
      const parsed = JSON.parse(importJson);
      const imported: FormData = {
        name: parsed.name || slugify(parsed.title || 'imported'),
        title: parsed.title || parsed.name || 'Imported Extension',
        description: parsed.description || '',
        icon: parsed.icon || 'Puzzle',
        author: parsed.author || 'Imported',
        version: parsed.version || '1.0.0',
        visibility: 'private',
        commands: (parsed.commands || []).map((c: any) => ({
          name: c.name || 'command',
          title: c.title || c.name || 'Command',
          description: c.description || '',
          mode: c.mode || 'no-view',
          action: c.mode === 'view' ? undefined : { type: 'toast', value: c.description || '' },
          panel: c.mode === 'view' ? { widgets: [] } : undefined,
        })),
      };
      setForm(imported);
      setImportMode(false);
      setStep(0);
    } catch {
      setImportError('Invalid JSON. Paste a valid extension manifest.');
    }
  };

  // ── Save (create folder on disk) ─────────────────────
  const handleSave = async () => {
    if (!form.title.trim()) return;
    if (!parentPath.trim()) {
      setCreateError('Please choose a folder in step 1.');
      return;
    }
    if (!window.mightyhq?.createExtensionFolder) {
      setCreateError('Create extension is only available in the desktop app.');
      return;
    }
    setSaving(true);
    setCreateError('');
    try {
      const manifest = {
        name: form.name || slugify(form.title),
        title: form.title,
        description: form.description,
        icon: form.icon,
        author: form.author,
        version: form.version,
        commands: form.commands.map((c) => ({
          name: c.name || slugify(c.title) || 'command',
          title: c.title,
          description: c.description,
          mode: c.mode || 'no-view',
        })),
      };
      const result = await window.mightyhq.createExtensionFolder({ parentPath: parentPath.trim(), manifest });
      if (result.error) {
        setCreateError(result.error);
        return;
      }
      if (result.path) {
        try {
          const raw = localStorage.getItem(DEV_EXTENSION_PATHS_KEY);
          const paths: string[] = raw ? JSON.parse(raw) : [];
          if (!paths.includes(result.path)) paths.push(result.path);
          localStorage.setItem(DEV_EXTENSION_PATHS_KEY, JSON.stringify(paths));
        } catch (_) {}
        toast({ title: 'Extension created', description: `Created at ${result.path}`, duration: 4000 });
        navigate('/dashboard/extensions');
      }
    } catch (err) {
      setCreateError((err as Error)?.message || 'Failed to create extension');
    } finally {
      setSaving(false);
    }
  };

  const handleBrowse = async () => {
    if (!window.mightyhq?.showOpenDialog) return;
    const { canceled, filePaths } = await window.mightyhq.showOpenDialog({ properties: ['openDirectory'] });
    if (!canceled && filePaths && filePaths[0]) setParentPath(filePaths[0]);
  };

  // ── Validation ──────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return parentPath.trim().length > 0;
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  // ── Render Steps ────────────────────────────────────
  const renderChooseFolder = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="font-medium text-gray-400 text-xs">Where should the extension be created? *</label>
        <p className="mb-2 text-gray-500 text-xs">
          Choose the folder that will contain your new extension (e.g. frontend/extensions).
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={parentPath}
            onChange={(e) => setParentPath(e.target.value)}
            placeholder="C:\dev\mighty-https://github.com\frontend\extensions"
            data-testid="ext-parent-path"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
          {window.mightyhq && (
            <button
              type="button"
              onClick={handleBrowse}
              data-testid="ext-browse-btn"
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-gray-400 text-sm transition-colors hover:border-white/20 hover:text-white">
              <FolderOpen className="h-4 w-4" /> Browse
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <label className="font-medium text-gray-400 text-xs">Extension Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => {
            updateField('title', e.target.value);
            updateField('name', slugify(e.target.value));
          }}
          placeholder="My Awesome Extension"
          data-testid="ext-title-input"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
        {form.name && <p className="text-gray-500 text-xs">Slug: {form.name}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-gray-400 text-xs">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="What does this extension do?"
          rows={2}
          data-testid="ext-description-input"
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="font-medium text-gray-400 text-xs">Author</label>
          <input
            type="text"
            value={form.author}
            onChange={(e) => updateField('author', e.target.value)}
            placeholder="Your name"
            data-testid="ext-author-input"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="font-medium text-gray-400 text-xs">Version</label>
          <input
            type="text"
            value={form.version}
            onChange={(e) => updateField('version', e.target.value)}
            placeholder="1.0.0"
            data-testid="ext-version-input"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-gray-400 text-xs">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((icon) => (
            <button
              key={icon}
              onClick={() => updateField('icon', icon)}
              data-testid={`icon-${icon}`}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                form.icon === icon
                  ? 'border-blue-500/40 bg-blue-600/20 text-blue-400'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
              }`}>
              {icon}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="font-medium text-gray-400 text-xs">Visibility</label>
        <div className="flex gap-3">
          <button
            onClick={() => updateField('visibility', 'private')}
            data-testid="visibility-private"
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              form.visibility === 'private'
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}>
            <Lock className="h-4 w-4" /> Private
          </button>
          <button
            onClick={() => updateField('visibility', 'public')}
            data-testid="visibility-public"
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
              form.visibility === 'public'
                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
            }`}>
            <Globe className="h-4 w-4" /> Public
          </button>
        </div>
      </div>
    </div>
  );

  const renderCommandEditor = (cmd: ExtCommand, idx: number) => (
    <div key={idx} className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium text-sm text-white">
          <GripVertical className="h-4 w-4 text-gray-600" />
          Command {idx + 1}
        </div>
        <button
          onClick={() => removeCommand(idx)}
          className="rounded p-1 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-gray-500 text-xs">Title</label>
          <input
            type="text"
            value={cmd.title}
            onChange={(e) => updateCommand(idx, 'title', e.target.value)}
            placeholder="Command name"
            data-testid={`cmd-title-${idx}`}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
        <div className="space-y-1">
          <label className="text-gray-500 text-xs">Mode</label>
          <select
            value={cmd.mode}
            onChange={(e) => updateCommand(idx, 'mode', e.target.value)}
            data-testid={`cmd-mode-${idx}`}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500/50">
            <option value="no-view">Action (no-view)</option>
            <option value="view">Panel (view)</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-gray-500 text-xs">Description</label>
        <input
          type="text"
          value={cmd.description}
          onChange={(e) => updateCommand(idx, 'description', e.target.value)}
          placeholder="What this command does"
          data-testid={`cmd-desc-${idx}`}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
        />
      </div>

      {/* Action config for no-view mode */}
      {cmd.mode === 'no-view' && cmd.action && (
        <div className="space-y-3 border-white/5 border-t pt-2">
          <div className="font-medium text-gray-500 text-xs">Action</div>
          <div className="flex gap-2">
            {ACTION_TYPES.map((at) => {
              const Icon = at.icon;
              return (
                <button
                  key={at.value}
                  onClick={() => updateCommandAction(idx, 'type', at.value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                    cmd.action?.type === at.value
                      ? 'border-blue-500/30 bg-blue-600/20 text-blue-400'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                  }`}>
                  <Icon className="h-3 w-3" /> {at.label}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={cmd.action.value}
            onChange={(e) => updateCommandAction(idx, 'value', e.target.value)}
            placeholder={
              cmd.action.type === 'open-url'
                ? 'https://example.com'
                : cmd.action.type === 'copy'
                  ? 'Text to copy'
                  : 'Notification message'
            }
            data-testid={`cmd-action-value-${idx}`}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
          />
        </div>
      )}

      {/* Panel widget builder for view mode */}
      {cmd.mode === 'view' && (
        <div className="space-y-3 border-white/5 border-t pt-2">
          <div className="flex items-center justify-between">
            <div className="font-medium text-gray-500 text-xs">Panel Widgets</div>
            <div className="flex gap-1">
              {WIDGET_TYPES.map((wt) => (
                <button
                  key={wt.value}
                  onClick={() => addWidget(idx, wt.value)}
                  className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-400 transition-colors hover:border-white/20 hover:text-white">
                  + {wt.label}
                </button>
              ))}
            </div>
          </div>

          {(cmd.panel?.widgets || []).map((widget, wIdx) => (
            <div key={wIdx} className="space-y-2 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-gray-400 text-xs">
                  {widget.type}
                  {widget.id ? ` #${widget.id}` : ''}
                </span>
                <button
                  onClick={() => removeWidget(idx, wIdx)}
                  className="text-gray-500 transition-colors hover:text-red-400">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {['input', 'textarea', 'select'].includes(widget.type) && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={widget.id || ''}
                    onChange={(e) => updateWidget(idx, wIdx, { id: e.target.value })}
                    placeholder="Field ID"
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                  />
                  <input
                    value={widget.label || ''}
                    onChange={(e) => updateWidget(idx, wIdx, { label: e.target.value })}
                    placeholder="Label"
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                  />
                  <input
                    value={widget.placeholder || ''}
                    onChange={(e) => updateWidget(idx, wIdx, { placeholder: e.target.value })}
                    placeholder="Placeholder"
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                  />
                </div>
              )}

              {widget.type === 'select' && (
                <input
                  value={(widget.options || []).join(', ')}
                  onChange={(e) =>
                    updateWidget(idx, wIdx, {
                      options: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Options (comma-separated)"
                  className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                />
              )}

              {widget.type === 'button' && (
                <div className="grid grid-cols-3 gap-2">
                  <input
                    value={widget.label || ''}
                    onChange={(e) => updateWidget(idx, wIdx, { label: e.target.value })}
                    placeholder="Button label"
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                  />
                  <select
                    value={widget.action?.type || 'copy'}
                    onChange={(e) => updateWidget(idx, wIdx, { action: { ...widget.action, type: e.target.value } })}
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs outline-none">
                    <option value="copy">Copy</option>
                    <option value="open-url">Open URL</option>
                    <option value="toast">Toast</option>
                  </select>
                  <input
                    value={widget.action?.source || widget.action?.value || ''}
                    onChange={(e) =>
                      updateWidget(idx, wIdx, {
                        action: { ...widget.action!, source: e.target.value, type: widget.action?.type || 'copy' },
                      })
                    }
                    placeholder="Source field ID"
                    className="rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                  />
                </div>
              )}

              {widget.type === 'label' && (
                <input
                  value={widget.label || ''}
                  onChange={(e) => updateWidget(idx, wIdx, { label: e.target.value })}
                  placeholder="Text content"
                  className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-white text-xs placeholder-gray-500 outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCommands = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm text-white">Commands</h3>
          <p className="mt-0.5 text-gray-500 text-xs">
            Define commands that appear in the launcher and extension panel.
          </p>
        </div>
        <button
          onClick={addCommand}
          data-testid="add-command-btn"
          className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600/20 px-3 py-1.5 font-medium text-blue-400 text-xs transition-colors hover:bg-blue-600/30">
          <Plus className="h-3.5 w-3.5" /> Add Command
        </button>
      </div>

      {form.commands.length === 0 && (
        <div className="rounded-xl border border-white/10 border-dashed py-8 text-center text-gray-500 text-sm">
          No commands yet. Click "Add Command" to get started.
        </div>
      )}

      {form.commands.map((cmd, i) => renderCommandEditor(cmd, i))}
    </div>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Puzzle className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <div className="font-semibold text-lg text-white">{form.title || 'Untitled'}</div>
            <div className="text-gray-500 text-xs">
              by {form.author} - v{form.version}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs">
            {form.visibility === 'private' ? (
              <>
                <Lock className="h-3 w-3 text-amber-400" />
                <span className="text-amber-400">Private</span>
              </>
            ) : (
              <>
                <Globe className="h-3 w-3 text-green-400" />
                <span className="text-green-400">Public</span>
              </>
            )}
          </div>
        </div>
        {form.description && <p className="mb-4 text-gray-400 text-sm">{form.description}</p>}

        <div className="mb-2 font-medium text-gray-500 text-xs">Manifest (package.json)</div>
        <pre
          data-testid="manifest-preview"
          className="max-h-48 overflow-auto rounded-lg border border-white/5 bg-black/30 p-3 font-mono text-gray-300 text-xs">
          {JSON.stringify(
            {
              name: form.name,
              title: form.title,
              description: form.description,
              icon: form.icon,
              author: form.author,
              version: form.version,
              commands: form.commands.map((c) => ({
                name: c.name,
                title: c.title,
                description: c.description,
                mode: c.mode,
              })),
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className="text-gray-500 text-xs">
        {form.commands.length} command{form.commands.length !== 1 ? 's' : ''} configured.
        {form.commands.filter((c) => c.mode === 'view').length > 0 && (
          <span> Including {form.commands.filter((c) => c.mode === 'view').length} panel(s).</span>
        )}
      </div>
    </div>
  );

  // ── Import Modal ────────────────────────────────────
  if (importMode) {
    return (
      <div className="mx-auto max-w-3xl p-8">
        <button
          onClick={() => setImportMode(false)}
          className="mb-6 flex items-center gap-2 text-gray-400 text-sm transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="mb-2 font-bold text-2xl text-white">Import from Source</h1>
        <p className="mb-6 text-gray-400 text-sm">Paste a Mighty-style extension manifest (package.json) to import.</p>

        <textarea
          value={importJson}
          onChange={(e) => {
            setImportJson(e.target.value);
            setImportError('');
          }}
          placeholder={
            '{\n  "name": "my-extension",\n  "title": "My Extension",\n  "description": "...",\n  "commands": [...]\n}'
          }
          rows={14}
          data-testid="import-json-input"
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-blue-500/50"
        />

        {importError && <p className="mt-2 text-red-400 text-xs">{importError}</p>}

        <button
          onClick={handleImport}
          disabled={!importJson.trim()}
          data-testid="import-btn"
          className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
          <Upload className="h-4 w-4" /> Import Manifest
        </button>
      </div>
    );
  }

  // ── Main Wizard ─────────────────────────────────────
  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard/extensions')}
            className="mb-3 flex items-center gap-2 text-gray-400 text-sm transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Back to Extensions
          </button>
          <h1 className="font-bold text-2xl text-white">Create Extension</h1>
        </div>
        <button
          onClick={() => setImportMode(true)}
          data-testid="import-from-source-btn"
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-gray-400 text-sm transition-colors hover:border-white/20 hover:text-white">
          <Code className="h-4 w-4" /> Import from Source
        </button>
      </div>

      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <button
              onClick={() => i <= step && setStep(i)}
              data-testid={`step-${i}`}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium text-xs transition-colors ${
                i === step
                  ? 'border border-blue-500/30 bg-blue-600/20 text-blue-400'
                  : i < step
                    ? 'cursor-pointer border border-green-500/20 bg-green-600/10 text-green-400'
                    : 'border border-white/10 bg-white/5 text-gray-500'
              }`}>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/20 text-[10px]">
                {i < step ? '\u2713' : i + 1}
              </span>
              {label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-gray-600" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {step === 0 && renderChooseFolder()}
        {step === 1 && renderBasicInfo()}
        {step === 2 && renderCommands()}
        {step === 3 && renderReview()}
      </div>

      {createError && (
        <p className="mb-4 text-red-400 text-sm" data-testid="create-error">
          {createError}
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-white/10 border-t pt-4">
        <button
          onClick={() => {
            setStep(step - 1);
            setCreateError('');
          }}
          disabled={step === 0}
          className="flex items-center gap-2 px-4 py-2 text-gray-400 text-sm transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30">
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        {step < steps.length - 1 ? (
          <button
            onClick={() => canProceed() && setStep(step + 1)}
            disabled={!canProceed()}
            data-testid="next-step-btn"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !parentPath.trim()}
            data-testid="save-extension-btn"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-sm text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40">
            <Package className="h-4 w-4" /> {saving ? 'Creating...' : 'Create Extension'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateExtensionPage;
