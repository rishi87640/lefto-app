import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RescueBag } from '../types';
import { fetchRescueBags } from '../services/supabaseService';
import { RescueBagCard } from '../components/marketplace/RescueBagCard';
import { useLocation } from '../context/LocationContext';

export const HomePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bags, setBags] = useState<RescueBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedZone } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchRescueBags({ zone: selectedZone })
      .then((res) => {
        if (!isMounted) return;
        setBags(res.data);
        setError(res.error);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load rescue bags');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedZone]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm) query.append('search', searchTerm);
    if (selectedCategory !== 'all') query.append('category', selectedCategory);
    navigate(`/explore?${query.toString()}`);
  };

  const previewBag1 = bags[1] || bags[0];
  const previewBag2 = bags[2] || bags[0];

  return (
    <div className="flex flex-col w-full">
      {/* Top Subtle Notification Pill — data-driven, no hardcoded inventory claims */}
      <div className="w-full bg-surface-container-high py-2 px-layout-margin-mobile md:px-layout-margin-desktop text-center">
        <div className="max-w-[1240px] mx-auto flex items-center justify-center gap-2">
          {bags.length > 0 ? (
            <>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary text-xs">
                ⚡
              </span>
              <span className="font-body-sm text-body-sm text-on-surface">
                <strong>{bags.length} Rescue {bags.length === 1 ? 'Bag' : 'Bags'}</strong>{' '}
                available now in {selectedZone}
              </span>
              <span className="hidden sm:inline-block text-outline-variant">•</span>
              <Link
                to="/explore"
                className="hidden sm:inline-flex items-center gap-0.5 font-label-button text-body-sm text-primary hover:underline"
              >
                <span>Browse deals</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </>
          ) : !loading ? (
            <>
              <span className="material-symbols-outlined text-primary text-sm">storefront</span>
              <span className="font-body-sm text-body-sm text-on-surface">
                Are you a restaurant in Greater Noida?{' '}
                <Link to="/become-a-partner" className="text-primary font-semibold hover:underline">
                  Partner with LEFTO
                </Link>{' '}
                and list your surplus food.
              </span>
            </>
          ) : (
            <span className="font-body-sm text-body-sm text-on-surface-variant">Loading available bags…</span>
          )}
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop pt-8 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Hero Left Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant mb-4">
              <span className="material-symbols-outlined text-sm">eco</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider font-bold">
                Surplus Food Rescue • Greater Noida
              </span>
            </div>

            <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight mb-4">
              Good Food.{' '}
              <span className="text-primary">Better Prices.</span>
              <br className="hidden sm:inline" />
              Less Waste.
            </h1>

            {/* Two-sided value proposition */}
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl mb-8 leading-relaxed">
              Customers discover quality surplus food at deeply discounted prices.
              Restaurant partners earn extra revenue from food that would otherwise go unsold.
              Everyone wins — and the planet does too.
            </p>

            {/* Big Hero Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="w-full bg-surface-container-lowest rounded-2xl p-2.5 shadow-xl mb-6 border border-outline-variant/30"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-2 px-3 flex-1">
                  <span className="material-symbols-outlined text-primary text-xl shrink-0">search</span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search restaurants, cafés, bakeries or food..."
                    className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/60 font-body-md text-body-md focus:outline-none"
                  />
                </div>

                <div className="h-6 w-px bg-surface-container-highest hidden sm:block"></div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-xl shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-base">tune</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-on-surface font-body-sm text-body-sm focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all">All Food Types</option>
                    <option value="Bakeries">Bakeries & Breads</option>
                    <option value="Full Meals">Full Meals & Thalis</option>
                    <option value="Pizza">Pizza & Italian</option>
                    <option value="Snacks">Snacks & Street Food</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-container text-on-primary font-label-button text-label-button px-6 py-3 rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Find Food</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              </div>
            </form>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <a
                href="#rescue-grid"
                className="bg-primary hover:bg-primary-container text-on-primary font-label-button text-label-button px-6 py-3.5 rounded-full inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                <span>Explore Leftovers</span>
                <span className="material-symbols-outlined text-base">arrow_downward</span>
              </a>

              <Link
                to="/become-a-partner"
                className="bg-surface-container-low hover:bg-surface-container text-on-surface font-label-button text-label-button px-6 py-3.5 rounded-full inline-flex items-center gap-2 transition-colors border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-lg text-secondary">storefront</span>
                <span>Become a Partner</span>
              </Link>
            </div>

            {/* Value / Trust Line */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-on-surface-variant">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">verified</span>
                <span className="font-body-sm text-body-sm">Save up to 70% money</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">eco</span>
                <span className="font-body-sm text-body-sm">Reduce urban food waste</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">store</span>
                <span className="font-body-sm text-body-sm">Support local businesses</span>
              </div>
            </div>
          </div>

          {/* Hero Right Dynamic Preview Card */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary-fixed/30 via-secondary-fixed/20 to-tertiary-fixed/30 rounded-3xl blur-2xl -z-10"></div>
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xl relative overflow-hidden border border-outline-variant/20">
              {/* Live Header Status */}
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 bg-surface-container-low -mx-6 -mt-6 p-6">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    {bags.length > 0 ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary-container"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-outline-variant"></span>
                    )}
                  </span>
                  <div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-tight font-bold">
                      {bags.length > 0 ? 'Live Rescues Active' : 'Marketplace Preview'}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {selectedZone}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {bags.length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-badge text-label-badge font-bold">
                      {bags.length} Available Now
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-badge text-label-badge">
                      Coming soon
                    </span>
                  )}
                </div>
              </div>

              {/* Featured Mini Cards inside Hero Widget — only shown when real bags exist */}
              <div className="space-y-3 mb-5">
                {loading ? (
                  // Skeleton placeholders while fetching
                  [1, 2].map((i) => (
                    <div key={i} className="p-3 bg-surface-container-low rounded-2xl flex items-center gap-3 animate-pulse">
                      <div className="w-16 h-16 rounded-xl bg-surface-container shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-surface-container rounded w-3/4" />
                        <div className="h-3 bg-surface-container rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : previewBag1 ? (
                  <>
                    <Link
                      to={`/bag/${previewBag1.slug || previewBag1.id}`}
                      className="p-3 bg-surface-container-low rounded-2xl flex items-center gap-3 transition-transform hover:scale-[1.01] block"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-surface-container">
                        <img
                          src={previewBag1.imageUrl}
                          alt={previewBag1.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-headline-sm text-body-md text-on-surface font-semibold truncate">
                            {previewBag1.title}
                          </span>
                          <span className="font-label-badge text-label-badge px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary font-bold">
                            Save {previewBag1.savingsPercent}%
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          {previewBag1.merchantName} • {previewBag1.distance}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-headline-sm text-headline-sm text-primary font-bold">
                              ₹{previewBag1.rescuePrice}
                            </span>
                            <span className="font-price-strikethrough text-price-strikethrough text-outline line-through">
                              ₹{previewBag1.originalPrice}
                            </span>
                          </div>
                          <span className="font-body-sm text-body-sm text-secondary font-medium">
                            Only {previewBag1.stockLeft} left
                          </span>
                        </div>
                      </div>
                    </Link>

                    {previewBag2 && (
                      <Link
                        to={`/bag/${previewBag2.slug || previewBag2.id}`}
                        className="p-3 bg-surface-container-low rounded-2xl flex items-center gap-3 transition-transform hover:scale-[1.01] block"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-surface-container">
                          <img
                            src={previewBag2.imageUrl}
                            alt={previewBag2.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 truncate">
                              <span className="w-2 h-2 rounded-sm bg-primary shrink-0"></span>
                              <span className="font-headline-sm text-body-md text-on-surface font-semibold truncate">
                                {previewBag2.title}
                              </span>
                            </div>
                            <span className="font-label-badge text-label-badge px-1.5 py-0.5 rounded bg-primary text-on-primary font-bold">
                              {previewBag2.dietaryType === 'pure_veg' ? 'Pure Veg' : 'Surplus'}
                            </span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                            {previewBag2.merchantName} • {previewBag2.distance}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-headline-sm text-headline-sm text-primary font-bold">
                                ₹{previewBag2.rescuePrice}
                              </span>
                              <span className="font-price-strikethrough text-price-strikethrough text-outline line-through">
                                ₹{previewBag2.originalPrice}
                              </span>
                            </div>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">
                              {previewBag2.stockLeft} bags left
                            </span>
                          </div>
                        </div>
                      </Link>
                    )}
                  </>
                ) : (
                  // Empty-state inside the hero preview card
                  <div className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-40">
                      <rect x="8" y="16" width="32" height="26" rx="8" stroke="#00652C" strokeWidth="2" />
                      <path d="M18 16 C18 10 24 7 24 7 C24 7 30 10 30 16" stroke="#00652C" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="24" cy="29" r="4" fill="#4ADE80" opacity="0.5" />
                    </svg>
                    <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[200px]">
                      Rescue bags will appear here once restaurant partners list surplus food.
                    </p>
                    <Link
                      to="/become-a-partner"
                      className="text-primary font-label-button text-xs font-bold hover:underline"
                    >
                      Become a partner →
                    </Link>
                  </div>
                )}
              </div>

              {/* Countdown Alert Widget */}
              <div className="p-3.5 rounded-2xl bg-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-xl">alarm</span>
                  <div>
                    <span className="font-headline-sm text-body-sm text-on-surface font-semibold block leading-tight">
                      Evening Pickup Closes
                    </span>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Nightly window 9:00 PM – 10:30 PM
                    </span>
                  </div>
                </div>
                <Link
                  to="/explore"
                  className="font-label-button text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLS SECTION */}
      <section className="w-full bg-surface-container-low py-10 border-y border-outline-variant/30">
        <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                Explore by Category
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Surplus food rescued daily across Greater Noida's best spots
              </p>
            </div>
            <Link
              to="/explore"
              className="text-primary font-label-button text-sm font-semibold hover:underline flex items-center gap-1"
            >
              <span>See all ({bags.length})</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: 'Bakeries & Breads', count: 'Fresh daily', icon: 'bakery_dining', cat: 'Bakeries' },
              { name: 'Full Meals & Thalis', count: 'Wholesome', icon: 'restaurant', cat: 'Full Meals' },
              { name: 'Cafés & Pastries', count: 'Coffee & treats', icon: 'local_cafe', cat: 'Cafés' },
              { name: 'Pizza & Italian', count: 'Wood-fired', icon: 'local_pizza', cat: 'Pizza' }
            ].map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate(`/explore?category=${encodeURIComponent(cat.cat)}`)}
                className="bg-surface-container-lowest p-4 rounded-2xl flex items-center gap-3.5 hover:shadow-md transition-all text-left border border-outline-variant/30 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-body-md font-bold text-on-surface group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant">{cat.count}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TODAY'S RESCUE BAGS GRID */}
      <section
        id="rescue-grid"
        className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-12 lg:py-16 scroll-mt-20"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed mb-2">
              <span className="material-symbols-outlined text-xs">local_fire_department</span>
              <span className="font-label-badge text-label-badge uppercase tracking-wider font-bold">
                Limited Stock Remaining
              </span>
            </div>
            <h2 className="font-display-hero text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
              Today's Rescue Bags in Greater Noida
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Surprise bags packed fresh at store closing. Reserve online, collect in-store.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-button text-sm transition-colors border border-outline-variant/30 shrink-0 self-start sm:self-auto"
          >
            <span>View All Active Bags</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-3xl p-4 border border-outline-variant/20 animate-pulse h-80"
              >
                <div className="bg-surface-container-high rounded-2xl h-44 mb-4"></div>
                <div className="bg-surface-container-high h-5 w-3/4 rounded mb-2"></div>
                <div className="bg-surface-container-high h-4 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        ) : error && bags.length === 0 ? (
          <div className="bg-surface-container-low p-8 rounded-2xl text-center max-w-md mx-auto">
            <span className="material-symbols-outlined text-4xl text-error mb-2">error</span>
            <p className="text-on-surface font-semibold mb-1">Failed to load bags</p>
            <p className="text-on-surface-variant text-xs mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-on-primary text-xs px-4 py-2 rounded-xl font-bold"
            >
              Retry
            </button>
          </div>
        ) : bags.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center max-w-md mx-auto gap-4">
            {/* Rescue-bag illustration — simple, brand-aligned */}
            <div className="w-20 h-20 rounded-3xl bg-primary-fixed/30 flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
                <rect x="8" y="16" width="32" height="26" rx="8" fill="#00652C" opacity="0.15" />
                <rect x="8" y="16" width="32" height="26" rx="8" stroke="#00652C" strokeWidth="2" />
                <path d="M18 16 C18 10 24 7 24 7 C24 7 30 10 30 16" stroke="#00652C" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="29" r="4" fill="#4ADE80" opacity="0.8" />
              </svg>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                Fresh deals are on their way
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Rescue Bags appear here when local restaurant partners list their surplus food. Check back
                in the evening — most listings go live between 7 PM and 10 PM.
              </p>
            </div>
            <Link
              to="/become-a-partner"
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary text-primary font-label-button text-label-button hover:bg-primary hover:text-on-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base">storefront</span>
              <span>List your surplus food</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bags.slice(0, 6).map((bag) => (
              <RescueBagCard key={bag.id} bag={bag} />
            ))}
          </div>
        )}
      </section>

      {/* 4. HOW LEFTO WORKS */}
      <section className="w-full bg-surface-container-lowest py-16 border-t border-outline-variant/30">
        <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop text-center">
          <span className="font-label-badge text-label-badge uppercase tracking-widest text-primary font-bold">
            Zero-Waste Movement
          </span>
          <h2 className="font-display-hero text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight mt-1 mb-3">
            How LEFTO works in 3 easy steps
          </h2>
          <p className="font-body-lg text-body-md text-on-surface-variant max-w-xl mx-auto mb-12">
            Enjoying premium food while saving the planet takes less than a minute.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-2xl mb-4 shadow-md">
                1
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                Discover
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Open LEFTO and browse surprise bags listed by local Greater Noida restaurants, bakeries, and cloud kitchens.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-2xl mb-4 shadow-md">
                2
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                Rescue
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Reserve your bag online with secure UPI or card payments at 50–70% off retail menu prices.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20">
              <div className="w-16 h-16 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center font-bold text-2xl mb-4 shadow-md">
                3
              </div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                Enjoy
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Show your digital pass or 4-digit PIN at the counter during the pickup window, collect your fresh feast, and dig in!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MISSION STRIP */}
      <section className="w-full bg-primary py-14 text-on-primary">
        <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left — mission statement */}
          <div className="flex-1 text-left">
            <span className="font-label-badge text-label-badge uppercase tracking-widest text-on-primary/70 font-bold block mb-2">
              Our Mission
            </span>
            <h2 className="font-display-hero text-2xl md:text-3xl font-extrabold tracking-tight mb-3 leading-snug">
              Every unsold bag rescued<br className="hidden sm:inline" /> is a win for everyone.
            </h2>
            <p className="font-body-lg text-body-lg text-on-primary/80 max-w-lg leading-relaxed">
              LEFTO connects food lovers with restaurants that have surplus food at the end of the day.
              Customers pay less. Restaurants earn more. Less food goes to waste.
            </p>
          </div>

          {/* Right — three honest value pillars (no fabricated numbers) */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 shrink-0">
            {[
              { icon: 'savings', label: 'Discounted prices', sub: 'Quality food at 50–70% off' },
              { icon: 'storefront', label: 'Extra revenue', sub: 'For every partner restaurant' },
              { icon: 'eco', label: 'Less food waste', sub: 'Surplus bags rescued daily' },
            ].map((pillar) => (
              <div key={pillar.label} className="flex items-center gap-3 bg-on-primary/10 rounded-2xl px-4 py-3">
                <span className="material-symbols-outlined text-2xl text-primary-fixed shrink-0">{pillar.icon}</span>
                <div>
                  <span className="font-label-button text-label-button font-bold block leading-tight">{pillar.label}</span>
                  <span className="font-body-sm text-body-sm text-on-primary/70">{pillar.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
