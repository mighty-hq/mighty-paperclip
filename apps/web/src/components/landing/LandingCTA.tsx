'use client';

import { useState } from 'react';
import { MightyLogo } from './MightyLogo';

const FOOTER_LINKS = {
  Product: ['Features', 'Changelog', 'Roadmap', 'Extensions', 'Pricing'],
  Resources: ['Documentation', 'Blog', 'API Reference', 'Status', 'Community'],
  Company: ['About', 'Careers', 'Press Kit', 'Privacy', 'Terms'],
};

export function LandingCTA({ onCTAClick }: { onCTAClick?: () => void }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      onCTAClick?.();
    }
  };

  return (
    <>
      {/* CTA Section */}
      <section
        id="cta"
        className="relative overflow-hidden px-6 py-32"
        style={{ background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Orange glow */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
          style={{
            width: 700,
            height: 350,
            background: 'radial-gradient(ellipse at bottom, rgba(255,122,26,0.1) 0%, transparent 70%)',
          }}
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2
            className="text-balance font-sans text-white"
            style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Your shortcuts. <span style={{ color: '#FF7A1A' }}>Supercharged.</span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-md font-sans leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17 }}>
            Join 50,000+ power users who have made Mighty Shortcut the fastest part of their day.
          </p>

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 sm:flex-row"
              aria-label="Get early access">
              <label htmlFor="cta-email" className="sr-only">
                Email address
              </label>
              <input
                id="cta-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full flex-1 rounded-xl px-4 py-3.5 font-sans text-sm outline-none transition-all duration-150"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.border = '1px solid rgba(255,122,26,0.4)';
                  (e.target as HTMLInputElement).style.boxShadow = '0 0 0 3px rgba(255,122,26,0.08)';
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.border = '1px solid rgba(255,255,255,0.1)';
                  (e.target as HTMLInputElement).style.boxShadow = 'none';
                }}
              />
              <button
                type="submit"
                className="w-full whitespace-nowrap rounded-xl px-7 py-3.5 font-sans font-semibold text-sm transition-all duration-200 sm:w-auto"
                style={{
                  background: '#FF7A1A',
                  color: '#0a0a0a',
                  boxShadow: '0 0 20px rgba(255,122,26,0.35)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#e66a0f';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(255,122,26,0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#FF7A1A';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(255,122,26,0.35)';
                }}>
                Get early access
              </button>
            </form>
          ) : (
            <div
              className="mx-auto mt-10 flex max-w-md items-center justify-center gap-3 rounded-xl px-6 py-4"
              style={{ background: 'rgba(255,122,26,0.08)', border: '1px solid rgba(255,122,26,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" fill="rgba(255,122,26,0.2)" stroke="#FF7A1A" strokeWidth="1" />
                <path
                  d="M6 10L9 13L14 7"
                  stroke="#FF7A1A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="font-sans text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
                You're on the list! We'll be in touch soon.
              </p>
            </div>
          )}

          <p className="mt-5 font-sans text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            No credit card required. macOS 13+ required. Windows support coming 2025.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative px-6 py-16"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: '#0a0a0a' }}
        role="contentinfo">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex flex-col gap-12 lg:flex-row">
            {/* Brand */}
            <div className="max-w-xs flex-shrink-0">
              <MightyLogo size={28} />
              <p className="mt-4 font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
                The command palette for people who know that every second matters.
              </p>
            </div>

            {/* Links */}
            <div className="grid flex-1 grid-cols-2 gap-8 md:grid-cols-3">
              {Object.entries(FOOTER_LINKS).map(([group, links]) => (
                <div key={group}>
                  <p
                    className="mb-4 font-mono font-semibold text-xs uppercase"
                    style={{ color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em' }}>
                    {group}
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          className="font-sans text-sm transition-colors duration-150"
                          style={{ color: 'rgba(255,255,255,0.35)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}>
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col items-center justify-between gap-4 pt-8 sm:flex-row"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
              &copy; {new Date().getFullYear()} Mighty Shortcut, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Social icons */}
              {[
                { label: 'Twitter / X', path: 'M4 4L16 16M4 16L16 4' },
                {
                  label: 'GitHub',
                  path: 'M8 2C4.7 2 2 4.7 2 8C2 10.6 3.7 12.9 6.1 13.7C6.4 13.8 6.5 13.6 6.5 13.4V12.2C4.9 12.6 4.5 11.5 4.5 11.5C4.2 10.8 3.8 10.6 3.8 10.6C3.2 10.2 3.8 10.2 3.8 10.2C4.4 10.3 4.8 10.8 4.8 10.8C5.4 11.8 6.4 11.5 6.8 11.3C6.8 10.9 7 10.6 7.2 10.5C5.7 10.3 4.1 9.7 4.1 7.2C4.1 6.4 4.4 5.8 4.8 5.3C4.8 5.1 4.5 4.4 5.1 3.5C5.1 3.5 5.7 3.3 6.9 4.1C7.4 4 8 3.9 8.5 3.9C9 3.9 9.6 4 10.1 4.1C11.3 3.3 11.9 3.5 11.9 3.5C12.5 4.4 12.2 5.1 12.2 5.3C12.6 5.8 12.9 6.5 12.9 7.2C12.9 9.7 11.3 10.3 9.8 10.5C10 10.7 10.2 11.1 10.2 11.7V13.4C10.2 13.6 10.3 13.8 10.6 13.7C13 12.9 14.7 10.6 14.7 8C14 4.7 11.3 2 8 2Z',
                },
              ].map(({ label, path }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="transition-colors duration-150"
                  style={{ color: 'rgba(255,255,255,0.2)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FF7A1A')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
