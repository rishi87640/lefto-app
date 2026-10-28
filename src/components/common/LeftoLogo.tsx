import React from 'react';
import { Link } from 'react-router-dom';

interface LeftoLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * LEFTO brand wordmark.
 *
 * Design principles:
 * - Rounded, friendly letterforms in forest green (#00652C) on a cream/white background.
 * - The "O" is rendered as a rescue‑bag silhouette with a subtle leaf accent on the top‑right.
 * - No gradients, no food icons, no 3‑D effects – clean and trustworthy.
 * - Scales cleanly at sm / md / lg via a viewBox SVG.
 */
export const LeftoLogo: React.FC<LeftoLogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const heights: Record<string, string> = {
    sm: 'h-7',
    md: 'h-9',
    lg: 'h-11',
  };

  // The wordmark combines the letters "Left" with a bag‑shaped "O" that includes a leaf.
  return (
    <Link
      to="/"
      className={`inline-flex items-center group ${className}`}
      aria-label="LEFTO – Rescue Food Marketplace"
    >
      <svg
        viewBox="0 0 148 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heights[size]} w-auto shrink-0 transition-opacity group-hover:opacity-80`}
        role="img"
        aria-hidden="true"
      >
        {/* ── L, E, F, T ── */}
        <text
          x="0"
          y="31"
          fontFamily="'Plus Jakarta Sans', 'Inter', system-ui, sans-serif"
          fontWeight="800"
          fontSize="34"
          letterSpacing="-1"
          fill="#00652C"
        >
          Left
        </text>

        {/* ── O (rescue‑bag silhouette) ── */}
        {/* Outer rounded rectangle body of the bag */}
        <rect x="110" y="11" width="25" height="22" rx="6" fill="#00652C" />
        {/* Inner cream "window" cutout to suggest the bag opening */}
        <rect x="115" y="16" width="15" height="12" rx="3" fill="#F7F3ED" />
        {/* Drawstring knot at top centre – two tiny arcs */}
        <path
          d="M119.5 11 C119.5 8 122.5 6 122.5 6 C122.5 6 125.5 8 125.5 11"
          stroke="#00652C"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Leaf accent on the top‑right of the bag */}
        <path
          d="M126 8 C128 5, 131 5, 133 8 C132 10, 127 10, 126 8"
          fill="#4ADE80"
        />
        {/* Bright‑green accent dot inside the bag (rescue spark) */}
        <circle cx="122.5" cy="22" r="3" fill="#4ADE80" />
      </svg>

      {/* Optional hidden text for accessibility */}
      {showText && (
        <span className="sr-only" aria-label="Rescue Food Marketplace" />
      )}
    </Link>
  );
};
