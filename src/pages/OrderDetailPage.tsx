import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchOrderDetailsByIdOrCode } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { DEMO_ACTIVE_ORDER } from '../data/mockData';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const lookupId = id || 'LFT-48291';

    if (!isSupabaseConfigured()) {
      // In demo/preview mode without Supabase connection
      setOrder(DEMO_ACTIVE_ORDER);
      setLoading(false);
      return;
    }

    fetchOrderDetailsByIdOrCode(lookupId)
      .then((res) => {
        if (!isMounted) return;
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setOrder(res.data);
        } else {
          setError('Order not found.');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error loading order details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleIssueClick = (issue: string) => {
    setSupportMessage(
      `Your support inquiry for "${issue}" on Order #${orderCode} has been logged. Our Greater Noida customer team will contact you via SMS/WhatsApp.`
    );
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  if (loading) {
    return (
      <div className="w-full bg-surface py-24 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-on-surface-variant font-medium">Fetching verified order records...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full bg-surface py-20 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">error_outline</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-black text-on-surface">Order Not Accessible</h2>
          <p className="text-xs text-on-surface-variant max-w-sm">
            {error || 'We could not retrieve details for this order. It may have expired or belongs to another account.'}
          </p>
          <div className="flex gap-3 mt-2">
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary/90 transition-all"
            >
              Back to My Orders
            </Link>
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs shadow-sm hover:bg-surface-container-highest transition-all"
            >
              Explore Food Bags
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract order properties gracefully from either Supabase schema row or Demo mock
  const isDemo = !isSupabaseConfigured() || !order.order_code;

  const orderCode = isDemo ? order.orderCode : order.order_code;
  const orderDate = isDemo
    ? order.placedAt
    : new Date(order.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

  const rawStatus = isDemo ? order.status : order.status; // 'placed', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'
  const subtotal = Number(isDemo ? order.subtotal : order.subtotal);
  const platformFee = Number(isDemo ? order.platformFee : order.platform_fee || 5);
  const platformTaxGst = Number((platformFee * 0.05).toFixed(2));
  const totalAmount = Number(isDemo ? order.totalAmount : order.total_amount);
  const totalSaved = Number(isDemo ? order.totalSaved : order.total_saved);
  const pickupWindow = isDemo ? order.pickupWindow : order.pickup_window;
  const customerName = isDemo ? order.pickupPersonName : order.pickup_person_name;
  const customerMobile = isDemo ? order.pickupPersonMobile : order.pickup_person_mobile;

  // Restaurant details
  const restaurantName = isDemo ? order.bag?.merchantName : order.restaurants?.name || 'Local Partner';
  const restaurantAddress = isDemo ? order.bag?.address : order.restaurants?.address || 'Greater Noida, UP';
  const locality = isDemo ? order.bag?.zone || 'Alpha 1' : order.restaurants?.locality || 'Greater Noida';
  const openingHours = isDemo ? '9:00 AM – 10:30 PM' : order.restaurants?.opening_hours || 'Store hours';
  const pickupInstructions = isDemo
    ? 'Collect at the main cashier desk. Present your pickup PIN or digital pass.'
    : order.restaurants?.pickup_instructions ||
      'Collect at the main store counter. Show your LEFTO pickup pass to the staff and collect your order.';

  // Bag items
  const items = isDemo
    ? [
        {
          id: order.bag?.id,
          title: order.bag?.title,
          quantity: 1,
          unitPrice: order.subtotal,
          originalPrice: order.bag?.originalPrice,
          imageUrl: order.bag?.imageUrl
        }
      ]
    : (order.order_items || []).map((it: any) => ({
        id: it.id,
        title: it.bag_title_snapshot,
        quantity: it.quantity,
        unitPrice: Number(it.unit_price_snapshot),
        originalPrice: Number(it.original_price_snapshot),
        imageUrl: it.cover_image_url || ''
      }));

  // Payment status
  const paymentRow = isDemo ? null : order.payments?.[0];
  const paymentStatus = isDemo
    ? 'authorized'
    : paymentRow?.status || (order.payment_method === 'pay_at_store_counter' ? 'pending' : 'authorized');
  const paymentMethod = isDemo ? 'UPI' : paymentRow?.payment_method || 'Store Counter';

  // Verification PIN
  const verificationRow = isDemo ? null : order.pickup_verifications?.[0];
  const pickupPin = isDemo ? order.pickupPin : verificationRow?.pickup_pin || '4892';
  const redemptionStatus = isDemo ? 'pending' : verificationRow?.redemption_status || 'pending';

  // Derive genuine lifecycle step (1 to 4)
  // Step 1: Placed (always reached)
  // Step 2: Payment verified/confirmed (paymentStatus in ['authorized', 'captured'] or acknowledged)
  // Step 3: Ready for pickup (only when rawStatus is 'ready_for_pickup' or 'completed')
  // Step 4: Pickup completed (rawStatus is 'completed' or redemptionStatus is 'verified')
  const isCancelled = rawStatus === 'cancelled';
  const isPaymentConfirmed = paymentStatus === 'authorized' || paymentStatus === 'captured';
  const isReady = rawStatus === 'ready_for_pickup' || rawStatus === 'completed';
  const isCompleted = rawStatus === 'completed' || redemptionStatus === 'verified';

  return (
    <div className="w-full bg-surface pb-20">
      <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
          <Link
            to="/orders"
            className="text-xs font-bold text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>All My Orders</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container transition-colors text-xs font-bold border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Print Invoice</span>
            </button>

            {!isCancelled && (
              <Link
                to="/order-confirmation"
                state={{
                  serverOrder: {
                    order_code: orderCode,
                    pickup_pin: pickupPin,
                    total_amount: totalAmount,
                    pickup_window: pickupWindow,
                    restaurant_name: restaurantName,
                    restaurant_address: restaurantAddress,
                    locality
                  }
                }}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary/90 transition-colors text-xs font-bold shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">qr_code</span>
                <span>Open Pickup Pass</span>
              </Link>
            )}
          </div>
        </div>

        {/* Title and Top Status Header */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-headline-lg text-2xl font-extrabold text-on-surface">
                Order #{orderCode}
              </h1>

              {isCancelled ? (
                <span className="px-3 py-1 rounded-full bg-error/10 text-error text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error"></span>
                  Cancelled
                </span>
              ) : isCompleted ? (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Pickup Completed
                </span>
              ) : isReady ? (
                <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  Ready For Pickup
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Order Placed & Stock Reserved
                </span>
              )}
            </div>

            <p className="text-xs text-on-surface-variant mt-1">
              Placed on {orderDate} • Customer Contact: {customerName} (+91 {customerMobile})
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-[11px] uppercase tracking-wider font-bold text-outline block">Total Payable</span>
            <span className="font-headline-lg text-2xl font-black text-on-surface">₹{totalAmount.toFixed(2)}</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mt-0.5">
              ₹{totalSaved.toFixed(0)} saved compared to reference value
            </span>
          </div>
        </div>

        {/* Cancellation Notice Banner (If cancelled) */}
        {isCancelled && (
          <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/30 text-error flex items-start gap-3">
            <span className="material-symbols-outlined text-xl mt-0.5 shrink-0">cancel</span>
            <div className="text-xs leading-relaxed flex-1">
              <strong className="block text-sm font-bold">This Order Was Cancelled</strong>
              <span>
                The reservation was cancelled and inventory has been released. If an online payment was authorized, an automated refund to the original payment source has been initiated.
              </span>
            </div>
          </div>
        )}

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Lifecycle Timeline, Ordered Bags, Help (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* SECTION 1: Clear Order Lifecycle Timeline */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-base text-on-surface font-bold">
                  Order Lifecycle & Transition State
                </h2>
                <span className="text-[11px] text-outline font-medium">
                  Verified by server action
                </span>
              </div>

              {/* 4-Step Honest Lifecycle */}
              <div className="py-2">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
                  
                  {/* Step 1: Order Placed */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/20">
                    <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">1. Order Placed</span>
                      <span className="text-[11px] text-primary font-medium">Stock reserved</span>
                    </div>
                  </div>

                  {/* Step 2: Payment Status */}
                  <div className={`flex items-start gap-3 p-3 rounded-2xl border ${
                    isPaymentConfirmed
                      ? 'bg-primary/5 border-primary/20'
                      : paymentStatus === 'pending'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-surface-container-low border-outline-variant/20'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm ${
                      isPaymentConfirmed
                        ? 'bg-primary text-on-primary'
                        : paymentStatus === 'pending'
                        ? 'bg-amber-500 text-white'
                        : 'bg-surface-container-high text-outline'
                    }`}>
                      {isPaymentConfirmed ? '✓' : '•'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">2. Payment</span>
                      <span className={`text-[11px] font-medium ${
                        isPaymentConfirmed ? 'text-primary' : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {isPaymentConfirmed ? 'Authorized' : 'Counter Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Step 3: Ready for Pickup (Only when verified by restaurant staff) */}
                  <div className={`flex items-start gap-3 p-3 rounded-2xl border ${
                    isReady
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-surface-container-low border-outline-variant/20 opacity-70'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm ${
                      isReady ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                    }`}>
                      {isReady ? '✓' : '3'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">3. Ready for Pickup</span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {isReady ? 'Ready at store' : 'Awaiting window'}
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Pickup Completed */}
                  <div className={`flex items-start gap-3 p-3 rounded-2xl border ${
                    isCompleted
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-surface-container-low border-outline-variant/20 opacity-70'
                  }`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm ${
                      isCompleted ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-outline'
                    }`}>
                      {isCompleted ? '✓' : '4'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-on-surface block">4. Collected</span>
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {isCompleted ? 'PIN verified' : 'Pending handover'}
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Customer Next Steps Advisory */}
              <div className="p-3.5 bg-surface-container-low rounded-2xl flex items-start gap-2.5 text-xs text-on-surface-variant leading-relaxed">
                <span className="material-symbols-outlined text-primary text-lg shrink-0 mt-0.5">info</span>
                <div>
                  <strong className="block text-on-surface font-bold">Customer Next Steps:</strong>
                  {isCompleted ? (
                    <span>This order has been verified and picked up. Thank you for rescuing surplus food!</span>
                  ) : isCancelled ? (
                    <span>This order is cancelled. No pickup is required.</span>
                  ) : paymentStatus === 'pending' ? (
                    <span>
                      Please arrive at <strong>{restaurantName}</strong> during your pickup window ({pickupWindow}) and complete payment of <strong>₹{totalAmount.toFixed(2)}</strong> at the restaurant counter.
                    </span>
                  ) : (
                    <span>
                      Visit <strong>{restaurantName}</strong> during your pickup window: <strong>{pickupWindow}</strong>. Present your 4-digit PIN (<strong>{pickupPin}</strong>) or pickup pass to staff upon arrival.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 2: Ordered Rescue Bags & Items */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <h2 className="font-headline-md text-base text-on-surface font-bold">
                  Ordered Rescue Bags ({items.length})
                </h2>
                <span className="text-xs text-outline font-medium">Surplus Food Reservation</span>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((it: any, index: number) => (
                  <div
                    key={it.id || index}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-surface-container overflow-hidden shrink-0 flex items-center justify-center text-outline">
                        {it.imageUrl ? (
                          <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-2xl">lunch_dining</span>
                        )}
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-on-surface block">
                          {it.title || 'Surplus Rescue Bag'}
                        </strong>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          {restaurantName} • {locality}
                        </p>
                        <span className="text-[11px] text-outline mt-1 block">
                          Quantity: {it.quantity} {it.quantity === 1 ? 'Box' : 'Boxes'}
                        </span>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <span className="font-headline-sm text-base font-black text-on-surface block">
                        ₹{(it.unitPrice * it.quantity).toFixed(2)}
                      </span>
                      {it.originalPrice > it.unitPrice && (
                        <span className="text-xs text-outline line-through">
                          ₹{(it.originalPrice * it.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 3: Support & Issue Resolution */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <h3 className="font-headline-md text-base text-on-surface font-bold">
                Need Help with this Order?
              </h3>
              <p className="text-xs text-on-surface-variant">
                Select an issue below for assistance from our Greater Noida local support team:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {['Pickup delayed', 'Store closed', 'Cancellation policy', 'Quality feedback'].map((issue) => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => handleIssueClick(issue)}
                    className="p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold text-center transition-colors border border-outline-variant/20 cursor-pointer"
                  >
                    {issue}
                  </button>
                ))}
              </div>

              {supportMessage && (
                <div className="p-3 bg-primary/10 text-primary rounded-xl text-xs font-medium mt-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{supportMessage}</span>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Pickup Details, Location & Complete Payment Breakdown (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">

            {/* CARD A: Pickup Location & Instructions */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                  Pickup Instructions
                </span>
                <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">
                  Self-Pickup
                </span>
              </div>

              <div>
                <strong className="text-sm font-bold text-on-surface block">{restaurantName}</strong>
                <p className="text-xs text-on-surface-variant leading-relaxed mt-0.5">
                  {restaurantAddress}
                </p>
                <span className="text-[11px] text-outline mt-1 block">Hours: {openingHours}</span>
              </div>

              {/* Pickup Window Highlight */}
              <div className="p-3 rounded-xl bg-primary/10 text-primary flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Pickup Window</span>
                <strong className="text-sm font-black">{pickupWindow}</strong>
              </div>

              <div className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low p-3 rounded-xl">
                <strong className="block text-on-surface mb-0.5 font-bold">Store Instructions:</strong>
                {pickupInstructions}
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(`${restaurantName} ${restaurantAddress}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary text-on-primary py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-primary/90 transition-all"
              >
                <span className="material-symbols-outlined text-sm">directions</span>
                <span>Directions on Google Maps</span>
              </a>
            </div>

            {/* CARD B: Secret Pickup PIN & Pass shortcut */}
            {!isCancelled && (
              <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-outline">Secret Pickup PIN</span>
                  <span className="text-xs font-bold text-primary">Required at counter</span>
                </div>

                <div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-outline block">Show to Staff</span>
                    <strong className="font-headline-lg text-2xl font-black text-primary tracking-widest">
                      {pickupPin}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPin(pickupPin)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedPin ? 'check' : 'content_copy'}
                    </span>
                    <span>{copiedPin ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* CARD C: Itemized Payment & Pricing Receipt */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <h3 className="font-headline-md text-sm text-on-surface font-bold pb-2 border-b border-outline-variant/20">
                Payment & Fee Receipt
              </h3>

              <div className="space-y-2 text-xs text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span>Rescue Item Subtotal</span>
                  <span className="text-on-surface font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>LEFTO Platform Fee</span>
                  <span className="text-on-surface font-semibold">₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Applicable GST (5% on Platform Fee)</span>
                  <span className="text-on-surface font-semibold">₹{platformTaxGst.toFixed(2)}</span>
                </div>

                {totalSaved > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <span>Surplus Savings Saved</span>
                    <span>-₹{totalSaved.toFixed(2)}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-baseline font-bold text-sm text-on-surface">
                  <span>Final Amount</span>
                  <span className="font-headline-lg text-lg font-black text-primary">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/10 text-[11px] text-outline flex flex-col gap-1">
                <span>Payment Method: {paymentMethod}</span>
                <span>Payment Status: <strong className="text-on-surface">{paymentStatus.toUpperCase()}</strong></span>
                <span>Receipt Identifier: #{orderCode}</span>
              </div>
            </div>

            {/* Back to Orders */}
            <Link
              to="/orders"
              className="text-center text-xs text-primary font-bold hover:underline py-1"
            >
              ← Back to All Orders
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
