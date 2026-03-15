import React from 'react';

export interface DetailProps {
  actions?: React.ReactNode;
  isLoading?: boolean;
  markdown?: string | null;
  metadata?: React.ReactNode;
}

const DetailBase: React.FC<DetailProps> = ({ markdown, metadata, isLoading }) => (
  <div data-raycast="Detail" style={{ padding: 16, display: 'flex', gap: 16 }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      {isLoading && <div style={{ color: '#888' }}>Loading…</div>}
      {!isLoading && markdown && (
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{markdown}</pre>
      )}
    </div>
    {metadata && <div style={{ width: 240, flexShrink: 0 }}>{metadata}</div>}
  </div>
);

const MetadataBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div data-raycast="Detail.Metadata" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    {children}
  </div>
);

const MetadataLabel: React.FC<{ title: string; icon?: unknown; text?: string | { value: string; color?: string } }> = ({
  title,
  text,
}) => (
  <div data-raycast="Detail.Metadata.Label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <span style={{ fontSize: 12, color: '#888', minWidth: 80 }}>{title}</span>
    <span style={{ fontSize: 12 }}>{typeof text === 'string' ? text : (text?.value ?? '')}</span>
  </div>
);

const MetadataSeparator: React.FC = () => (
  <hr data-raycast="Detail.Metadata.Separator" style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
);

const MetadataLink: React.FC<{ title: string; target: string; text: string }> = ({ target, text }) => (
  <a
    href={target}
    target="_blank"
    rel="noopener noreferrer"
    data-raycast="Detail.Metadata.Link"
    style={{ fontSize: 12 }}>
    {text}
  </a>
);

const MetadataTagListBase: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div data-raycast="Detail.Metadata.TagList" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
    {children}
  </div>
);

const MetadataTagListItem: React.FC<{ title: string }> = ({ title }) => (
  <span
    data-raycast="Detail.Metadata.TagList.Item"
    style={{ padding: '2px 6px', fontSize: 11, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
    {title}
  </span>
);

const MetadataTagList = Object.assign(MetadataTagListBase, { Item: MetadataTagListItem });

export const Metadata = Object.assign(MetadataBase, {
  Label: MetadataLabel,
  Separator: MetadataSeparator,
  Link: MetadataLink,
  TagList: MetadataTagList,
});

const DetailWithMembers = Object.assign(DetailBase, {
  Metadata,
});

export { DetailWithMembers as Detail };
export default DetailWithMembers;
