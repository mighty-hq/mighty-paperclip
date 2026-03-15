'use client';

/**
 * AuthPanel — The animated left-side brand panel for the auth screen.
 * Displays the logo, a rotating list of power-user benefits, and
 * a grid of floating keyboard shortcut keys.
 */

import { useEffect, useState } from 'react';
import { MightyLogo } from '@/components/landing/MightyLogo';

const BENEFITS = [
  { label: 'Launch anything in one keystroke', kbd: '⌘ Space' },
  { label: 'Expand snippets at the speed of thought', kbd: ';;' },
  { label: 'AI co-pilot wired into every app', kbd: '⌘ .' },
  { label: 'Clipboard history, always at hand', kbd: '⌘ ⇧ V' },
  { label: 'Smart quick links to every corner of your stack', kbd: '⌘ K' },
];

const FLOATING_KEYS = [
  { key: '⌘', x: '8%', y: '18%', delay: '0s', size: 'lg' },
  { key: '⇧', x: '22%', y: '72%', delay: '0.4s', size: 'md' },
  { key: '⌥', x: '78%', y: '14%', delay: '0.8s', size: 'md' },
  { key: '⌃', x: '88%', y: '66%', delay: '1.2s', size: 'sm' },
  { key: '↩', x: '55%', y: '82%', delay: '0.6s', size: 'md' },
  { key: '⎋', x: '68%', y: '32%', delay: '1.6s', size: 'sm' },
  { key: '⇥', x: '12%', y: '48%', delay: '2.0s', size: 'sm' },
];

const SIZE_MAP = { lg: 52, md: 40, sm: 32 };
const FONT_MAP = { lg: 20, md: 16, sm: 13 };

export function AuthPanel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setActiveIndex((i) => (i + 1) % BENEFITS.length);
        setAnimating(false);
      }, 300);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const benefit = BENEFITS[activeIndex];

  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden"
      style={{
        background: '#0d0d0d',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Orange radial glow — top right */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 560,
          height: 560,
          top: -180,
          right: -200,
          background: 'radial-gradient(circle, rgba(255,122,26,0.13) 0%, transparent 65%)',
        }}
      />

      {/* Orange radial glow — bottom left */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 400,
          height: 400,
          bottom: -120,
          left: -120,
          background: 'radial-gradient(circle, rgba(255,122,26,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Floating keyboard keys */}
      {FLOATING_KEYS.map(({ key, x, y, delay, size }) => {
        const px = SIZE_MAP[size as keyof typeof SIZE_MAP];
        const fs = FONT_MAP[size as keyof typeof FONT_MAP];
        return (
          <div
            key={key}
            className="pointer-events-none absolute flex select-none items-center justify-center rounded-lg"
            style={{
              left: x,
              top: y,
              width: px,
              height: px,
              fontSize: fs,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.18)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderBottom: '2px solid rgba(0,0,0,0.4)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: `kb-float ${3.5 + Math.random() * 2}s ease-in-out ${delay} infinite`,
              fontFamily: 'var(--font-inter)',
            }}>
            {key}
          </div>
        );
      })}

      {/* Logo — top */}
      <div className="relative z-10 p-8">
        <MightyLogo size={34} />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col gap-8 px-10 pb-4">
        {/* Rotating benefit */}
        <div
          className="flex flex-col gap-4"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
            transition: 'opacity 0.28s ease, transform 0.28s ease',
          }}>
          <div
            className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1 font-mono font-semibold text-xs"
            style={{
              background: 'rgba(255,122,26,0.12)',
              border: '1px solid rgba(255,122,26,0.25)',
              color: '#FF7A1A',
              letterSpacing: '0.05em',
            }}>
            {benefit?.kbd}
          </div>
          <p
            className="text-balance font-bold font-sans text-3xl leading-tight"
            style={{ color: 'rgba(255,255,255,0.92)', letterSpacing: '-0.03em' }}>
            {benefit?.label}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {BENEFITS.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === activeIndex ? 20 : 5,
                height: 5,
                background: i === activeIndex ? '#FF7A1A' : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom stats strip */}
      <div
        className="relative z-10 flex items-center gap-6 px-10 py-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {[
          { value: '40K+', label: 'power users' },
          { value: '2M+', label: 'shortcuts fired / day' },
          { value: '4.9', label: 'avg rating' },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="font-bold font-sans text-xl" style={{ color: '#FF7A1A', letterSpacing: '-0.02em' }}>
              {value}
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: 'rgba(255,255,255,0.35)' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
