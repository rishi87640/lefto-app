import React from 'react';

interface QuantityStepperProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
  min?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  quantity,
  onIncrease,
  onDecrease,
  max = 2,
  min = 1,
  className = '',
  size = 'md',
}) => {
  const btnSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 'text-sm' : 'text-base';
  const width = size === 'sm' ? 'w-8' : 'w-10';

  return (
    <div
      className={`flex items-center bg-surface-container rounded-full p-1 shadow-inner ${className}`}
    >
      <button
        aria-label="Decrease quantity"
        type="button"
        disabled={quantity <= min}
        onClick={onDecrease}
        className={`${btnSize} rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-sm`}
      >
        <span className={`material-symbols-outlined ${iconSize}`}>remove</span>
      </button>

      <span
        className={`${width} text-center font-headline-sm text-headline-sm font-bold text-on-surface select-none`}
      >
        {quantity}
      </span>

      <button
        aria-label="Increase quantity"
        type="button"
        disabled={quantity >= max}
        onClick={onIncrease}
        className={`${btnSize} rounded-full bg-surface-container-lowest text-on-surface flex items-center justify-center hover:bg-surface transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-sm`}
      >
        <span className={`material-symbols-outlined ${iconSize}`}>add</span>
      </button>
    </div>
  );
};
