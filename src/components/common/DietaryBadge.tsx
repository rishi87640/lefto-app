import React from 'react';
import { DietaryType } from '../../types';

interface DietaryBadgeProps {
  type: DietaryType;
  showLabel?: boolean;
  className?: string;
}

export const DietaryBadge: React.FC<DietaryBadgeProps> = ({
  type,
  showLabel = false,
  className = '',
}) => {
  if (type === 'pure_veg') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className="w-3.5 h-3.5 rounded-sm border border-primary flex items-center justify-center p-0.5 bg-surface-container-lowest shrink-0"
          title="100% Pure Vegetarian"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary block"></span>
        </span>
        {showLabel && (
          <span className="font-label-badge text-label-badge text-primary uppercase font-bold">
            Pure Veg
          </span>
        )}
      </div>
    );
  }

  if (type === 'non_veg') {
    return (
      <div className={`inline-flex items-center gap-1.5 ${className}`}>
        <span
          className="w-3.5 h-3.5 rounded-sm border border-secondary flex items-center justify-center p-0.5 bg-surface-container-lowest shrink-0"
          title="Non-Vegetarian"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-secondary block"></span>
        </span>
        {showLabel && (
          <span className="font-label-badge text-label-badge text-secondary uppercase font-bold">
            Non-Veg
          </span>
        )}
      </div>
    );
  }

  // Mixed assortment
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="w-3.5 h-3.5 rounded-sm border border-outline flex items-center justify-center p-0.5 bg-surface-container-lowest shrink-0"
        title="Veg & Non-Veg Mixed Assortment"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-secondary block"></span>
      </span>
      {showLabel && (
        <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
          Veg & Non-Veg Mix
        </span>
      )}
    </div>
  );
};
