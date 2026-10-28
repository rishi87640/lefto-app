import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { LeftoLogo } from '../common/LeftoLogo';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { AuthModal } from '../common/AuthModal';

export const Navbar: React.FC = () => {
  const { selectedZone, openLocationModal } = useLocation();
  const { cartItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const navigate = useNavigate();
  const location = useRouterLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface-container-lowest border-b border-outline-variant/40 shadow-[0_2px_8px_-1px_rgba(17,24,39,0.06)]">
        <div className="h-20 max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop flex items-center justify-between gap-space-md">
          {/* Logo & Location Cluster */}
          <div className="flex items-center gap-space-md lg:gap-space-lg shrink-0">
            <LeftoLogo size="md" />

            {/* Location Selector Button */}
            <button
              onClick={openLocationModal}
              type="button"
              className="flex items-center gap-space-xs text-left px-space-sm py-space-xs rounded-xl hover:bg-surface-container-low transition-colors group"
            >
              <span className="material-symbols-outlined text-primary text-xl">location_on</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary leading-tight">
                    Greater Noida
                  </span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">
                    expand_more
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate max-w-[160px] sm:max-w-[200px]">
                  {selectedZone}
                </span>
              </div>
            </button>
          </div>

          {/* Search Bar & Nav Actions */}
          <div className="flex items-center gap-space-md shrink-0">
            {/* Search Input for Desktop */}
            <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center">
              <div className="flex items-center gap-space-sm bg-surface-container-low hover:bg-surface-container px-space-md py-space-xs rounded-full transition-colors text-on-surface-variant text-left w-64 border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary/30">
                <span className="material-symbols-outlined text-primary text-lg">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search food, bakery..."
                  className="bg-transparent border-none outline-none font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant w-full"
                />
              </div>
            </form>

            {/* Navigation Links */}
            <nav className="flex items-center gap-space-sm md:gap-space-md">
              <Link
                to="/explore"
                className={`transition-colors hidden md:inline-block font-body-md text-body-md ${
                  location.pathname === '/explore'
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Explore Bags
              </Link>

              <Link
                to="/orders"
                className={`font-body-md text-body-md transition-colors hidden sm:flex items-center gap-1.5 ${
                  location.pathname === '/orders' || location.pathname.startsWith('/order')
                    ? 'text-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                <span>Orders</span>
              </Link>

              <Link
                to="/become-a-partner"
                className="font-label-button text-label-button bg-secondary-container text-on-secondary hover:bg-secondary transition-colors px-space-md py-2 rounded-full inline-flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-base">storefront</span>
                <span>Become a Partner</span>
              </Link>
            </nav>

            {/* Cart & Profile Controls */}
            <div className="flex items-center gap-space-xs pl-space-xs border-l border-outline-variant/40">
              {/* Cart Button */}
              <Link
                to="/cart"
                aria-label="View reserved cart bag"
                className="relative p-2 rounded-full hover:bg-surface-container-low text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-2xl text-on-surface">shopping_bag</span>
                {cartItem && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-secondary-container ring-2 ring-surface-container-lowest"></span>
                )}
              </Link>

              {/* Profile / Login Button */}
              <button
                type="button"
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-space-xs p-1 rounded-full hover:bg-surface-container-low transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs ring-1 ring-outline-variant/30">
                  R
                </div>
                <span className="hidden lg:inline-block font-label-button text-label-button text-on-surface">
                  Rishi
                </span>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                  expand_more
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
