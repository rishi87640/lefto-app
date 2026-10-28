import React from 'react';
import { useCart } from '../../context/CartContext';

interface CountdownTimerProps {
  className?: string;
  variant?: 'banner' | 'badge' | 'compact';
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  className = '',
  variant = 'badge',
}) => {
  const { formatTimer, secondsRemaining } = useCart();

  if (variant === 'banner') {
    return (
      <div
        className={`w-full bg-secondary-container/10 border-b border-secondary-container/20 py-2 px-4 text-center ${className}`}
      >
        <div className="max-w-[1240px] mx-auto flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-secondary text-base animate-pulse">
            timer
          </span>
          <span className="font-headline-sm text-body-sm text-on-surface">
            Surplus reservation held for:{' '}
            <strong className="text-secondary font-bold font-mono">
              {formatTimer()} min
            </strong>
          </span>
          <span className="hidden sm:inline-block text-outline-variant">•</span>
          <span className="hidden sm:inline-block font-body-sm text-on-surface-variant text-xs">
            Complete order before inventory releases to next customer
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-mono font-bold text-secondary ${className}`}
      >
        <span className="material-symbols-outlined text-xs">alarm</span>
        {formatTimer()}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline-sm text-xs ${className}`}
    >
      <span className="material-symbols-outlined text-sm">schedule</span>
      <span>{secondsRemaining > 0 ? `${formatTimer()} remaining` : 'Expired'}</span>
    </div>
  );
};
