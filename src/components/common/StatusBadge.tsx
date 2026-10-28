import React from 'react';
import { OrderStatus } from '../../types';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'confirmed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-label-badge text-label-badge uppercase tracking-wider ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          Confirmed
        </span>
      );
    case 'ready_for_pickup':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-badge text-label-badge uppercase tracking-wider ${className}`}
        >
          <span className="material-symbols-outlined text-[14px]">storefront</span>
          Ready for Pickup
        </span>
      );
    case 'completed':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label-badge text-label-badge uppercase tracking-wider ${className}`}
        >
          <span className="material-symbols-outlined text-[14px] text-primary">task_alt</span>
          Collected
        </span>
      );
    case 'cancelled':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container font-label-badge text-label-badge uppercase tracking-wider ${className}`}
        >
          <span className="material-symbols-outlined text-[14px]">cancel</span>
          Cancelled
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-badge text-label-badge uppercase tracking-wider ${className}`}
        >
          {status}
        </span>
      );
  }
};
