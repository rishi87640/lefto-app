import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchOrderDetailsByIdOrCode } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

export const PickupPassPage: React.FC = () => {
  const location = useLocation();
  const locationState = location.state || {};
  const serverOrder = locationState.serverOrder;

  const [loading, setLoading] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showPassModal, setShowPassModal] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // If order was created in this session, we have locationState.serverOrder or locationState.orderCode
  const orderCodeFromState = serverOrder?.order_code || locationState.orderCode;
  const orderIdFromState = serverOrder?.order_id || serverOrder?.id || locationState.orderId;

  useEffect(() => {
    // If order was placed and we have a reference or we want to re-verify from backend
    const identifier = orderIdFromState || orderCodeFromState;
    if (identifier && isSupabaseConfigured()) {
      setLoading(true);
      fetchOrderDetailsByIdOrCode(identifier)
        .then((res) => {
          if (res.data) {
            setFetchedOrder(res.data);
          } else if (res.error) {
            setFetchError(res.error);
          }
        })
        .catch((err) => setFetchError(err.message))
        .finally(() => setLoading(false));
    }
  }, [orderIdFromState, orderCodeFromState]);

  // If no order data exists in state AND Supabase is live, do not fabricate a fake order!
  const hasOrderData = Boolean(serverOrder || locationState.orderCode || fetchedOrder);

  if (!hasOrderData && isSupabaseConfigured()) {
    return (
      <div className="w-full bg-surface py-20 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-6 text-center flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
            <span className="material-symbols-outlined text-4xl">search_off</span>
          </div>
          <h2 className="font-headline-lg text-2xl font-black text-on-surface">
            No Active Order Found
          </h2>
          <p className="text-sm text-on-surface-variant max-w-sm">
            We couldn't find a recently confirmed order. If you recently placed an order, you can check your order history.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full justify-center">
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-bold text-xs shadow-sm transition-all text-center"
            >
              Go to Order History
            </Link>
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary/90 transition-all text-center"
            >
              Explore Surplus Food
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fallback demo values if running without configured database in preview mode
  const orderCode =
    fetchedOrder?.order_code ||
    serverOrder?.order_code ||
    locationState.orderCode ||
    'LFT-48291';

  const orderId =
    fetchedOrder?.id ||
    serverOrder?.order_id ||
    serverOrder?.id ||
    locationState.orderId ||
    orderCode;

  const pickupPin =
    fetchedOrder?.pickup_verifications?.[0]?.pickup_pin ||
    serverOrder?.pickup_pin ||
    locationState.pickupPin ||
    '4892';

  const pickupPassCode =
    fetchedOrder?.pickup_verifications?.[0]?.pickup_pass_code ||
    serverOrder?.pickup_pass_code ||
    locationState.pickupPassCode ||
    'PASS-LEFTO';

  const restaurantName =
    fetchedOrder?.restaurants?.name ||
    serverOrder?.restaurant_name ||
    locationState.bag?.merchantName ||
    'Crust & Co.';

  const restaurantAddress =
    fetchedOrder?.restaurants?.address ||
    serverOrder?.restaurant_address ||
    locationState.bag?.address ||
    'Shop 14, Ground Floor, Central Market, Alpha 1, Greater Noida';

  const locality =
    fetchedOrder?.restaurants?.locality ||
    serverOrder?.locality ||
    locationState.bag?.zone ||
    'Alpha 1';

  const pickupWindow =
    fetchedOrder?.pickup_window ||
    serverOrder?.pickup_window ||
    locationState.bag?.pickupWindow ||
    'Tonight, 9:30 PM – 10:00 PM';

  const bagTitle =
    fetchedOrder?.order_items?.[0]?.bag_title_snapshot ||
    locationState.bag?.title ||
    'End-of-Day Gourmet Pizza Box';

  const bagQuantity =
    fetchedOrder?.order_items?.[0]?.quantity ||
    locationState.quantity ||
    1;

  const totalAmount =
    Number(fetchedOrder?.total_amount || serverOrder?.total_amount || locationState.totalAmount || 259);

  const paymentStatus =
    fetchedOrder?.payments?.[0]?.status ||
    (locationState.paymentMethod === 'pay_at_store_counter' ? 'pending_store_counter' : 'authorized');

  const paymentMethodLabel =
    locationState.paymentMethod === 'pay_at_store_counter'
      ? 'Pay at Restaurant Counter'
      : locationState.paymentMethod === 'sandbox_test_mode'
      ? 'Sandbox Test Mode'
      : 'Online Authorization';

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pickupPin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  return (
    <div className="w-full bg-surface pb-20">
      <div className="w-full max-w-[840px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet pt-8">
        
        {/* Navigation Breadcrumb / Quick Back */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-6">
          <Link
            to="/orders"
            className="text-xs font-bold text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>All My Orders</span>
          </Link>

          <Link
            to="/explore"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Return to Marketplace</span>
            <span className="material-symbols-outlined text-sm">storefront</span>
          </Link>
        </div>

        {/* 1. Clear Confirmation Banner */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-3xl font-black">check</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
            Order Confirmed & Stock Locked
          </span>

          <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
            Order Reference: {orderCode}
          </h1>

          <p className="font-body-md text-xs md:text-sm text-on-surface-variant max-w-lg">
            Your meal is reserved and safely locked with our restaurant partner.
          </p>

          {/* Suggested Pickup Instruction Banner */}
          <div className="w-full mt-2 p-4 rounded-2xl bg-primary-fixed/20 border border-primary/20 text-on-surface text-left flex items-start gap-3">
            <span className="material-symbols-outlined text-xl text-primary shrink-0 mt-0.5">info</span>
            <div className="text-xs md:text-sm leading-relaxed">
              <strong className="block font-bold text-primary mb-0.5">How to collect your food:</strong>
              “Visit the restaurant during your pickup window. Show your LEFTO pickup pass to the staff and collect your order.”
            </div>
          </div>
        </div>

        {/* 2. Key Order & Pickup Summary Card */}
        <div className="mt-6 bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 flex flex-col gap-6">
          <h2 className="font-headline-md text-base text-on-surface font-bold pb-2 border-b border-outline-variant/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">receipt</span>
            <span>Pickup & Reservation Details</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant & Address */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-outline">
                Restaurant & Pickup Address
              </span>
              <strong className="text-base text-on-surface font-bold flex items-center gap-1.5">
                <span>{restaurantName}</span>
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </strong>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {restaurantAddress}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${restaurantName} ${restaurantAddress}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-xs">directions</span>
                  <span>Get Directions</span>
                </a>
                <span className="text-outline text-xs">•</span>
                <span className="text-[11px] text-outline">Locality: {locality}</span>
              </div>
            </div>

            {/* Pickup Date & Exact Window */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-outline">
                Pickup Window
              </span>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-xl text-primary font-bold text-sm w-fit">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>{pickupWindow}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-1">
                Please collect strictly within this schedule as surplus items are freshly assembled at closing.
              </p>
            </div>

            {/* Ordered Bags & Quantities */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-outline">
                Ordered Rescue Bag
              </span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div>
                  <strong className="text-xs md:text-sm font-bold text-on-surface block">
                    {bagTitle}
                  </strong>
                  <span className="text-[11px] text-on-surface-variant">
                    Quantity: {bagQuantity} {bagQuantity === 1 ? 'Surplus Bag' : 'Surplus Bags'}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-surface-container text-xs font-bold text-on-surface">
                  Qty: {bagQuantity}
                </span>
              </div>
            </div>

            {/* Payment Status & Amount */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-outline">
                Payment Status
              </span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low">
                <div>
                  <div className="flex items-center gap-2">
                    {paymentStatus === 'pending_store_counter' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Pending (Pay at Counter)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Authorized / Confirmed
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-on-surface-variant block mt-1">
                    Method: {paymentMethodLabel}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-outline block">Total</span>
                  <strong className="text-base font-black text-on-surface">₹{totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Action Buttons: View Pickup Pass & Open Full Order Details */}
          <div className="pt-4 border-t border-outline-variant/20 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setShowPassModal(true)}
              className="flex-1 bg-primary text-on-primary py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">qr_code_2</span>
              <span>View Pickup Pass (PIN: {pickupPin})</span>
            </button>

            <Link
              to={`/order/${orderCode}`}
              className="flex-1 bg-surface-container hover:bg-surface-container-high text-on-surface py-3.5 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors text-center"
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>Open Full Order Details</span>
            </Link>
          </div>
        </div>

        {/* 4. Quick Return Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <Link
            to="/orders"
            className="hover:text-primary font-bold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">history</span>
            <span>View All Previous & Active Orders</span>
          </Link>

          <Link
            to="/explore"
            className="text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>Rescue More Surplus Food in Greater Noida</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* 5. Pickup Pass Interactive Modal / Drawer */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <span className="font-bold text-xs uppercase tracking-wider text-primary">
                LEFTO Pickup Pass
              </span>
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-outline hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div>
              <h3 className="font-headline-md text-base text-on-surface font-black">
                {restaurantName}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Pass Code: <strong className="text-primary">{pickupPassCode}</strong>
              </p>
            </div>

            {/* QR Code Presentation */}
            <div className="bg-surface-container-low p-4 rounded-2xl flex flex-col items-center justify-center border border-outline-variant/20">
              <Link to="/qr-code">
                <img
                  src="/src/assets/qr-pattern.svg"
                  alt="Pickup Pass QR"
                  className="w-40 h-40 object-contain hover:scale-105 transition-transform"
                />
              </Link>
              <span className="text-[11px] font-mono font-bold text-outline mt-1.5">
                #{orderCode}
              </span>
            </div>

            {/* 4-digit PIN */}
            <div className="p-3 rounded-2xl bg-surface-container flex items-center justify-between px-4 border border-outline-variant/20">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-outline block">Secret Pickup PIN</span>
                <strong className="text-2xl font-black text-primary tracking-widest">{pickupPin}</strong>
              </div>
              <button
                type="button"
                onClick={handleCopyPin}
                className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">
                  {copiedPin ? 'check' : 'content_copy'}
                </span>
                <span>{copiedPin ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Show this pass to the staff during: <strong>{pickupWindow}</strong>
            </p>

            <button
              type="button"
              onClick={() => setShowPassModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary/90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
