import React from 'react';
import type { ActionStyle } from '../primitives/ActionStyle';
import type { ImageLike } from '../types/image';
import type { Shortcut } from '../types/keyboard';
import type { Clipboard as ClipboardTypes } from '../utilities/Clipboard';

export interface ActionProps {
  autoFocus?: boolean;
  icon?: ImageLike | null;
  id?: string;
  onAction?: () => void;
  shortcut?: Shortcut | null;
  style?: ActionStyle;
  title: string;
}

const ActionBase: React.FC<ActionProps> = ({ title, onAction }) => (
  <button
    data-raycast="Action"
    onClick={onAction}
    style={{
      padding: '4px 8px',
      fontSize: 12,
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      color: 'inherit',
    }}>
    {title}
  </button>
);

export const CopyToClipboard: React.FC<{
  content: string | number | ClipboardTypes.Content;
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
  transient?: boolean;
  concealed?: boolean;
  onCopy?: (content: string | number | ClipboardTypes.Content) => void;
}> = ({ content, title = 'Copy to Clipboard', onCopy }) => {
  const text =
    typeof content === 'string' || typeof content === 'number'
      ? String(content)
      : 'text' in content
        ? content.text
        : 'html' in content
          ? (content.text ?? content.html)
          : '';
  return (
    <button
      data-raycast="Action.CopyToClipboard"
      onClick={() => {
        navigator.clipboard.writeText(text ?? '');
        onCopy?.(content);
      }}
      style={{
        padding: '4px 8px',
        fontSize: 12,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        color: 'inherit',
      }}>
      {title}
    </button>
  );
};

export const Push: React.FC<{
  title: string;
  target: React.ReactNode;
  icon?: ImageLike;
  shortcut?: Shortcut;
  onPush?: () => void;
  onPop?: () => void;
}> = ({ title }) => <ActionBase title={title} />;

export const OpenInBrowser: React.FC<{
  url: string;
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ url, title = 'Open in Browser' }) => (
  <button
    data-raycast="Action.OpenInBrowser"
    onClick={() => window.open(url, '_blank')}
    style={{
      padding: '4px 8px',
      fontSize: 12,
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      color: 'inherit',
    }}>
    {title}
  </button>
);

export const Paste: React.FC<{
  content: string | number | ClipboardTypes.Content;
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
  onPaste?: (content: string | number | ClipboardTypes.Content) => void;
}> = ({ content, title = 'Paste in Active App', onPaste }) => {
  const text =
    typeof content === 'string' || typeof content === 'number'
      ? String(content)
      : 'text' in content
        ? content.text
        : 'html' in content
          ? (content.text ?? content.html)
          : '';
  return (
    <button
      data-raycast="Action.Paste"
      onClick={() => {
        navigator.clipboard.writeText(text ?? '');
        onPaste?.(content);
      }}
      style={{
        padding: '4px 8px',
        fontSize: 12,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        color: 'inherit',
      }}>
      {title}
    </button>
  );
};

export const Open: React.FC<{
  title?: string;
  target: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Open', target }) => (
  <button
    data-raycast="Action.Open"
    onClick={() => window.open(target, '_blank')}
    style={{
      padding: '4px 8px',
      fontSize: 12,
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      color: 'inherit',
    }}>
    {title}
  </button>
);

export const Trash: React.FC<{
  paths: string | string[];
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
  onTrash?: (paths: string | string[]) => void;
}> = ({ paths, title = 'Move to Trash', onTrash }) => (
  <button
    data-raycast="Action.Trash"
    onClick={() => onTrash?.(paths)}
    style={{
      padding: '4px 8px',
      fontSize: 12,
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      color: 'inherit',
    }}>
    {title}
  </button>
);

export const ToggleQuickLook: React.FC<{
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Quick Look' }) => <ActionBase title={title} />;

export const ShowInFinder: React.FC<{
  path?: string;
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Show in Finder' }) => <ActionBase title={title} />;

export const PickDate: React.FC<{
  title: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
  onChange: (date: Date | null) => void;
  type?: 'date' | 'date_time';
  min?: Date;
  max?: Date;
}> = ({ title }) => <ActionBase title={title} />;

export const CreateQuicklink: React.FC<{
  quicklink: { link: string; name?: string; icon?: unknown; application?: string };
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Create Quicklink' }) => <ActionBase title={title} />;

export const CreateSnippet: React.FC<{
  snippet: { text: string; name?: string; keyword?: string };
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Create Snippet' }) => <ActionBase title={title} />;

export const InstallMCPServer: React.FC<{
  server: { name: string; transport: string; command: string; args?: string[] };
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Install MCP Server' }) => <ActionBase title={title} />;

export const OpenWith: React.FC<{
  application?: string;
  path?: string;
  title?: string;
  icon?: ImageLike;
  shortcut?: Shortcut;
}> = ({ title = 'Open With' }) => <ActionBase title={title} />;

export interface SubmitFormProps<T> {
  icon?: ImageLike;
  onSubmit: (values: T) => void;
  shortcut?: Shortcut;
  title?: string;
}

export function SubmitForm<T extends Record<string, unknown>>({ title = 'Submit', onSubmit }: SubmitFormProps<T>) {
  return (
    <button
      data-raycast="Action.SubmitForm"
      onClick={() => onSubmit({} as T)}
      style={{
        padding: '4px 8px',
        fontSize: 12,
        cursor: 'pointer',
        background: 'transparent',
        border: 'none',
        color: 'inherit',
      }}>
      {title}
    </button>
  );
}

const ActionWithSubcomponents = Object.assign(ActionBase, {
  CopyToClipboard,
  Push,
  OpenInBrowser,
  Paste,
  Open,
  Trash,
  ToggleQuickLook,
  ShowInFinder,
  PickDate,
  CreateQuicklink,
  CreateSnippet,
  InstallMCPServer,
  OpenWith,
  SubmitForm,
});

export { ActionWithSubcomponents as Action };
export default ActionWithSubcomponents;
