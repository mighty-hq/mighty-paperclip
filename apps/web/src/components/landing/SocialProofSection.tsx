'use client';

const STATS = [
  { value: '10×', label: 'Faster than a mouse' },
  { value: '50k+', label: 'Power users' },
  { value: '1,000', label: 'Clipboard entries stored' },
  { value: '<50ms', label: 'Launch time' },
];

const TESTIMONIALS = [
  {
    quote:
      'Mighty Shortcut completely changed how I work. I saved at least 45 minutes every single day within the first week.',
    author: 'Sarah Chen',
    role: 'Senior Engineer, Vercel',
    avatar: 'SC',
  },
  {
    quote:
      'The command palette is addictive. Once you use it, you can never go back to hunting through menus and Dock icons.',
    author: 'Marcus Webb',
    role: 'Design Lead, Linear',
    avatar: 'MW',
  },
  {
    quote:
      "I've tried every launcher on the market. Mighty is the first one that actually feels built for how developers think.",
    author: 'Priya Nair',
    role: 'Staff Engineer, Stripe',
    avatar: 'PN',
  },
];

function Avatar({ initials, seed }: { initials: string; seed: number }) {
  const hues = [24, 38, 12];
  const hue = hues[seed % hues.length];
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-bold font-sans text-xs"
      style={{
        background: `hsl(${hue}, 80%, 20%)`,
        border: `1px solid hsl(${hue}, 70%, 35%)`,
        color: `hsl(${hue}, 90%, 65%)`,
        letterSpacing: '0.04em',
      }}>
      {initials}
    </div>
  );
}

export function SocialProofSection() {
  return (
    <section id="social-proof" className="relative overflow-hidden px-6 py-28">
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 300,
          background: 'radial-gradient(ellipse, rgba(255,122,26,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Stats */}
        <div
          className="mb-20 grid grid-cols-2 gap-px lg:grid-cols-4"
          style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
          {STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 px-6 py-10 text-center"
              style={{ background: '#0d0d0d' }}>
              <span
                className="font-sans text-white"
                style={{
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  color: '#FF7A1A',
                }}>
                {s.value}
              </span>
              <span
                className="font-sans text-xs"
                style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 500, letterSpacing: '0.04em' }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-12 text-center">
          <h2
            className="text-balance font-sans text-white"
            style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Loved by teams who move fast.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.author}
              className="flex flex-col gap-5 rounded-2xl p-7"
              style={{
                background: '#0d0d0d',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="#FF7A1A" aria-hidden="true">
                    <path d="M7 1L8.8 5.2L13.5 5.5L10 8.6L11.1 13.3L7 10.8L2.9 13.3L4 8.6L0.5 5.5L5.2 5.2L7 1Z" />
                  </svg>
                ))}
              </div>

              <p
                className="flex-1 font-sans leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, fontStyle: 'italic' }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <Avatar initials={t.avatar} seed={i} />
                <div>
                  <p className="font-sans font-semibold text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {t.author}
                  </p>
                  <p className="font-sans text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
