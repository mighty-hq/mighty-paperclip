'use client';

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M11 2L3 8V19H8V13H14V19H19V8L11 2Z" stroke="#FF7A1A" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Universal Command Palette',
    desc: 'One keystroke to launch anything — apps, snippets, AI prompts, web searches. No mouse needed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="16" height="12" rx="2" stroke="#FF7A1A" strokeWidth="1.5" />
        <path d="M7 9H9M13 9H15M7 13H15" stroke="#FF7A1A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Smart Text Snippets',
    desc: 'Expand abbreviations into full templates, email signatures, code boilerplates — instantly typed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="8" stroke="#FF7A1A" strokeWidth="1.5" />
        <path d="M11 7V11L14 13" stroke="#FF7A1A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Clipboard History',
    desc: 'Never lose a copied item. Browse, search and reuse your last 1,000 clipboard entries in seconds.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M4 6L11 3L18 6V11C18 15.4 14.5 18.9 11 20C7.5 18.9 4 15.4 4 11V6Z"
          stroke="#FF7A1A"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8 11L10 13L14 9" stroke="#FF7A1A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI at your Fingertips',
    desc: 'Summon a powerful AI assistant from anywhere. Summarise, rewrite, translate or generate — all inline.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path d="M3 10L11 4L19 10V19H14V14H8V19H3V10Z" stroke="#FF7A1A" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Extension Ecosystem',
    desc: 'Browse and install community-built extensions from the store. Extend Mighty to fit your exact workflow.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M5 12H17M12 7L17 12L12 17"
          stroke="#FF7A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: 'Lightning Quick Launch',
    desc: 'Fuzzy-find and open any installed app, document or bookmark faster than your Dock ever could.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden px-6 py-28">
      {/* Section grid line accent */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,122,26,0.25), transparent)' }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest"
            style={{
              color: '#FF7A1A',
              background: 'rgba(255,122,26,0.08)',
              border: '1px solid rgba(255,122,26,0.15)',
            }}>
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: '#FF7A1A', boxShadow: '0 0 6px #FF7A1A' }}
            />
            Features
          </p>
          <h2
            className="text-balance font-sans text-white"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Everything you need.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>Nothing you don't.</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl font-sans leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)', fontSize: 16 }}>
            Built for power users who demand speed. Every feature is designed around the keyboard — because your hands
            never need to leave it.
          </p>
        </div>

        {/* Feature grid */}
        <div
          className="grid gap-px md:grid-cols-2 lg:grid-cols-3"
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group relative flex flex-col gap-4 p-7 transition-all duration-200"
              style={{
                background: '#0d0d0d',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#111111';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = '#0d0d0d';
              }}>
              {/* Icon */}
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110"
                style={{
                  background: 'rgba(255,122,26,0.08)',
                  border: '1px solid rgba(255,122,26,0.15)',
                }}>
                {f.icon}
              </div>
              {/* Text */}
              <div>
                <h3
                  className="mb-1.5 font-sans text-white"
                  style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p className="font-sans leading-relaxed" style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14 }}>
                  {f.desc}
                </p>
              </div>
              {/* Corner accent on hover */}
              <div
                className="pointer-events-none absolute right-0 bottom-0 h-16 w-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle at bottom right, rgba(255,122,26,0.12), transparent 70%)',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
