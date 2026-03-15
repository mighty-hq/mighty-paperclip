'use client';

import { cn } from '@/lib/utils';

interface MightyLogoProps {
  /** Animate the bolt on hover. */
  animated?: boolean;
  /** Extra className for the wrapper. */
  className?: string;
  /** Show wordmark alongside icon. Default true. */
  showWordmark?: boolean;
  /** Size in pixels for the icon mark. Default 36. */
  size?: number;
}

/**
 * Mighty Shortcut brand logo.
 * Icon: A bold lightning bolt inside a rounded-square shield, rendered in SVG.
 * Wordmark: "Mighty" in heavy weight + "Shortcut" in lighter orange.
 */
export function MightyLogo({ size = 36, showWordmark = true, className, animated = true }: MightyLogoProps) {
  return (
    <div className={cn('flex select-none items-center gap-3', className)}>
      {/* Icon mark */}
      <div className={cn('relative flex-shrink-0', animated && 'group')} style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          aria-hidden="true">
          {/* Shield / rounded-square background */}
          <rect
            x="1"
            y="1"
            width="38"
            height="38"
            rx="10"
            fill="#0a0a0a"
            stroke="rgba(255,122,26,0.3)"
            strokeWidth="1.5"
          />
          {/* Inner accent border */}
          <rect
            x="3"
            y="3"
            width="34"
            height="34"
            rx="8"
            fill="none"
            stroke="rgba(255,122,26,0.12)"
            strokeWidth="0.75"
          />
          {/* Orange glow fill behind bolt */}
          <ellipse
            cx="20"
            cy="21"
            rx="9"
            ry="10"
            fill="rgba(255,122,26,0.15)"
            className={animated ? 'transition-all duration-300 group-hover:fill-[rgba(255,122,26,0.28)]' : ''}
          />
          {/* Lightning bolt — main shape */}
          <path
            d="M23 8L13 22H20L17 32L27 18H20L23 8Z"
            fill="#FF7A1A"
            className={animated ? 'transition-all duration-200 group-hover:brightness-110' : ''}
          />
          {/* Bolt highlight edge */}
          <path
            d="M23 8L20 18H27L20.5 26"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.75"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        {/* Subtle glow ring on hover */}
        {animated && (
          <div
            className="pointer-events-none absolute inset-0 rounded-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              boxShadow: '0 0 20px rgba(255,122,26,0.4), 0 0 40px rgba(255,122,26,0.15)',
            }}
          />
        )}
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className="font-sans text-white leading-tight tracking-tight"
            style={{ fontSize: size * 0.52, fontWeight: 800, letterSpacing: '-0.02em' }}>
            Mighty
          </span>
          <span
            className="font-sans uppercase leading-tight tracking-widest"
            style={{
              fontSize: size * 0.26,
              fontWeight: 500,
              color: '#FF7A1A',
              letterSpacing: '0.12em',
            }}>
            Shortcut
          </span>
        </div>
      )}
    </div>
  );
}

/** Standalone icon-only logo (no wordmark). Alias for convenience. */
export function MightyIcon({ size = 36, className }: { size?: number; className?: string }) {
  return <MightyLogo size={size} showWordmark={false} className={className} />;
}
