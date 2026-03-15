'use client';

import { useEffect, useState } from 'react';
import { MightyIcon } from './MightyLogo';

interface LoaderScreenProps {
  /** Override total display duration in ms. Default 3000ms. */
  duration?: number;
  /** Called when the exit animation completes and the loader is gone. */
  onComplete?: () => void;
}

/**
 * Full-screen loader animation for Mighty Shortcut.
 *
 * Stages:
 *  0–300ms  : fade in
 *  300–2400ms: animated rings + bolt draw + progress fill
 *  2400–3000ms: fade out via CSS
 *
 * After `duration` ms the component unmounts and `onComplete` fires.
 */
export function LoaderScreen({ onComplete, duration = 3200 }: LoaderScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit'>('enter');

  useEffect(() => {
    // Enter → active
    const t1 = setTimeout(() => setPhase('active'), 300);

    // Progress animation: ramp 0→100 over ~2s
    let start: number | null = null;
    let raf: number;
    const totalDuration = duration - 800; // leave 800ms for exit

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / totalDuration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      }
    };

    const t2 = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, 400);

    // active → exit
    const t3 = setTimeout(() => setPhase('exit'), duration - 700);

    // Unmount
    const t4 = setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      cancelAnimationFrame(raf);
    };
  }, [duration, onComplete]);

  if (phase === 'exit' && progress >= 100) {
    // still rendered but fading out via CSS
  }

  return (
    <div
      aria-label="Loading Mighty Shortcut"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        backgroundColor: '#0a0a0a',
        transition: phase === 'exit' ? 'opacity 0.65s ease-out' : 'opacity 0.3s ease-in',
        opacity: phase === 'exit' ? 0 : phase === 'enter' ? 0 : 1,
        pointerEvents: phase === 'exit' ? 'none' : 'all',
      }}>
      {/* Background grid */}
      <div className="grid-overlay pointer-events-none absolute inset-0 opacity-40" />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 500,
          height: 500,
          background: 'radial-gradient(circle, rgba(255,122,26,0.12) 0%, transparent 65%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Main animation ring assembly */}
      <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
        {/* Outer ring — dashed, slow spin */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 200 200"
          width={200}
          height={200}
          aria-hidden="true"
          style={{
            animation: 'loader-ring-spin 8s linear infinite',
            transformOrigin: 'center',
          }}>
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="rgba(255,122,26,0.15)"
            strokeWidth="1"
            strokeDasharray="6 10"
            strokeLinecap="round"
          />
        </svg>

        {/* Middle ring — progress arc */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 200 200"
          width={200}
          height={200}
          aria-hidden="true"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}>
          {/* Track */}
          <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,122,26,0.08)" strokeWidth="2" />
          {/* Fill */}
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke="#FF7A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 78}`}
            strokeDashoffset={`${2 * Math.PI * 78 * (1 - progress / 100)}`}
            style={{ transition: 'stroke-dashoffset 0.12s linear' }}
          />
          {/* Glowing dot at tip */}
          {progress > 2 && (
            <circle
              cx={100 + 78 * Math.cos((Math.PI * 2 * progress) / 100 - Math.PI / 2)}
              cy={100 + 78 * Math.sin((Math.PI * 2 * progress) / 100 - Math.PI / 2)}
              r="4"
              fill="#FF7A1A"
              style={{ filter: 'drop-shadow(0 0 6px #FF7A1A)' }}
            />
          )}
        </svg>

        {/* Inner ring — reverse slow spin */}
        <svg
          className="absolute inset-0"
          viewBox="0 0 200 200"
          width={200}
          height={200}
          aria-hidden="true"
          style={{
            animation: 'loader-ring-spin-reverse 5s linear infinite',
            transformOrigin: 'center',
          }}>
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="rgba(255,122,26,0.1)"
            strokeWidth="1"
            strokeDasharray="3 14"
            strokeLinecap="round"
          />
        </svg>

        {/* Logo icon at centre */}
        <div
          className="relative z-10 flex items-center justify-center rounded-[14px]"
          style={{
            width: 72,
            height: 72,
            background: '#111111',
            border: '1px solid rgba(255,122,26,0.25)',
            boxShadow: '0 0 32px rgba(255,122,26,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
          <MightyIcon size={44} />
        </div>
      </div>

      {/* Brand name */}
      <div className="mt-8 flex flex-col items-center gap-1">
        <div className="flex items-baseline gap-2">
          <span className="font-sans text-white" style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em' }}>
            Mighty
          </span>
          <span className="font-sans text-sm uppercase tracking-[0.15em]" style={{ color: '#FF7A1A', fontWeight: 500 }}>
            Shortcut
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="mt-4 overflow-hidden rounded-full"
          style={{
            width: 160,
            height: 2,
            background: 'rgba(255,255,255,0.06)',
          }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: '#FF7A1A',
              transition: 'width 0.1s linear',
              boxShadow: '0 0 8px rgba(255,122,26,0.6)',
            }}
          />
        </div>

        <p className="mt-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em' }}>
          {progress < 100 ? 'LOADING...' : 'READY'}
        </p>
      </div>
    </div>
  );
}
