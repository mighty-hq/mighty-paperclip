'use client';

import { useEffect, useState } from 'react';
import { HeroKeyboardVisual } from './HeroKeyboardVisual';

const ROTATING_WORDS = ['faster.', 'smarter.', 'mighty.'];

/** Animated rotating word */
function RotatingWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % ROTATING_WORDS.length);
        setVisible(true);
      }, 300);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      style={{
        color: '#FF7A1A',
        display: 'inline-block',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        minWidth: 160,
      }}>
      {ROTATING_WORDS[index]}
    </span>
  );
}

/** Announcement pill */
function AnnouncementPill() {
  return (
    <div
      className="group inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-sans text-sm transition-all duration-200"
      style={{
        background: 'rgba(255,122,26,0.07)',
        border: '1px solid rgba(255,122,26,0.2)',
        color: 'rgba(255,255,255,0.7)',
      }}>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{
          background: '#FF7A1A',
          boxShadow: '0 0 6px #FF7A1A',
          animation: 'loader-pulse 2s ease-in-out infinite',
        }}
      />
      <span style={{ fontWeight: 500 }}>
        New: AI assistant now available —{' '}
        <span className="underline underline-offset-2 transition-colors duration-150" style={{ color: '#FF7A1A' }}>
          learn more
        </span>
      </span>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path
          d="M4 7H10M7 4L10 7L7 10"
          stroke="#FF7A1A"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function HeroSection({ onCTAClick }: { onCTAClick?: () => void }) {
  return (
    <section className="relative flex min-h-screen flex-col" style={{ background: '#0a0a0a' }} aria-label="Hero">
      {/* Background grid */}
      <div className="grid-overlay pointer-events-none absolute inset-0" />

      {/* Top glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: 800,
          height: 500,
          background: 'radial-gradient(ellipse at top, rgba(255,122,26,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Vertical rule accents */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 hidden lg:block"
        style={{ left: 'calc(50% - 340px)', width: 1, background: 'rgba(255,255,255,0.03)' }}
      />
      <div
        className="pointer-events-none absolute top-0 bottom-0 hidden lg:block"
        style={{ right: 'calc(50% - 340px)', width: 1, background: 'rgba(255,255,255,0.03)' }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 pt-24 pb-16">
        <div className="flex w-full flex-col items-center gap-16 lg:flex-row">
          {/* Left column: copy */}
          <div className="flex flex-1 flex-col gap-6 text-center lg:text-left">
            <div
              className="flex animate-hero-fade-up justify-center lg:justify-start"
              style={{ animationDelay: '0.1s', opacity: 0 }}>
              <AnnouncementPill />
            </div>

            <h1
              className="animate-hero-fade-up text-balance font-sans text-white"
              style={{
                fontSize: 'clamp(40px, 7vw, 72px)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
                animationDelay: '0.2s',
                opacity: 0,
              }}>
              Work <RotatingWord />
              <br />
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>with every keystroke.</span>
            </h1>

            <p
              className="mx-auto max-w-md animate-hero-fade-up font-sans leading-relaxed lg:mx-0"
              style={{
                color: 'rgba(255,255,255,0.45)',
                fontSize: 18,
                animationDelay: '0.35s',
                opacity: 0,
              }}>
              Mighty Shortcut is the command palette, text expander, clipboard manager and AI assistant that lives in a
              single keystroke.
            </p>

            <div
              className="flex animate-hero-fade-up flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
              style={{ animationDelay: '0.45s', opacity: 0 }}>
              <button
                onClick={onCTAClick}
                className="w-full rounded-xl px-8 py-4 font-sans font-semibold text-base transition-all duration-200 sm:w-auto"
                style={{
                  background: '#FF7A1A',
                  color: '#0a0a0a',
                  boxShadow: '0 0 24px rgba(255,122,26,0.4)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#e66a0f';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(255,122,26,0.55)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FF7A1A';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(255,122,26,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}>
                Download for free
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl px-8 py-4 font-medium font-sans text-base transition-all duration-200 sm:w-auto"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  color: 'rgba(255,255,255,0.65)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
                  (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)';
                }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.25" />
                  <path d="M6 5.5L11 8L6 10.5V5.5Z" fill="currentColor" />
                </svg>
                Watch demo
              </button>
            </div>

            {/* Platform badges */}
            <div
              className="flex animate-hero-fade-up items-center justify-center gap-4 lg:justify-start"
              style={{ animationDelay: '0.55s', opacity: 0 }}>
              {['macOS 13+', 'Apple Silicon', 'Intel Mac'].map((badge) => (
                <span
                  key={badge}
                  className="flex items-center gap-1.5 font-mono text-xs"
                  style={{ color: 'rgba(255,255,255,0.25)' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <circle cx="5" cy="5" r="4" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
                    <path
                      d="M3 5L4.5 6.5L7 3.5"
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="0.75"
                      strokeLinecap="round"
                    />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Right column: visual */}
          <div
            className="flex flex-1 animate-hero-fade-up justify-center lg:justify-end"
            style={{ animationDelay: '0.4s', opacity: 0 }}>
            <HeroKeyboardVisual />
          </div>
        </div>
      </div>

      {/* Bottom trusted-by ticker */}
      <div
        className="relative w-full overflow-hidden border-t border-b py-5"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)',
        }}>
        <p
          className="mb-5 text-center font-mono text-xs uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.14em' }}>
          Trusted by teams at
        </p>
        <div className="relative overflow-hidden">
          <div className="flex animate-ticker items-center gap-16" style={{ width: 'max-content' }}>
            {[
              'Vercel',
              'Linear',
              'Stripe',
              'Figma',
              'Notion',
              'Raycast',
              'Loom',
              'Pitch',
              'Vercel',
              'Linear',
              'Stripe',
              'Figma',
              'Notion',
              'Raycast',
              'Loom',
              'Pitch',
            ].map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="whitespace-nowrap font-sans font-semibold text-sm"
                style={{ color: 'rgba(255,255,255,0.18)', letterSpacing: '-0.01em' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
