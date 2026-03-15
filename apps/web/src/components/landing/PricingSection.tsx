'use client';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect to get started and discover the power of Mighty.',
    features: ['Command palette', '50 text snippets', 'App launcher', 'Clipboard history (last 50)', '3 extensions'],
    cta: 'Download free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    desc: 'For individuals who want the full power of Mighty Shortcut.',
    features: [
      'Everything in Free',
      'Unlimited snippets',
      'Clipboard history (last 1,000)',
      'Unlimited extensions',
      'AI assistant integration',
      'Cloud sync across devices',
      'Priority support',
    ],
    cta: 'Start free trial',
    featured: true,
  },
  {
    name: 'Team',
    price: '$19',
    period: 'per seat / month',
    desc: 'For teams who want shared snippets and centralized billing.',
    features: [
      'Everything in Pro',
      'Shared snippet library',
      'Team extensions',
      'Admin dashboard',
      'SSO / SAML',
      'Dedicated account manager',
    ],
    cta: 'Contact sales',
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative px-6 py-28">
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,122,26,0.2), transparent)' }}
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
            Pricing
          </p>
          <h2
            className="text-balance font-sans text-white"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Simple pricing. <span style={{ color: 'rgba(255,255,255,0.35)' }}>No surprises.</span>
          </h2>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="relative flex flex-col gap-6 rounded-2xl p-8"
              style={{
                background: plan.featured ? '#111111' : '#0d0d0d',
                border: plan.featured ? '1px solid rgba(255,122,26,0.35)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: plan.featured ? '0 0 48px rgba(255,122,26,0.1), inset 0 1px 0 rgba(255,122,26,0.1)' : 'none',
              }}>
              {plan.featured && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 font-mono text-xs uppercase tracking-widest"
                  style={{
                    background: '#FF7A1A',
                    color: '#0a0a0a',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}>
                  Most popular
                </div>
              )}

              {/* Plan name + price */}
              <div>
                <p
                  className="mb-3 font-sans font-semibold text-sm uppercase tracking-widest"
                  style={{ color: plan.featured ? '#FF7A1A' : 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
                  {plan.name}
                </p>
                <div className="mb-2 flex items-end gap-1.5">
                  <span
                    className="font-sans text-white"
                    style={{
                      fontSize: 'clamp(32px, 5vw, 44px)',
                      fontWeight: 800,
                      letterSpacing: '-0.04em',
                      lineHeight: 1,
                    }}>
                    {plan.price}
                  </span>
                  <span className="pb-1 font-sans text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {plan.period}
                  </span>
                </div>
                <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {plan.desc}
                </p>
              </div>

              {/* CTA */}
              <button
                className="w-full rounded-xl py-3 font-sans font-semibold text-sm transition-all duration-200"
                style={
                  plan.featured
                    ? {
                        background: '#FF7A1A',
                        color: '#0a0a0a',
                        boxShadow: '0 0 20px rgba(255,122,26,0.3)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgba(255,255,255,0.7)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }
                }
                onMouseEnter={(e) => {
                  if (plan.featured) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#e66a0f';
                  } else {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.featured) {
                    (e.currentTarget as HTMLButtonElement).style.background = '#FF7A1A';
                  } else {
                    (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  }
                }}>
                {plan.cta}
              </button>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

              {/* Feature list */}
              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 flex-shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true">
                      <circle
                        cx="8"
                        cy="8"
                        r="7"
                        fill="rgba(255,122,26,0.1)"
                        stroke="rgba(255,122,26,0.3)"
                        strokeWidth="0.75"
                      />
                      <path
                        d="M5 8L7 10L11 6"
                        stroke="#FF7A1A"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
