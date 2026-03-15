import React from 'react';
import ItemDisplayHeader from './ItemDisplayHeader';

interface ItemDisplayProps {
  categorySelector?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  clipboardCopied?: boolean;
  description?: React.ReactNode;
  extraActions?: React.ReactNode;
  isBookmarked?: boolean;
  meta?: React.ReactNode;
  onBookmark?: () => void;
  onClipboardClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  subtitle?: React.ReactNode;
  tags?: string[] | false;
  title: string;
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({
  title,
  subtitle,
  meta,
  description,
  tags,
  categorySelector,
  onEdit,
  onClipboardClick,
  clipboardCopied,
  onBookmark,
  isBookmarked,
  onDelete,
  extraActions,
  children,
  className = 'max-w-2xl',
}) => {
  const showTags = tags !== false && Array.isArray(tags);

  return (
    <div className={className}>
      <ItemDisplayHeader
        title={title}
        onEdit={onEdit}
        onClipboardClick={onClipboardClick}
        clipboardCopied={clipboardCopied}
        onBookmark={onBookmark}
        isBookmarked={isBookmarked}
        onDelete={onDelete}
        extraActions={extraActions}
      />

      {subtitle && <div className="mb-3 text-gray-400 text-sm">{subtitle}</div>}
      {meta && <div className="mb-3">{meta}</div>}
      {categorySelector && <div className="mb-3">{categorySelector}</div>}
      {showTags && tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-full bg-blue-500/10 px-2.5 py-1 text-blue-400 text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {description && <div className="mb-4">{description}</div>}
      {children}
    </div>
  );
};

export default ItemDisplay;
