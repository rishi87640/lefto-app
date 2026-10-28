import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { QuantityStepper } from '../components/common/QuantityStepper';
import { DietaryBadge } from '../components/common/DietaryBadge';

export const CartPage: React.FC = () => {
  const { cartItem, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscountAmount, setPromoDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    // Transparent, genuine promo codes
    if (code === 'FIRSTBAG') {
      setPromoApplied(true);
      setPromoDiscountAmount(20);
      setPromoError('');
    } else if (code === 'SAVENCR') {
      setPromoApplied(true);
      setPromoDiscountAmount(30);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Valid test codes: "FIRSTBAG" or "SAVENCR".');
    }
  };

  // 1. EMPTY CART STATE
  if (!cartItem) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-20 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
          <span className="material-symbols-outlined text-5xl">shopping_cart</span>
        </div>
        <h1 className="font-headline-lg text-2xl text-on-surface font-extrabold mb-2">
          Your Rescue Cart is Empty
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant max-w-md mb-6 leading-relaxed">
          You haven't reserved any surplus meals yet. Browse surplus bags from local bakeries, cafes, and restaurants across Greater Noida to rescue fresh food at discounted prices.
        </p>
        <Link
          to="/explore"
          className="bg-primary hover:bg-primary-container text-on-primary font-label-button text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 font-bold"
        >
          <span className="material-symbols-outlined text-lg">explore</span>
          <span>Explore Available Rescue Bags</span>
        </Link>
      </div>
    );
  }

  const { bag, quantity } = cartItem;

  // 2. UNAVAILABLE OR EXPIRED ITEM STATE
  const isOutOfStock = (bag.stockLeft || 0) <= 0;
  const isAvailable = bag.stockLeft >= quantity;

  // 3. TRANSPARENT PRICING & TRUSTED BREAKDOWN
  // Configurable LEFTO platform fee (sourced from bag.platformFee or fallback 5.00)
  const platformFee = Number(bag.platformFee !== undefined ? bag.platformFee : 5);

  // 1. Stated original reference value of selected bags
  const originalReferenceValue = bag.originalPrice * quantity;

  // 2. Discounted rescue bag subtotal
  const discountedSubtotal = bag.rescuePrice * quantity;

  // 3. Customer savings = valid original reference value minus discounted subtotal
  const customerSavingsRupees = Math.max(0, originalReferenceValue - discountedSubtotal);
  const customerSavingsPercent = originalReferenceValue > 0
    ? Math.round((customerSavingsRupees / originalReferenceValue) * 100)
    : 0;

  // 4. Configured Taxes (5% GST applicable on platform service fee, transparently itemized)
  const platformTaxGst = Number((platformFee * 0.05).toFixed(2));

  // 5. Promo discount deduction (if genuinely applied)
  const promoDiscount = promoApplied ? Math.min(promoDiscountAmount, discountedSubtotal) : 0;

  // 6. Final trusted payable amount
  const finalPayableAmount = discountedSubtotal + platformFee + platformTaxGst - promoDiscount;

  // Environmental impact metric
  const totalCo2Prevented = ((bag.co2SavedKg || 1.2) * quantity).toFixed(1);

  return (
    <div className="w-full bg-surface pb-20">
      {/* Reservation Active Countdown Banner */}
      <CountdownTimer variant="banner" />

      <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-lg text-2xl text-on-surface font-extrabold tracking-tight">
              Order Review & Summary
            </h1>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full">
              {quantity} {quantity === 1 ? 'Bag' : 'Bags'} Reserved
            </span>
          </div>

          <Link
            to="/explore"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>Browse More Bags</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {/* Out-of-Stock / Unavailable Alert */}
        {(!isAvailable || isOutOfStock) && (
          <div className="mb-6 p-4 rounded-2xl bg-error-container text-on-error-container border border-error/30 flex items-start gap-3">
            <span className="material-symbols-outlined text-error text-xl mt-0.5">warning</span>
            <div className="text-xs leading-relaxed flex-1">
              <span className="font-bold block mb-0.5">Item No Longer Available</span>
              <p>
                {isOutOfStock
                  ? 'This rescue bag just sold out or was deactivated by the restaurant.'
                  : `Only ${bag.stockLeft} bag(s) left in stock. Please adjust your quantity.`}
              </p>
              <div className="mt-2 flex items-center gap-3">
                {bag.stockLeft > 0 && (
                  <button
                    onClick={() => updateQuantity(bag.stockLeft)}
                    className="underline font-bold hover:text-error"
                  >
                    Update to {bag.stockLeft} bag(s)
                  </button>
                )}
                <button
                  onClick={removeFromCart}
                  className="underline font-bold hover:text-error"
                >
                  Remove from cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Cart Layout (7:5 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Items, Pickup Location & Policy (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Reserved Item Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-surface-container relative">
                <img
                  src={
                    bag.imageUrl ||
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={bag.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-badge text-[10px] font-bold">
                  -{customerSavingsPercent}%
                </span>
              </div>

              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <DietaryBadge type={bag.dietaryType} />
                      <span className="font-headline-sm text-sm text-on-surface font-bold truncate">
                        {bag.merchantName}
                      </span>
                    </div>

                    <span className="text-[11px] text-outline shrink-0 font-medium">
                      {bag.category}
                    </span>
                  </div>

                  <h3 className="font-headline-md text-base text-on-surface font-bold mt-1 line-clamp-1">
                    {bag.title}
                  </h3>

                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-xs text-primary">schedule</span>
                    <span>Pickup Window: {bag.pickupWindow}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-outline-variant/20 mt-3 flex-wrap">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-price-hero text-lg text-primary font-black">
                      ₹{discountedSubtotal}
                    </span>
                    <span className="font-price-strikethrough text-xs text-outline line-through">
                      ₹{originalReferenceValue}
                    </span>
                    <span className="text-[11px] text-secondary font-bold">
                      Save ₹{customerSavingsRupees}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <QuantityStepper
                      quantity={quantity}
                      onIncrease={() => updateQuantity(quantity + 1)}
                      onDecrease={() => updateQuantity(quantity - 1)}
                      max={Math.min(bag.stockLeft || 5, 5)}
                      min={1}
                      size="sm"
                    />

                    <button
                      type="button"
                      onClick={removeFromCart}
                      className="text-on-surface-variant hover:text-error transition-colors p-1"
                      title="Remove Bag"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Store & In-Store Pickup Details */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-headline-sm text-sm text-on-surface font-bold">
                  <span className="material-symbols-outlined text-primary text-lg">storefront</span>
                  <span>Pickup Details & Location</span>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(bag.address || bag.merchantName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>Directions</span>
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Store Address
                    </span>
                    <p className="font-headline-sm text-xs font-bold text-on-surface mt-0.5">
                      {bag.merchantName}
                    </p>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {bag.address}
                    </p>
                  </div>
                  <span className="text-[11px] text-outline mt-2 block">
                    {bag.zone}, Greater Noida
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-secondary-container/10 border border-secondary-container/20 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                      Designated Window
                    </span>
                    <p className="font-headline-sm text-sm font-bold text-on-surface mt-0.5">
                      {bag.pickupWindow}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Surplus batch packed at store closing. Please arrive before the window closes.
                    </p>
                  </div>
                  <span className="text-[11px] text-secondary font-bold flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-xs">pin</span>
                    Collect with 4-digit PIN at counter
                  </span>
                </div>
              </div>
            </div>

            {/* What to Expect & Surprise Nature Advisory */}
            <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <div className="text-xs leading-relaxed text-on-surface-variant">
                <h3 className="font-headline-sm text-sm text-on-surface font-bold mb-1">
                  Surplus Food Rescue Guarantee
                </h3>
                <p>
                  Surprise bag contents vary daily based on unsold inventory. The restaurant guarantees you will receive fresh, hygienic food matching or exceeding the stated original reference value of ₹{originalReferenceValue}.
                </p>
              </div>
            </div>

            {/* Transparent Cancellation Policy */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30">
              <div className="text-xs font-bold text-on-surface flex items-center gap-1.5 mb-2">
                <span className="material-symbols-outlined text-sm text-primary">policy</span>
                <span>Cancellation & Refund Policy</span>
              </div>
              <div className="text-xs text-on-surface-variant space-y-1.5 leading-relaxed">
                <p>
                  • Free cancellation up to <strong>2 hours before</strong> the pickup window starts.
                </p>
                <p>
                  • 100% refund automatically initiated if the restaurant cannot fulfill your rescue order.
                </p>
                <p>
                  • Unclaimed orders after pickup closing cannot be refunded to maintain zero-waste integrity.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Transparent Breakdown & Checkout (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-24">
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-md border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-lg text-on-surface font-bold">
                  Payment Breakdown
                </h2>
                <span className="text-xs text-outline font-semibold">INR (₹)</span>
              </div>

              {/* Genuine Breakdown Table */}
              <div className="space-y-3 text-xs text-on-surface-variant">
                {/* 1. Original Reference Value */}
                <div className="flex justify-between items-center">
                  <span>Stated Original Reference Value ({quantity}x)</span>
                  <span className="font-medium text-on-surface">₹{originalReferenceValue}</span>
                </div>

                {/* 2. Discounted Bag Subtotal */}
                <div className="flex justify-between items-center font-medium">
                  <span>Discounted Bag Subtotal</span>
                  <span className="font-bold text-on-surface">₹{discountedSubtotal}</span>
                </div>

                {/* 3. Customer Savings */}
                <div className="flex justify-between items-center text-primary font-bold bg-primary/5 p-2 rounded-xl">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">savings</span>
                    <span>Customer Savings ({customerSavingsPercent}%)</span>
                  </span>
                  <span>-₹{customerSavingsRupees}</span>
                </div>

                {/* 4. LEFTO Platform Fee */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>LEFTO Platform Fee</span>
                    <span
                      className="material-symbols-outlined text-[13px] text-outline"
                      title="Fixed platform fee supporting store verification and zero-waste marketplace operations"
                    >
                      help
                    </span>
                  </span>
                  <span className="font-medium text-on-surface">₹{platformFee.toFixed(2)}</span>
                </div>

                {/* 5. Applicable Taxes */}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <span>Applicable GST (5% on Platform Fee)</span>
                  </span>
                  <span className="font-medium text-on-surface">₹{platformTaxGst.toFixed(2)}</span>
                </div>

                {/* 6. Promotional Discount */}
                {promoApplied && (
                  <div className="flex justify-between items-center text-secondary font-bold">
                    <span>Promo Discount ({promoCode.toUpperCase()})</span>
                    <span>-₹{promoDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Final Payable Amount */}
              <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-baseline">
                <div>
                  <span className="font-label-badge text-xs uppercase tracking-wider text-outline block">
                    Final Payable Amount
                  </span>
                  <span className="text-[11px] text-primary font-bold">
                    All fees & taxes included
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-price-hero text-2xl text-on-surface font-black">
                    ₹{finalPayableAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Clear Savings Message */}
              <div className="p-3 rounded-xl bg-primary-fixed/30 text-primary text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">eco</span>
                <span>
                  You save ₹{customerSavingsRupees} compared with the stated original reference value!
                </span>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. FIRSTBAG)"
                    className="flex-1 bg-surface-container-low text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-1 focus:ring-primary uppercase text-on-surface"
                  />
                  <button
                    type="submit"
                    className="bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-error text-[11px] mt-1">{promoError}</p>}
                {promoApplied && (
                  <p className="text-primary text-[11px] mt-1 font-bold">
                    Promo code applied: ₹{promoDiscount} deduction!
                  </p>
                )}
              </form>

              {/* Proceed to Checkout CTA */}
              <button
                type="button"
                disabled={!isAvailable || isOutOfStock}
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-container hover:bg-primary disabled:bg-surface-container-high disabled:text-outline disabled:cursor-not-allowed active:scale-[0.99] text-on-primary font-headline-sm text-sm py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-between font-bold cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-1">
                  <span>Pay ₹{finalPayableAmount.toFixed(2)}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </div>
              </button>

              <p className="text-center text-[11px] text-outline">
                Encrypted checkout • Verified in-store counter collection • Zero hidden costs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
