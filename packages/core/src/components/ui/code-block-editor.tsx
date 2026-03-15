import React, { useMemo } from 'react';

interface CodeBlockEditorProps {
  className?: string;
  language?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  textareaTestId?: string;
  value: string;
}

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  value,
  onChange,
  language,
  placeholder = 'Write code...',
  className = '',
  textareaTestId,
}) => {
  const lineCount = useMemo(() => Math.max(1, value.split('\n').length), [value]);

  return (
    <div className={`overflow-hidden rounded-xl border border-white/10 bg-[#121521] ${className}`}>
      <div className="flex items-center justify-between border-white/10 border-b px-3 py-2.5">
        <div className="text-gray-400 text-xs uppercase tracking-wider">Code</div>
        <div className="text-gray-500 text-xs">{language || 'plaintext'}</div>
      </div>

      <div className="grid h-full min-h-0 grid-cols-[48px_1fr]">
        <div className="select-none overflow-hidden border-white/10 border-r bg-black/20 py-2 pr-2 text-right text-gray-600 text-xs">
          {Array.from({ length: lineCount }).map((_, idx) => (
            <div key={idx} className="leading-6">
              {idx + 1}
            </div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          data-testid={textareaTestId}
          className="h-full min-h-0 w-full resize-none overflow-auto bg-transparent p-2 font-mono text-gray-200 text-sm leading-6 outline-none"
        />
      </div>
    </div>
  );
};

export default CodeBlockEditor;
