import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Loader2, Sparkles, X } from 'lucide-react';

interface AIInputModalProps {
  description: string;
  error?: string | null;
  inputType?: 'text' | 'textarea';
  isOpen: boolean;
  label: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  resetKey?: string;
  submitLabel: string;
  title: string;
}

const AIInputModal: React.FC<AIInputModalProps> = ({
  isOpen,
  title,
  description,
  label,
  placeholder,
  submitLabel,
  inputType = 'textarea',
  loading = false,
  error = null,
  resetKey,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setValue('');
  }, [isOpen, resetKey]);

  if (!isOpen) return null;

  const canSubmit = value.trim().length > 0 && !loading;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[12000] bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[12001] flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1c1c2e] p-5"
          onClick={(event) => event.stopPropagation()}>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h3 className="font-semibold text-lg">{title}</h3>
            </div>
            <button onClick={onClose} className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mb-4 text-gray-400 text-sm">{description}</p>

          <div>
            <label className="mb-1.5 block font-semibold text-gray-500 text-xs uppercase tracking-wider">{label}</label>
            {inputType === 'text' ? (
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={placeholder}
                data-testid="ai-input-modal-text"
                className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
              />
            ) : (
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={placeholder}
                data-testid="ai-input-modal-textarea"
                rows={7}
                className="w-full resize-y rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
              />
            )}
          </div>

          {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => onSubmit(value.trim())}
              disabled={!canSubmit}
              data-testid="ai-input-submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-emerald-600 px-4 py-2.5 font-medium text-sm text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {submitLabel}
            </button>
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded border border-white/10 bg-white/5 px-4 py-2.5 text-gray-300 text-sm transition-colors hover:bg-white/10 disabled:opacity-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

export default AIInputModal;
