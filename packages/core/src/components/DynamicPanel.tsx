import React, { useState, useCallback } from 'react';
import { Copy, ExternalLink, Bell } from 'lucide-react';

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

interface DynamicPanelProps {
  extensionTitle: string;
  widgets: PanelWidget[];
}

const DynamicPanel: React.FC<DynamicPanelProps> = ({ widgets, extensionTitle }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [lastAction, setLastAction] = useState<string | null>(null);

  const setValue = useCallback((id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const executeAction = useCallback(
    (action: WidgetAction) => {
      const resolvedValue = action.source ? values[action.source] || '' : action.value || '';

      switch (action.type) {
        case 'copy':
          navigator.clipboard.writeText(resolvedValue);
          setLastAction(`Copied: "${resolvedValue.slice(0, 40)}${resolvedValue.length > 40 ? '...' : ''}"`);
          setTimeout(() => setLastAction(null), 2000);
          break;
        case 'open-url': {
          let url = resolvedValue;
          if (url && !url.startsWith('http')) url = 'https://' + url;
          if (url) window.open(url, '_blank');
          setLastAction(`Opened: ${url}`);
          setTimeout(() => setLastAction(null), 2000);
          break;
        }
        case 'toast':
          setLastAction(resolvedValue || 'Action completed');
          setTimeout(() => setLastAction(null), 3000);
          break;
      }
    },
    [values]
  );

  const renderWidget = (widget: PanelWidget, index: number) => {
    switch (widget.type) {
      case 'input':
        return (
          <div key={index} className="space-y-1.5">
            {widget.label && <label className="font-medium text-gray-400 text-xs">{widget.label}</label>}
            <input
              type="text"
              value={values[widget.id || ''] || ''}
              onChange={(e) => widget.id && setValue(widget.id, e.target.value)}
              placeholder={widget.placeholder}
              data-testid={`widget-input-${widget.id}`}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={index} className="space-y-1.5">
            {widget.label && <label className="font-medium text-gray-400 text-xs">{widget.label}</label>}
            <textarea
              value={values[widget.id || ''] || ''}
              onChange={(e) => widget.id && setValue(widget.id, e.target.value)}
              placeholder={widget.placeholder}
              rows={widget.rows || 3}
              data-testid={`widget-textarea-${widget.id}`}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
            />
          </div>
        );

      case 'select':
        return (
          <div key={index} className="space-y-1.5">
            {widget.label && <label className="font-medium text-gray-400 text-xs">{widget.label}</label>}
            <select
              value={values[widget.id || ''] || ''}
              onChange={(e) => widget.id && setValue(widget.id, e.target.value)}
              data-testid={`widget-select-${widget.id}`}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-blue-500/50">
              <option value="">Select...</option>
              {widget.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );

      case 'button':
        return (
          <button
            key={index}
            onClick={() => widget.action && executeAction(widget.action)}
            data-testid={`widget-btn-${widget.label?.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
            {widget.action?.type === 'copy' && <Copy className="h-3.5 w-3.5" />}
            {widget.action?.type === 'open-url' && <ExternalLink className="h-3.5 w-3.5" />}
            {widget.action?.type === 'toast' && <Bell className="h-3.5 w-3.5" />}
            {widget.label || 'Run'}
          </button>
        );

      case 'label':
        return (
          <p key={index} className="text-gray-400 text-sm">
            {widget.label}
          </p>
        );

      case 'divider':
        return <hr key={index} className="border-white/10" />;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="mb-2 text-gray-500 text-xs uppercase tracking-wider">{extensionTitle}</div>
      {widgets.map((w, i) => renderWidget(w, i))}
      {lastAction && (
        <div className="fade-in mt-3 animate-in rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-green-400 text-sm">
          {lastAction}
        </div>
      )}
      {widgets.length === 0 && (
        <div className="py-8 text-center text-gray-500 text-sm">No panel widgets configured for this extension.</div>
      )}
    </div>
  );
};

export default DynamicPanel;
