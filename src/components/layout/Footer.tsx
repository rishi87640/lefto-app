import React from 'react';
import { Link } from 'react-router-dom';
import { LeftoLogo } from '../common/LeftoLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-low mt-space-3xl py-space-3xl border-t border-outline-variant/30">
      <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-2xl">
        {/* Brand Column */}
        <div className="flex flex-col gap-space-sm">
          <LeftoLogo size="lg" />
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            India's hyper-local food surplus rescue marketplace. Connecting mindful food lovers
            with restaurants, bakeries, and cloud-kitchens to eliminate food waste in Greater Noida.
          </p>
          <div className="flex items-center gap-space-xs mt-space-xs bg-surface-container-highest px-space-sm py-space-2xs rounded-lg w-fit">
            <span className="material-symbols-outlined text-primary text-[18px]">eco</span>
            <span className="font-label-badge text-label-badge text-primary uppercase tracking-wider">
              Mission Green India 2025
            </span>
          </div>
        </div>

        {/* For Foodies Column */}
        <div className="flex flex-col gap-space-xs">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-2xs font-bold">
            For Foodies
          </h4>
          <nav className="flex flex-col gap-2.5">
            <Link to="/explore" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Nearby Mystery Bags
            </Link>
            <Link to="/orders" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Order History & Tracking
            </Link>
            <Link to="/profile" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Rescue Impact Wallet
            </Link>
            <Link to="/qr-code" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Pickup Pass QR Demo
            </Link>
          </nav>
        </div>

        {/* For Businesses Column */}
        <div className="flex flex-col gap-space-xs">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-2xs font-bold">
            For Businesses
          </h4>
          <nav className="flex flex-col gap-2.5">
            <Link to="/become-a-partner" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Become a Food Partner
            </Link>
            <Link to="/restaurant/crust-and-co" className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors">
              Merchant Storefront Demo
            </Link>
            <span className="font-body-md text-body-md text-on-surface-variant cursor-pointer hover:text-primary">
              FSSAI & Safety Standards
            </span>
            <span className="font-body-md text-body-md text-on-surface-variant cursor-pointer hover:text-primary">
              Zero-Waste Certification
            </span>
          </nav>
        </div>

        {/* Coverage & Timings */}
        <div className="flex flex-col gap-space-xs">
          <h4 className="font-headline-sm text-headline-sm text-on-surface mb-space-2xs font-bold">
            Location & Coverage
          </h4>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Active across Greater Noida, Pari Chowk, Knowledge Park I–III, Sector Alpha, Beta, and Gamma.
          </p>
          <div className="flex items-center gap-1.5 text-primary text-sm font-semibold mt-2">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span>Operating 7:00 AM – 11:30 PM IST</span>
          </div>
          <p className="text-xs text-outline mt-1">
            FSSAI License Assured • 100% Verified Outlets
          </p>
        </div>
      </div>

      {/* Sub-Footer Legal */}
      <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop mt-space-2xl pt-space-lg border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
        <p className="font-body-sm text-body-sm text-outline">
          © 2025 LEFTO Technologies Pvt. Ltd. All rights reserved.
        </p>
        <div className="flex items-center gap-space-md text-xs text-on-surface-variant">
          <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-primary cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-primary cursor-pointer">FSSAI Compliance</span>
        </div>
      </div>
    </footer>
  );
};
