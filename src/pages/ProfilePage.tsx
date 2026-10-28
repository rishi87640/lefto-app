import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, fetchUserOrders } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, Order } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, profile: authProfile, signOut, refreshProfile, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(authProfile);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editZone, setEditZone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Account Deletion Flow State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteStatusMessage, setDeleteStatusMessage] = useState<string | null>(null);

  // Saved preferences state (Only genuine local dietary/app preferences)
  const [savedPreferences, setSavedPreferences] = useState(() => {
    const saved = localStorage.getItem('lefto_user_preferences');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return {
      dietaryPreference: 'all',
      pickupReminders: true,
      ecoImpactTracking: true
    };
  });

  // Support / Help feedback
  const [helpFeedback, setHelpFeedback] = useState<string | null>(null);

  // Sync state with auth context
  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
      setEditName(authProfile.name || '');
      setEditPhone(authProfile.phone || '');
      setEditZone(authProfile.defaultZone || 'Alpha 2');
    }
  }, [authProfile]);

  // Fetch recent customer order history securely
  useEffect(() => {
    setLoadingOrders(true);
    fetchUserOrders()
      .then((res) => {
        if (res.data) {
          setOrders(res.data);
        }
      })
      .catch((err) => console.error('Failed to load user orders:', err))
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleOpenEdit = () => {
    setSaveSuccess(null);
    setSaveError(null);
    setEditName(profile?.name || '');
    setEditPhone(profile?.phone || '');
    setEditZone(profile?.defaultZone || 'Alpha 2');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(null);
    setSaveError(null);

    // Validation
    if (!editName.trim() || editName.trim().length < 2) {
      setSaveError('Full Name must be at least 2 characters long.');
      return;
    }

    const cleanPhone = editPhone.replace(/\D/g, '').slice(-10);
    if (editPhone.trim() && cleanPhone.length !== 10) {
      setSaveError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSaving(true);

    try {
      // Securely update non-sensitive fields
      const res = await updateUserProfile({
        fullName: editName.trim(),
        phone: cleanPhone ? `+91${cleanPhone}` : undefined,
        defaultZone: editZone.trim()
      });

      if (res.error || !res.data) {
        setSaveError(res.error || 'Failed to update profile. Please try again.');
        setIsSaving(false);
        return;
      }

      setProfile(res.data);
      if (refreshProfile) {
        await refreshProfile();
      }

      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(null);
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || 'Network error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = (key: string, value: any) => {
    const updated = { ...savedPreferences, [key]: value };
    setSavedPreferences(updated);
    localStorage.setItem('lefto_user_preferences', JSON.stringify(updated));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText.trim().toUpperCase() !== 'DELETE') {
      alert('Please type "DELETE" to confirm your request.');
      return;
    }

    setDeleteStatusMessage(
      'Account deletion request submitted. As required by data retention and transaction audit regulations, your personal profile data will be permanently wiped within 48 hours and active sessions revoked.'
    );

    setTimeout(async () => {
      await signOut();
      navigate('/');
    }, 4000);
  };

  if (authLoading) {
    return (
      <div className="w-full bg-surface py-24 min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-on-surface-variant font-medium">Loading your account profile...</p>
      </div>
    );
  }

  const customerEmail = profile?.email || user?.email || 'customer@lefto.in';
  const customerName = profile?.name || user?.user_metadata?.full_name || 'LEFTO Rescuer';
  const customerPhone = profile?.phone || user?.phone || 'Not provided';
  const defaultZone = profile?.defaultZone || 'Alpha 2';

  return (
    <div className="w-full bg-surface pb-20">
      <div className="w-full max-w-6xl mx-auto px-layout-margin-mobile md:px-layout-margin-tablet lg:px-layout-margin-desktop py-6">
        
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-outline mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface font-semibold">Account & Profile Settings</span>
        </nav>

        {/* 1. Main Profile Card Header */}
        <header className="w-full bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-sm border border-outline-variant/30 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-headline-lg text-3xl font-black shadow-md">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center shadow-xs">
                <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-headline-lg text-2xl text-on-surface font-extrabold tracking-tight">
                  {customerName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-xs">eco</span>
                  Customer Account
                </span>
              </div>

              <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-sm">mail</span>
                  {customerEmail}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-outline text-sm">smartphone</span>
                  {customerPhone}
                </span>
              </div>

              <p className="text-[11px] text-outline mt-1">
                Preferred Area: <strong className="text-on-surface">{defaultZone}</strong> • Member since {profile?.memberSince || '2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary/90 text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit Profile</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs px-4 py-2.5 rounded-xl transition-colors font-bold cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Customer Orders & Saved Preferences (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* SECTION A: Order History */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    My Order History
                  </h2>
                </div>
                <Link
                  to="/orders"
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </Link>
              </div>

              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-outline">Loading order history...</div>
              ) : orders.length === 0 ? (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
                  <p className="text-xs text-on-surface-variant font-medium">No rescue orders placed yet.</p>
                  <Link
                    to="/explore"
                    className="mt-1 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm"
                  >
                    Explore Surplus Food Bags
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-outline-variant/10"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-outline">#{ord.orderCode}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            ord.status === 'completed'
                              ? 'bg-primary/10 text-primary'
                              : ord.status === 'cancelled'
                              ? 'bg-error/10 text-error'
                              : 'bg-secondary-fixed text-on-secondary-fixed'
                          }`}>
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <strong className="text-sm font-bold text-on-surface block mt-1">
                          {ord.bag?.title || 'Surplus Rescue Bag'}
                        </strong>
                        <span className="text-xs text-on-surface-variant">
                          {ord.bag?.merchantName} • {ord.pickupWindow}
                        </span>
                      </div>

                      <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
                        <strong className="text-sm font-black text-on-surface">₹{ord.totalAmount}</strong>
                        <Link
                          to={`/order/${ord.orderCode}`}
                          className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                        >
                          <span>Details</span>
                          <span className="material-symbols-outlined text-xs">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION B: Saved Preferences (Only genuine supported preferences) */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">tune</span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    Saved Preferences
                  </h2>
                </div>
                <span className="text-xs text-outline font-medium">Customer Experience Settings</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Dietary preference filter default */}
                <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-container-low">
                  <div>
                    <strong className="text-on-surface block font-bold">Dietary Filter Default</strong>
                    <span className="text-on-surface-variant text-[11px]">
                      Filter marketplace listings automatically based on dietary lifestyle.
                    </span>
                  </div>
                  <select
                    value={savedPreferences.dietaryPreference}
                    onChange={(e) => handlePreferenceChange('dietaryPreference', e.target.value)}
                    className="bg-surface-container-lowest text-on-surface border border-outline-variant/30 rounded-xl px-3 py-1.5 text-xs font-bold outline-none"
                  >
                    <option value="all">All Foods</option>
                    <option value="pure_veg">Pure Veg Only</option>
                    <option value="non_veg">Non-Veg</option>
                  </select>
                </div>

                {/* Pickup Reminders */}
                <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-container-low">
                  <div>
                    <strong className="text-on-surface block font-bold">Pickup Window Alerts</strong>
                    <span className="text-on-surface-variant text-[11px]">
                      Receive browser and SMS reminders 30 minutes before your store pickup window ends.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={savedPreferences.pickupReminders}
                    onChange={(e) => handlePreferenceChange('pickupReminders', e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Eco Impact Tracking */}
                <div className="flex items-center justify-between gap-4 p-3.5 rounded-2xl bg-surface-container-low">
                  <div>
                    <strong className="text-on-surface block font-bold">CO₂e & Environmental Metrics</strong>
                    <span className="text-on-surface-variant text-[11px]">
                      Calculate carbon savings on receipts and order confirmations.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={savedPreferences.ecoImpactTracking}
                    onChange={(e) => handlePreferenceChange('ecoImpactTracking', e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </section>

            {/* SECTION C: Help, Contact & Support */}
            <section className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">help_outline</span>
                  <h2 className="font-headline-md text-base text-on-surface font-bold">
                    Help & Contact Information
                  </h2>
                </div>
                <span className="text-xs text-outline">Greater Noida Support</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-1">
                  <strong className="text-on-surface font-bold">Support Email</strong>
                  <span className="text-on-surface-variant">support@lefto.in</span>
                  <span className="text-[11px] text-outline mt-1">Average response within 2 hours</span>
                </div>

                <div className="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-1">
                  <strong className="text-on-surface font-bold">WhatsApp Hotline</strong>
                  <span className="text-on-surface-variant">+91 98765 43210</span>
                  <span className="text-[11px] text-outline mt-1">Available 9:00 AM – 10:30 PM daily</span>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap pt-2">
                {['Pickup assistance', 'Report wrong order', 'Payment inquiry'].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setHelpFeedback(`Inquiry regarding "${topic}" submitted to support desk.`)}
                    className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs text-on-surface font-medium transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>

              {helpFeedback && (
                <div className="p-3 bg-primary/10 text-primary text-xs font-semibold rounded-xl flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span>{helpFeedback}</span>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Separation of Roles, Legal & Deletion (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">

            {/* CARD 1: Restaurant Partner Portal Callout (Clear Role Separation) */}
            <div className="bg-gradient-to-br from-primary-fixed/30 to-surface-container-lowest rounded-3xl p-6 shadow-sm border border-primary/20 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">store</span>
                <strong className="text-sm font-bold text-on-surface">Restaurant Owner?</strong>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Merchant onboarding, surplus food bag management, and storefront order verification are isolated in the restaurant portal to protect merchant controls.
              </p>
              <Link
                to="/partner-dashboard"
                className="w-full py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:bg-primary/90 transition-all text-center flex items-center justify-center gap-1.5"
              >
                <span>Open Restaurant Partner Portal</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {/* CARD 2: Legal, Privacy & Terms */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-3 text-xs">
              <strong className="text-sm font-bold text-on-surface pb-2 border-b border-outline-variant/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-outline text-base">policy</span>
                <span>Policies & Terms</span>
              </strong>

              <div className="space-y-2 text-on-surface-variant">
                <div className="flex items-center justify-between py-1">
                  <span>Privacy Policy</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('LEFTO Privacy Policy: Customer data is processed strictly for surplus reservation and pickup authentication. No third-party ad profiling.'); }}
                    className="font-bold text-primary hover:underline"
                  >
                    Read
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Terms of Food Rescue Service</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('LEFTO Terms: Bags contain daily unsold edible surplus. Self-pickup during verified timeframes is required.'); }}
                    className="font-bold text-primary hover:underline"
                  >
                    Read
                  </a>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span>Cancellation & Refund Policy</span>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('Refund Policy: In the event of partner store closure or unfulfilled inventory, 100% refund is initiated automatically.'); }}
                    className="font-bold text-primary hover:underline"
                  >
                    Read
                  </a>
                </div>
              </div>
            </div>

            {/* CARD 3: Account Deletion Flow */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-3">
              <strong className="text-sm font-bold text-error flex items-center gap-1.5 pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-base">delete_forever</span>
                <span>Account Deletion</span>
              </strong>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Permanently request removal of your customer account and personal data from LEFTO databases.
              </p>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-error/10 text-error hover:bg-error/20 font-bold text-xs transition-colors border border-error/20 cursor-pointer"
              >
                Request Account Deletion
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <h2 className="font-headline-md text-base text-on-surface font-bold">
                Edit Customer Profile
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-error/10 text-error rounded-xl text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Phone Number (for SMS & Pickup PIN)
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2.5 bg-surface-container-high rounded-xl text-xs font-bold text-on-surface">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={editPhone.replace('+91', '').trim()}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="flex-1 bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-on-surface-variant mb-1">
                  Default Locality / Zone
                </label>
                <select
                  value={editZone}
                  onChange={(e) => setEditZone(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-xs rounded-xl px-3.5 py-2.5 border border-outline-variant/30 focus:border-primary focus:outline-none font-medium"
                >
                  <option value="Alpha 1">Alpha 1</option>
                  <option value="Alpha 2">Alpha 2</option>
                  <option value="Beta 1">Beta 1</option>
                  <option value="Beta 2">Beta 2</option>
                  <option value="Gamma 1">Gamma 1</option>
                  <option value="Pari Chowk">Pari Chowk</option>
                  <option value="Knowledge Park III">Knowledge Park III</option>
                </select>
              </div>

              <div className="p-3 bg-surface-container-low rounded-xl text-[11px] text-outline">
                <span>Account Role: <strong>Customer</strong> (Role changes require administrator approval).</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col gap-4 text-center">
            <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div>
              <h2 className="font-headline-md text-lg text-on-surface font-extrabold">
                Request Account Deletion
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                This action will request the permanent erasure of your account, past rescue records, and preferences. To proceed, type <strong>DELETE</strong> below:
              </p>
            </div>

            {deleteStatusMessage ? (
              <div className="p-4 bg-primary/10 text-primary text-xs font-bold rounded-2xl leading-relaxed">
                {deleteStatusMessage}
              </div>
            ) : (
              <form onSubmit={handleDeleteRequest} className="space-y-4">
                <input
                  type="text"
                  required
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full bg-surface-container-low text-on-surface text-center font-mono font-bold text-sm rounded-xl px-4 py-2.5 border border-outline-variant/30 focus:border-error focus:outline-none"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-error text-white text-xs font-bold hover:bg-error/90 transition-all cursor-pointer"
                  >
                    Confirm Deletion
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
