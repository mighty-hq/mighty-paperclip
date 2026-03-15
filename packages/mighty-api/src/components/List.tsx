import React from 'react';
import type { ImageLike } from '../types/image';

export interface ListProps {
  children?: React.ReactNode;
  filtering?: boolean | { keepSectionOrder: boolean };
  isLoading?: boolean;
  isShowingDetail?: boolean;
  navigationTitle?: string;
  onSearchTextChange?: (text: string) => void;
  searchBarAccessory?: React.ReactNode;
  searchBarPlaceholder?: string;
  throttle?: boolean;
}

export interface ListItemAccessory {
  icon?: ImageLike;
  text?: string;
}

const ListBase: React.FC<ListProps> = ({ children, searchBarAccessory }) => (
  <div data-raycast="List" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {searchBarAccessory}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{children}</div>
  </div>
);

const ItemBase: React.FC<{
  id?: string;
  title: string | { value: string; tooltip?: string };
  subtitle?: string | null;
  icon?: ImageLike | null;
  accessories?: ListItemAccessory[];
  keywords?: string[];
  actions?: React.ReactNode;
  detail?: React.ReactNode;
  quickLook?: { path: string; name?: string };
}> = ({ title, subtitle, accessories, actions }) => {
  const titleStr = typeof title === 'string' ? title : (title?.value ?? '');
  return (
    <div
      data-raycast="List.Item"
      style={{
        padding: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        gap: 8,
      }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="truncate font-medium text-sm">{titleStr}</div>
        {subtitle && <div className="truncate text-gray-500 text-xs">{subtitle}</div>}
      </div>
      {accessories?.map((a, i) => (
        <span key={i} style={{ fontSize: 12, color: '#888' }}>
          {a.text}
        </span>
      ))}
      {actions}
    </div>
  );
};

export const Section: React.FC<{
  id?: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div data-raycast="List.Section" style={{ marginTop: 8 }}>
    {(title || subtitle) && (
      <div className="px-4 pt-2 pb-1 font-semibold text-[10px] text-gray-500 uppercase tracking-widest">
        {title}
        {subtitle && <span className="text-gray-600"> — {subtitle}</span>}
      </div>
    )}
    {children}
  </div>
);

export const EmptyView: React.FC<{
  icon?: ImageLike;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ title, description }) => (
  <div data-raycast="List.EmptyView" style={{ padding: 24, textAlign: 'center', color: '#888' }}>
    {title && <div className="font-medium text-white/80">{title}</div>}
    {description && <div className="mt-1 text-sm">{description}</div>}
  </div>
);

const ListDropdownBase: React.FC<{
  tooltip?: string;
  storeValue?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  children?: React.ReactNode;
}> = ({ value, onChange, children }) => (
  <select
    data-raycast="List.Dropdown"
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    style={{
      marginBottom: 8,
      padding: 4,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 4,
      color: 'inherit',
    }}>
    {children}
  </select>
);

const ListDropdownItem: React.FC<{ title: string | { value: string; tooltip?: string }; value: string }> = ({
  title,
  value,
}) => {
  const t = typeof title === 'string' ? title : (title?.value ?? value);
  return <option value={value}>{t}</option>;
};

const ListDropdownSection: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => (
  <optgroup label={title ?? ''}>{children}</optgroup>
);

const ListDropdown = Object.assign(ListDropdownBase, {
  Item: ListDropdownItem,
  Section: ListDropdownSection,
});

const ItemDetailBase: React.FC<{ markdown?: string; metadata?: React.ReactNode }> = ({ markdown, metadata }) => (
  <div data-raycast="List.Item.Detail">
    {markdown && <pre style={{ whiteSpace: 'pre-wrap' }}>{markdown}</pre>}
    {metadata}
  </div>
);

const ItemDetailMetadata: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div data-raycast="List.Item.Detail.Metadata">{children}</div>
);

const ItemDetail = Object.assign(ItemDetailBase, { Metadata: ItemDetailMetadata });

const ItemWithDetail = Object.assign(ItemBase, { Detail: ItemDetail });

const ListWithMembers = Object.assign(ListBase, {
  Item: ItemWithDetail,
  Section,
  EmptyView,
  Dropdown: ListDropdown,
});

export { ItemWithDetail as Item };
export { ListWithMembers as List };
export default ListWithMembers;
