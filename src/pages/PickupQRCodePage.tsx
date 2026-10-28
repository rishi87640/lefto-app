import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import QRCode from 'qrcode';
import { fetchOrderDetailsByIdOrCode } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { DEMO_ACTIVE_ORDER } from '../data/mockData';

export const PickupQRCodePage: React.FC = () => {
  const { id: paramId } = useParams<{ id: string }>();
  const location = useLocation();
  const locationState = location.state || {};

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedPin, setCopiedPin] = useState(false);

  // Preferred identifier from route param, navigation state, or fallback
  const lookupIdentifier =
    paramId ||
    locationState.serverOrder?.order_code ||
    locationState.serverOrder?.order_id ||
    locationState.orderCode ||
    locationState.orderId;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured()) {
      // In local preview/demo mode without database credentials
      setOrder(DEMO_ACTIVE_ORDER);
      setLoading(false);
      return;
    }

    if (!lookupIdentifier) {
      // If no order identifier was provided, do not fabricate a fake pass
      setError('No order specified. Please open your pickup pass from your confirmed orders.');
      setLoading(false);
      return;
    }

    fetchOrderDetailsByIdOrCode(lookupIdentifier)
      .then((res) => {
        if (!isMounted) return;
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setOrder(res.data);
        } else {
          setError('Order pass not found or not accessible.');
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Error loading pickup pass');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lookupIdentifier]);

  // Generate the high-contrast QR code safely when order is loaded
  useEffect(() => {
    if (!order) return;

    // Security requirement:
    // Only encode non-sensitive verification metadata (order_id, order_code, expires_at token).
    // NEVER encode personal customer phone numbers, names, or payment details.
    const isDemo = !isSupabaseConfigured() || !order.order_code;
    const orderId = isDemo ? order.orderId || 'demo-order-1' : order.id;
    const orderCode = isDemo ? order.orderCode : order.order_code;
    const verification = isDemo ? null : order.pickup_verifications?.[0];

    const qrPayload = JSON.stringify({
      schema: 'LEFTO_PASS_V1',
      orderId,
      orderCode,
      restaurantId: isDemo ? order.bag?.merchantId : order.restaurant_id,
      expiresAt: verification?.expires_at || new Date(Date.now() + 12 * 3600 * 1000).toISOString()
    });

    QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 320,
      color: {
        dark: '#052e16', // Forest green / dark high-contrast
        light: '#ffffff'
      }
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate high-contrast QR code:', err);
      });
  }, [order]);

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2500);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 bg-surface">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-on-surface-variant font-medium mt-3">
          Loading secure pickup token...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-4 bg-surface">
        <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-xl border border-outline-variant/30 text-center flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">qr_code_2</span>
          </div>
          <h2 className="font-headline-md text-xl font-black text-on-surface">
            Pickup Pass Unavailable
          </h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {error || 'Could not verify a valid pickup pass for this order.'}
          </p>
          <div className="flex flex-col gap-2 w-full mt-2">
            <Link
              to="/orders"
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow hover:bg-primary/90 transition-all text-center"
            >
              Go to My Orders
            </Link>
            <Link
              to="/explore"
              className="w-full py-2 rounded-xl text-on-surface-variant hover:text-primary font-semibold text-xs text-center"
            >
              Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Derive order fields
  const isDemo = !isSupabaseConfigured() || !order.order_code;
  const orderCode = isDemo ? order.orderCode : order.order_code;
  const restaurantName = isDemo ? order.bag?.merchantName : order.restaurants?.name || 'Local Restaurant';
  const pickupWindow = isDemo ? order.pickupWindow : order.pickup_window;
  const rawStatus = isDemo ? order.status : order.status; // 'placed', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled'

  const verification = isDemo ? null : order.pickup_verifications?.[0];
  const pickupPin = isDemo ? order.pickupPin : verification?.pickup_pin || '4892';
  const redemptionStatus = isDemo ? 'pending' : verification?.redemption_status || 'pending';
  const expiresAtStr = isDemo ? null : verification?.expires_at;

  const isExpired = expiresAtStr ? new Date() > new Date(expiresAtStr) : false;
  const isCollected = rawStatus === 'completed' || redemptionStatus === 'verified';
  const isCancelled = rawStatus === 'cancelled';
  const isReady = rawStatus === 'ready_for_pickup' || (!isCollected && !isCancelled && !isExpired);

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-center p-4 bg-surface py-8">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col items-center text-center gap-4 animate-fade-in">
        
        {/* Top Header */}
        <div className="flex items-center justify-between w-full pb-2 border-b border-outline-variant/20">
          <Link
            to={orderCode ? `/order/${orderCode}` : '/orders'}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
            title="Back to Order"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <span className="font-headline-sm text-xs font-bold uppercase tracking-wider text-primary">
            Storefront Pickup Pass
          </span>
          <div className="w-6"></div>
        </div>

        {/* Store & Order Header */}
        <div>
          <h1 className="font-headline-md text-xl text-on-surface font-extrabold tracking-tight">
            {restaurantName}
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Pickup Window: <strong className="text-on-surface font-bold">{pickupWindow}</strong>
          </p>
        </div>

        {/* Actual Backend State Status Pill */}
        {isCancelled ? (
          <div className="w-full p-2.5 rounded-xl bg-error/10 border border-error/30 text-error text-xs font-bold flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-base">cancel</span>
            <span>Order Cancelled (Pass Void)</span>
          </div>
        ) : isCollected ? (
          <div className="w-full p-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>Collected • Verified by Store</span>
          </div>
        ) : isExpired ? (
          <div className="w-full p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-base">timer_off</span>
            <span>Pass Expired</span>
          </div>
        ) : (
          <div className="w-full p-2.5 rounded-xl bg-secondary-fixed text-on-secondary-fixed text-xs font-bold flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span>Ready to Collect</span>
          </div>
        )}

        {/* ONE LARGE, READABLE QR CODE (High Contrast for outdoors) */}
        <div className="p-4 bg-white rounded-3xl shadow-lg border-2 border-primary/20 flex flex-col items-center justify-center w-full max-w-[280px] aspect-square relative overflow-hidden">
          {isCancelled || isCollected || isExpired ? (
            <div className="flex flex-col items-center justify-center p-4 text-center h-full">
              <span className="material-symbols-outlined text-5xl text-outline mb-2">
                {isCollected ? 'task_alt' : isCancelled ? 'block' : 'history_toggle_drop_down'}
              </span>
              <strong className="text-sm font-bold text-on-surface">
                {isCollected ? 'Pass Already Redeemed' : isCancelled ? 'Pass Voided' : 'Pass Expired'}
              </strong>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                {isCollected
                  ? 'This surplus bag was collected and verified at the restaurant counter.'
                  : 'This code is no longer valid for store handover.'}
              </p>
            </div>
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Pickup QR Code for ${orderCode}`}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        {/* Short Order Reference Fallback */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-outline font-medium">Order Reference:</span>
          <span className="font-mono text-sm font-black text-on-surface bg-surface-container px-2.5 py-0.5 rounded-md">
            #{orderCode}
          </span>
        </div>

        {/* 4-Digit Manual Backup PIN Card */}
        {!isCancelled && !isCollected && (
          <div className="w-full p-3 bg-surface-container-low rounded-2xl flex items-center justify-between px-4 border border-outline-variant/20">
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-outline block">
                Manual Counter PIN
              </span>
              <p className="font-headline-md text-2xl font-black text-primary tracking-widest leading-none mt-0.5">
                {pickupPin}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopyPin(pickupPin)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest text-xs font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1 shadow-sm"
              title="Copy PIN"
            >
              <span className="material-symbols-outlined text-sm">
                {copiedPin ? 'check' : 'content_copy'}
              </span>
              <span>{copiedPin ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Clear Instruction Required by Customer */}
        <div className="w-full p-3.5 bg-primary/10 rounded-2xl text-xs text-on-surface font-medium leading-relaxed text-left flex items-start gap-2.5">
          <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">storefront</span>
          <span>
            <strong>Instruction:</strong> “Show this code to restaurant staff when collecting your order.” Staff will scan or enter your 4-digit PIN to release the bag.
          </span>
        </div>

        {/* Outdoor readability brightness tip */}
        <p className="text-[11px] text-outline flex items-center gap-1">
          <span className="material-symbols-outlined text-sm text-amber-600">brightness_high</span>
          <span>Turn screen brightness up when scanning outdoors or at counter.</span>
        </p>

        {/* Navigation Action */}
        <Link
          to={orderCode ? `/order/${orderCode}` : '/orders'}
          className="w-full bg-primary text-on-primary font-bold text-xs py-3 rounded-xl transition-all shadow hover:bg-primary/90 text-center"
        >
          View Full Order Details
        </Link>
      </div>
    </div>
  );
};
