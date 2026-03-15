import React, { useState } from 'react';
import type { PluginManifest, PluginAPI } from '../../plugins/types';

const loremWords =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(
    ' '
  );

function generateWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) words.push(loremWords[i % loremWords.length]);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateSentences(count: number): string {
  return Array.from({ length: count }, () => {
    const len = 8 + Math.floor(Math.random() * 12);
    const start = Math.floor(Math.random() * loremWords.length);
    const words = Array.from({ length: len }, (_, i) => loremWords[(start + i) % loremWords.length]);
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(' ') + '.';
  }).join(' ');
}

function generateParagraphs(count: number): string {
  return Array.from({ length: count }, () => generateSentences(3 + Math.floor(Math.random() * 4))).join('\n\n');
}

const LoremPanel: React.ComponentType<{ api: PluginAPI }> = ({ api }) => {
  const [mode, setMode] = useState<'words' | 'sentences' | 'paragraphs'>('paragraphs');
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState('');

  const generate = () => {
    let text = '';
    switch (mode) {
      case 'words':
        text = generateWords(count);
        break;
      case 'sentences':
        text = generateSentences(count);
        break;
      case 'paragraphs':
        text = generateParagraphs(count);
        break;
    }
    setOutput(text);
  };

  const copy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      api.ui.showToast({ title: 'Copied to clipboard', duration: 1500 });
    }
  };

  const saveAsSnippet = () => {
    if (output) {
      api.snippets.create({
        title: `Lorem Ipsum (${count} ${mode})`,
        description: 'Generated placeholder text',
        content: output,
        type: 'Note' as any,
        language: '',
        categoryId: '',
        tags: ['lorem', 'placeholder'],
        isFavorite: false,
      });
      api.ui.showToast({ title: 'Saved as snippet', duration: 1500 });
    }
  };

  return (
    <div className="mx-auto max-w-lg p-6">
      <div className="mb-4 flex gap-2">
        {(['words', 'sentences', 'paragraphs'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg py-2 font-medium text-sm transition-colors ${
              mode === m
                ? 'border border-blue-500/30 bg-blue-600/20 text-blue-400'
                : 'border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
            }`}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
      <div className="mb-4 flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-gray-500 text-xs">Count</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            data-testid="lorem-count"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-blue-500/50"
          />
        </div>
        <button
          onClick={generate}
          data-testid="lorem-generate"
          className="self-end rounded-lg bg-blue-600 px-6 py-2 font-medium text-sm text-white transition-colors hover:bg-blue-700">
          Generate
        </button>
      </div>
      {output && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="custom-scrollbar max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm text-white leading-relaxed">
            {output}
          </div>
        </div>
      )}
      {output && (
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white transition-colors hover:bg-white/10">
            Copy to Clipboard
          </button>
          <button
            onClick={saveAsSnippet}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2 text-sm text-white transition-colors hover:bg-white/10">
            Save as Snippet
          </button>
        </div>
      )}
    </div>
  );
};

export const loremIpsumPlugin: PluginManifest = {
  id: 'builtin-lorem-ipsum',
  name: 'Lorem Ipsum',
  description: 'Generate placeholder text quickly',
  version: '1.0.0',
  author: 'Mighty Shortcut',
  icon: 'Type',
  enabled: true,
  commands: [
    {
      id: 'generate-lorem',
      title: 'Lorem Ipsum Generator',
      subtitle: 'Generate placeholder text',
      icon: 'Type',
      action: (api) => api.ui.showToast({ title: 'Open Lorem Ipsum from the Extensions page', duration: 2000 }),
    },
  ],
  panels: [{ id: 'lorem-panel', title: 'Lorem Ipsum', icon: 'Type', component: LoremPanel }],
  settings: [
    {
      key: 'defaultMode',
      label: 'Default mode',
      type: 'select',
      default: 'paragraphs',
      options: [
        { label: 'Words', value: 'words' },
        { label: 'Sentences', value: 'sentences' },
        { label: 'Paragraphs', value: 'paragraphs' },
      ],
    },
  ],
};
