import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Merchant } from '../types';
import { fetchRestaurantByIdOrSlug } from '../services/supabaseService';
import { RescueBagCard } from '../components/marketplace/RescueBagCard';

export const RestaurantProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bags' | 'about' | 'map' | 'reviews' | 'policies'>('bags');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchRestaurantByIdOrSlug(id || 'crust-and-co')
      .then((res) => {
        if (!isMounted) return;
        setMerchant(res.data);
        setError(res.error);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load restaurant');
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
        <p className="text-on-surface font-semibold">Loading restaurant profile...</p>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="w-full max-w-[1240px] mx-auto px-4 py-16 text-center">
        <span className="material-symbols-outlined text-4xl text-error mb-2">storefront</span>
        <h2 className="text-xl font-bold text-on-surface mb-2">Restaurant not found</h2>
        <p className="text-sm text-on-surface-variant mb-4">{error || 'This outlet may be closed or unverified.'}</p>
        <Link to="/explore" className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold text-sm">
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface pb-16">
      {/* 1. Hero Store Cover & Header */}
      <div className="relative w-full h-64 md:h-80 bg-surface-container-highest overflow-hidden">
        <img
          src={merchant.coverImage}
          alt={merchant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"></div>

        {/* Back Link Overlay */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-on-surface hover:bg-surface-container-lowest text-xs font-bold transition-all shadow-md"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Explorer</span>
          </Link>
        </div>
      </div>

      {/* 2. Store Info Floating Card */}
      <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop -mt-20 relative z-20">
        <div className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-xl border border-outline-variant/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start md:items-center gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-primary-container text-on-primary-container font-black text-2xl flex items-center justify-center shadow-md shrink-0 border-2 border-surface-container-lowest">
              <img
                src={merchant.logoImage}
                alt={merchant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display-hero text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
                  {merchant.name}
                </h1>
                {merchant.isVerified && (
                  <span
                    className="material-symbols-outlined text-primary text-xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    title="Verified LEFTO Partner"
                  >
                    verified
                  </span>
                )}
                <span className="font-label-badge text-xs px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
                  FSSAI Verified
                </span>
              </div>

              <p className="text-on-surface-variant font-body-md text-sm mt-0.5">
                {merchant.cuisineTags.join(' · ')} • {merchant.tagline}
              </p>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-2 flex-wrap">
                <div className="flex items-center gap-1 text-secondary font-bold">
                  <span
                    className="material-symbols-outlined text-amber-500 text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <span>{merchant.rating}</span>
                  <span className="text-outline font-normal">({merchant.ratingCount} reviews)</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-sm">location_on</span>
                  <span>{merchant.distance}</span>
                </div>

                <span>•</span>

                <div className="flex items-center gap-1 text-primary font-semibold">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>{merchant.typicalPickupWindow}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <a
              href="#rescue-bags"
              className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-button text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-base">shopping_bag</span>
              <span>View Bags ({merchant.availableBags.length})</span>
            </a>
          </div>
        </div>

        {/* 3. Tab Navigation Bar */}
        <div className="flex items-center gap-6 border-b border-outline-variant/30 mt-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'bags', label: `Rescue Bags (${merchant.availableBags.length})`, icon: 'shopping_bag' },
            { id: 'about', label: 'About & Surplus Story', icon: 'info' },
            { id: 'reviews', label: 'Rescuer Reviews', icon: 'star' },
            { id: 'policies', label: 'Pickup Policies', icon: 'verified_user' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3.5 font-headline-sm text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 4. Tab Content Panes */}
        <div className="mt-8 flex flex-col gap-10">
          {/* TAB: AVAILABLE BAGS */}
          {(activeTab === 'bags' || activeTab === 'about') && (
            <section id="rescue-bags" className="flex flex-col gap-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-lg text-xl md:text-2xl text-on-surface font-bold">
                    Available Rescue Bags Today
                  </h2>
                  <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
                    Fresh batches prepped today. Reserved online, picked up at counter.
                  </p>
                </div>
              </div>

              {merchant.availableBags.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {merchant.availableBags.map((bag) => (
                    <RescueBagCard key={bag.id} bag={bag} />
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container-low p-8 rounded-2xl text-center">
                  <p className="text-on-surface font-semibold">No active surplus bags at this moment.</p>
                  <p className="text-on-surface-variant text-xs mt-1">Please check back in the evening during the closing prep.</p>
                </div>
              )}
            </section>
          )}

          {/* TAB: ABOUT & WHY PARTNER */}
          {(activeTab === 'about' || activeTab === 'bags') && (
            <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-headline-md text-xl text-on-surface font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">restaurant</span>
                  <span>About {merchant.name}</span>
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4">
                  {merchant.about}
                </p>
                <div className="p-4 rounded-2xl bg-surface-container-low flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                  <div>
                    <span className="font-headline-sm text-xs font-bold text-on-surface block">
                      FSSAI Food Safety License
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      License #{merchant.fssaiNumber} • 100% Hygienic packaging
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-headline-md text-xl text-on-surface font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">eco</span>
                  <span>Why We Partner with LEFTO</span>
                </h3>
                <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4">
                  {merchant.whyPartner}
                </p>
                <div className="p-4 rounded-2xl bg-secondary-fixed/30 text-on-secondary-fixed flex items-center gap-3">
                  <span className="material-symbols-outlined text-2xl">recycling</span>
                  <div>
                    <span className="font-headline-sm text-xs font-bold block">
                      Local Impact in Greater Noida
                    </span>
                    <span className="font-body-sm text-xs">
                      Over 1,200 meals saved and 1.6 tonnes of CO₂e emissions prevented to date.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB: REVIEWS */}
          {(activeTab === 'reviews' || activeTab === 'bags') && (
            <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 flex flex-col gap-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-headline-md text-xl text-on-surface font-bold">
                    Verified Customer Reviews
                  </h3>
                  <p className="font-body-sm text-sm text-on-surface-variant mt-0.5">
                    Reviews from foodies who rescued meals at {merchant.name}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2.5 rounded-2xl shrink-0">
                  <div className="flex items-center gap-1 text-2xl font-black text-on-surface">
                    <span className="material-symbols-outlined text-amber-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span>{merchant.rating}</span>
                  </div>
                  <div className="text-xs text-on-surface-variant leading-tight">
                    <span className="font-bold block">100% Verified</span>
                    <span>{merchant.ratingCount} rescuer ratings</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'rev-1',
                    authorName: 'Priya Sharma',
                    rating: 5,
                    date: 'Yesterday',
                    text: 'Rescued the pizza box last night. Got 3 fresh slices of sourdough margherita and 4 garlic breadsticks still warm! Unbelievable value for ₹249.'
                  },
                  {
                    id: 'rev-2',
                    authorName: 'Arjun Nambiar',
                    rating: 5,
                    date: '3 days ago',
                    text: 'Super quick counter pickup. Walked into the Alpha 1 outlet, gave my 4-digit PIN, and got my freshly packed box in 30 seconds.'
                  },
                  {
                    id: 'rev-3',
                    authorName: 'Kavita Roy',
                    rating: 4,
                    date: 'Last week',
                    text: 'Great food quality. 100% genuine restaurant surplus and hygienic packaging.'
                  }
                ].map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-2xl bg-surface-container-low/70 flex flex-col justify-between gap-3 border border-outline-variant/20"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-headline-sm text-sm font-bold text-on-surface">
                          {rev.authorName}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <span
                              key={i}
                              className="material-symbols-outlined text-xs"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                        "{rev.text}"
                      </p>
                    </div>
                    <span className="text-[11px] text-outline">{rev.date}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB: POLICIES */}
          {(activeTab === 'policies' || activeTab === 'bags') && (
            <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <h3 className="font-headline-md text-xl text-on-surface font-bold">
                Pickup & Food Rescue Policies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-on-surface-variant leading-relaxed">
                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface mb-1">
                    Strict Pickup Window Policy
                  </h4>
                  <p>
                    Because meals are packaged at the end of the evening kitchen shift, bags cannot be stored overnight.
                    Orders not collected by 10:00 PM are discarded for hygiene reasons and cannot be refunded.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-surface-container-low">
                  <h4 className="font-headline-sm text-sm font-bold text-on-surface mb-1">
                    Cancellation Guarantee
                  </h4>
                  <p>
                    Free cancellation is allowed up to 2 hours before the scheduled window begins. If the kitchen runs out
                    of surplus early, an instant 100% refund is initiated back to your original payment mode.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
