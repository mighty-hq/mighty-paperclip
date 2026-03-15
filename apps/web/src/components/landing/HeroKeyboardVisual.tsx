'use client';

import { useEffect, useRef } from 'react';

/** Keyboard key visual */
function KbKey({
  children,
  accent = false,
  large = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <div
      className="kb-key flex select-none items-center justify-center rounded-lg text-center font-mono font-semibold"
      style={{
        minWidth: large ? 60 : 44,
        height: large ? 52 : 44,
        padding: '0 10px',
        fontSize: large ? 13 : 12,
        color: accent ? '#FF7A1A' : 'rgba(255,255,255,0.85)',
        ...(accent && {
          border: '1px solid rgba(255,122,26,0.4)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 12px rgba(255,122,26,0.15)',
        }),
      }}>
      {children}
    </div>
  );
}

/** Animated keyboard shortcut hero visual */
export function HeroKeyboardVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  // subtle parallax
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      el.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 4}deg)`;
    };
    const reset = () => {
      el.style.transform = 'perspective(800px) rotateY(-4deg) rotateX(2deg)';
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseleave', reset);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseleave', reset);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="animate-kb-float"
      style={{
        transform: 'perspective(800px) rotateY(-4deg) rotateX(2deg)',
        transition: 'transform 0.15s ease-out',
        willChange: 'transform',
      }}>
      <div
        className="relative overflow-hidden rounded-2xl p-8"
        style={{
          background: 'linear-gradient(145deg, #161616 0%, #111111 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          minWidth: 320,
        }}>
        {/* Top chrome bar */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ background: '#3a3a3a' }} />
          <div className="h-3 w-3 rounded-full" style={{ background: '#3a3a3a' }} />
          <div className="h-3 w-3 rounded-full" style={{ background: '#3a3a3a' }} />
          <div className="ml-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>
            Command Palette
          </div>
        </div>

        {/* Shortcut rows */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Launch palette', keys: ['⌘', 'Space'] },
            { label: 'Find anything', keys: ['⌘', 'K'], accent: true },
            { label: 'Quick switch', keys: ['⌘', 'Tab'] },
            { label: 'AI prompt', keys: ['⌘', 'Shift', 'A'] },
          ].map((row, i) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
              style={{
                background: i === 1 ? 'rgba(255,122,26,0.06)' : 'rgba(255,255,255,0.02)',
                border: i === 1 ? '1px solid rgba(255,122,26,0.12)' : '1px solid rgba(255,255,255,0.04)',
              }}>
              <span
                className="font-sans text-sm"
                style={{ color: i === 1 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
                {row.label}
              </span>
              <div className="flex items-center gap-1.5">
                {row.keys.map((k) => (
                  <KbKey key={k} accent={i === 1}>
                    {k}
                  </KbKey>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom glow */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-24"
          style={{
            background: 'linear-gradient(to top, rgba(255,122,26,0.06) 0%, transparent 100%)',
          }}
        />
      </div>
    </div>
  );
}
