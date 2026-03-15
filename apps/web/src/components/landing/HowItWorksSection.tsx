'use client';

const STEPS = [
  {
    num: '01',
    title: 'Install Mighty',
    desc: 'Download the app and grant Accessibility permission in System Preferences. One minute setup, zero configuration required.',
    codeSnippet: 'brew install --cask mighty-shortcut',
  },
  {
    num: '02',
    title: 'Learn your first shortcut',
    desc: 'Press ⌘Space to launch the command palette. Start typing — find apps, snippets, AI actions, and more instantly.',
    codeSnippet: '⌘ Space → start typing',
  },
  {
    num: '03',
    title: 'Build your workflow',
    desc: 'Create custom text snippets, install extensions from the store, and configure AI integrations to match how you work.',
    codeSnippet: 'Settings → Snippets → + New',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-28">
      {/* top rule */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p
            className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-widest"
            style={{
              color: '#FF7A1A',
              background: 'rgba(255,122,26,0.08)',
              border: '1px solid rgba(255,122,26,0.15)',
            }}>
            How it works
          </p>
          <h2
            className="text-balance font-sans text-white"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Up and running <span style={{ color: '#FF7A1A' }}>in under a minute.</span>
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col gap-5">
              {/* Connector line between cards */}
              {i < STEPS.length - 1 && (
                <div
                  className="pointer-events-none absolute top-10 left-[calc(100%+1rem)] hidden h-px w-8 md:block"
                  style={{
                    background: 'linear-gradient(90deg, rgba(255,122,26,0.3), rgba(255,122,26,0.05))',
                  }}
                />
              )}

              {/* Card */}
              <div
                className="group flex h-full flex-col gap-5 rounded-2xl p-7 transition-all duration-200"
                style={{
                  background: '#0d0d0d',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 1px 0 rgba(255,255,255,0.02)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.border = '1px solid rgba(255,122,26,0.2)';
                  el.style.boxShadow = '0 0 32px rgba(255,122,26,0.06)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.border = '1px solid rgba(255,255,255,0.06)';
                  el.style.boxShadow = '0 1px 0 rgba(255,255,255,0.02)';
                }}>
                {/* Step number badge */}
                <div className="flex items-center gap-3">
                  <span
                    className="rounded-md px-2.5 py-1 font-bold font-mono text-xs"
                    style={{
                      color: '#FF7A1A',
                      background: 'rgba(255,122,26,0.1)',
                      border: '1px solid rgba(255,122,26,0.2)',
                      letterSpacing: '0.06em',
                    }}>
                    {step.num}
                  </span>
                  <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>

                <h3
                  className="font-sans text-white"
                  style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
                  {step.title}
                </h3>

                <p
                  className="flex-1 font-sans leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.42)', fontSize: 14 }}>
                  {step.desc}
                </p>

                {/* Code line */}
                <div
                  className="flex items-center gap-2 overflow-x-auto rounded-lg px-3 py-2.5 font-mono text-xs"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.55)',
                    whiteSpace: 'nowrap',
                  }}>
                  <span style={{ color: 'rgba(255,122,26,0.7)' }}>{'>'}</span>
                  <span>{step.codeSnippet}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
