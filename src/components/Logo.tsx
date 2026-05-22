'use client';

interface LogoProps {
  size?: number;
  color?: string;
}

export function Logo({ size = 44, color = '#C8A97E' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 50 54"
      width={size}
      height={Math.round(size * 1.08)}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="omo scale logo"
    >
      {/* String from top */}
      <line x1="25" y1="2" x2="25" y2="12" />
      {/* Beam */}
      <line x1="6" y1="12" x2="44" y2="12" />
      {/* Pivot point */}
      <circle cx="25" cy="12" r="2.2" fill={color} stroke="none" />
      {/* Left arm */}
      <line x1="7" y1="12" x2="7" y2="22" />
      {/* Right arm */}
      <line x1="43" y1="12" x2="43" y2="22" />
      {/* Left pan */}
      <path d="M2 22 Q7 27 12 22" />
      {/* Right pan */}
      <path d="M38 22 Q43 27 48 22" />
      {/* Stand */}
      <line x1="25" y1="36" x2="25" y2="46" />
      {/* Base */}
      <line x1="16" y1="46" x2="34" y2="46" />
    </svg>
  );
}
