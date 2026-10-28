import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchMyRestaurant,
  saveRestaurantProfile,
  saveRescueBag,
  toggleBagStatus,
  RestaurantProfileInput,
  RescueBagInput
} from '../services/supabaseService';
import { Merchant, RescueBag } from '../types';

export const PartnerPortal: React.FC = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'create_bag'>('overview');

  // Restaurant profile form state
  const [profileForm, setProfileForm] = useState<RestaurantProfileInput>({
    name: '',
    outletType: 'restaurant',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    locality: 'Sector Alpha 1',
    openingHours: '10:00 AM - 10:30 PM',
    pickupInstructions: 'Collect at the counter by sharing your 4-digit PIN',
    fssaiLicense: '',
    logoImageUrl: '',
    coverImageUrl: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Rescue Bag form state
  const [bagForm, setBagForm] = useState<RescueBagInput>({
    restaurantId: '',
    title: '',
    description: '',
    foodCategory: 'Baked Goods & Breads',
    dietaryType: 'pure_veg',
    originalPrice: 400,
    discountedPrice: 149,
    availableQuantity: 5,
    pickupStart: '20:30',
    pickupEnd: '22:00',
    pickupWindowDisplay: '8:30 PM - 10:00 PM',
    allergenInfo: '',
    handlingInstructions: 'Best consumed within 24 hours. Keep refrigerated.',
    uncertaintyNote: 'Surprise assortment based on daily surplus. Freshly prepared today.',
    coverImageUrl: '',
    isActive: true
  });
  const [bagSaving, setBagSaving] = useState(false);
  const [bagFeedback, setBagFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [editingBagId, setEditingBagId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchMyRestaurant();
    if (res.data) {
      setRestaurant(res.data);
      setProfileForm({
        name: res.data.name || '',
        outletType: res.data.outletType || 'restaurant',
        contactPerson: res.data.contactPerson || '',
        phone: res.data.phone || '',
        email: res.data.email || '',
        address: res.data.address || '',
        locality: res.data.zone || 'Sector Alpha 1',
        openingHours: res.data.openingHours || '10:00 AM - 10:30 PM',
        pickupInstructions: res.data.pickupInstructions || 'Collect at the counter by sharing your 4-digit PIN',
        fssaiLicense: res.data.fssaiNumber || '',
        logoImageUrl: res.data.logoImage || '',
        coverImageUrl: res.data.coverImage || ''
      });
      if (res.data?.id) {
        setBagForm((prev) => ({ ...prev, restaurantId: res.data!.id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileFeedback(null);

    const res = await saveRestaurantProfile(profileForm, restaurant?.id);
    setProfileSaving(false);

    if (res.error) {
      setProfileFeedback({ type: 'error', msg: res.error });
    } else {
      setProfileFeedback({
        type: 'success',
        msg: restaurant?.id ? 'Profile updated successfully!' : 'Restaurant registered! Pending verification before public launch.'
      });
      loadData();
    }
  };

  const handleBagSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!restaurant) {
      setBagFeedback({ type: 'error', msg: 'Please complete your restaurant profile before creating surplus bags.' });
      return;
    }

    setBagSaving(true);
    setBagFeedback(null);

    const payload = {
      ...bagForm,
      restaurantId: restaurant.id,
      isActive: isDraft ? false : bagForm.isActive
    };

    const res = await saveRescueBag(payload, editingBagId || undefined);
    setBagSaving(false);

    if (res.error) {
      setBagFeedback({ type: 'error', msg: res.error });
    } else {
      setBagFeedback({
        type: 'success',
        msg: isDraft ? 'Listing saved as private draft.' : 'Rescue bag published successfully!'
      });
      setEditingBagId(null);
      setBagForm({
        restaurantId: restaurant.id,
        title: '',
        description: '',
        foodCategory: 'Baked Goods & Breads',
        dietaryType: 'pure_veg',
        originalPrice: 400,
        discountedPrice: 149,
        availableQuantity: 5,
        pickupStart: '20:30',
        pickupEnd: '22:00',
        pickupWindowDisplay: '8:30 PM - 10:00 PM',
        allergenInfo: '',
        handlingInstructions: 'Best consumed within 24 hours. Keep refrigerated.',
        uncertaintyNote: 'Surprise assortment based on daily surplus. Freshly prepared today.',
        coverImageUrl: '',
        isActive: true
      });
      loadData();
      setActiveTab('overview');
    }
  };

  const handleToggleActive = async (bagId: string, currentStatus: boolean) => {
    const res = await toggleBagStatus(bagId, !currentStatus);
    if (res.success) {
      loadData();
    }
  };

  const calculatedDiscount = bagForm.originalPrice > 0
    ? Math.round(((bagForm.originalPrice - bagForm.discountedPrice) / bagForm.originalPrice) * 100)
    : 0;

  return (
    <div className="w-full bg-surface min-h-screen pb-20">
      {/* Top Banner */}
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30 py-6">
        <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-label-badge text-xs uppercase tracking-wider text-primary font-bold">
                LEFTO Partner Dashboard
              </span>
              {restaurant?.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  Verified Merchant
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">hourglass_empty</span>
                  Verification Pending
                </span>
              )}
            </div>
            <h1 className="font-display-hero text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
              {restaurant?.name || 'Welcome, Restaurant Partner'}
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              List surplus batches, set convenient pickup windows, and earn extra revenue while cutting food waste.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('create_bag')}
              className="bg-primary hover:bg-primary-container text-on-primary font-label-button text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5 font-bold"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Create Rescue Bag</span>
            </button>
            {restaurant && (
              <Link
                to={`/restaurant/${restaurant.slug || restaurant.id}`}
                className="bg-surface-container hover:bg-surface-container-high text-on-surface font-label-button text-xs py-2.5 px-4 rounded-xl border border-outline-variant/30 transition-all flex items-center gap-1.5 font-medium"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>View Public Page</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-[1240px] mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop mt-6">
        <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-base">dashboard</span>
            <span>Active Listings ({restaurant?.availableBags?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('create_bag')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'create_bag'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-base">post_add</span>
            <span>{editingBagId ? 'Edit Surplus Bag' : 'New Surplus Bag'}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-base">storefront</span>
            <span>Restaurant Profile</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW & ACTIVE LISTINGS */}
        {activeTab === 'overview' && (
          <div className="mt-6 flex flex-col gap-6">
            {!restaurant?.isVerified && (
              <div className="p-4 rounded-2xl bg-secondary-fixed/30 border border-secondary/30 flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl mt-0.5">info</span>
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-on-surface block mb-0.5">Verification in Progress</span>
                  <p className="text-on-surface-variant">
                    To protect food quality and regulatory standards, newly created surplus bags will appear to customers once our operations team verifies your FSSAI license and store details (typically under 24 hours).
                  </p>
                </div>
              </div>
            )}

            {restaurant?.availableBags && restaurant.availableBags.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurant.availableBags.map((bag) => (
                  <div
                    key={bag.id}
                    className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-label-badge text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                          {bag.category}
                        </span>
                        <span
                          className={`font-label-badge text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            bag.stockLeft > 0 ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-outline-variant text-on-surface'
                          }`}
                        >
                          {bag.stockLeft > 0 ? `${bag.stockLeft} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      <h3 className="font-headline-sm text-base font-bold text-on-surface">{bag.title}</h3>
                      <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{bag.description}</p>

                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-bold text-base text-primary">₹{bag.rescuePrice}</span>
                        <span className="text-xs text-outline line-through">₹{bag.originalPrice}</span>
                        <span className="text-xs text-secondary font-bold">({bag.savingsPercent}% off)</span>
                      </div>

                      <div className="mt-2 text-xs text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                        <span>Pickup: {bag.pickupWindow}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setEditingBagId(bag.id);
                          setBagForm({
                            restaurantId: restaurant.id,
                            title: bag.title,
                            description: bag.description,
                            foodCategory: bag.category,
                            dietaryType: bag.dietaryType,
                            originalPrice: bag.originalPrice,
                            discountedPrice: bag.rescuePrice,
                            availableQuantity: bag.stockLeft,
                            pickupStart: bag.pickupStart,
                            pickupEnd: bag.pickupEnd,
                            pickupWindowDisplay: bag.pickupWindow,
                            allergenInfo: bag.allergenInfo || '',
                            handlingInstructions: bag.handlingInstructions || '',
                            uncertaintyNote: bag.uncertaintyNote || '',
                            coverImageUrl: bag.imageUrl,
                            isActive: true
                          });
                          setActiveTab('create_bag');
                        }}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        <span>Edit Bag</span>
                      </button>

                      <button
                        onClick={() => handleToggleActive(bag.id, bag.stockLeft > 0)}
                        className="text-xs font-bold text-outline hover:text-error transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">power_settings_new</span>
                        <span>Deactivate</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant/30 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
                <h3 className="font-bold text-base text-on-surface">No surplus bags listed yet</h3>
                <p className="text-xs text-on-surface-variant max-w-sm">
                  Create your first surprise bag listing to start recovering value from your unsold food batches tonight.
                </p>
                <button
                  onClick={() => setActiveTab('create_bag')}
                  className="mt-2 bg-primary text-on-primary font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
                >
                  Create Rescue Bag
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CREATE / EDIT RESCUE BAG FORM */}
        {activeTab === 'create_bag' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/30">
              <div className="border-b border-outline-variant/30 pb-4 mb-6">
                <h2 className="font-headline-lg text-xl font-bold text-on-surface">
                  {editingBagId ? 'Edit Surplus Bag' : 'List Surplus Food Bag'}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Help nearby customers understand what delicious items they can expect while accommodating natural daily surplus variation.
                </p>
              </div>

              {bagFeedback && (
                <div
                  className={`p-4 rounded-xl text-xs mb-6 ${
                    bagFeedback.type === 'success'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-error-container text-error border border-error/20'
                  }`}
                >
                  {bagFeedback.msg}
                </div>
              )}

              <form onSubmit={(e) => handleBagSubmit(e, false)} className="flex flex-col gap-6">
                {/* SECTION 1: Food Essentials */}
                <div className="flex flex-col gap-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">1</span>
                    <span>Bag Information & Food Category</span>
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">
                      Bag Title * <span className="text-outline font-normal">(Visible on search & cards)</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. End-of-Day Fresh Sourdough & Pastry Surprise Box"
                      value={bagForm.title}
                      onChange={(e) => setBagForm({ ...bagForm, title: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Food Category *</label>
                      <select
                        value={bagForm.foodCategory}
                        onChange={(e) => setBagForm({ ...bagForm, foodCategory: e.target.value })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
                      >
                        <option value="Baked Goods & Breads">Baked Goods & Breads</option>
                        <option value="Full Meals & Thalis">Full Meals & Thalis</option>
                        <option value="Pizza & Italian">Pizza & Italian</option>
                        <option value="Snacks & Fast Food">Snacks & Fast Food</option>
                        <option value="Desserts & Sweets">Desserts & Sweets</option>
                        <option value="Beverages & Sandwiches">Beverages & Sandwiches</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Dietary Classification *</label>
                      <select
                        value={bagForm.dietaryType}
                        onChange={(e) => setBagForm({ ...bagForm, dietaryType: e.target.value as any })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
                      >
                        <option value="pure_veg">100% Pure Vegetarian</option>
                        <option value="non_veg">Non-Vegetarian Included</option>
                        <option value="mixed">Mixed Assortment (Veg + Non-Veg)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">
                      Short Description & Possible Items *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="e.g. A hearty mystery assortment that could include artisan sourdough loafs, cinnamon rolls, filled croissants, or Danish buns baked this morning."
                      value={bagForm.description}
                      onChange={(e) => setBagForm({ ...bagForm, description: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface leading-relaxed"
                    />
                    <span className="text-[11px] text-on-surface-variant">
                      Explain the types of food customers can reasonably expect without promising fixed individual items.
                    </span>
                  </div>
                </div>

                {/* SECTION 2: Pricing & Stock */}
                <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">2</span>
                    <span>Pricing, Discount & Available Bags</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">
                        Original Value (₹) *
                      </label>
                      <input
                        type="number"
                        min="50"
                        required
                        value={bagForm.originalPrice}
                        onChange={(e) => setBagForm({ ...bagForm, originalPrice: Number(e.target.value) })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface font-bold"
                      />
                      <span className="text-[10px] text-outline">Retail menu price reference</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">
                        Discounted Price (₹) *
                      </label>
                      <input
                        type="number"
                        min="20"
                        required
                        value={bagForm.discountedPrice}
                        onChange={(e) => setBagForm({ ...bagForm, discountedPrice: Number(e.target.value) })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface font-bold text-primary"
                      />
                      <span className="text-[10px] text-secondary font-bold">
                        Customer saves {calculatedDiscount}% (₹{bagForm.originalPrice - bagForm.discountedPrice})
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">
                        Bags for Tonight *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        required
                        value={bagForm.availableQuantity}
                        onChange={(e) => setBagForm({ ...bagForm, availableQuantity: Number(e.target.value) })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface font-bold"
                      />
                      <span className="text-[10px] text-outline">Quantity strictly reserved</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Pickup Window */}
                <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">3</span>
                    <span>Pickup Window Times</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Pickup Starts (e.g. 20:30) *</label>
                      <input
                        type="time"
                        required
                        value={bagForm.pickupStart}
                        onChange={(e) => setBagForm({ ...bagForm, pickupStart: e.target.value })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Pickup Ends (e.g. 22:00) *</label>
                      <input
                        type="time"
                        required
                        value={bagForm.pickupEnd}
                        onChange={(e) => setBagForm({ ...bagForm, pickupEnd: e.target.value })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Display Label *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 8:30 PM - 10:00 PM Tonight"
                      value={bagForm.pickupWindowDisplay}
                      onChange={(e) => setBagForm({ ...bagForm, pickupWindowDisplay: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>
                </div>

                {/* SECTION 4: Allergens, Handling & Uncertainty */}
                <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/20">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs">4</span>
                    <span>Allergen Transparency & Food Safety</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Potential Allergens</label>
                      <input
                        type="text"
                        placeholder="e.g. Gluten, Dairy, Tree Nuts, Soy"
                        value={bagForm.allergenInfo}
                        onChange={(e) => setBagForm({ ...bagForm, allergenInfo: e.target.value })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-on-surface">Storage & Handling Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Keep refrigerated; heat before serving"
                        value={bagForm.handlingInstructions}
                        onChange={(e) => setBagForm({ ...bagForm, handlingInstructions: e.target.value })}
                        className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Food Photo URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={bagForm.coverImageUrl}
                      onChange={(e) => setBagForm({ ...bagForm, coverImageUrl: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="pt-6 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-bold text-xs hover:bg-surface-container-low transition-colors"
                    >
                      {showPreview ? 'Hide Customer Preview' : 'Show Customer Preview'}
                    </button>
                    <button
                      type="button"
                      disabled={bagSaving}
                      onClick={(e) => handleBagSubmit(e, true)}
                      className="px-4 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-colors"
                    >
                      Save as Draft
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={bagSaving}
                    className="bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {bagSaving ? 'Publishing...' : 'Publish Surplus Bag'}
                  </button>
                </div>
              </form>
            </div>

            {/* LIVE CUSTOMER CARD PREVIEW */}
            <div className="lg:col-span-4 sticky top-24">
              <div className="bg-surface-container-lowest p-5 rounded-3xl border border-outline-variant/30 shadow-sm">
                <span className="font-label-badge text-xs uppercase tracking-wider text-outline block mb-3 font-bold">
                  Customer Card Preview
                </span>
                <div className="rounded-2xl overflow-hidden border border-outline-variant/20 bg-surface-container-low">
                  <div className="aspect-[16/10] bg-surface-container-highest relative">
                    <img
                      src={
                        bagForm.coverImageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-secondary text-on-secondary font-label-badge text-[10px] font-bold">
                      SAVE {calculatedDiscount}%
                    </span>
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 text-on-surface font-label-badge text-[10px] font-bold">
                      {bagForm.availableQuantity} left
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="text-[11px] font-bold text-primary block truncate">
                      {restaurant?.name || 'Your Restaurant Name'}
                    </span>
                    <h4 className="text-xs font-bold text-on-surface mt-0.5 truncate">
                      {bagForm.title || 'Surplus Rescue Bag Title'}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">
                      {bagForm.description || 'Description will appear here for customers.'}
                    </p>
                    <div className="mt-2 pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-sm text-primary">₹{bagForm.discountedPrice}</span>
                        <span className="text-[10px] text-outline line-through">₹{bagForm.originalPrice}</span>
                      </div>
                      <span className="text-[10px] text-outline">{bagForm.pickupWindowDisplay}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RESTAURANT PROFILE FORM */}
        {activeTab === 'profile' && (
          <div className="mt-6 max-w-3xl bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-sm border border-outline-variant/30">
            <div className="border-b border-outline-variant/30 pb-4 mb-6">
              <h2 className="font-headline-lg text-xl font-bold text-on-surface">
                Restaurant Outlet Profile
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                Keep your outlet address, opening hours, and counter pickup instructions updated for visiting customers.
              </p>
            </div>

            {profileFeedback && (
              <div
                className={`p-4 rounded-xl text-xs mb-6 ${
                  profileFeedback.type === 'success'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-error-container text-error border border-error/20'
                }`}
              >
                {profileFeedback.msg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
              {/* SECTION 1: Identity */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                  1. Outlet Identity & Type
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Restaurant / Bakery Name *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      placeholder="e.g. Crust & Co. Artisan Bakes"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Outlet Type *</label>
                    <select
                      value={profileForm.outletType}
                      onChange={(e) => setProfileForm({ ...profileForm, outletType: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
                    >
                      <option value="restaurant">Dine-in Restaurant</option>
                      <option value="cafe">Café & Coffee Bar</option>
                      <option value="bakery">Bakery & Patisserie</option>
                      <option value="cloud_kitchen">Cloud Kitchen</option>
                      <option value="other">Other Food Outlet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">FSSAI License Number</label>
                    <input
                      type="text"
                      placeholder="14-digit FSSAI License"
                      value={profileForm.fssaiLicense}
                      onChange={(e) => setProfileForm({ ...profileForm, fssaiLicense: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Manager Vikram"
                      value={profileForm.contactPerson}
                      onChange={(e) => setProfileForm({ ...profileForm, contactPerson: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Location & Contact */}
              <div className="flex flex-col gap-4 pt-4 border-t border-outline-variant/20">
                <h3 className="font-bold text-xs uppercase tracking-wider text-primary">
                  2. Location & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Store Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      placeholder="+91 98XXXXXXXX"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Store Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="store@restaurant.in"
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Greater Noida Locality *</label>
                    <select
                      value={profileForm.locality}
                      onChange={(e) => setProfileForm({ ...profileForm, locality: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface cursor-pointer"
                    >
                      <option value="Sector Alpha 1">Sector Alpha 1</option>
                      <option value="Sector Alpha 2">Sector Alpha 2</option>
                      <option value="Knowledge Park I">Knowledge Park I</option>
                      <option value="Knowledge Park II">Knowledge Park II</option>
                      <option value="Knowledge Park III">Knowledge Park III</option>
                      <option value="Pari Chowk">Pari Chowk</option>
                      <option value="Sector Beta 1">Sector Beta 1</option>
                      <option value="Sector Beta 2">Sector Beta 2</option>
                      <option value="Sector Gamma 1">Sector Gamma 1 (Jagat Farm)</option>
                      <option value="Sector Delta 1">Sector Delta 1</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-on-surface">Opening Hours *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10:00 AM - 10:30 PM Daily"
                      value={profileForm.openingHours}
                      onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                      className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">Full Physical Address *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Shop/Unit number, Market Block, Sector, Greater Noida"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface">Pickup Instructions for Customers</label>
                  <input
                    type="text"
                    placeholder="e.g. Tell the front cashier you have a LEFTO pickup and share your 4-digit PIN."
                    value={profileForm.pickupInstructions}
                    onChange={(e) => setProfileForm({ ...profileForm, pickupInstructions: e.target.value })}
                    className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary text-on-surface"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {profileSaving ? 'Saving Profile...' : 'Save Restaurant Profile'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
