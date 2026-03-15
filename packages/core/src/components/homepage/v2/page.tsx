'use client';

import { useState } from 'react';
// import { LoaderScreen } from './components/LoaderScreen';
import { LandingNav } from './components/LandingNav';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { SocialProofSection } from './components/SocialProofSection';
import { PricingSection } from './components/PricingSection';
import { LandingCTA } from './components/LandingCTA';

export default function LandingPageV1() {
  const [loaderDone, setLoaderDone] = useState(true);

  const scrollToCTA = () => {
    document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main
      className="min-h-screen font-sans"
      style={{
        background: '#0a0a0a',
        color: 'rgba(255,255,255,0.85)',
        opacity: 1,
        transition: 'opacity 0.4s ease',
      }}>
      {/* Loader — renders on top of everything until done */}
      {/* {!loaderDone && <LoaderScreen duration={3200} onComplete={() => setLoaderDone(true)} />} */}

      {/* Navigation */}
      <LandingNav onCTAClick={scrollToCTA} />

      {/* Hero */}
      <HeroSection onCTAClick={scrollToCTA} />

      {/* Features */}
      <FeaturesSection />

      {/* How it works */}
      <HowItWorksSection />

      {/* Social proof + stats */}
      <SocialProofSection />

      {/* Pricing */}
      <PricingSection />

      {/* CTA + Footer */}
      <LandingCTA onCTAClick={scrollToCTA} />
    </main>
  );
}
