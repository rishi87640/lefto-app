import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RescueBag } from '../types';
import { fetchRescueBagByIdOrSlug } from '../services/supabaseService';
import { useCart } from '../context/CartContext';
import { DietaryBadge } from '../components/common/DietaryBadge';
import { QuantityStepper } from '../components/common/QuantityStepper';

export const BagDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [bag, setBag] = useState<RescueBag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchRescueBagByIdOrSlug(id || 'end-of-day-pizza-box')
      .then((res) => {
        if (!isMounted) return;
        setBag(res.data);
        setError(res.error);
        if (res.data) {
          setSelectedImage(res.data.galleryImages?.[0] || res.data.imageUrl);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load rescue bag');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-on-surface font-semibold">Loading rescue bag details...</p>
      </div>
    );
  }

  if (!bag) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-4 py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-2">shopping_bag</span>
        <h2 className="text-xl font-bold text-on-surface mb-2">Bag not found</h2>
        <p className="text-sm text-on-surface-variant mb-4">{error || 'This bag may have expired or sold out.'}</p>
        <Link to="/explore" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm">
          Browse Active Bags
        </Link>
      </div>
    );
  }

  const handleReserve = () => {
    addToCart(bag, quantity);
    navigate('/cart');
  };

  return (
    <div className="w-full bg-surface pb-24 lg:pb-16">
      {/* Breadcrumb Header */}
      <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-4">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
          <Link to="/explore" className="hover:text-primary transition-colors">Greater Noida Marketplace</Link>
          <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
          <Link to={`/restaurant/${bag.merchantId}`} className="hover:text-primary transition-colors">{bag.merchantName}</Link>
          <span className="material-symbols-outlined text-xs text-outline">chevron_right</span>
          <span className="text-on-surface font-bold truncate max-w-[200px]">{bag.title}</span>
        </nav>
      </div>

      {/* Main Two-Column Product Container */}
      <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* LEFT COLUMN: Gallery & Eco Badges (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-surface-container-highest shadow-md border border-outline-variant/30">
              <img
                src={selectedImage || bag.imageUrl}
                alt={bag.title}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-badge text-xs uppercase shadow-md font-bold">
                  SAVE {bag.savingsPercent}%
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface font-label-badge text-xs font-bold shadow-md">
                  Only {bag.stockLeft} left
                </span>
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-lowest/95 backdrop-blur-md shadow-md text-on-surface">
                <span className="material-symbols-outlined text-primary text-base">schedule</span>
                <span className="font-headline-sm text-xs font-semibold">Pickup: {bag.pickupWindow}</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {bag.galleryImages && bag.galleryImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {bag.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`relative aspect-square rounded-2xl overflow-hidden bg-surface-container shadow-sm p-0.5 transition-all ${
                      selectedImage === img
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:opacity-80'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}

            {/* Dietary & Genuine Locality Info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-surface-container-lowest p-3 rounded-2xl flex flex-col items-center text-center shadow-sm border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
                  <span className="material-symbols-outlined text-base">eco</span>
                </div>
                <span className="font-headline-sm text-xs text-on-surface font-bold">~{bag.co2SavedKg || 1.2} kg CO₂e</span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Estimated Prevented</span>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-2xl flex flex-col items-center text-center shadow-sm border border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface mb-1">
                  <span className="material-symbols-outlined text-base">store</span>
                </div>
                <span className="font-headline-sm text-xs text-on-surface font-bold">{bag.zone || 'Greater Noida'}</span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">Direct Store Pickup</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Buying Actions, Details, What's Inside (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Header info */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <DietaryBadge type={bag.dietaryType} showLabel />
                <span className="text-xs text-on-surface-variant font-medium">
                  {bag.category} • Surplus Surprise Bag
                </span>
                {bag.isApproved && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Approved Listing
                  </span>
                )}
              </div>

              <h1 className="font-display-hero text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
                {bag.title}
              </h1>

              {/* Merchant preview card link */}
              <Link
                to={`/restaurant/${bag.merchantId}`}
                className="inline-flex items-center gap-2 mt-2 p-2 px-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors group flex-wrap"
              >
                <span className="font-headline-sm text-sm font-bold text-on-surface group-hover:text-primary">
                  {bag.merchantName}
                </span>
                {bag.isApproved && (
                  <span
                    className="material-symbols-outlined text-primary text-[16px] shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified FSSAI Partner"
                  >
                    verified
                  </span>
                )}
                <span className="text-xs text-outline">•</span>
                <span className="text-xs text-on-surface-variant">{bag.zone}, Greater Noida</span>
                <span className="material-symbols-outlined text-sm text-primary group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Pricing Box */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-baseline justify-between flex-wrap gap-2">
                <div>
                  <span className="font-display-hero text-3xl font-black text-primary">
                    ₹{bag.rescuePrice}
                  </span>
                  <span className="font-price-strikethrough text-base text-outline line-through ml-2.5">
                    ₹{bag.originalPrice}
                  </span>
                </div>
                {bag.originalPrice > bag.rescuePrice && (
                  <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary font-headline-sm text-xs font-bold">
                    Save ₹{bag.originalPrice - bag.rescuePrice} ({Math.round(((bag.originalPrice - bag.rescuePrice) / bag.originalPrice) * 100)}%)
                  </span>
                )}
              </div>

              {/* Quantity Selector or Out of stock message */}
              {bag.stockLeft > 0 ? (
                <div className="flex items-center justify-between py-3 border-y border-outline-variant/20">
                  <div>
                    <span className="font-headline-sm text-xs text-on-surface font-bold block">
                      Quantity
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      {bag.stockLeft} available • Max {Math.min(bag.stockLeft, 5)} per person
                    </span>
                  </div>
                  <QuantityStepper
                    quantity={quantity}
                    min={1}
                    max={Math.min(bag.stockLeft, 5)}
                    onIncrease={() => setQuantity((q) => Math.min(q + 1, Math.min(bag.stockLeft, 5)))}
                    onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-container-high text-xs text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-base">block</span>
                  <span>Currently out of stock. Check back tomorrow when new surplus batches are posted.</span>
                </div>
              )}

              {/* Total Calculation Row */}
              {bag.stockLeft > 0 && (
                <div className="flex items-center justify-between text-xs text-on-surface-variant">
                  <span>Subtotal ({quantity} bag{quantity > 1 ? 's' : ''}):</span>
                  <span className="font-bold text-on-surface text-sm">₹{bag.rescuePrice * quantity}</span>
                </div>
              )}

              {/* Reserve / Add to Cart Button */}
              <button
                type="button"
                onClick={handleReserve}
                disabled={bag.stockLeft === 0}
                className="w-full h-14 py-4 px-6 rounded-2xl bg-primary hover:bg-primary-container disabled:bg-surface-container-high disabled:text-outline disabled:cursor-not-allowed text-on-primary font-label-button text-base font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">shopping_cart</span>
                <span>
                  {bag.stockLeft > 0 ? `Add to Cart • ₹${bag.rescuePrice * quantity}` : 'Currently Unavailable (Sold Out)'}
                </span>
              </button>

              <div className="flex flex-col gap-1 text-[11px] text-on-surface-variant text-center">
                <p className="flex items-center justify-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                  Pickup Window: {bag.pickupWindow}
                </p>
                <p className="text-outline">
                  Show your 4-digit PIN at the counter during the pickup window to collect.
                </p>
              </div>
            </div>

            {/* What might be inside & Uncertainty Explanation */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">help</span>
                <span>What's inside this Surprise Bag?</span>
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                {bag.description}
              </p>

              {/* Honest Expectation Note */}
              <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 text-xs flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary text-base mt-0.5">info</span>
                <div className="leading-relaxed text-on-surface-variant">
                  <span className="font-bold text-on-surface block mb-0.5">Contents May Vary</span>
                  <p>
                    {bag.uncertaintyNote ||
                      'Because this is surplus food rescue, the exact mix of items depends on daily unsolds. You will always receive food meeting or exceeding the original reference value.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Allergen & Food Handling Information */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">sanitizer</span>
                <span>Allergens & Food Handling</span>
              </h3>
              
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-on-surface min-w-[120px]">Allergen Notice:</span>
                  <span className="text-on-surface-variant">
                    {bag.allergenInfo || 'Prepared in a commercial kitchen that handles dairy, gluten, nuts, and sesame. Please notify the counter staff if you have severe food allergies.'}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-on-surface min-w-[120px]">Handling Guidance:</span>
                  <span className="text-on-surface-variant">
                    {bag.handlingInstructions || 'Collect fresh, keep refrigerated, and consume within 24 hours of pickup.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Clear Cancellation & Refund Terms */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">policy</span>
                <span>Cancellation & Refund Policy</span>
              </h3>
              <ul className="text-xs text-on-surface-variant space-y-1.5 list-disc list-inside leading-relaxed">
                <li>
                  <strong className="text-on-surface">Free cancellation</strong> up to 2 hours before the pickup window begins.
                </li>
                <li>
                  Full refund issued automatically if the restaurant is unable to fulfill your rescue bag.
                </li>
                <li>
                  Unclaimed bags at the end of the pickup window are non-refundable to prevent food waste.
                </li>
              </ul>
            </div>

            {/* Store Location & Pickup Details */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <h3 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">store</span>
                <span>Store & Pickup Location</span>
              </h3>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-outline text-lg mt-0.5">pin_drop</span>
                <div className="text-xs">
                  <span className="font-bold text-on-surface block">{bag.merchantName}</span>
                  <span className="text-on-surface-variant leading-relaxed block">{bag.address}</span>
                  <span className="text-outline block mt-0.5">{bag.zone}, Greater Noida</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
