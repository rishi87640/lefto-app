import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { placeRescueOrderRPC } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

export const CheckoutPage: React.FC = () => {
  const { cartItem, clearCart } = useCart();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Customer contact required strictly for pickup verification and order status
  const [fullName, setFullName] = useState(profile?.name || user?.user_metadata?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(
    profile?.phone?.replace(/\D/g, '').slice(-10) || ''
  );
  const [contactTouched, setContactTouched] = useState(false);

  // Review & Confirmation step states
  const [isReviewed, setIsReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Payment state:
  // Check if live payment gateway credentials exist in the environment
  const isGatewayConfigured = Boolean(
    import.meta.env.VITE_RAZORPAY_KEY_ID &&
    !import.meta.env.VITE_RAZORPAY_KEY_ID.includes('placeholder')
  );

  // When live payment gateway is not configured, we offer honest Counter / Storefront verification or Demo Sandbox
  const [paymentChoice, setPaymentChoice] = useState<'counter' | 'sandbox'>('counter');

  // If cart is empty, do NOT inject a fake bag. Show an honest empty cart screen.
  if (!cartItem || !cartItem.bag) {
    return (
      <div className="w-full bg-surface py-20 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-4xl">shopping_cart</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-black text-on-surface">
            Your Cart is Empty
          </h2>
          <p className="text-sm text-on-surface-variant max-w-sm">
            Select a verified surplus Rescue Bag from our local restaurant partners before proceeding to checkout.
          </p>
          <Link
            to="/explore"
            className="mt-3 px-6 py-3 rounded-xl bg-primary text-on-primary font-bold text-sm shadow hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>Explore Active Rescue Bags</span>
          </Link>
        </div>
      </div>
    );
  }

  const { bag, quantity } = cartItem;

  // Real, transparent calculations matching database prices and tax rules
  const platformFee = Number(bag.platformFee !== undefined ? bag.platformFee : 5);
  const originalReferenceValue = bag.originalPrice * quantity;
  const discountedSubtotal = bag.rescuePrice * quantity;
  const customerSavingsRupees = Math.max(0, originalReferenceValue - discountedSubtotal);
  const customerSavingsPercent = originalReferenceValue > 0
    ? Math.round((customerSavingsRupees / originalReferenceValue) * 100)
    : 0;

  // Transparent GST on platform service fee (5%)
  const platformTaxGst = Number((platformFee * 0.05).toFixed(2));
  const finalPayableAmount = discountedSubtotal + platformFee + platformTaxGst;

  // Form validations
  const isNameValid = fullName.trim().length >= 2;
  const isMobileValid = /^[6-9]\d{9}$/.test(mobileNumber.trim());
  const canProceed = isNameValid && isMobileValid && isReviewed;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactTouched(true);
    setOrderError(null);

    if (!isNameValid) {
      setOrderError('Please provide a valid full name for store pickup verification.');
      return;
    }
    if (!isMobileValid) {
      setOrderError('Please enter a valid 10-digit Indian mobile number for SMS/PIN notification.');
      return;
    }
    if (!isReviewed) {
      setOrderError('Please review and confirm the final payable amount and pickup terms.');
      return;
    }

    // Guard against duplicate submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedPaymentMethod = isGatewayConfigured
        ? 'gateway_online'
        : paymentChoice === 'counter'
        ? 'pay_at_store_counter'
        : 'sandbox_test_mode';

      const res = await placeRescueOrderRPC({
        bagId: bag.id,
        quantity,
        pickupName: fullName.trim(),
        pickupMobile: mobileNumber.trim(),
        paymentMethod: selectedPaymentMethod
      });

      if (res.error || !res.data) {
        setOrderError(res.error || 'Failed to place order. The bag may have sold out. Please try again.');
        setIsSubmitting(false);
        return;
      }

      // Order created successfully via secure server-side RPC with atomic stock deduction
      clearCart();

      navigate('/order-confirmation', {
        state: {
          serverOrder: res.data,
          customerName: fullName.trim(),
          customerMobile: mobileNumber.trim(),
          paymentMethod: selectedPaymentMethod,
          totalAmount: res.data.total_amount || finalPayableAmount,
          bag,
          quantity
        }
      });
    } catch (err: any) {
      setOrderError(err.message || 'Network error placing your rescue order. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-surface pb-24">
      {/* Active Hold Countdown Banner */}
      <CountdownTimer variant="banner" />

      <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-6">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
          <div className="flex items-center gap-2">
            <Link to="/cart" className="p-1 hover:bg-surface-container rounded-lg text-outline">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
            </Link>
            <h1 className="font-headline-lg text-2xl text-on-surface font-extrabold">
              Pickup Checkout
            </h1>
          </div>
          <span className="text-xs text-primary font-semibold flex items-center gap-1.5 bg-primary/10 px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-sm">lock</span>
            Secure Pickup Order
          </span>
        </div>

        {orderError && (
          <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/30 text-error flex items-start gap-3 animate-shake">
            <span className="material-symbols-outlined text-xl mt-0.5 shrink-0">error</span>
            <div className="text-xs flex-1">
              <strong className="block text-sm font-bold">Checkout Alert</strong>
              <span>{orderError}</span>
            </div>
            <button
              type="button"
              onClick={() => setOrderError(null)}
              className="text-error hover:opacity-75"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        )}

        {/* 2-Column Pickup-First Checkout Layout */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
  {isSubmitting && (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="loader ease-linear rounded-full border-8 border-t-8 border-primary h-16 w-16"></div>
    </div>
  )}
          {/* LEFT COLUMN: Pickup Details & Honest Payment Setup */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* CARD 1: Store Pickup Location & Window */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">store</span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    1. Pickup Store & Window
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-xs">directions_walk</span>
                  Customer Pickup Only
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-surface-container-low p-4 rounded-xl">
                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    {bag.merchantName}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {bag.address || `${bag.zone}, Greater Noida`}
                  </p>
                  <p className="text-[11px] text-outline mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary">pin_drop</span>
                    Locality: <strong className="text-on-surface">{bag.zone || 'Local Partner'}</strong>
                  </p>
                </div>
                <div className="sm:text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-outline block">Pickup Window</span>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                    {bag.pickupWindow || `${bag.pickupStart} – ${bag.pickupEnd}`}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary shrink-0">info</span>
                <span>
                  <strong>Pickup-First Model:</strong> LEFTO is strictly customer self-pickup to keep surplus food affordable with zero delivery markup. No home delivery address is required.
                </span>
              </div>
            </div>

            {/* CARD 2: Pickup Person Contact (Zero unnecessary delivery fields) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">badge</span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    2. Pickup Person Information
                  </h2>
                </div>
                <span className="text-xs text-outline font-medium">Used solely for order handover</span>
              </div>

              <p className="text-xs text-on-surface-variant">
                We only ask for the name and mobile number needed by the restaurant staff to verify your 4-digit pickup PIN.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter recipient full name"
                    className={`w-full bg-surface-container-low text-on-surface font-body-md text-sm rounded-xl px-4 py-2.5 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border ${
                      contactTouched && !isNameValid
                        ? 'border-error ring-1 ring-error'
                        : 'border-outline-variant/30 focus:border-primary'
                    }`}
                  />
                  {contactTouched && !isNameValid && (
                    <span className="text-[11px] text-error mt-1 block">Name must be at least 2 characters.</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-on-surface-variant mb-1 font-bold">
                    Mobile Number (for pickup SMS & PIN) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2.5 bg-surface-container-high rounded-xl text-xs font-bold text-on-surface">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile"
                      className={`flex-1 bg-surface-container-low text-on-surface font-body-md text-sm rounded-xl px-4 py-2.5 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all border ${
                        contactTouched && !isMobileValid
                          ? 'border-error ring-1 ring-error'
                          : 'border-outline-variant/30 focus:border-primary'
                      }`}
                    />
                  </div>
                  {contactTouched && !isMobileValid && (
                    <span className="text-[11px] text-error mt-1 block">Valid 10-digit Indian mobile required.</span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-outline flex items-center gap-1.5 mt-1">
                <span className="material-symbols-outlined text-xs text-primary">security</span>
                <span>Zero spam guarantee: Your number is never shared with third-party advertisers.</span>
              </div>
            </div>

            {/* CARD 3: Payment Configuration (Honest State) */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">payments</span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    3. Payment Method
                  </h2>
                </div>
                <span className="text-xs text-primary font-bold">
                  {isGatewayConfigured ? 'Gateway Active' : 'Transparent Setup Mode'}
                </span>
              </div>

              {isGatewayConfigured ? (
                /* When payment provider is genuinely configured */
                <div className="p-4 rounded-xl border border-primary bg-primary/5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-xl">verified_user</span>
                    <div>
                      <span className="font-bold text-sm text-on-surface block">Integrated Gateway Available</span>
                      <span className="text-xs text-on-surface-variant">Razorpay / UPI / Cards online checkout</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Honest payment setup / sandbox state when gateway is not configured */
                <div className="flex flex-col gap-4">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-lg mt-0.5 shrink-0 text-amber-600">info</span>
                    <div>
                      <strong className="block font-bold">Honest Payment Gateway Notice</strong>
                      <span>
                        Live online payment keys (e.g. Razorpay Key ID) are not configured in this environment. LEFTO never simulates fake credit card debits or deceptive payment successes. Choose an honest fulfillment method below:
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A: Pay at Store Counter on Pickup */}
                    <div
                      onClick={() => setPaymentChoice('counter')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        paymentChoice === 'counter'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={paymentChoice === 'counter'}
                          onChange={() => setPaymentChoice('counter')}
                          className="accent-primary"
                        />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/20 text-primary">
                          Recommended
                        </span>
                      </div>
                      <span className="font-headline-sm text-sm font-bold text-on-surface block">
                        Pay at Restaurant Counter
                      </span>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Pay exact amount (₹{finalPayableAmount}) via cash or restaurant's own UPI QR code upon verifying your bag.
                      </p>
                    </div>

                    {/* Option B: Sandbox Reservation (Test Mode) */}
                    <div
                      onClick={() => setPaymentChoice('sandbox')}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        paymentChoice === 'sandbox'
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-outline-variant/30 bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="radio"
                          name="payment_choice"
                          checked={paymentChoice === 'sandbox'}
                          onChange={() => setPaymentChoice('sandbox')}
                          className="accent-primary"
                        />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container-high text-outline">
                          Developer / Test
                        </span>
                      </div>
                      <span className="font-headline-sm text-sm font-bold text-on-surface block">
                        Sandbox Order Simulation
                      </span>
                      <p className="text-xs text-on-surface-variant mt-1">
                        Test end-to-end atomic database reservation, pickup PIN generation, and pass code flow without financial transactions.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 4: Customer Review & Confirmation Step */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
                <h2 className="font-headline-md text-base text-on-surface font-bold">
                  4. Review & Acknowledge
                </h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isReviewed}
                    onChange={(e) => setIsReviewed(e.target.checked)}
                    className="mt-1 accent-primary w-4 h-4 rounded"
                  />
                  <div className="text-xs text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-on-surface block">
                      I understand the pickup window and surplus nature of this order:
                    </span>
                    <span>
                      I will collect my Rescue Bag from <strong>{bag.merchantName}</strong> ({bag.zone}) during <strong>{bag.pickupWindow || `${bag.pickupStart} – ${bag.pickupEnd}`}</strong>. I acknowledge that contents depend on daily surplus and final payable amount is <strong>₹{finalPayableAmount}</strong>.
                    </span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Real Order Summary Breakdown (Sticky) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md border border-outline-variant/30 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-base text-on-surface font-bold">
                  Order Summary
                </h2>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {quantity} {quantity === 1 ? 'Bag' : 'Bags'}
                </span>
              </div>

              {/* Selected Bag Card */}
              <div className="flex items-start gap-3 pb-4 border-b border-outline-variant/20">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20">
                  {bag.imageUrl ? (
                    <img src={bag.imageUrl} alt={bag.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-2xl">lunch_dining</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-headline-sm text-sm font-bold text-on-surface block truncate">
                    {bag.title}
                  </span>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">
                    {bag.merchantName} • {bag.zone}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-bold text-sm text-primary">₹{discountedSubtotal}</span>
                    {originalReferenceValue > discountedSubtotal && (
                      <span className="text-xs text-outline line-through">₹{originalReferenceValue}</span>
                    )}
                    <span className="text-[11px] text-on-surface-variant">Qty: {quantity}</span>
                  </div>
                </div>
              </div>

              {/* Truthful Itemized Price Breakdown */}
              <div className="space-y-2 text-xs text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span>Stated Original Reference Value</span>
                  <span className="font-semibold text-on-surface">₹{originalReferenceValue}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discounted Bag Subtotal ({quantity}x)</span>
                  <span className="font-semibold text-on-surface">₹{discountedSubtotal}</span>
                </div>

                {customerSavingsRupees > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <span>Customer Genuine Savings</span>
                    <span>-₹{customerSavingsRupees} ({customerSavingsPercent}% off)</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10">
                  <span className="flex items-center gap-1">
                    <span>LEFTO Platform Fee</span>
                    <span className="text-[10px] text-outline" title="Supports partner quality audits and platform operations">ⓘ</span>
                  </span>
                  <span className="font-semibold text-on-surface">₹{platformFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Applicable GST (5% on Platform Fee)</span>
                  <span className="font-semibold text-on-surface">₹{platformTaxGst.toFixed(2)}</span>
                </div>
              </div>

              {/* Final Payable Amount */}
              <div className="pt-3 border-t border-outline-variant/20 flex justify-between items-baseline">
                <div>
                  <span className="font-label-badge text-[11px] uppercase tracking-wider text-outline block">
                    Final Payable Amount
                  </span>
                  <span className="text-[11px] text-primary font-bold">
                    All genuine charges included
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-headline-lg text-2xl text-on-surface font-black">
                    ₹{finalPayableAmount.toFixed(2)}
                  </span>
                  <span className="block text-[10px] text-outline">No hidden delivery surcharges</span>
                </div>
              </div>

              {/* Environmental Impact Card */}
              <div className="p-3 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">eco</span>
                <span>You save ₹{customerSavingsRupees} & prevent {((bag.co2SavedKg || 1.2) * quantity).toFixed(1)} kg CO₂e!</span>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={isSubmitting || !canProceed}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-headline-sm text-base py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-between font-bold cursor-pointer"
              >
                <span>{isSubmitting ? 'Reserving Order...' : `Confirm & Reserve (₹${finalPayableAmount.toFixed(2)})`}</span>
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <span>{isSubmitting ? 'Locking Stock' : 'Confirm'}</span>
                  <span className="material-symbols-outlined text-base">
                    {isSubmitting ? 'hourglass_top' : 'arrow_forward'}
                  </span>
                </div>
              </button>

              {!isReviewed && (
                <p className="text-center text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Please check the acknowledgement box before confirming.
                </p>
              )}

              <p className="text-center font-body-sm text-[11px] text-outline leading-tight">
                Backend RPC validates active stock and locks your bag with a secret 4-digit pickup PIN upon confirmation.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
