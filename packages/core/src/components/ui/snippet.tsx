import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface SnippetViewerProps {
  code: string;
  downloadLabel?: string;
  language?: string;
  onDownload?: () => void;
  title: string;
}

export const SnippetViewer: React.FC<SnippetViewerProps> = ({
  title,
  language,
  code,
  onDownload,
  downloadLabel = 'Download',
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121521]">
      <div className="flex items-center justify-between border-white/10 border-b px-3 py-2.5">
        <div>
          <div className="font-medium text-sm text-white">{title}</div>
          {language && <div className="text-gray-500 text-xs">{language}</div>}
        </div>
        <div className="flex items-center gap-1.5">
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-1.5 rounded bg-white/5 px-2.5 py-1.5 text-gray-300 text-xs hover:bg-white/10">
              {downloadLabel}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded bg-white/5 px-2.5 py-1.5 text-gray-300 text-xs hover:bg-white/10">
            {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full font-mono text-sm">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="align-top">
                <td className="w-10 select-none border-white/5 border-r py-0.5 pr-3 text-right text-gray-600">
                  {idx + 1}
                </td>
                <td className="whitespace-pre py-0.5 pl-3 text-gray-200">{line || ' '}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SnippetViewer;
