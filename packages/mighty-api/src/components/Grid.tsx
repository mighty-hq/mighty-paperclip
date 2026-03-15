import React from 'react';
import type { ImageLike } from '../types/image';

export interface GridProps {
  children?: React.ReactNode;
  columns?: number;
  inset?: string;
  isLoading?: boolean;
  searchBarAccessory?: React.ReactNode;
}

const GridBase: React.FC<GridProps> = ({ columns = 5, isLoading, searchBarAccessory, children }) => (
  <div data-raycast="Grid" style={{ padding: 16 }}>
    {searchBarAccessory}
    {isLoading && <div style={{ color: '#888' }}>Loading…</div>}
    {!isLoading && (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12,
          marginTop: 12,
        }}>
        {children}
      </div>
    )}
  </div>
);

export const Item: React.FC<{
  content?: { value?: { source?: ImageLike; tintColor?: string }; tooltip?: string };
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}> = ({ content, title, subtitle, actions }) => (
  <div
    data-raycast="Grid.Item"
    style={{
      padding: 12,
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
    <span>{title}</span>
    {subtitle && <span style={{ fontSize: 12, color: '#888' }}>{subtitle}</span>}
    {actions}
  </div>
);

export const Section: React.FC<{
  title?: string;
  subtitle?: string;
  columns?: number;
  children?: React.ReactNode;
}> = ({ title, children }) => (
  <div data-raycast="Grid.Section">
    {title && <div style={{ fontSize: 11, color: '#888', marginBottom: 8, textTransform: 'uppercase' }}>{title}</div>}
    <div style={{ display: 'contents' }}>{children}</div>
  </div>
);

const GridDropdownBase: React.FC<{
  tooltip?: string;
  storeValue?: boolean;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}> = ({ onChange, children }) => (
  <select
    data-raycast="Grid.Dropdown"
    onChange={(e) => onChange?.(e.target.value)}
    style={{ marginBottom: 8, padding: 4 }}>
    {children}
  </select>
);

const GridDropdownItem: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <option value={value}>{title}</option>
);

const GridDropdown = Object.assign(GridDropdownBase, { Item: GridDropdownItem });

const GridWithMembers = Object.assign(GridBase, {
  Item,
  Section,
  Dropdown: GridDropdown,
  Inset: { Large: 'large', Medium: 'medium', Small: 'small' },
});

export { GridWithMembers as Grid };
export default GridWithMembers;
