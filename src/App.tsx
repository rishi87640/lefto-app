import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LocationModal } from './components/common/LocationModal';
import { DatabaseStatusBanner } from './components/common/DatabaseStatusBanner';

// Pages
import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { RestaurantProfilePage } from './pages/RestaurantProfilePage';
import { BagDetailPage } from './pages/BagDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PickupPassPage } from './pages/PickupPassPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { OrdersPage } from './pages/OrdersPage';
import { PickupQRCodePage } from './pages/PickupQRCodePage';
import { ProfilePage } from './pages/ProfilePage';
import { PartnerPage } from './pages/PartnerPage';
import { PartnerPortal } from './pages/PartnerPortal';

// ScrollToTop helper on route transition
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-surface text-on-surface antialiased font-body-md">
              {/* Database Live / Preview Mode Indicator */}
              <DatabaseStatusBanner />

              {/* Global Navbar Header */}
              <Navbar />

              {/* Main Viewport */}
              <main className="flex-1 w-full">
                <Routes>
                  {/* 1. Homepage (Screen 1) */}
                  <Route path="/" element={<HomePage />} />

                  {/* 2. Marketplace / Discover (Screen 2) */}
                  <Route path="/explore" element={<DiscoverPage />} />
                  <Route path="/marketplace" element={<DiscoverPage />} />

                  {/* 3. Restaurant Profile (Screen 3) */}
                  <Route path="/restaurant/:id" element={<RestaurantProfilePage />} />

                  {/* 4. Food Bag Details (Screen 4) */}
                  <Route path="/bag/:id" element={<BagDetailPage />} />

                  {/* 5. Cart / Order Summary (Screen 5) */}
                  <Route path="/cart" element={<CartPage />} />

                  {/* 6. Checkout & Payment (Screen 6) */}
                  <Route path="/checkout" element={<CheckoutPage />} />

                  {/* 7. Order Confirmation & Pickup Pass (Screen 7) */}
                  <Route path="/order-confirmation" element={<PickupPassPage />} />

                  {/* 8. Order Details & Receipt (Screen 8) */}
                  <Route path="/order/:id" element={<OrderDetailPage />} />

                  {/* Orders Overview Listing */}
                  <Route path="/orders" element={<OrdersPage />} />

                  {/* 9. Standalone Pickup QR Code Scanner (Screen 9) */}
                  <Route path="/qr-code" element={<PickupQRCodePage />} />
                  <Route path="/qr-code/:id" element={<PickupQRCodePage />} />

                  {/* 10. Profile & Account Settings (Screen 10) */}
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* 11. Become a Partner / Merchant Onboarding (Screen 11) */}
                  <Route path="/become-a-partner" element={<PartnerPage />} />
                  <Route path="/partner-onboarding" element={<PartnerPage />} />
                  <Route path="/partner-dashboard" element={<PartnerPortal />} />
                  <Route path="/partner-portal" element={<PartnerPortal />} />

                  {/* Fallback to Home */}
                  <Route path="*" element={<HomePage />} />
                </Routes>
              </main>

              {/* Global Footer */}
              <Footer />

              {/* Modals & Drawers */}
              <LocationModal />
            </div>
          </BrowserRouter>
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
};

export default App;
