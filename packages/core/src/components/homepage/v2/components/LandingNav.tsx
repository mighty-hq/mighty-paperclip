'use client';

import { useState, useEffect } from 'react';
import { MightyLogo } from './MightyLogo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '#blog' },
];

export function LandingNav({ onCTAClick }: { onCTAClick?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,10,10,0.88)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}>
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <MightyLogo size={30} />

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex" role="navigation">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-sans text-sm transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => (window.location.href = '/auth')}
            className="rounded-lg px-4 py-2 font-sans text-sm transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
            Log in
          </button>
          <button
            onClick={onCTAClick}
            className="rounded-lg px-5 py-2.5 font-sans font-semibold text-sm transition-all duration-200"
            style={{
              background: '#FF7A1A',
              color: '#0a0a0a',
              boxShadow: '0 0 16px rgba(255,122,26,0.35)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#e66a0f';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(255,122,26,0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = '#FF7A1A';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(255,122,26,0.35)';
            }}>
            Get early access
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-lg p-2 md:hidden"
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {mobileOpen ? (
              <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 10H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M3 14H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="flex flex-col gap-4 px-6 pb-6 md:hidden"
          style={{ background: 'rgba(10,10,10,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="py-2 font-sans text-sm"
              style={{ color: 'rgba(255,255,255,0.6)' }}
              onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              onCTAClick?.();
            }}
            className="mt-2 rounded-lg px-5 py-3 text-center font-sans font-semibold text-sm"
            style={{ background: '#FF7A1A', color: '#0a0a0a' }}>
            Get early access
          </button>
        </div>
      )}
    </header>
  );
}
