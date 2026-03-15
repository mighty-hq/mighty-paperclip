import React from 'react';
import { Action } from './Action';

export interface ActionPanelProps {
  children?: React.ReactNode;
  title?: string;
}

const ActionPanelBase: React.FC<ActionPanelProps> = ({ children }) => (
  <div data-raycast="ActionPanel" style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
    {children}
  </div>
);

export const Section: React.FC<{ children?: React.ReactNode; title?: string }> = ({ children, title }) => (
  <div data-raycast="ActionPanel.Section" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
    {title && <span style={{ width: '100%', fontSize: 10, color: '#888', textTransform: 'uppercase' }}>{title}</span>}
    {children}
  </div>
);

export const Submenu: React.FC<{ title: string; children?: React.ReactNode; icon?: unknown }> = ({
  title,
  children,
}) => (
  <details data-raycast="ActionPanel.Submenu" style={{ display: 'inline' }}>
    <summary style={{ cursor: 'pointer', padding: '4px 8px', fontSize: 12 }}>{title}</summary>
    <div style={{ display: 'flex', gap: 4, marginTop: 4, marginLeft: 8 }}>{children}</div>
  </details>
);

const ActionPanelWithMembers = Object.assign(ActionPanelBase, {
  Section,
  Submenu,
  Item: Action,
});

export { ActionPanelWithMembers as ActionPanel };
export default ActionPanelWithMembers;
