import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_ACTIVE_ORDER } from '../data/mockData';
import { StatusBadge } from '../components/common/StatusBadge';

export const OrdersPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const activeOrder = DEMO_ACTIVE_ORDER;

  const pastOrder = {
    id: 'order-lft19240',
    orderCode: 'LFT19240',
    bagTitle: 'Surprise Artisan Bakery Bag',
    merchantName: 'Midnight Bakery',
    merchantZone: 'Knowledge Park III',
    amount: 159,
    saved: 240,
    placedAt: '12 Oct 2025, 9:15 PM',
    status: 'completed' as const,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR8_wWamnpPzTjQQ6OacLODUASp8C4wkORZcwjkUhDBaE_HSluLTQRx_0pnpv1Ba2sKMyTuAmcKrK3DanGrIWkWXUyXcdMrUX4nvlPiN1OVItykppZ8RF-Fk7nhGVMY9vCLP7DbNPMhNa5hCY1vvHqWqbewejBZNoZRICGMHqMWZd9U2vGBouPYP8bf6WlZT4eVZEU5kWewTL667gcLOaPNmx4fbqP1tK17jwQLkjjpy2Puho_IKMK0w'
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-8 flex flex-col gap-6">
      {/* Title & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface font-extrabold tracking-tight">
            My Rescue Orders
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
            Track active pickups and view past environmental savings in Greater Noida
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Orders (2)
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'active'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Active (1)
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'completed'
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Completed (1)
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-4">
        {/* Active Order Card */}
        {(filter === 'all' || filter === 'active') && (
          <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border-2 border-primary/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-surface-container">
                <img src={activeOrder.bag.imageUrl} alt={activeOrder.bag.title} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-outline font-bold">#{activeOrder.orderCode}</span>
                  <StatusBadge status={activeOrder.status} />
                  <span className="text-[11px] text-secondary font-bold">Pickup tonight 9:30 PM</span>
                </div>

                <h3 className="font-headline-md text-base text-on-surface font-bold mt-1">
                  {activeOrder.bag.title}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {activeOrder.bag.merchantName} • Alpha 1, Greater Noida
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="font-price-hero text-sm font-black text-primary">₹{activeOrder.totalAmount}</span>
                  <span className="text-xs text-outline">• Placed {activeOrder.placedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Link
                to="/order-confirmation"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold text-center shadow-sm flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">qr_code</span>
                <span>Open Pickup Pass</span>
              </Link>
              <Link
                to={`/order/${activeOrder.orderCode}`}
                className="px-3.5 py-2.5 rounded-xl bg-surface-container text-on-surface text-xs font-bold text-center hover:bg-surface-container-high transition-colors"
              >
                Receipt
              </Link>
            </div>
          </div>
        )}

        {/* Past Completed Order */}
        {(filter === 'all' || filter === 'completed') && (
          <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-surface-container opacity-85">
                <img src={pastOrder.imageUrl} alt={pastOrder.bagTitle} className="w-full h-full object-cover" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-outline font-bold">#{pastOrder.orderCode}</span>
                  <StatusBadge status="completed" />
                </div>

                <h3 className="font-headline-md text-base text-on-surface font-bold mt-1">
                  {pastOrder.bagTitle}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {pastOrder.merchantName} • {pastOrder.merchantZone}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="font-price-hero text-sm font-black text-on-surface">₹{pastOrder.amount}</span>
                  <span className="text-xs text-primary font-bold">(Saved ₹{pastOrder.saved})</span>
                  <span className="text-xs text-outline">• {pastOrder.placedAt}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <Link
                to="/bag/artisan-bakery-box"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold text-center transition-colors border border-outline-variant/30"
              >
                Rescue Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
