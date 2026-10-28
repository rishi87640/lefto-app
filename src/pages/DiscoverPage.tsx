import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RescueBag } from '../types';
import { fetchRescueBags } from '../services/supabaseService';
import { RescueBagCard } from '../components/marketplace/RescueBagCard';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [pureVegOnly, setPureVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'closest' | 'savings' | 'endingSoon'>('recommended');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under150' | 'under250'>('all');

  const [allBags, setAllBags] = useState<RescueBag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchRescueBags({ search: initialSearch })
      .then((res) => {
        if (!isMounted) return;
        setAllBags(res.data);
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
  }, [initialSearch]);

  const categories = useMemo(() => {
    const list = [
      { name: 'All', count: allBags.length },
      { name: 'Bakeries', count: allBags.filter((b) => b.category.toLowerCase().includes('baker')).length },
      { name: 'Full Meals', count: allBags.filter((b) => b.category.toLowerCase().includes('meal')).length },
      { name: 'Pizza', count: allBags.filter((b) => b.category.toLowerCase().includes('pizza')).length },
      { name: 'Snacks', count: allBags.filter((b) => b.category.toLowerCase().includes('snack')).length }
    ];
    return list;
  }, [allBags]);

  const filteredBags = useMemo(() => {
    return allBags.filter((bag) => {
      // Search term
      if (initialSearch) {
        const query = initialSearch.toLowerCase();
        const matches =
          bag.title.toLowerCase().includes(query) ||
          bag.merchantName.toLowerCase().includes(query) ||
          bag.description.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Category
      if (activeCategory !== 'All') {
        if (!bag.category.toLowerCase().includes(activeCategory.toLowerCase())) {
          return false;
        }
      }

      // Pure Veg toggle
      if (pureVegOnly && bag.dietaryType !== 'pure_veg') {
        return false;
      }

      // Price filter
      if (priceFilter === 'under150' && bag.rescuePrice > 150) return false;
      if (priceFilter === 'under250' && bag.rescuePrice > 250) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'savings') return b.savingsPercent - a.savingsPercent;
      if (sortBy === 'closest') return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === 'endingSoon') return (b.isEndingSoon ? 1 : 0) - (a.isEndingSoon ? 1 : 0);
      return 0;
    });
  }, [allBags, activeCategory, pureVegOnly, sortBy, priceFilter, initialSearch]);

  return (
    <div className="w-full max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-6 flex flex-col gap-6">
      {/* 1. Header Title & Location Context */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-outline-variant/30 pb-4">
        <div>
          <h1 className="font-display-hero text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
            Explore Surplus Bags in Greater Noida
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Fresh restaurant food rescued at closing time. Save money and protect the climate.
          </p>
        </div>

        {initialSearch && (
          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1 rounded-full text-xs text-on-surface-variant">
            <span>
              Search: <strong>"{initialSearch}"</strong>
            </span>
            <button
              onClick={() => {
                searchParams.delete('search');
                setSearchParams(searchParams);
              }}
              className="text-primary hover:underline font-bold"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* 2. Horizontal Scrollable Category Track */}
      <div className="w-full overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-space-xs min-w-max">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.name);
                  searchParams.set('category', cat.name);
                  setSearchParams(searchParams);
                }}
                className={`px-4 h-9 rounded-full font-headline-sm text-sm transition-all flex items-center gap-1.5 shadow-sm ${
                  isActive
                    ? 'bg-primary text-on-primary font-bold'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-xs ${isActive ? 'text-on-primary/80' : 'text-outline'}`}>
                  ({cat.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Toolbar (Sticky Experience) */}
      <div className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md py-2">
        <div className="p-3 bg-surface-container-lowest rounded-2xl shadow-sm flex flex-col gap-3 border border-outline-variant/30">
          {/* Upper Row: Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {/* Pure Veg Toggle */}
              <button
                type="button"
                onClick={() => setPureVegOnly(!pureVegOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-headline-sm text-xs shadow-sm transition-all border ${
                  pureVegOnly
                    ? 'bg-primary/10 border-primary text-primary font-bold'
                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-sm bg-surface-container-lowest flex items-center justify-center p-0.5 border border-primary">
                  <span className="w-2 h-2 rounded-full bg-primary block"></span>
                </span>
                <span>Pure Veg Only</span>
                {pureVegOnly && <span className="material-symbols-outlined text-sm">check</span>}
              </button>

              {/* Price Filter Dropdown */}
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value as any)}
                className="bg-surface-container-low text-on-surface font-body-sm text-xs px-3 py-1.5 rounded-xl border border-outline-variant/30 outline-none cursor-pointer"
              >
                <option value="all">Price: Any</option>
                <option value="under150">Under ₹150</option>
                <option value="under250">Under ₹250</option>
              </select>

              {/* Quick Preset: 4.5+ Rating */}
              <div className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-xs flex items-center gap-1 border border-outline-variant/30">
                <span className="material-symbols-outlined text-amber-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
                <span>Rating 4.5+ ★</span>
              </div>
            </div>

            {/* Total Count Badge */}
            <div className="px-3 py-1 rounded-full bg-on-primary-container/30 text-primary font-label-badge text-xs uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse"></span>
              <span>{filteredBags.length} Bags Available</span>
            </div>
          </div>

          {/* Lower Row: Sorting Options */}
          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-0.5 text-xs">
              <span className="font-body-sm text-outline font-medium shrink-0">Sort by:</span>

              <button
                type="button"
                onClick={() => setSortBy('recommended')}
                className={`py-1 shrink-0 font-headline-sm transition-colors ${
                  sortBy === 'recommended' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Recommended
              </button>

              <button
                type="button"
                onClick={() => setSortBy('closest')}
                className={`py-1 shrink-0 font-headline-sm transition-colors ${
                  sortBy === 'closest' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Closest Distance
              </button>

              <button
                type="button"
                onClick={() => setSortBy('savings')}
                className={`py-1 shrink-0 font-headline-sm transition-colors ${
                  sortBy === 'savings' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Biggest Savings
              </button>

              <button
                type="button"
                onClick={() => setSortBy('endingSoon')}
                className={`py-1 shrink-0 font-headline-sm transition-colors ${
                  sortBy === 'endingSoon' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Ending Soon
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1 text-outline font-body-sm text-xs">
              <span className="material-symbols-outlined text-sm text-primary">eco</span>
              <span>Saving ~35kg CO₂e tonight</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Three-Column Discovery Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
      ) : filteredBags.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBags.map((bag) => (
            <RescueBagCard key={bag.id} bag={bag} />
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest p-12 rounded-2xl text-center flex flex-col items-center justify-center gap-3 border border-outline-variant/30">
          <span className="material-symbols-outlined text-outline text-5xl">sentiment_dissatisfied</span>
          <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
            No matching surplus bags found
          </h3>
          <p className="font-body-md text-sm text-on-surface-variant max-w-md">
            Try adjusting your category filter, turning off Pure Veg only, or browsing all Greater Noida locations.
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setPureVegOnly(false);
              setPriceFilter('all');
            }}
            className="mt-2 bg-primary text-on-primary font-label-button text-sm px-5 py-2.5 rounded-xl shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 5. Trust Checkpoints Footer Band */}
      <div className="mt-8 p-6 rounded-2xl bg-surface-container-low grid grid-cols-2 md:grid-cols-4 gap-4 text-center border border-outline-variant/20">
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-1">verified</span>
          <span className="font-headline-sm text-xs font-bold text-on-surface">Verified Businesses</span>
          <span className="text-[11px] text-on-surface-variant">FSSAI Certified kitchens</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-1">lock</span>
          <span className="font-headline-sm text-xs font-bold text-on-surface">Secure Payments</span>
          <span className="text-[11px] text-on-surface-variant">Instant UPI & Cards</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-1">schedule</span>
          <span className="font-headline-sm text-xs font-bold text-on-surface">Strict Pickup Windows</span>
          <span className="text-[11px] text-on-surface-variant">Fresh evening bakes</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="material-symbols-outlined text-primary text-2xl mb-1">eco</span>
          <span className="font-headline-sm text-xs font-bold text-on-surface">Zero Waste Mission</span>
          <span className="text-[11px] text-on-surface-variant">Prevent landfill methane</span>
        </div>
      </div>
    </div>
  );
};
