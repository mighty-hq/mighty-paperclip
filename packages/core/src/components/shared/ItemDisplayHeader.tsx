import React from 'react';
import { Check, Copy, Pencil, Star, Trash2 } from 'lucide-react';

interface ItemDisplayHeaderProps {
  clipboardCopied?: boolean;
  extraActions?: React.ReactNode;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onClipboardClick?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  title: string;
}

const ItemDisplayHeader: React.FC<ItemDisplayHeaderProps> = ({
  title,
  onEdit,
  onClipboardClick,
  clipboardCopied = false,
  onBookmark,
  isBookmarked = false,
  onDelete,
  extraActions,
}) => {
  return (
    <div className="mb-3 flex items-start justify-between">
      <h2 className="font-semibold text-white text-xl">{title}</h2>
      <div className="flex shrink-0 items-center gap-1">
        {onEdit && (
          <button
            onClick={onEdit}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
            title="Edit">
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {onClipboardClick && (
          <button
            onClick={onClipboardClick}
            className={`rounded-lg p-1.5 transition-colors ${
              clipboardCopied ? 'text-green-400' : 'text-gray-500 hover:text-white'
            }`}
            title="Copy">
            {clipboardCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        )}

        {extraActions}

        {onBookmark && (
          <button
            onClick={onBookmark}
            className={`rounded-lg p-1.5 transition-colors ${
              isBookmarked ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}>
            <Star className={`h-5 w-5 ${isBookmarked ? 'fill-yellow-400' : ''}`} />
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemDisplayHeader;
