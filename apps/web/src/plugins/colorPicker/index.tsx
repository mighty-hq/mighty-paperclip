import React, { useState } from 'react';
import type { PluginManifest, PluginAPI } from '../types';

const presetColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#fb923c',
  '#facc15',
  '#4ade80',
  '#22d3ee',
  '#60a5fa',
  '#a78bfa',
  '#f472b6',
];

const ColorPickerPanel: React.ComponentType<{ api: PluginAPI }> = ({ api }) => {
  const [color, setColor] = useState('#3b82f6');
  const [savedColors, setSavedColors] = useState<string[]>([]);

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const hexToHsl = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn:
          h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
          break;
        case gn:
          h = ((bn - rn) / d + 2) / 6;
          break;
        case bn:
          h = ((rn - gn) / d + 4) / 6;
          break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const copyColor = (format: string) => {
    let text = color;
    if (format === 'rgb') {
      const { r, g, b } = hexToRgb(color);
      text = `rgb(${r}, ${g}, ${b})`;
    }
    if (format === 'hsl') {
      const { h, s, l } = hexToHsl(color);
      text = `hsl(${h}, ${s}%, ${l}%)`;
    }
    navigator.clipboard.writeText(text);
    api.ui.showToast({ title: 'Copied', description: text, duration: 1500 });
  };

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-4 overflow-hidden rounded-xl border border-white/10">
        <div className="h-28 w-full" style={{ backgroundColor: color }} />
        <div className="flex items-center gap-3 bg-white/5 p-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && setColor(e.target.value)}
            data-testid="color-hex-input"
            className="flex-1 rounded border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none"
          />
          <button
            onClick={() => setSavedColors((p) => (p.includes(color) ? p : [...p, color]))}
            className="rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10">
            Save
          </button>
        </div>
      </div>
      <div className="mb-4 space-y-2">
        {[
          { label: 'HEX', value: color, format: 'hex' },
          { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, format: 'rgb' },
          { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, format: 'hsl' },
        ].map((f) => (
          <button
            key={f.format}
            onClick={() => copyColor(f.format)}
            className="group flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm transition-colors hover:bg-white/10">
            <span className="text-gray-400">{f.label}</span>
            <span className="font-mono text-white">{f.value}</span>
            <span className="text-gray-600 text-xs group-hover:text-gray-400">Click to copy</span>
          </button>
        ))}
      </div>
      <div className="mb-4">
        <div className="mb-2 text-gray-500 text-xs">Presets</div>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`h-7 w-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                color === c ? 'scale-110 border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      {savedColors.length > 0 && (
        <div>
          <div className="mb-2 text-gray-500 text-xs">Saved Colors</div>
          <div className="flex flex-wrap gap-2">
            {savedColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-lg border-2 border-transparent transition-all hover:scale-110 hover:border-white"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const colorPickerPlugin: PluginManifest = {
  id: 'builtin-color-picker',
  name: 'Color Picker',
  description: 'Pick, convert, and copy colors in any format',
  version: '1.0.0',
  author: 'Mighty Shortcut',
  icon: 'Palette',
  enabled: true,
  commands: [
    {
      id: 'open-color-picker',
      title: 'Color Picker',
      subtitle: 'Pick and convert colors',
      icon: 'Palette',
      mode: 'view',
      panelId: 'color-picker-panel',
      action: () => {},
    },
  ],
  panels: [{ id: 'color-picker-panel', title: 'Color Picker', icon: 'Palette', component: ColorPickerPanel }],
};
