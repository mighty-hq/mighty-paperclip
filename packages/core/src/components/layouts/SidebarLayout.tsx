import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { X, Plus, ChevronLeft } from 'lucide-react';

interface SidebarLayoutProps {
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  children: ReactNode;
  footer?: ReactNode;
  onBack?: () => void;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  searchValue: string;
  showBackButton?: boolean;
  sidebar: ReactNode;
  title?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  searchPlaceholder = 'search...',
  searchValue,
  onSearchChange,
  onClose,
  onBack,
  showBackButton = false,
  actionButton,
  sidebar,
  children,
  footer,
}) => {
  return ReactDOM.createPortal(
    <>
      <div
        className="fade-in fixed inset-0 z-[9999] animate-in bg-black/70 backdrop-blur-sm duration-200"
        onClick={onClose}
      />
      <div className="fade-in fixed inset-0 z-[9999] flex animate-in items-center justify-center p-4 duration-200">
        <div className="slide-in-from-top-4 flex h-full max-h-[85vh] w-full max-w-6xl animate-in flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1c1c2e] shadow-2xl backdrop-blur-xl duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 border-white/10 border-b bg-white/[0.02] px-6 py-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                data-testid="sidebar-back-btn"
                className="flex-shrink-0 rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                title="Go back">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            <div className="flex flex-1 items-center gap-3">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500/50"
              />
            </div>

            <button
              onClick={onClose}
              className="flex-shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>

            {actionButton && (
              <button
                onClick={actionButton.onClick}
                className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                {actionButton.label}
              </button>
            )}
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex flex-1 overflow-hidden">
            <div className="custom-scrollbar w-64 overflow-y-auto border-white/10 border-r bg-white/[0.02]">
              {sidebar}
            </div>
            <div className="custom-scrollbar flex-1 overflow-y-auto">{children}</div>
          </div>

          {/* Footer */}
          {footer && <div className="border-white/10 border-t bg-white/[0.02] px-6 py-3">{footer}</div>}
        </div>
      </div>
    </>,
    document.body
  );
};

export default SidebarLayout;
