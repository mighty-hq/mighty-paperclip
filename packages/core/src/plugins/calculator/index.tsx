import React, { useState } from 'react';
import type { PluginManifest, PluginAPI } from '../types';

const CalculatorPanel: React.ComponentType<{ api: PluginAPI }> = ({ api }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);

  const calculate = () => {
    try {
      const fn = new Function('return ' + expression.replace(/[^0-9+\-*/().%\s^]/g, ''));
      const res = fn();
      const resStr = String(res);
      setResult(resStr);
      setHistory((prev) => [{ expr: expression, result: resStr }, ...prev].slice(0, 10));
    } catch {
      setResult('Error');
    }
  };

  const copyResult = () => {
    if (result && result !== 'Error') {
      api.ui.showToast({ title: 'Copied', description: result, duration: 1500 });
      navigator.clipboard.writeText(result);
    }
  };

  const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'];

  return (
    <div className="mx-auto max-w-md p-6">
      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && calculate()}
          placeholder="Enter expression..."
          data-testid="calc-input"
          className="w-full bg-transparent text-right font-mono text-white text-xl outline-none"
        />
        {result !== null && (
          <div
            className="mt-2 cursor-pointer text-right font-bold text-2xl text-blue-400 hover:text-blue-300"
            onClick={copyResult}
            data-testid="calc-result">
            = {result}
          </div>
        )}
      </div>
      <div className="mb-4 grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn}
            data-testid={`calc-btn-${btn}`}
            onClick={() => (btn === '=' ? calculate() : setExpression((p) => p + btn))}
            className={`rounded-lg p-3 text-center font-medium transition-colors ${
              ['+', '-', '*', '/'].includes(btn)
                ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                : btn === '='
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white/5 text-white hover:bg-white/10'
            }`}>
            {btn}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          setExpression('');
          setResult(null);
        }}
        className="w-full py-2 text-gray-400 text-sm transition-colors hover:text-white">
        Clear
      </button>
      {history.length > 0 && (
        <div className="mt-4 border-white/10 border-t pt-4">
          <div className="mb-2 text-gray-500 text-xs">History</div>
          {history.map((h, i) => (
            <div key={i} className="flex justify-between py-1 text-gray-400 text-sm">
              <span className="font-mono">{h.expr}</span>
              <span className="text-blue-400">= {h.result}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const calculatorPlugin: PluginManifest = {
  id: 'builtin-calculator',
  name: 'Calculator',
  description: 'Quick calculations right from Mighty Shortcut',
  version: '1.0.0',
  author: 'Mighty Shortcut',
  icon: 'Calculator',
  enabled: true,
  commands: [
    {
      id: 'open-calculator',
      title: 'Calculator',
      subtitle: 'Quick calculations',
      icon: 'Calculator',
      mode: 'view',
      panelId: 'calculator-panel',
      action: () => {},
    },
  ],
  panels: [{ id: 'calculator-panel', title: 'Calculator', icon: 'Calculator', component: CalculatorPanel }],
  settings: [{ key: 'precision', label: 'Decimal precision', type: 'number', default: 4 }],
};
