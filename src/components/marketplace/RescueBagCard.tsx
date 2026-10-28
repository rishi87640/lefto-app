import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RescueBag } from '../../types';
import { DietaryBadge } from '../common/DietaryBadge';
import { useCart } from '../../context/CartContext';

interface RescueBagCardProps {
  bag: RescueBag;
  variant?: 'grid' | 'horizontal';
}

export const RescueBagCard: React.FC<RescueBagCardProps> = ({ bag, variant = 'grid' }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleReserve = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(bag, 1);
    navigate('/cart');
  };

  if (variant === 'horizontal') {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-space-md relative overflow-hidden group border border-outline-variant/30">
        <Link
          to={`/bag/${bag.slug}`}
          className="relative w-full sm:w-60 h-48 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-surface-container-high block"
        >
          <img
            src={bag.imageUrl}
            alt={bag.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-secondary text-on-secondary font-label-badge text-label-badge shadow-sm">
            SAVE {bag.savingsPercent}%
          </span>
          <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-black/65 backdrop-blur-sm text-white font-label-badge text-label-badge">
            🔥 Only {bag.stockLeft} left
          </span>
        </Link>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-label-badge text-label-badge uppercase tracking-wider text-primary font-bold">
                Chef's Surplus Rescue
              </span>
              <DietaryBadge type={bag.dietaryType} showLabel />
            </div>

            <Link to={`/bag/${bag.slug}`}>
              <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">
                {bag.title}
              </h3>
            </Link>

            <p className="font-body-md text-body-md text-on-surface-variant mt-1 line-clamp-2">
              {bag.description}
            </p>

            <div className="flex flex-wrap items-center gap-space-xs mt-3">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-base text-primary">schedule</span>
                <span>{bag.pickupWindow}</span>
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed-variant font-body-sm text-body-sm">
                <span className="material-symbols-outlined text-sm">eco</span>
                <span>~{bag.co2SavedKg} kg CO₂e saved</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-space-md mt-space-md pt-space-xs border-t border-outline-variant/20">
            <div className="flex items-baseline gap-2">
              <span className="font-price-hero text-price-hero text-on-surface">₹{bag.rescuePrice}</span>
              <span className="font-price-strikethrough text-price-strikethrough text-on-surface-variant line-through">
                ₹{bag.originalPrice}
              </span>
              <span className="font-label-badge text-label-badge text-secondary font-bold">
                (Save ₹{bag.originalPrice - bag.rescuePrice})
              </span>
            </div>

            <button
              onClick={handleReserve}
              type="button"
              className="h-11 px-space-md rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-button text-label-button flex items-center gap-1.5 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <span>Reserve Bag</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/30">
      {/* Card Image Viewport */}
      <Link to={`/bag/${bag.slug}`} className="relative w-full aspect-[16/10] overflow-hidden bg-surface-container-highest block">
        <img
          src={bag.imageUrl}
          alt={bag.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-space-xs left-space-xs flex items-center gap-1">
          {bag.isEndingSoon && (
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary font-label-badge text-label-badge uppercase shadow-sm font-bold">
              Ending Soon
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-badge text-label-badge shadow-sm font-bold">
            Save {bag.savingsPercent}%
          </span>
        </div>

        {/* Top Right Stock Badge */}
        <span className="absolute top-space-xs right-space-xs px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-badge text-label-badge font-bold shadow-sm">
          {bag.stockLeft} left
        </span>

        {/* Pickup Window Chip */}
        <div className="absolute bottom-space-xs left-space-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-lowest/95 backdrop-blur-md shadow-sm text-on-surface">
          <span className="material-symbols-outlined text-primary text-[16px]">schedule</span>
          <span className="font-headline-sm text-xs font-semibold">{bag.pickupWindow}</span>
        </div>
      </Link>

      {/* Card Body */}
      <div className="p-space-md flex flex-col flex-1 justify-between gap-space-sm">
        <div className="flex flex-col gap-1">
          {/* Business & Rating */}
          <div className="flex items-center justify-between gap-space-xs">
            <Link
              to={`/restaurant/${bag.merchantId.replace('merchant-', '')}`}
              className="flex items-center gap-1 min-w-0 hover:text-primary transition-colors"
            >
              <DietaryBadge type={bag.dietaryType} />
              <span className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                {bag.merchantName}
              </span>
              <span
                className="material-symbols-outlined text-primary text-[16px] shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </Link>

            <div className="flex items-center gap-0.5 font-body-sm text-body-sm font-bold text-on-surface shrink-0">
              <span
                className="material-symbols-outlined text-amber-500 text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span>{bag.merchantRating}</span>
              <span className="text-outline font-normal">({bag.merchantRatingCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/bag/${bag.slug}`}>
            <h2 className="font-headline-md text-headline-md text-on-surface mt-1 line-clamp-1 group-hover:text-primary transition-colors font-bold">
              {bag.title}
            </h2>
          </Link>

          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
            {bag.description}
          </p>

          <p className="font-body-sm text-body-sm text-outline flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-sm text-primary">location_on</span>
            <span>{bag.distance} • {bag.zone}</span>
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-space-xs flex items-center justify-between gap-2 border-t border-outline-variant/20 mt-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-price-hero text-price-hero text-primary font-black">
                ₹{bag.rescuePrice}
              </span>
              <span className="font-price-strikethrough text-price-strikethrough line-through text-outline">
                ₹{bag.originalPrice}
              </span>
            </div>
            <span className="text-[11px] text-secondary font-bold">
              Save ₹{bag.originalPrice - bag.rescuePrice}
            </span>
          </div>

          <button
            onClick={handleReserve}
            type="button"
            className="bg-primary hover:bg-primary-container active:scale-95 text-on-primary font-label-button text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm flex items-center gap-1"
          >
            <span>Reserve</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </div>
    </article>
  );
};
